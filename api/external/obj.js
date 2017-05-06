//vim: set tabstop=4 shiftwidth=4 expandtab:

if (!Object.assign) {
	Object.defineProperty(Object, 'assign', {
		configurable: true,
		writable: true,
		value: function (target) {
			var to, i, cur;
			if (undefined === target || null === target) {
				throw new TypeError('Cannot convert target to object');
			}
			to = Object(target);
			for (i = 1; i < arguments.length; i = i + 1) {
				cur = arguments[i];
				if (undefined !== cur && null !== cur) {
					cur = Object(cur);
					Object.keys(cur).forEach(function (key) {
						this[key] = cur[key];
					}, to);
				}
			}
			return to;
		}
	});
}

if (!Object.freeze) {
	Object.defineProperty(Object, 'freeze', {
		configurable: true,
		writable: true,
		value: function (target) {
			return target;
		}
	});
}
