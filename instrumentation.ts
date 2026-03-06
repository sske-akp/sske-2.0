export async function register() {
  // Node.js 22+ exposes a global `localStorage` when --localstorage-file is
  // set, but without a valid path the methods (getItem, setItem, …) are
  // undefined. Libraries like next-themes check
  // `typeof localStorage !== "undefined"` and then call getItem(), which
  // throws. Patch it with a no-op in-memory shim so SSR works.
  if (
    typeof globalThis.localStorage !== "undefined" &&
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    const store = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      get length() {
        return store.size;
      },
      key: (index: number) => {
        const keys = Array.from(store.keys());
        return keys[index] ?? null;
      },
    } as Storage;
  }
}
