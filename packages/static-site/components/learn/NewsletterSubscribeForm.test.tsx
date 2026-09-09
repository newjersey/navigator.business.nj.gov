import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewsletterSubscribeForm from "./NewsletterSubscribeForm";

const messages = {
  subscribeHeading: "Sign up",
  subscribeDescription: "Get the latest news and updates from the State of New Jersey.",
  subscribeConsentPrefix: "By signing up, you consent to our",
  subscribePrivacyPolicyLink: {
    label: "data privacy policy",
    href: "https://www.nj.gov/nj/privacy.shtml",
    isInternal: false,
    opensInNewTab: true,
  },
  subscribeEmailLabel: "Email",
  subscribeButton: "Sign Up",
  subscribeSubmitting: "Signing Up...",
  subscribeInvalidEmail: "Enter a valid email address.",
  subscribeSuccess: "You're subscribed. Watch your inbox for updates.",
  subscribeError: "Something went wrong. Please try again.",
};

const renderForm = () => render(<NewsletterSubscribeForm messages={messages} />);

const submitEmail = (email: string) => {
  fireEvent.change(screen.getByLabelText(messages.subscribeEmailLabel), {
    target: { value: email },
  });
  fireEvent.submit(screen.getByRole("form"));
};

describe("NewsletterSubscribeForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the heading, email input, and submit button", () => {
    renderForm();
    expect(screen.getByText(messages.subscribeHeading)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.subscribeEmailLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: messages.subscribeButton })).toBeInTheDocument();
  });

  it("renders the privacy policy link opening in a new tab", () => {
    renderForm();
    const link = screen.getByRole("link", { name: messages.subscribePrivacyPolicyLink.label });
    expect(link).toHaveAttribute("href", messages.subscribePrivacyPolicyLink.href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("shows an inline error and does not call fetch when the email is invalid", () => {
    renderForm();
    submitEmail("not-an-email");
    const error = screen.getByText(messages.subscribeInvalidEmail);
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass("usa-error-message");
    expect(screen.getByLabelText(messages.subscribeEmailLabel)).toHaveClass("usa-input--error");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not rely on native browser validation to block submission of an invalid email", () => {
    renderForm();
    const input = screen.getByLabelText(messages.subscribeEmailLabel);
    expect(input).toHaveAttribute("type", "text");
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: messages.subscribeButton }));
    expect(screen.getByText(messages.subscribeInvalidEmail)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls fetch with the email when the email is valid", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: "SUCCESS" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ email: "user@example.com" });
  });

  it("shows a success message when the request succeeds", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: "SUCCESS" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeSuccess)).toBeInTheDocument());
  });

  it("shows an error message when the request reports failure", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, status: "EMAIL_ERROR" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
  });

  it("shows an error message when the fetch call rejects", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
  });
});

describe("NewsletterSubscribeForm request URL", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: "SUCCESS" }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const submitAndReadUrl = async (): Promise<string> => {
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    return url;
  };

  it("posts to the configured API origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");

    expect(await submitAndReadUrl()).toBe(
      "https://api.example.com/api/external/newsletter/subscribe",
    );
  });

  // A trailing slash on any API_BASE_URL_AWS_* repo variable would otherwise
  // produce a double slash in the request path.
  it("does not double the slash when the configured origin ends in one", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");

    expect(await submitAndReadUrl()).toBe(
      "https://api.example.com/api/external/newsletter/subscribe",
    );
  });
});

describe("NewsletterSubscribeForm response handling", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error message when the response status is not ok", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid email" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
    expect(screen.queryByText(messages.subscribeSuccess)).not.toBeInTheDocument();
  });

  // A non-2xx response is a failure regardless of what its body claims, so the
  // status check has to happen before the body is trusted.
  it("does not report success when a non-ok response body claims success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: true, status: "SUCCESS" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
    expect(screen.queryByText(messages.subscribeSuccess)).not.toBeInTheDocument();
  });

  it("shows an error message when a non-ok response body is not valid JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new SyntaxError("Unexpected token < in JSON")),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
  });

  it("clears the email field after a successful subscribe", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, status: "SUCCESS" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeSuccess)).toBeInTheDocument());
    expect(screen.getByLabelText(messages.subscribeEmailLabel)).toHaveValue("");
  });

  it("keeps the email field populated after a failed subscribe", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, status: "EMAIL_ERROR" }),
    });
    renderForm();
    submitEmail("user@example.com");
    await waitFor(() => expect(screen.getByText(messages.subscribeError)).toBeInTheDocument());
    expect(screen.getByLabelText(messages.subscribeEmailLabel)).toHaveValue("user@example.com");
  });
});

describe("NewsletterSubscribeForm double-submit protection", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ignores a second submit while a request is already in flight", async () => {
    let resolveFetch: (value: { ok: boolean; json: () => Promise<{ success: boolean }> }) => void =
      () => {};
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    renderForm();
    submitEmail("user@example.com");
    submitEmail("user@example.com");
    expect(fetch).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, json: () => Promise.resolve({ success: true, status: "SUCCESS" }) });
    await waitFor(() => expect(screen.getByText(messages.subscribeSuccess)).toBeInTheDocument());
  });

  it("announces the in-flight request on the submit button", async () => {
    let resolveFetch: (value: { ok: boolean; json: () => Promise<{ success: boolean }> }) => void =
      () => {};
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    renderForm();
    submitEmail("user@example.com");

    const submitting = screen.getByRole("button", { name: messages.subscribeSubmitting });
    expect(submitting).toBeDisabled();
    expect(submitting).toHaveAttribute("aria-busy", "true");

    resolveFetch({ ok: true, json: () => Promise.resolve({ success: true, status: "SUCCESS" }) });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: messages.subscribeButton })).toHaveAttribute(
        "aria-busy",
        "false",
      ),
    );
  });
});
