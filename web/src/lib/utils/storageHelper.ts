type StorageType = "session" | "local";
export type GetStorageReturnValue = {
  get: (key: string, type?: StorageType) => string | undefined;
  set: (key: string, value: string, type?: StorageType) => boolean;
  keys: (type?: StorageType) => string[];
  delete: (key: string, type?: StorageType) => void;
  clear: (type?: StorageType) => void;
};

const GetStorage = (): GetStorageReturnValue => {
  const storageType = (type?: StorageType): "localStorage" | "sessionStorage" =>
    `${type ?? "session"}Storage`;

  const isBrowser: boolean = ((): boolean => typeof window !== "undefined")();

  const get = (key: string, type?: StorageType): string | undefined => {
    return isBrowser ? window[storageType(type)].getItem(key) ?? undefined : undefined;
  };

  const set = (key: string, value: string, type?: StorageType): boolean => {
    if (isBrowser) {
      window[storageType(type)].setItem(key, value);
      return true;
    }
    return false;
  };

  const keys = (type?: StorageType) =>
    [...Array(window[storageType(type)].length)].map((_, i) => window[storageType(type)].key(i)) as string[];

  const clear = (type?: StorageType) => window[storageType(type)].clear();

  const _delete = (key: string, type?: StorageType): void => {
    window[storageType(type)].removeItem(key);
  };

  return {
    get,
    set,
    keys,
    clear,
    delete: _delete,
  };
};

export { GetStorage };
