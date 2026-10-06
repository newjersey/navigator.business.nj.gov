const MAX_TIMER_DELAY_MS = 2_147_483_647;

/** Hosts that share one rate-limit policy even though their hostnames differ. */
const HOST_ALIASES: Readonly<Record<string, string>> = {
  "www.njeda.gov": "njeda.gov",
};

export class CooldownWaitExceededError extends Error {
  readonly cooldownMs: number;

  constructor(cooldownMs: number) {
    super(`Domain cooldown of ${cooldownMs}ms exceeds the allowed wait`);
    this.name = "CooldownWaitExceededError";
    this.cooldownMs = cooldownMs;
  }
}

interface DomainState {
  active: boolean;
  nextRequestAt: number;
  cooldownUntil: number;
}

interface PendingRequest {
  readonly domain: string;
  readonly maxCooldownWaitMs: number;
  readonly resolve: (release: () => void) => void;
  readonly reject: (error: Error) => void;
}

export interface DeadLinkRequestSchedulerOptions {
  readonly globalConcurrency: number;
  readonly requestIntervalMs: number;
}

export interface AcquireOptions {
  readonly url: string;
  /** Reject instead of waiting when the domain is cooling down for longer than this. */
  readonly maxCooldownWaitMs: number;
}

export interface DeadLinkRequestScheduler {
  readonly acquire: (options: AcquireOptions) => Promise<() => void>;
  readonly cooldown: (url: string, delayMs: number) => void;
}

export const getDeadLinkDomain = (url: string): string => {
  const { hostname } = new URL(url);
  return HOST_ALIASES[hostname] ?? hostname;
};

export const createDeadLinkRequestScheduler = ({
  globalConcurrency,
  requestIntervalMs,
}: DeadLinkRequestSchedulerOptions): DeadLinkRequestScheduler => {
  const domains = new Map<string, DomainState>();
  const pending: PendingRequest[] = [];
  let activeRequests = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const getDomainState = (domain: string): DomainState => {
    const existing = domains.get(domain);
    if (existing) return existing;

    const state: DomainState = { active: false, nextRequestAt: 0, cooldownUntil: 0 };
    domains.set(domain, state);
    return state;
  };

  const rejectRequestsCoolingDownTooLong = (now: number): void => {
    for (let index = pending.length - 1; index >= 0; index--) {
      const request = pending[index];
      const cooldownMs = getDomainState(request.domain).cooldownUntil - now;
      if (cooldownMs > request.maxCooldownWaitMs) {
        pending.splice(index, 1);
        request.reject(new CooldownWaitExceededError(cooldownMs));
      }
    }
  };

  const startNextRequest = (now: number): boolean => {
    const isReady = (request: PendingRequest): boolean => {
      const state = getDomainState(request.domain);
      return !state.active && state.nextRequestAt <= now;
    };

    const index = pending.findIndex(isReady);
    if (index === -1) return false;

    const [request] = pending.splice(index, 1);
    const state = getDomainState(request.domain);
    state.active = true;
    state.nextRequestAt = now + requestIntervalMs;
    activeRequests++;

    let released = false;
    const release = (): void => {
      if (released) return;
      released = true;
      state.active = false;
      activeRequests--;
      pump();
    };

    request.resolve(release);
    return true;
  };

  const scheduleWakeUp = (now: number): void => {
    let earliestRequestAt = Number.POSITIVE_INFINITY;

    for (const request of pending) {
      const state = getDomainState(request.domain);
      if (!state.active) {
        earliestRequestAt = Math.min(earliestRequestAt, state.nextRequestAt);
      }
    }

    if (Number.isFinite(earliestRequestAt)) {
      // Node timers cannot represent delays beyond a signed 32-bit integer.
      const delayMs = Math.min(Math.max(1, earliestRequestAt - now), MAX_TIMER_DELAY_MS);
      timer = setTimeout(pump, delayMs);
    }
  };

  function pump(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    rejectRequestsCoolingDownTooLong(Date.now());

    while (activeRequests < globalConcurrency && startNextRequest(Date.now())) {
      // Each iteration starts one request until none are ready or the global limit is reached.
    }

    if (activeRequests < globalConcurrency) {
      scheduleWakeUp(Date.now());
    }
  }

  const acquire = ({ url, maxCooldownWaitMs }: AcquireOptions): Promise<() => void> => {
    const domain = getDeadLinkDomain(url);

    return new Promise((resolve, reject) => {
      pending.push({ domain, maxCooldownWaitMs, resolve, reject });
      pump();
    });
  };

  const cooldown = (url: string, delayMs: number): void => {
    const state = getDomainState(getDeadLinkDomain(url));
    const cooldownUntil = Date.now() + delayMs;
    state.cooldownUntil = Math.max(state.cooldownUntil, cooldownUntil);
    state.nextRequestAt = Math.max(state.nextRequestAt, cooldownUntil);
    pump();
  };

  return { acquire, cooldown };
};
