type StorageType = "session" | "local";

export type BrowserStorage = {
  get: (key: string, type?: StorageType) => string | undefined;
  set: (key: string, value: string, type?: StorageType) => boolean;
  keys: (type?: StorageType) => string[];
  delete: (key: string, type?: StorageType) => void;
  clear: (type?: StorageType) => void;
};

export const BrowserStorageFactory = (type?: StorageType): BrowserStorage => {
  const storageType: "localStorage" | "sessionStorage" = `${type ?? "session"}Storage`;

  const isBrowser: boolean = ((): boolean => typeof window !== "undefined")();

  const get = (key: string): string | undefined => {
    return isBrowser ? window[storageType].getItem(key) ?? undefined : undefined;
  };

  const set = (key: string, value: string): boolean => {
    if (isBrowser) {
      window[storageType].setItem(key, value);
      return true;
    }
    return false;
  };

  const keys = () =>
    [...Array(window[storageType].length)].map((_, i) => window[storageType].key(i)) as string[];

  const clear = () => window[storageType].clear();

  const _delete = (key: string): void => {
    window[storageType].removeItem(key);
  };

  return {
    get,
    set,
    keys,
    clear,
    delete: _delete,
  };
};
