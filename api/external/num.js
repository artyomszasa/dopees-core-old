//vim: set tabstop=4 shiftwidth=4 expandtab:

if (!Number.isFinite) {
	Number.isFinite = function (value) {
		return 'number' === typeof value && isFinite(value);
	};
}

if (!Number.isInteger) {
	Number.isInteger = function (value) {
		return Number.isFinite(value) && Math.floor(value) === value;
	};
}

if (!Number.isNaN) {
	Number.isNaN = function (value) {
		return 'number' === typeof value && isNaN(value);
	};
}

if (!Object.defineProperty) {
	if (!Number.MIN_SAFE_INTEGER) {
		Number.MIN_SAFE_INTEGER = -(Math.pow(2, 53) - 1);
	}
	if (!Number.MAX_SAFE_INTEGER) {
		Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
	}
} else {
	if (!Number.MIN_SAFE_INTEGER) {
		Object.defineProperty(Number, 'MIN_SAFE_INTEGER', {
			value: -(Math.pow(2, 53) - 1)
		});
	}
	if (!Number.MAX_SAFE_INTEGER) {
		Object.defineProperty(Number, 'MAX_SAFE_INTEGER', {
			value: Math.pow(2, 53) - 1
		});
	}
}

if (!Number.isSafeInteger) {
	Number.isSafeInteger = function (value) {
		return 'number' === typeof value && value >= Number.MIN_SAFE_VALUE && value <= Number.MAX_SAFE_VALUE;
	};
}

if (!Number.parseFloat) {
	Number.parseFloat = parseFloat;
}

if (!Number.parseInt) {
	Number.parseInt = parseInt;
}


