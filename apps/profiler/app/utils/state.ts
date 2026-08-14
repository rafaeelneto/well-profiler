/**
 * Returns a recursive Proxy over `target` that intercepts property sets and
 * routes them through `updater` with an auto-generated path-based recipe.
 *
 * Intended for Immer-backed stores: every assignment on the proxy (or on a
 * nested proxy returned by a chain of gets) becomes a tracked draft mutation.
 *
 * @example
 * const proxy = makeDeepProxy(snapshot, [], updateWell)
 * proxy.name = 'x'                              // → updateWell(d => { d.name = 'x' })
 * proxy.events[1].steps.level = 12.3            // → updateWell(d => { d.events[1].steps.level = 12.3 })
 *
 * Symbol keys pass through unproxied (Vue/JS internals).
 * Array mutation methods (push, splice…) are NOT intercepted — call `updater` directly for those.
 */

export function makeDeepProxy<T extends object>(
  target: T,
  path: (string | number)[],

  updater: (recipe: (draft: any) => void) => void,
): T {
  return new Proxy(target, {
    get(obj, key) {
      // Tell Vue's reactive system to leave this proxy alone (equivalent to markRaw).
      // Without this, reactive() wraps the proxy in a second Proxy, which breaks
      // path tracking and causes double-triggering of effects.
      if (key === '__v_skip') return true;
      if (typeof key === 'symbol') return Reflect.get(obj, key);
      const value = Reflect.get(obj, key);
      if (value !== null && typeof value === 'object')
        return makeDeepProxy(
          value as object,
          [...path, key as string],
          updater,
        );
      return value;
    },
    set(_, key, value) {
      // Symbol sets (e.g. Vue internals) pass through silently — returning false
      // would throw a TypeError in strict mode.
      if (typeof key === 'symbol') return true;
      updater(draft => {
        let node: any = draft;
        for (const segment of path) node = node[segment];
        node[key] = value;
      });
      return true;
    },
  });
}
