declare module "react-cache" {
  type primitive = string | number | boolean | void | null;

  // Primitive keys do not request a hash function.
  export function createResource<V>(
    loadResource: (K: primitive) => Promise<V>,
    hash?: (K: primitive) => primitive
  ): Resource<primitive, V>;

  // Non-primitive keys *do* require a hash function.
  // eslint-disable-next-line no-redeclare
  export function createResource<V>(
    loadResource: (K: any) => Promise<V>,
    hash: (K: any) => primitive
  ): Resource<any, V>;

  interface Cache {
    invalidate(): void;
    read<K, V, A>(
      resourceType: any,
      key: K,
      miss: (A) => Promise<V>,
      missArg: A
    ): V;
    preload<K, V, A>(
      resourceType: any,
      key: K,
      miss: (A) => Promise<V>,
      missArg: A
    ): void;
  }
  interface Resource<K, V> {
    read(cache: Cache, key: K): V;
    preload(cache: Cache, key: K): void;
  }

  export function createCache(invalidator: () => void): Cache;
}
