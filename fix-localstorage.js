// Ensure a minimal localStorage API exists in Node processes to avoid
// server-side code (dev overlays, devtools) calling undefined methods.
(function () {
	try {
		if (typeof globalThis === 'undefined') return;
		const ls = globalThis.localStorage;
		if (ls && typeof ls.getItem === 'function') return;

		const store = Object.create(null);

		globalThis.localStorage = globalThis.localStorage || {};
		globalThis.localStorage.getItem = function (key) {
			return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
		};
		globalThis.localStorage.setItem = function (key, value) {
			store[key] = String(value);
		};
		globalThis.localStorage.removeItem = function (key) {
			delete store[key];
		};
		globalThis.localStorage.clear = function () {
			for (const k of Object.keys(store)) delete store[k];
		};
	} catch (e) {
		// avoid crashing the process
	}
})();
