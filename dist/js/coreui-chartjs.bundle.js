/*!
  * CoreUI Plugins - Chart.js for CoreUI 3 v3.0.0-alpha.0 (https://coreui.io)
  * Copyright 2021 creativeLabs Łukasz Holeczek
  * Licensed under MIT (https://coreui.io/license/)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.coreui = global.coreui || {}, global.coreui.ChartJS = factory()));
}(this, (function () { 'use strict';

  /*!
   * Chart.js v3.1.0
   * https://www.chartjs.org
   * (c) 2021 Chart.js Contributors
   * Released under the MIT License
   */
  const requestAnimFrame = (function() {
    if (typeof window === 'undefined') {
      return function(callback) {
        return callback();
      };
    }
    return window.requestAnimationFrame;
  }());
  function throttled(fn, thisArg, updateFn) {
    const updateArgs = updateFn || ((args) => Array.prototype.slice.call(args));
    let ticking = false;
    let args = [];
    return function(...rest) {
      args = updateArgs(rest);
      if (!ticking) {
        ticking = true;
        requestAnimFrame.call(window, () => {
          ticking = false;
          fn.apply(thisArg, args);
        });
      }
    };
  }
  function debounce(fn, delay) {
    let timeout;
    return function() {
      if (delay) {
        clearTimeout(timeout);
        timeout = setTimeout(fn, delay);
      } else {
        fn();
      }
      return delay;
    };
  }
  const _toLeftRightCenter = (align) => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
  const _alignStartEnd = (align, start, end) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
  const uid = (function() {
    let id = 0;
    return function() {
      return id++;
    };
  }());
  function isNullOrUndef(value) {
    return value === null || typeof value === 'undefined';
  }
  function isArray(value) {
    if (Array.isArray && Array.isArray(value)) {
      return true;
    }
    const type = Object.prototype.toString.call(value);
    if (type.substr(0, 7) === '[object' && type.substr(-6) === 'Array]') {
      return true;
    }
    return false;
  }
  function isObject(value) {
    return value !== null && Object.prototype.toString.call(value) === '[object Object]';
  }
  const isNumberFinite = (value) => (typeof value === 'number' || value instanceof Number) && isFinite(+value);
  function finiteOrDefault(value, defaultValue) {
    return isNumberFinite(value) ? value : defaultValue;
  }
  function valueOrDefault(value, defaultValue) {
    return typeof value === 'undefined' ? defaultValue : value;
  }
  function callback(fn, args, thisArg) {
    if (fn && typeof fn.call === 'function') {
      return fn.apply(thisArg, args);
    }
  }
  function each(loopable, fn, thisArg, reverse) {
    let i, len, keys;
    if (isArray(loopable)) {
      len = loopable.length;
      if (reverse) {
        for (i = len - 1; i >= 0; i--) {
          fn.call(thisArg, loopable[i], i);
        }
      } else {
        for (i = 0; i < len; i++) {
          fn.call(thisArg, loopable[i], i);
        }
      }
    } else if (isObject(loopable)) {
      keys = Object.keys(loopable);
      len = keys.length;
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[keys[i]], keys[i]);
      }
    }
  }
  function _elementsEqual(a0, a1) {
    let i, ilen, v0, v1;
    if (!a0 || !a1 || a0.length !== a1.length) {
      return false;
    }
    for (i = 0, ilen = a0.length; i < ilen; ++i) {
      v0 = a0[i];
      v1 = a1[i];
      if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
        return false;
      }
    }
    return true;
  }
  function clone$1(source) {
    if (isArray(source)) {
      return source.map(clone$1);
    }
    if (isObject(source)) {
      const target = Object.create(null);
      const keys = Object.keys(source);
      const klen = keys.length;
      let k = 0;
      for (; k < klen; ++k) {
        target[keys[k]] = clone$1(source[keys[k]]);
      }
      return target;
    }
    return source;
  }
  function isValidKey(key) {
    return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1;
  }
  function _merger(key, target, source, options) {
    if (!isValidKey(key)) {
      return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
      merge(tval, sval, options);
    } else {
      target[key] = clone$1(sval);
    }
  }
  function merge(target, source, options) {
    const sources = isArray(source) ? source : [source];
    const ilen = sources.length;
    if (!isObject(target)) {
      return target;
    }
    options = options || {};
    const merger = options.merger || _merger;
    for (let i = 0; i < ilen; ++i) {
      source = sources[i];
      if (!isObject(source)) {
        continue;
      }
      const keys = Object.keys(source);
      for (let k = 0, klen = keys.length; k < klen; ++k) {
        merger(keys[k], target, source, options);
      }
    }
    return target;
  }
  function mergeIf(target, source) {
    return merge(target, source, {merger: _mergerIf});
  }
  function _mergerIf(key, target, source) {
    if (!isValidKey(key)) {
      return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
      mergeIf(tval, sval);
    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = clone$1(sval);
    }
  }
  const emptyString = '';
  const dot = '.';
  function indexOfDotOrLength(key, start) {
    const idx = key.indexOf(dot, start);
    return idx === -1 ? key.length : idx;
  }
  function resolveObjectKey(obj, key) {
    if (key === emptyString) {
      return obj;
    }
    let pos = 0;
    let idx = indexOfDotOrLength(key, pos);
    while (obj && idx > pos) {
      obj = obj[key.substr(pos, idx - pos)];
      pos = idx + 1;
      idx = indexOfDotOrLength(key, pos);
    }
    return obj;
  }
  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const defined = (value) => typeof value !== 'undefined';
  const isFunction = (value) => typeof value === 'function';

  const PI = Math.PI;
  const TAU = 2 * PI;
  const INFINITY = Number.POSITIVE_INFINITY;
  const HALF_PI = PI / 2;
  const log10 = Math.log10;
  const sign = Math.sign;
  function _factorize(value) {
    const result = [];
    const sqrt = Math.sqrt(value);
    let i;
    for (i = 1; i < sqrt; i++) {
      if (value % i === 0) {
        result.push(i);
        result.push(value / i);
      }
    }
    if (sqrt === (sqrt | 0)) {
      result.push(sqrt);
    }
    result.sort((a, b) => a - b).pop();
    return result;
  }
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function toRadians(degrees) {
    return degrees * (PI / 180);
  }
  function toDegrees(radians) {
    return radians * (180 / PI);
  }
  function _limitValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function _int16Range(value) {
    return _limitValue(value, -32768, 32767);
  }

  const atEdge = (t) => t === 0 || t === 1;
  const elasticIn = (t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
  const elasticOut = (t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
  const effects = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => -t * (t - 2),
    easeInOutQuad: t => ((t /= 0.5) < 1)
      ? 0.5 * t * t
      : -0.5 * ((--t) * (t - 2) - 1),
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (t -= 1) * t * t + 1,
    easeInOutCubic: t => ((t /= 0.5) < 1)
      ? 0.5 * t * t * t
      : 0.5 * ((t -= 2) * t * t + 2),
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => -((t -= 1) * t * t * t - 1),
    easeInOutQuart: t => ((t /= 0.5) < 1)
      ? 0.5 * t * t * t * t
      : -0.5 * ((t -= 2) * t * t * t - 2),
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => (t -= 1) * t * t * t * t + 1,
    easeInOutQuint: t => ((t /= 0.5) < 1)
      ? 0.5 * t * t * t * t * t
      : 0.5 * ((t -= 2) * t * t * t * t + 2),
    easeInSine: t => -Math.cos(t * HALF_PI) + 1,
    easeOutSine: t => Math.sin(t * HALF_PI),
    easeInOutSine: t => -0.5 * (Math.cos(PI * t) - 1),
    easeInExpo: t => (t === 0) ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: t => (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1,
    easeInOutExpo: t => atEdge(t) ? t : t < 0.5
      ? 0.5 * Math.pow(2, 10 * (t * 2 - 1))
      : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
    easeInCirc: t => (t >= 1) ? t : -(Math.sqrt(1 - t * t) - 1),
    easeOutCirc: t => Math.sqrt(1 - (t -= 1) * t),
    easeInOutCirc: t => ((t /= 0.5) < 1)
      ? -0.5 * (Math.sqrt(1 - t * t) - 1)
      : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
    easeInElastic: t => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
    easeOutElastic: t => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
    easeInOutElastic(t) {
      const s = 0.1125;
      const p = 0.45;
      return atEdge(t) ? t :
        t < 0.5
          ? 0.5 * elasticIn(t * 2, s, p)
          : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
    },
    easeInBack(t) {
      const s = 1.70158;
      return t * t * ((s + 1) * t - s);
    },
    easeOutBack(t) {
      const s = 1.70158;
      return (t -= 1) * t * ((s + 1) * t + s) + 1;
    },
    easeInOutBack(t) {
      let s = 1.70158;
      if ((t /= 0.5) < 1) {
        return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
      }
      return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },
    easeInBounce: t => 1 - effects.easeOutBounce(1 - t),
    easeOutBounce(t) {
      const m = 7.5625;
      const d = 2.75;
      if (t < (1 / d)) {
        return m * t * t;
      }
      if (t < (2 / d)) {
        return m * (t -= (1.5 / d)) * t + 0.75;
      }
      if (t < (2.5 / d)) {
        return m * (t -= (2.25 / d)) * t + 0.9375;
      }
      return m * (t -= (2.625 / d)) * t + 0.984375;
    },
    easeInOutBounce: t => (t < 0.5)
      ? effects.easeInBounce(t * 2) * 0.5
      : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
  };

  /*!
   * @kurkle/color v0.1.9
   * https://github.com/kurkle/color#readme
   * (c) 2020 Jukka Kurkela
   * Released under the MIT License
   */
  const map = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15};
  const hex = '0123456789ABCDEF';
  const h1 = (b) => hex[b & 0xF];
  const h2 = (b) => hex[(b & 0xF0) >> 4] + hex[b & 0xF];
  const eq = (b) => (((b & 0xF0) >> 4) === (b & 0xF));
  function isShort(v) {
  	return eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
  }
  function hexParse(str) {
  	var len = str.length;
  	var ret;
  	if (str[0] === '#') {
  		if (len === 4 || len === 5) {
  			ret = {
  				r: 255 & map[str[1]] * 17,
  				g: 255 & map[str[2]] * 17,
  				b: 255 & map[str[3]] * 17,
  				a: len === 5 ? map[str[4]] * 17 : 255
  			};
  		} else if (len === 7 || len === 9) {
  			ret = {
  				r: map[str[1]] << 4 | map[str[2]],
  				g: map[str[3]] << 4 | map[str[4]],
  				b: map[str[5]] << 4 | map[str[6]],
  				a: len === 9 ? (map[str[7]] << 4 | map[str[8]]) : 255
  			};
  		}
  	}
  	return ret;
  }
  function hexString(v) {
  	var f = isShort(v) ? h1 : h2;
  	return v
  		? '#' + f(v.r) + f(v.g) + f(v.b) + (v.a < 255 ? f(v.a) : '')
  		: v;
  }
  function round(v) {
  	return v + 0.5 | 0;
  }
  const lim = (v, l, h) => Math.max(Math.min(v, h), l);
  function p2b(v) {
  	return lim(round(v * 2.55), 0, 255);
  }
  function n2b(v) {
  	return lim(round(v * 255), 0, 255);
  }
  function b2n(v) {
  	return lim(round(v / 2.55) / 100, 0, 1);
  }
  function n2p(v) {
  	return lim(round(v * 100), 0, 100);
  }
  const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
  function rgbParse(str) {
  	const m = RGB_RE.exec(str);
  	let a = 255;
  	let r, g, b;
  	if (!m) {
  		return;
  	}
  	if (m[7] !== r) {
  		const v = +m[7];
  		a = 255 & (m[8] ? p2b(v) : v * 255);
  	}
  	r = +m[1];
  	g = +m[3];
  	b = +m[5];
  	r = 255 & (m[2] ? p2b(r) : r);
  	g = 255 & (m[4] ? p2b(g) : g);
  	b = 255 & (m[6] ? p2b(b) : b);
  	return {
  		r: r,
  		g: g,
  		b: b,
  		a: a
  	};
  }
  function rgbString(v) {
  	return v && (
  		v.a < 255
  			? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})`
  			: `rgb(${v.r}, ${v.g}, ${v.b})`
  	);
  }
  const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
  function hsl2rgbn(h, s, l) {
  	const a = s * Math.min(l, 1 - l);
  	const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  	return [f(0), f(8), f(4)];
  }
  function hsv2rgbn(h, s, v) {
  	const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  	return [f(5), f(3), f(1)];
  }
  function hwb2rgbn(h, w, b) {
  	const rgb = hsl2rgbn(h, 1, 0.5);
  	let i;
  	if (w + b > 1) {
  		i = 1 / (w + b);
  		w *= i;
  		b *= i;
  	}
  	for (i = 0; i < 3; i++) {
  		rgb[i] *= 1 - w - b;
  		rgb[i] += w;
  	}
  	return rgb;
  }
  function rgb2hsl(v) {
  	const range = 255;
  	const r = v.r / range;
  	const g = v.g / range;
  	const b = v.b / range;
  	const max = Math.max(r, g, b);
  	const min = Math.min(r, g, b);
  	const l = (max + min) / 2;
  	let h, s, d;
  	if (max !== min) {
  		d = max - min;
  		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  		h = max === r
  			? ((g - b) / d) + (g < b ? 6 : 0)
  			: max === g
  				? (b - r) / d + 2
  				: (r - g) / d + 4;
  		h = h * 60 + 0.5;
  	}
  	return [h | 0, s || 0, l];
  }
  function calln(f, a, b, c) {
  	return (
  		Array.isArray(a)
  			? f(a[0], a[1], a[2])
  			: f(a, b, c)
  	).map(n2b);
  }
  function hsl2rgb(h, s, l) {
  	return calln(hsl2rgbn, h, s, l);
  }
  function hwb2rgb(h, w, b) {
  	return calln(hwb2rgbn, h, w, b);
  }
  function hsv2rgb(h, s, v) {
  	return calln(hsv2rgbn, h, s, v);
  }
  function hue(h) {
  	return (h % 360 + 360) % 360;
  }
  function hueParse(str) {
  	const m = HUE_RE.exec(str);
  	let a = 255;
  	let v;
  	if (!m) {
  		return;
  	}
  	if (m[5] !== v) {
  		a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  	}
  	const h = hue(+m[2]);
  	const p1 = +m[3] / 100;
  	const p2 = +m[4] / 100;
  	if (m[1] === 'hwb') {
  		v = hwb2rgb(h, p1, p2);
  	} else if (m[1] === 'hsv') {
  		v = hsv2rgb(h, p1, p2);
  	} else {
  		v = hsl2rgb(h, p1, p2);
  	}
  	return {
  		r: v[0],
  		g: v[1],
  		b: v[2],
  		a: a
  	};
  }
  function rotate(v, deg) {
  	var h = rgb2hsl(v);
  	h[0] = hue(h[0] + deg);
  	h = hsl2rgb(h);
  	v.r = h[0];
  	v.g = h[1];
  	v.b = h[2];
  }
  function hslString(v) {
  	if (!v) {
  		return;
  	}
  	const a = rgb2hsl(v);
  	const h = a[0];
  	const s = n2p(a[1]);
  	const l = n2p(a[2]);
  	return v.a < 255
  		? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})`
  		: `hsl(${h}, ${s}%, ${l}%)`;
  }
  const map$1 = {
  	x: 'dark',
  	Z: 'light',
  	Y: 're',
  	X: 'blu',
  	W: 'gr',
  	V: 'medium',
  	U: 'slate',
  	A: 'ee',
  	T: 'ol',
  	S: 'or',
  	B: 'ra',
  	C: 'lateg',
  	D: 'ights',
  	R: 'in',
  	Q: 'turquois',
  	E: 'hi',
  	P: 'ro',
  	O: 'al',
  	N: 'le',
  	M: 'de',
  	L: 'yello',
  	F: 'en',
  	K: 'ch',
  	G: 'arks',
  	H: 'ea',
  	I: 'ightg',
  	J: 'wh'
  };
  const names = {
  	OiceXe: 'f0f8ff',
  	antiquewEte: 'faebd7',
  	aqua: 'ffff',
  	aquamarRe: '7fffd4',
  	azuY: 'f0ffff',
  	beige: 'f5f5dc',
  	bisque: 'ffe4c4',
  	black: '0',
  	blanKedOmond: 'ffebcd',
  	Xe: 'ff',
  	XeviTet: '8a2be2',
  	bPwn: 'a52a2a',
  	burlywood: 'deb887',
  	caMtXe: '5f9ea0',
  	KartYuse: '7fff00',
  	KocTate: 'd2691e',
  	cSO: 'ff7f50',
  	cSnflowerXe: '6495ed',
  	cSnsilk: 'fff8dc',
  	crimson: 'dc143c',
  	cyan: 'ffff',
  	xXe: '8b',
  	xcyan: '8b8b',
  	xgTMnPd: 'b8860b',
  	xWay: 'a9a9a9',
  	xgYF: '6400',
  	xgYy: 'a9a9a9',
  	xkhaki: 'bdb76b',
  	xmagFta: '8b008b',
  	xTivegYF: '556b2f',
  	xSange: 'ff8c00',
  	xScEd: '9932cc',
  	xYd: '8b0000',
  	xsOmon: 'e9967a',
  	xsHgYF: '8fbc8f',
  	xUXe: '483d8b',
  	xUWay: '2f4f4f',
  	xUgYy: '2f4f4f',
  	xQe: 'ced1',
  	xviTet: '9400d3',
  	dAppRk: 'ff1493',
  	dApskyXe: 'bfff',
  	dimWay: '696969',
  	dimgYy: '696969',
  	dodgerXe: '1e90ff',
  	fiYbrick: 'b22222',
  	flSOwEte: 'fffaf0',
  	foYstWAn: '228b22',
  	fuKsia: 'ff00ff',
  	gaRsbSo: 'dcdcdc',
  	ghostwEte: 'f8f8ff',
  	gTd: 'ffd700',
  	gTMnPd: 'daa520',
  	Way: '808080',
  	gYF: '8000',
  	gYFLw: 'adff2f',
  	gYy: '808080',
  	honeyMw: 'f0fff0',
  	hotpRk: 'ff69b4',
  	RdianYd: 'cd5c5c',
  	Rdigo: '4b0082',
  	ivSy: 'fffff0',
  	khaki: 'f0e68c',
  	lavFMr: 'e6e6fa',
  	lavFMrXsh: 'fff0f5',
  	lawngYF: '7cfc00',
  	NmoncEffon: 'fffacd',
  	ZXe: 'add8e6',
  	ZcSO: 'f08080',
  	Zcyan: 'e0ffff',
  	ZgTMnPdLw: 'fafad2',
  	ZWay: 'd3d3d3',
  	ZgYF: '90ee90',
  	ZgYy: 'd3d3d3',
  	ZpRk: 'ffb6c1',
  	ZsOmon: 'ffa07a',
  	ZsHgYF: '20b2aa',
  	ZskyXe: '87cefa',
  	ZUWay: '778899',
  	ZUgYy: '778899',
  	ZstAlXe: 'b0c4de',
  	ZLw: 'ffffe0',
  	lime: 'ff00',
  	limegYF: '32cd32',
  	lRF: 'faf0e6',
  	magFta: 'ff00ff',
  	maPon: '800000',
  	VaquamarRe: '66cdaa',
  	VXe: 'cd',
  	VScEd: 'ba55d3',
  	VpurpN: '9370db',
  	VsHgYF: '3cb371',
  	VUXe: '7b68ee',
  	VsprRggYF: 'fa9a',
  	VQe: '48d1cc',
  	VviTetYd: 'c71585',
  	midnightXe: '191970',
  	mRtcYam: 'f5fffa',
  	mistyPse: 'ffe4e1',
  	moccasR: 'ffe4b5',
  	navajowEte: 'ffdead',
  	navy: '80',
  	Tdlace: 'fdf5e6',
  	Tive: '808000',
  	TivedBb: '6b8e23',
  	Sange: 'ffa500',
  	SangeYd: 'ff4500',
  	ScEd: 'da70d6',
  	pOegTMnPd: 'eee8aa',
  	pOegYF: '98fb98',
  	pOeQe: 'afeeee',
  	pOeviTetYd: 'db7093',
  	papayawEp: 'ffefd5',
  	pHKpuff: 'ffdab9',
  	peru: 'cd853f',
  	pRk: 'ffc0cb',
  	plum: 'dda0dd',
  	powMrXe: 'b0e0e6',
  	purpN: '800080',
  	YbeccapurpN: '663399',
  	Yd: 'ff0000',
  	Psybrown: 'bc8f8f',
  	PyOXe: '4169e1',
  	saddNbPwn: '8b4513',
  	sOmon: 'fa8072',
  	sandybPwn: 'f4a460',
  	sHgYF: '2e8b57',
  	sHshell: 'fff5ee',
  	siFna: 'a0522d',
  	silver: 'c0c0c0',
  	skyXe: '87ceeb',
  	UXe: '6a5acd',
  	UWay: '708090',
  	UgYy: '708090',
  	snow: 'fffafa',
  	sprRggYF: 'ff7f',
  	stAlXe: '4682b4',
  	tan: 'd2b48c',
  	teO: '8080',
  	tEstN: 'd8bfd8',
  	tomato: 'ff6347',
  	Qe: '40e0d0',
  	viTet: 'ee82ee',
  	JHt: 'f5deb3',
  	wEte: 'ffffff',
  	wEtesmoke: 'f5f5f5',
  	Lw: 'ffff00',
  	LwgYF: '9acd32'
  };
  function unpack() {
  	const unpacked = {};
  	const keys = Object.keys(names);
  	const tkeys = Object.keys(map$1);
  	let i, j, k, ok, nk;
  	for (i = 0; i < keys.length; i++) {
  		ok = nk = keys[i];
  		for (j = 0; j < tkeys.length; j++) {
  			k = tkeys[j];
  			nk = nk.replace(k, map$1[k]);
  		}
  		k = parseInt(names[ok], 16);
  		unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
  	}
  	return unpacked;
  }
  let names$1;
  function nameParse(str) {
  	if (!names$1) {
  		names$1 = unpack();
  		names$1.transparent = [0, 0, 0, 0];
  	}
  	const a = names$1[str.toLowerCase()];
  	return a && {
  		r: a[0],
  		g: a[1],
  		b: a[2],
  		a: a.length === 4 ? a[3] : 255
  	};
  }
  function modHSL(v, i, ratio) {
  	if (v) {
  		let tmp = rgb2hsl(v);
  		tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
  		tmp = hsl2rgb(tmp);
  		v.r = tmp[0];
  		v.g = tmp[1];
  		v.b = tmp[2];
  	}
  }
  function clone(v, proto) {
  	return v ? Object.assign(proto || {}, v) : v;
  }
  function fromObject(input) {
  	var v = {r: 0, g: 0, b: 0, a: 255};
  	if (Array.isArray(input)) {
  		if (input.length >= 3) {
  			v = {r: input[0], g: input[1], b: input[2], a: 255};
  			if (input.length > 3) {
  				v.a = n2b(input[3]);
  			}
  		}
  	} else {
  		v = clone(input, {r: 0, g: 0, b: 0, a: 1});
  		v.a = n2b(v.a);
  	}
  	return v;
  }
  function functionParse(str) {
  	if (str.charAt(0) === 'r') {
  		return rgbParse(str);
  	}
  	return hueParse(str);
  }
  class Color {
  	constructor(input) {
  		if (input instanceof Color) {
  			return input;
  		}
  		const type = typeof input;
  		let v;
  		if (type === 'object') {
  			v = fromObject(input);
  		} else if (type === 'string') {
  			v = hexParse(input) || nameParse(input) || functionParse(input);
  		}
  		this._rgb = v;
  		this._valid = !!v;
  	}
  	get valid() {
  		return this._valid;
  	}
  	get rgb() {
  		var v = clone(this._rgb);
  		if (v) {
  			v.a = b2n(v.a);
  		}
  		return v;
  	}
  	set rgb(obj) {
  		this._rgb = fromObject(obj);
  	}
  	rgbString() {
  		return this._valid ? rgbString(this._rgb) : this._rgb;
  	}
  	hexString() {
  		return this._valid ? hexString(this._rgb) : this._rgb;
  	}
  	hslString() {
  		return this._valid ? hslString(this._rgb) : this._rgb;
  	}
  	mix(color, weight) {
  		const me = this;
  		if (color) {
  			const c1 = me.rgb;
  			const c2 = color.rgb;
  			let w2;
  			const p = weight === w2 ? 0.5 : weight;
  			const w = 2 * p - 1;
  			const a = c1.a - c2.a;
  			const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
  			w2 = 1 - w1;
  			c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5;
  			c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5;
  			c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5;
  			c1.a = p * c1.a + (1 - p) * c2.a;
  			me.rgb = c1;
  		}
  		return me;
  	}
  	clone() {
  		return new Color(this.rgb);
  	}
  	alpha(a) {
  		this._rgb.a = n2b(a);
  		return this;
  	}
  	clearer(ratio) {
  		const rgb = this._rgb;
  		rgb.a *= 1 - ratio;
  		return this;
  	}
  	greyscale() {
  		const rgb = this._rgb;
  		const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
  		rgb.r = rgb.g = rgb.b = val;
  		return this;
  	}
  	opaquer(ratio) {
  		const rgb = this._rgb;
  		rgb.a *= 1 + ratio;
  		return this;
  	}
  	negate() {
  		const v = this._rgb;
  		v.r = 255 - v.r;
  		v.g = 255 - v.g;
  		v.b = 255 - v.b;
  		return this;
  	}
  	lighten(ratio) {
  		modHSL(this._rgb, 2, ratio);
  		return this;
  	}
  	darken(ratio) {
  		modHSL(this._rgb, 2, -ratio);
  		return this;
  	}
  	saturate(ratio) {
  		modHSL(this._rgb, 1, ratio);
  		return this;
  	}
  	desaturate(ratio) {
  		modHSL(this._rgb, 1, -ratio);
  		return this;
  	}
  	rotate(deg) {
  		rotate(this._rgb, deg);
  		return this;
  	}
  }
  function index_esm(input) {
  	return new Color(input);
  }

  const isPatternOrGradient = (value) => value instanceof CanvasGradient || value instanceof CanvasPattern;
  function color(value) {
    return isPatternOrGradient(value) ? value : index_esm(value);
  }
  function getHoverColor(value) {
    return isPatternOrGradient(value)
      ? value
      : index_esm(value).saturate(0.5).darken(0.1).hexString();
  }

  const overrides = Object.create(null);
  const descriptors = Object.create(null);
  function getScope$1(node, key) {
    if (!key) {
      return node;
    }
    const keys = key.split('.');
    for (let i = 0, n = keys.length; i < n; ++i) {
      const k = keys[i];
      node = node[k] || (node[k] = Object.create(null));
    }
    return node;
  }
  function set(root, scope, values) {
    if (typeof scope === 'string') {
      return merge(getScope$1(root, scope), values);
    }
    return merge(getScope$1(root, ''), scope);
  }
  class Defaults {
    constructor(_descriptors) {
      this.animation = undefined;
      this.backgroundColor = 'rgba(0,0,0,0.1)';
      this.borderColor = 'rgba(0,0,0,0.1)';
      this.color = '#666';
      this.datasets = {};
      this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
      this.elements = {};
      this.events = [
        'mousemove',
        'mouseout',
        'click',
        'touchstart',
        'touchmove'
      ];
      this.font = {
        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        size: 12,
        style: 'normal',
        lineHeight: 1.2,
        weight: null
      };
      this.hover = {};
      this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
      this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
      this.hoverColor = (ctx, options) => getHoverColor(options.color);
      this.indexAxis = 'x';
      this.interaction = {
        mode: 'nearest',
        intersect: true
      };
      this.maintainAspectRatio = true;
      this.onHover = null;
      this.onClick = null;
      this.parsing = true;
      this.plugins = {};
      this.responsive = true;
      this.scale = undefined;
      this.scales = {};
      this.showLine = true;
      this.describe(_descriptors);
    }
    set(scope, values) {
      return set(this, scope, values);
    }
    get(scope) {
      return getScope$1(this, scope);
    }
    describe(scope, values) {
      return set(descriptors, scope, values);
    }
    override(scope, values) {
      return set(overrides, scope, values);
    }
    route(scope, name, targetScope, targetName) {
      const scopeObject = getScope$1(this, scope);
      const targetScopeObject = getScope$1(this, targetScope);
      const privateName = '_' + name;
      Object.defineProperties(scopeObject, {
        [privateName]: {
          value: scopeObject[name],
          writable: true
        },
        [name]: {
          enumerable: true,
          get() {
            const local = this[privateName];
            const target = targetScopeObject[targetName];
            if (isObject(local)) {
              return Object.assign({}, target, local);
            }
            return valueOrDefault(local, target);
          },
          set(value) {
            this[privateName] = value;
          }
        }
      });
    }
  }
  var defaults = new Defaults({
    _scriptable: (name) => !name.startsWith('on'),
    _indexable: (name) => name !== 'events',
    hover: {
      _fallback: 'interaction'
    },
    interaction: {
      _scriptable: false,
      _indexable: false,
    }
  });

  function toFontString(font) {
    if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
      return null;
    }
    return (font.style ? font.style + ' ' : '')
  		+ (font.weight ? font.weight + ' ' : '')
  		+ font.size + 'px '
  		+ font.family;
  }
  function _measureText(ctx, data, gc, longest, string) {
    let textWidth = data[string];
    if (!textWidth) {
      textWidth = data[string] = ctx.measureText(string).width;
      gc.push(string);
    }
    if (textWidth > longest) {
      longest = textWidth;
    }
    return longest;
  }
  function _alignPixel(chart, pixel, width) {
    const devicePixelRatio = chart.currentDevicePixelRatio;
    const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
    return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
  }
  function clearCanvas(canvas, ctx) {
    ctx = ctx || canvas.getContext('2d');
    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  function _isPointInArea(point, area, margin) {
    margin = margin || 0.5;
    return point && point.x > area.left - margin && point.x < area.right + margin &&
  		point.y > area.top - margin && point.y < area.bottom + margin;
  }
  function clipArea(ctx, area) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
    ctx.clip();
  }
  function unclipArea(ctx) {
    ctx.restore();
  }
  function renderText(ctx, text, x, y, font, opts = {}) {
    const lines = isArray(text) ? text : [text];
    const stroke = opts.strokeWidth > 0 && opts.strokeColor !== '';
    let i, line;
    ctx.save();
    if (opts.translation) {
      ctx.translate(opts.translation[0], opts.translation[1]);
    }
    if (!isNullOrUndef(opts.rotation)) {
      ctx.rotate(opts.rotation);
    }
    ctx.font = font.string;
    if (opts.color) {
      ctx.fillStyle = opts.color;
    }
    if (opts.textAlign) {
      ctx.textAlign = opts.textAlign;
    }
    if (opts.textBaseline) {
      ctx.textBaseline = opts.textBaseline;
    }
    for (i = 0; i < lines.length; ++i) {
      line = lines[i];
      if (stroke) {
        if (opts.strokeColor) {
          ctx.strokeStyle = opts.strokeColor;
        }
        if (!isNullOrUndef(opts.strokeWidth)) {
          ctx.lineWidth = opts.strokeWidth;
        }
        ctx.strokeText(line, x, y, opts.maxWidth);
      }
      ctx.fillText(line, x, y, opts.maxWidth);
      if (opts.strikethrough || opts.underline) {
        const metrics = ctx.measureText(line);
        const left = x - metrics.actualBoundingBoxLeft;
        const right = x + metrics.actualBoundingBoxRight;
        const top = y - metrics.actualBoundingBoxAscent;
        const bottom = y + metrics.actualBoundingBoxDescent;
        const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.lineWidth = opts.decorationWidth || 2;
        ctx.moveTo(left, yDecoration);
        ctx.lineTo(right, yDecoration);
        ctx.stroke();
      }
      y += font.lineHeight;
    }
    ctx.restore();
  }

  const LINE_HEIGHT = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
  const FONT_STYLE = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/);
  function toLineHeight(value, size) {
    const matches = ('' + value).match(LINE_HEIGHT);
    if (!matches || matches[1] === 'normal') {
      return size * 1.2;
    }
    value = +matches[2];
    switch (matches[3]) {
    case 'px':
      return value;
    case '%':
      value /= 100;
      break;
    }
    return size * value;
  }
  const numberOrZero = v => +v || 0;
  function _readValueToProps(value, props) {
    const ret = {};
    const objProps = isObject(props);
    const keys = objProps ? Object.keys(props) : props;
    const read = isObject(value)
      ? objProps
        ? prop => valueOrDefault(value[prop], value[props[prop]])
        : prop => value[prop]
      : () => value;
    for (const prop of keys) {
      ret[prop] = numberOrZero(read(prop));
    }
    return ret;
  }
  function toTRBL(value) {
    return _readValueToProps(value, {top: 'y', right: 'x', bottom: 'y', left: 'x'});
  }
  function toPadding(value) {
    const obj = toTRBL(value);
    obj.width = obj.left + obj.right;
    obj.height = obj.top + obj.bottom;
    return obj;
  }
  function toFont(options, fallback) {
    options = options || {};
    fallback = fallback || defaults.font;
    let size = valueOrDefault(options.size, fallback.size);
    if (typeof size === 'string') {
      size = parseInt(size, 10);
    }
    let style = valueOrDefault(options.style, fallback.style);
    if (style && !('' + style).match(FONT_STYLE)) {
      console.warn('Invalid font style specified: "' + style + '"');
      style = '';
    }
    const font = {
      family: valueOrDefault(options.family, fallback.family),
      lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
      size,
      style,
      weight: valueOrDefault(options.weight, fallback.weight),
      string: ''
    };
    font.string = toFontString(font);
    return font;
  }
  function resolve(inputs, context, index, info) {
    let cacheable = true;
    let i, ilen, value;
    for (i = 0, ilen = inputs.length; i < ilen; ++i) {
      value = inputs[i];
      if (value === undefined) {
        continue;
      }
      if (context !== undefined && typeof value === 'function') {
        value = value(context);
        cacheable = false;
      }
      if (index !== undefined && isArray(value)) {
        value = value[index % value.length];
        cacheable = false;
      }
      if (value !== undefined) {
        if (info && !cacheable) {
          info.cacheable = false;
        }
        return value;
      }
    }
  }

  function _lookup(table, value, cmp) {
    cmp = cmp || ((index) => table[index] < value);
    let hi = table.length - 1;
    let lo = 0;
    let mid;
    while (hi - lo > 1) {
      mid = (lo + hi) >> 1;
      if (cmp(mid)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return {lo, hi};
  }
  const _lookupByKey = (table, key, value) =>
    _lookup(table, value, index => table[index][key] < value);
  const _rlookupByKey = (table, key, value) =>
    _lookup(table, value, index => table[index][key] >= value);
  const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];
  function listenArrayEvents(array, listener) {
    if (array._chartjs) {
      array._chartjs.listeners.push(listener);
      return;
    }
    Object.defineProperty(array, '_chartjs', {
      configurable: true,
      enumerable: false,
      value: {
        listeners: [listener]
      }
    });
    arrayEvents.forEach((key) => {
      const method = '_onData' + _capitalize(key);
      const base = array[key];
      Object.defineProperty(array, key, {
        configurable: true,
        enumerable: false,
        value(...args) {
          const res = base.apply(this, args);
          array._chartjs.listeners.forEach((object) => {
            if (typeof object[method] === 'function') {
              object[method](...args);
            }
          });
          return res;
        }
      });
    });
  }
  function unlistenArrayEvents(array, listener) {
    const stub = array._chartjs;
    if (!stub) {
      return;
    }
    const listeners = stub.listeners;
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    if (listeners.length > 0) {
      return;
    }
    arrayEvents.forEach((key) => {
      delete array[key];
    });
    delete array._chartjs;
  }

  function _createResolver(scopes, prefixes = [''], rootScopes = scopes, fallback, getTarget = () => scopes[0]) {
    if (!defined(fallback)) {
      fallback = _resolve('_fallback', scopes);
    }
    const cache = {
      [Symbol.toStringTag]: 'Object',
      _cacheable: true,
      _scopes: scopes,
      _rootScopes: rootScopes,
      _fallback: fallback,
      _getTarget: getTarget,
      override: (scope) => _createResolver([scope, ...scopes], prefixes, rootScopes, fallback),
    };
    return new Proxy(cache, {
      deleteProperty(target, prop) {
        delete target[prop];
        delete target._keys;
        delete scopes[0][prop];
        return true;
      },
      get(target, prop) {
        return _cached(target, prop,
          () => _resolveWithPrefixes(prop, prefixes, scopes, target));
      },
      getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
      },
      getPrototypeOf() {
        return Reflect.getPrototypeOf(scopes[0]);
      },
      has(target, prop) {
        return getKeysFromAllScopes(target).includes(prop);
      },
      ownKeys(target) {
        return getKeysFromAllScopes(target);
      },
      set(target, prop, value) {
        const storage = target._storage || (target._storage = getTarget());
        storage[prop] = value;
        delete target[prop];
        delete target._keys;
        return true;
      }
    });
  }
  function _attachContext(proxy, context, subProxy, descriptorDefaults) {
    const cache = {
      _cacheable: false,
      _proxy: proxy,
      _context: context,
      _subProxy: subProxy,
      _stack: new Set(),
      _descriptors: _descriptors(proxy, descriptorDefaults),
      setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
      override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
    };
    return new Proxy(cache, {
      deleteProperty(target, prop) {
        delete target[prop];
        delete proxy[prop];
        return true;
      },
      get(target, prop, receiver) {
        return _cached(target, prop,
          () => _resolveWithContext(target, prop, receiver));
      },
      getOwnPropertyDescriptor(target, prop) {
        return target._descriptors.allKeys
          ? Reflect.has(proxy, prop) ? {enumerable: true, configurable: true} : undefined
          : Reflect.getOwnPropertyDescriptor(proxy, prop);
      },
      getPrototypeOf() {
        return Reflect.getPrototypeOf(proxy);
      },
      has(target, prop) {
        return Reflect.has(proxy, prop);
      },
      ownKeys() {
        return Reflect.ownKeys(proxy);
      },
      set(target, prop, value) {
        proxy[prop] = value;
        delete target[prop];
        return true;
      }
    });
  }
  function _descriptors(proxy, defaults = {scriptable: true, indexable: true}) {
    const {_scriptable = defaults.scriptable, _indexable = defaults.indexable, _allKeys = defaults.allKeys} = proxy;
    return {
      allKeys: _allKeys,
      scriptable: _scriptable,
      indexable: _indexable,
      isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
      isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
    };
  }
  const readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
  const needsSubResolver = (prop, value) => isObject(value) && prop !== 'adapters';
  function _cached(target, prop, resolve) {
    let value = target[prop];
    if (defined(value)) {
      return value;
    }
    value = resolve();
    if (defined(value)) {
      target[prop] = value;
    }
    return value;
  }
  function _resolveWithContext(target, prop, receiver) {
    const {_proxy, _context, _subProxy, _descriptors: descriptors} = target;
    let value = _proxy[prop];
    if (isFunction(value) && descriptors.isScriptable(prop)) {
      value = _resolveScriptable(prop, value, target, receiver);
    }
    if (isArray(value) && value.length) {
      value = _resolveArray(prop, value, target, descriptors.isIndexable);
    }
    if (needsSubResolver(prop, value)) {
      value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors);
    }
    return value;
  }
  function _resolveScriptable(prop, value, target, receiver) {
    const {_proxy, _context, _subProxy, _stack} = target;
    if (_stack.has(prop)) {
      throw new Error('Recursion detected: ' + [..._stack].join('->') + '->' + prop);
    }
    _stack.add(prop);
    value = value(_context, _subProxy || receiver);
    _stack.delete(prop);
    if (isObject(value)) {
      value = createSubResolver(_proxy._scopes, _proxy, prop, value);
    }
    return value;
  }
  function _resolveArray(prop, value, target, isIndexable) {
    const {_proxy, _context, _subProxy, _descriptors: descriptors} = target;
    if (defined(_context.index) && isIndexable(prop)) {
      value = value[_context.index % value.length];
    } else if (isObject(value[0])) {
      const arr = value;
      const scopes = _proxy._scopes.filter(s => s !== arr);
      value = [];
      for (const item of arr) {
        const resolver = createSubResolver(scopes, _proxy, prop, item);
        value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors));
      }
    }
    return value;
  }
  function resolveFallback(fallback, prop, value) {
    return isFunction(fallback) ? fallback(prop, value) : fallback;
  }
  const getScope = (key, parent) => key === true ? parent
    : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;
  function addScopes(set, parentScopes, key, parentFallback) {
    for (const parent of parentScopes) {
      const scope = getScope(key, parent);
      if (scope) {
        set.add(scope);
        const fallback = resolveFallback(scope._fallback, key, scope);
        if (defined(fallback) && fallback !== key && fallback !== parentFallback) {
          return fallback;
        }
      } else if (scope === false && defined(parentFallback) && key !== parentFallback) {
        return null;
      }
    }
    return false;
  }
  function createSubResolver(parentScopes, resolver, prop, value) {
    const rootScopes = resolver._rootScopes;
    const fallback = resolveFallback(resolver._fallback, prop, value);
    const allScopes = [...parentScopes, ...rootScopes];
    const set = new Set();
    set.add(value);
    let key = addScopesFromKey(set, allScopes, prop, fallback || prop);
    if (key === null) {
      return false;
    }
    if (defined(fallback) && fallback !== prop) {
      key = addScopesFromKey(set, allScopes, fallback, key);
      if (key === null) {
        return false;
      }
    }
    return _createResolver([...set], [''], rootScopes, fallback, () => {
      const parent = resolver._getTarget();
      if (!(prop in parent)) {
        parent[prop] = {};
      }
      return parent[prop];
    });
  }
  function addScopesFromKey(set, allScopes, key, fallback) {
    while (key) {
      key = addScopes(set, allScopes, key, fallback);
    }
    return key;
  }
  function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
    let value;
    for (const prefix of prefixes) {
      value = _resolve(readKey(prefix, prop), scopes);
      if (defined(value)) {
        return needsSubResolver(prop, value)
          ? createSubResolver(scopes, proxy, prop, value)
          : value;
      }
    }
  }
  function _resolve(key, scopes) {
    for (const scope of scopes) {
      if (!scope) {
        continue;
      }
      const value = scope[key];
      if (defined(value)) {
        return value;
      }
    }
  }
  function getKeysFromAllScopes(target) {
    let keys = target._keys;
    if (!keys) {
      keys = target._keys = resolveKeysFromAllScopes(target._scopes);
    }
    return keys;
  }
  function resolveKeysFromAllScopes(scopes) {
    const set = new Set();
    for (const scope of scopes) {
      for (const key of Object.keys(scope).filter(k => !k.startsWith('_'))) {
        set.add(key);
      }
    }
    return [...set];
  }

  function _getParentNode(domNode) {
    let parent = domNode.parentNode;
    if (parent && parent.toString() === '[object ShadowRoot]') {
      parent = parent.host;
    }
    return parent;
  }
  function parseMaxStyle(styleValue, node, parentProperty) {
    let valueInPixels;
    if (typeof styleValue === 'string') {
      valueInPixels = parseInt(styleValue, 10);
      if (styleValue.indexOf('%') !== -1) {
        valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
      }
    } else {
      valueInPixels = styleValue;
    }
    return valueInPixels;
  }
  const getComputedStyle = (element) => window.getComputedStyle(element, null);
  function getStyle(el, property) {
    return getComputedStyle(el).getPropertyValue(property);
  }
  const positions = ['top', 'right', 'bottom', 'left'];
  function getPositionedStyle(styles, style, suffix) {
    const result = {};
    suffix = suffix ? '-' + suffix : '';
    for (let i = 0; i < 4; i++) {
      const pos = positions[i];
      result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
    }
    result.width = result.left + result.right;
    result.height = result.top + result.bottom;
    return result;
  }
  const useOffsetPos = (x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot);
  function getCanvasPosition(evt, canvas) {
    const e = evt.native || evt;
    const touches = e.touches;
    const source = touches && touches.length ? touches[0] : e;
    const {offsetX, offsetY} = source;
    let box = false;
    let x, y;
    if (useOffsetPos(offsetX, offsetY, e.target)) {
      x = offsetX;
      y = offsetY;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = source.clientX - rect.left;
      y = source.clientY - rect.top;
      box = true;
    }
    return {x, y, box};
  }
  function getRelativePosition$1(evt, chart) {
    const {canvas, currentDevicePixelRatio} = chart;
    const style = getComputedStyle(canvas);
    const borderBox = style.boxSizing === 'border-box';
    const paddings = getPositionedStyle(style, 'padding');
    const borders = getPositionedStyle(style, 'border', 'width');
    const {x, y, box} = getCanvasPosition(evt, canvas);
    const xOffset = paddings.left + (box && borders.left);
    const yOffset = paddings.top + (box && borders.top);
    let {width, height} = chart;
    if (borderBox) {
      width -= paddings.width + borders.width;
      height -= paddings.height + borders.height;
    }
    return {
      x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
      y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
    };
  }
  function getContainerSize(canvas, width, height) {
    let maxWidth, maxHeight;
    if (width === undefined || height === undefined) {
      const container = _getParentNode(canvas);
      if (!container) {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
      } else {
        const rect = container.getBoundingClientRect();
        const containerStyle = getComputedStyle(container);
        const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
        const containerPadding = getPositionedStyle(containerStyle, 'padding');
        width = rect.width - containerPadding.width - containerBorder.width;
        height = rect.height - containerPadding.height - containerBorder.height;
        maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
        maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
      }
    }
    return {
      width,
      height,
      maxWidth: maxWidth || INFINITY,
      maxHeight: maxHeight || INFINITY
    };
  }
  const round1 = v => Math.round(v * 10) / 10;
  function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
    const style = getComputedStyle(canvas);
    const margins = getPositionedStyle(style, 'margin');
    const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
    const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
    const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
    let {width, height} = containerSize;
    if (style.boxSizing === 'content-box') {
      const borders = getPositionedStyle(style, 'border', 'width');
      const paddings = getPositionedStyle(style, 'padding');
      width -= paddings.width + borders.width;
      height -= paddings.height + borders.height;
    }
    width = Math.max(0, width - margins.width);
    height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height);
    width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
    height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
    if (width && !height) {
      height = round1(width / 2);
    }
    return {
      width,
      height
    };
  }
  function retinaScale(chart, forceRatio, forceStyle) {
    const pixelRatio = chart.currentDevicePixelRatio = forceRatio || 1;
    const {canvas, width, height} = chart;
    canvas.height = height * pixelRatio;
    canvas.width = width * pixelRatio;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (canvas.style && (forceStyle || (!canvas.style.height && !canvas.style.width))) {
      canvas.style.height = height + 'px';
      canvas.style.width = width + 'px';
    }
  }
  const supportsEventListenerOptions = (function() {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      window.addEventListener('test', null, options);
      window.removeEventListener('test', null, options);
    } catch (e) {
    }
    return passiveSupported;
  }());
  function readUsedSize(element, property) {
    const value = getStyle(element, property);
    const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
    return matches ? +matches[1] : undefined;
  }

  const intlCache = new Map();
  function getNumberFormat(locale, options) {
    options = options || {};
    const cacheKey = locale + JSON.stringify(options);
    let formatter = intlCache.get(cacheKey);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, options);
      intlCache.set(cacheKey, formatter);
    }
    return formatter;
  }
  function formatNumber(num, locale, options) {
    return getNumberFormat(locale, options).format(num);
  }

  /*!
   * Chart.js v3.1.0
   * https://www.chartjs.org
   * (c) 2021 Chart.js Contributors
   * Released under the MIT License
   */

  class Animator {
    constructor() {
      this._request = null;
      this._charts = new Map();
      this._running = false;
      this._lastDate = undefined;
    }
    _notify(chart, anims, date, type) {
      const callbacks = anims.listeners[type];
      const numSteps = anims.duration;
      callbacks.forEach(fn => fn({
        chart,
        numSteps,
        currentStep: Math.min(date - anims.start, numSteps)
      }));
    }
    _refresh() {
      const me = this;
      if (me._request) {
        return;
      }
      me._running = true;
      me._request = requestAnimFrame.call(window, () => {
        me._update();
        me._request = null;
        if (me._running) {
          me._refresh();
        }
      });
    }
    _update(date = Date.now()) {
      const me = this;
      let remaining = 0;
      me._charts.forEach((anims, chart) => {
        if (!anims.running || !anims.items.length) {
          return;
        }
        const items = anims.items;
        let i = items.length - 1;
        let draw = false;
        let item;
        for (; i >= 0; --i) {
          item = items[i];
          if (item._active) {
            if (item._total > anims.duration) {
              anims.duration = item._total;
            }
            item.tick(date);
            draw = true;
          } else {
            items[i] = items[items.length - 1];
            items.pop();
          }
        }
        if (draw) {
          chart.draw();
          me._notify(chart, anims, date, 'progress');
        }
        if (!items.length) {
          anims.running = false;
          me._notify(chart, anims, date, 'complete');
        }
        remaining += items.length;
      });
      me._lastDate = date;
      if (remaining === 0) {
        me._running = false;
      }
    }
    _getAnims(chart) {
      const charts = this._charts;
      let anims = charts.get(chart);
      if (!anims) {
        anims = {
          running: false,
          items: [],
          listeners: {
            complete: [],
            progress: []
          }
        };
        charts.set(chart, anims);
      }
      return anims;
    }
    listen(chart, event, cb) {
      this._getAnims(chart).listeners[event].push(cb);
    }
    add(chart, items) {
      if (!items || !items.length) {
        return;
      }
      this._getAnims(chart).items.push(...items);
    }
    has(chart) {
      return this._getAnims(chart).items.length > 0;
    }
    start(chart) {
      const anims = this._charts.get(chart);
      if (!anims) {
        return;
      }
      anims.running = true;
      anims.start = Date.now();
      anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
      this._refresh();
    }
    running(chart) {
      if (!this._running) {
        return false;
      }
      const anims = this._charts.get(chart);
      if (!anims || !anims.running || !anims.items.length) {
        return false;
      }
      return true;
    }
    stop(chart) {
      const anims = this._charts.get(chart);
      if (!anims || !anims.items.length) {
        return;
      }
      const items = anims.items;
      let i = items.length - 1;
      for (; i >= 0; --i) {
        items[i].cancel();
      }
      anims.items = [];
      this._notify(chart, anims, Date.now(), 'complete');
    }
    remove(chart) {
      return this._charts.delete(chart);
    }
  }
  var animator = new Animator();

  const transparent = 'transparent';
  const interpolators = {
    boolean(from, to, factor) {
      return factor > 0.5 ? to : from;
    },
    color(from, to, factor) {
      const c0 = color(from || transparent);
      const c1 = c0.valid && color(to || transparent);
      return c1 && c1.valid
        ? c1.mix(c0, factor).hexString()
        : to;
    },
    number(from, to, factor) {
      return from + (to - from) * factor;
    }
  };
  class Animation {
    constructor(cfg, target, prop, to) {
      const currentValue = target[prop];
      to = resolve([cfg.to, to, currentValue, cfg.from]);
      const from = resolve([cfg.from, currentValue, to]);
      this._active = true;
      this._fn = cfg.fn || interpolators[cfg.type || typeof from];
      this._easing = effects[cfg.easing] || effects.linear;
      this._start = Math.floor(Date.now() + (cfg.delay || 0));
      this._duration = this._total = Math.floor(cfg.duration);
      this._loop = !!cfg.loop;
      this._target = target;
      this._prop = prop;
      this._from = from;
      this._to = to;
      this._promises = undefined;
    }
    active() {
      return this._active;
    }
    update(cfg, to, date) {
      const me = this;
      if (me._active) {
        me._notify(false);
        const currentValue = me._target[me._prop];
        const elapsed = date - me._start;
        const remain = me._duration - elapsed;
        me._start = date;
        me._duration = Math.floor(Math.max(remain, cfg.duration));
        me._total += elapsed;
        me._loop = !!cfg.loop;
        me._to = resolve([cfg.to, to, currentValue, cfg.from]);
        me._from = resolve([cfg.from, currentValue, to]);
      }
    }
    cancel() {
      const me = this;
      if (me._active) {
        me.tick(Date.now());
        me._active = false;
        me._notify(false);
      }
    }
    tick(date) {
      const me = this;
      const elapsed = date - me._start;
      const duration = me._duration;
      const prop = me._prop;
      const from = me._from;
      const loop = me._loop;
      const to = me._to;
      let factor;
      me._active = from !== to && (loop || (elapsed < duration));
      if (!me._active) {
        me._target[prop] = to;
        me._notify(true);
        return;
      }
      if (elapsed < 0) {
        me._target[prop] = from;
        return;
      }
      factor = (elapsed / duration) % 2;
      factor = loop && factor > 1 ? 2 - factor : factor;
      factor = me._easing(Math.min(1, Math.max(0, factor)));
      me._target[prop] = me._fn(from, to, factor);
    }
    wait() {
      const promises = this._promises || (this._promises = []);
      return new Promise((res, rej) => {
        promises.push({res, rej});
      });
    }
    _notify(resolved) {
      const method = resolved ? 'res' : 'rej';
      const promises = this._promises || [];
      for (let i = 0; i < promises.length; i++) {
        promises[i][method]();
      }
    }
  }

  const numbers = ['x', 'y', 'borderWidth', 'radius', 'tension'];
  const colors = ['color', 'borderColor', 'backgroundColor'];
  defaults.set('animation', {
    delay: undefined,
    duration: 1000,
    easing: 'easeOutQuart',
    fn: undefined,
    from: undefined,
    loop: undefined,
    to: undefined,
    type: undefined,
  });
  const animationOptions = Object.keys(defaults.animation);
  defaults.describe('animation', {
    _fallback: false,
    _indexable: false,
    _scriptable: (name) => name !== 'onProgress' && name !== 'onComplete' && name !== 'fn',
  });
  defaults.set('animations', {
    colors: {
      type: 'color',
      properties: colors
    },
    numbers: {
      type: 'number',
      properties: numbers
    },
  });
  defaults.describe('animations', {
    _fallback: 'animation',
  });
  defaults.set('transitions', {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: 'transparent'
        },
        visible: {
          type: 'boolean',
          duration: 0
        },
      }
    },
    hide: {
      animations: {
        colors: {
          to: 'transparent'
        },
        visible: {
          type: 'boolean',
          easing: 'linear',
          fn: v => v | 0
        },
      }
    }
  });
  class Animations {
    constructor(chart, config) {
      this._chart = chart;
      this._properties = new Map();
      this.configure(config);
    }
    configure(config) {
      if (!isObject(config)) {
        return;
      }
      const animatedProps = this._properties;
      Object.getOwnPropertyNames(config).forEach(key => {
        const cfg = config[key];
        if (!isObject(cfg)) {
          return;
        }
        const resolved = {};
        for (const option of animationOptions) {
          resolved[option] = cfg[option];
        }
        (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => {
          if (prop === key || !animatedProps.has(prop)) {
            animatedProps.set(prop, resolved);
          }
        });
      });
    }
    _animateOptions(target, values) {
      const newOptions = values.options;
      const options = resolveTargetOptions(target, newOptions);
      if (!options) {
        return [];
      }
      const animations = this._createAnimations(options, newOptions);
      if (newOptions.$shared) {
        awaitAll(target.options.$animations, newOptions).then(() => {
          target.options = newOptions;
        }, () => {
        });
      }
      return animations;
    }
    _createAnimations(target, values) {
      const animatedProps = this._properties;
      const animations = [];
      const running = target.$animations || (target.$animations = {});
      const props = Object.keys(values);
      const date = Date.now();
      let i;
      for (i = props.length - 1; i >= 0; --i) {
        const prop = props[i];
        if (prop.charAt(0) === '$') {
          continue;
        }
        if (prop === 'options') {
          animations.push(...this._animateOptions(target, values));
          continue;
        }
        const value = values[prop];
        let animation = running[prop];
        const cfg = animatedProps.get(prop);
        if (animation) {
          if (cfg && animation.active()) {
            animation.update(cfg, value, date);
            continue;
          } else {
            animation.cancel();
          }
        }
        if (!cfg || !cfg.duration) {
          target[prop] = value;
          continue;
        }
        running[prop] = animation = new Animation(cfg, target, prop, value);
        animations.push(animation);
      }
      return animations;
    }
    update(target, values) {
      if (this._properties.size === 0) {
        Object.assign(target, values);
        return;
      }
      const animations = this._createAnimations(target, values);
      if (animations.length) {
        animator.add(this._chart, animations);
        return true;
      }
    }
  }
  function awaitAll(animations, properties) {
    const running = [];
    const keys = Object.keys(properties);
    for (let i = 0; i < keys.length; i++) {
      const anim = animations[keys[i]];
      if (anim && anim.active()) {
        running.push(anim.wait());
      }
    }
    return Promise.all(running);
  }
  function resolveTargetOptions(target, newOptions) {
    if (!newOptions) {
      return;
    }
    let options = target.options;
    if (!options) {
      target.options = newOptions;
      return;
    }
    if (options.$shared) {
      target.options = options = Object.assign({}, options, {$shared: false, $animations: {}});
    }
    return options;
  }

  function scaleClip(scale, allowedOverflow) {
    const opts = scale && scale.options || {};
    const reverse = opts.reverse;
    const min = opts.min === undefined ? allowedOverflow : 0;
    const max = opts.max === undefined ? allowedOverflow : 0;
    return {
      start: reverse ? max : min,
      end: reverse ? min : max
    };
  }
  function defaultClip(xScale, yScale, allowedOverflow) {
    if (allowedOverflow === false) {
      return false;
    }
    const x = scaleClip(xScale, allowedOverflow);
    const y = scaleClip(yScale, allowedOverflow);
    return {
      top: y.end,
      right: x.end,
      bottom: y.start,
      left: x.start
    };
  }
  function toClip(value) {
    let t, r, b, l;
    if (isObject(value)) {
      t = value.top;
      r = value.right;
      b = value.bottom;
      l = value.left;
    } else {
      t = r = b = l = value;
    }
    return {
      top: t,
      right: r,
      bottom: b,
      left: l
    };
  }
  function getSortedDatasetIndices(chart, filterVisible) {
    const keys = [];
    const metasets = chart._getSortedDatasetMetas(filterVisible);
    let i, ilen;
    for (i = 0, ilen = metasets.length; i < ilen; ++i) {
      keys.push(metasets[i].index);
    }
    return keys;
  }
  function applyStack(stack, value, dsIndex, options) {
    const keys = stack.keys;
    const singleMode = options.mode === 'single';
    let i, ilen, datasetIndex, otherValue;
    if (value === null) {
      return;
    }
    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      datasetIndex = +keys[i];
      if (datasetIndex === dsIndex) {
        if (options.all) {
          continue;
        }
        break;
      }
      otherValue = stack.values[datasetIndex];
      if (isNumberFinite(otherValue) && (singleMode || (value === 0 || sign(value) === sign(otherValue)))) {
        value += otherValue;
      }
    }
    return value;
  }
  function convertObjectDataToArray(data) {
    const keys = Object.keys(data);
    const adata = new Array(keys.length);
    let i, ilen, key;
    for (i = 0, ilen = keys.length; i < ilen; ++i) {
      key = keys[i];
      adata[i] = {
        x: key,
        y: data[key]
      };
    }
    return adata;
  }
  function isStacked(scale, meta) {
    const stacked = scale && scale.options.stacked;
    return stacked || (stacked === undefined && meta.stack !== undefined);
  }
  function getStackKey(indexScale, valueScale, meta) {
    return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
  }
  function getUserBounds(scale) {
    const {min, max, minDefined, maxDefined} = scale.getUserBounds();
    return {
      min: minDefined ? min : Number.NEGATIVE_INFINITY,
      max: maxDefined ? max : Number.POSITIVE_INFINITY
    };
  }
  function getOrCreateStack(stacks, stackKey, indexValue) {
    const subStack = stacks[stackKey] || (stacks[stackKey] = {});
    return subStack[indexValue] || (subStack[indexValue] = {});
  }
  function updateStacks(controller, parsed) {
    const {chart, _cachedMeta: meta} = controller;
    const stacks = chart._stacks || (chart._stacks = {});
    const {iScale, vScale, index: datasetIndex} = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const key = getStackKey(iScale, vScale, meta);
    const ilen = parsed.length;
    let stack;
    for (let i = 0; i < ilen; ++i) {
      const item = parsed[i];
      const {[iAxis]: index, [vAxis]: value} = item;
      const itemStacks = item._stacks || (item._stacks = {});
      stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
      stack[datasetIndex] = value;
    }
  }
  function getFirstScaleId(chart, axis) {
    const scales = chart.scales;
    return Object.keys(scales).filter(key => scales[key].axis === axis).shift();
  }
  function createDatasetContext(parent, index) {
    return Object.assign(Object.create(parent),
      {
        active: false,
        dataset: undefined,
        datasetIndex: index,
        index,
        mode: 'default',
        type: 'dataset'
      }
    );
  }
  function createDataContext(parent, index, element) {
    return Object.assign(Object.create(parent), {
      active: false,
      dataIndex: index,
      parsed: undefined,
      raw: undefined,
      element,
      index,
      mode: 'default',
      type: 'data'
    });
  }
  function clearStacks(meta, items) {
    items = items || meta._parsed;
    for (const parsed of items) {
      const stacks = parsed._stacks;
      if (!stacks || stacks[meta.vScale.id] === undefined || stacks[meta.vScale.id][meta.index] === undefined) {
        return;
      }
      delete stacks[meta.vScale.id][meta.index];
    }
  }
  const isDirectUpdateMode = (mode) => mode === 'reset' || mode === 'none';
  const cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
  class DatasetController {
    constructor(chart, datasetIndex) {
      this.chart = chart;
      this._ctx = chart.ctx;
      this.index = datasetIndex;
      this._cachedDataOpts = {};
      this._cachedMeta = this.getMeta();
      this._type = this._cachedMeta.type;
      this.options = undefined;
      this._parsing = false;
      this._data = undefined;
      this._objectData = undefined;
      this._sharedOptions = undefined;
      this._drawStart = undefined;
      this._drawCount = undefined;
      this.enableOptionSharing = false;
      this.$context = undefined;
      this.initialize();
    }
    initialize() {
      const me = this;
      const meta = me._cachedMeta;
      me.configure();
      me.linkScales();
      meta._stacked = isStacked(meta.vScale, meta);
      me.addElements();
    }
    updateIndex(datasetIndex) {
      this.index = datasetIndex;
    }
    linkScales() {
      const me = this;
      const chart = me.chart;
      const meta = me._cachedMeta;
      const dataset = me.getDataset();
      const chooseId = (axis, x, y, r) => axis === 'x' ? x : axis === 'r' ? r : y;
      const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, 'x'));
      const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, 'y'));
      const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, 'r'));
      const indexAxis = meta.indexAxis;
      const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
      const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
      meta.xScale = me.getScaleForId(xid);
      meta.yScale = me.getScaleForId(yid);
      meta.rScale = me.getScaleForId(rid);
      meta.iScale = me.getScaleForId(iid);
      meta.vScale = me.getScaleForId(vid);
    }
    getDataset() {
      return this.chart.data.datasets[this.index];
    }
    getMeta() {
      return this.chart.getDatasetMeta(this.index);
    }
    getScaleForId(scaleID) {
      return this.chart.scales[scaleID];
    }
    _getOtherScale(scale) {
      const meta = this._cachedMeta;
      return scale === meta.iScale
        ? meta.vScale
        : meta.iScale;
    }
    reset() {
      this._update('reset');
    }
    _destroy() {
      const meta = this._cachedMeta;
      if (this._data) {
        unlistenArrayEvents(this._data, this);
      }
      if (meta._stacked) {
        clearStacks(meta);
      }
    }
    _dataCheck() {
      const me = this;
      const dataset = me.getDataset();
      const data = dataset.data || (dataset.data = []);
      if (isObject(data)) {
        me._data = convertObjectDataToArray(data);
      } else if (me._data !== data) {
        if (me._data) {
          unlistenArrayEvents(me._data, me);
          clearStacks(me._cachedMeta);
        }
        if (data && Object.isExtensible(data)) {
          listenArrayEvents(data, me);
        }
        me._data = data;
      }
    }
    addElements() {
      const me = this;
      const meta = me._cachedMeta;
      me._dataCheck();
      if (me.datasetElementType) {
        meta.dataset = new me.datasetElementType();
      }
    }
    buildOrUpdateElements(resetNewElements) {
      const me = this;
      const meta = me._cachedMeta;
      const dataset = me.getDataset();
      let stackChanged = false;
      me._dataCheck();
      meta._stacked = isStacked(meta.vScale, meta);
      if (meta.stack !== dataset.stack) {
        stackChanged = true;
        clearStacks(meta);
        meta.stack = dataset.stack;
      }
      me._resyncElements(resetNewElements);
      if (stackChanged) {
        updateStacks(me, meta._parsed);
      }
    }
    configure() {
      const me = this;
      const config = me.chart.config;
      const scopeKeys = config.datasetScopeKeys(me._type);
      const scopes = config.getOptionScopes(me.getDataset(), scopeKeys, true);
      me.options = config.createResolver(scopes, me.getContext());
      me._parsing = me.options.parsing;
    }
    parse(start, count) {
      const me = this;
      const {_cachedMeta: meta, _data: data} = me;
      const {iScale, _stacked} = meta;
      const iAxis = iScale.axis;
      let sorted = start === 0 && count === data.length ? true : meta._sorted;
      let prev = start > 0 && meta._parsed[start - 1];
      let i, cur, parsed;
      if (me._parsing === false) {
        meta._parsed = data;
        meta._sorted = true;
      } else {
        if (isArray(data[start])) {
          parsed = me.parseArrayData(meta, data, start, count);
        } else if (isObject(data[start])) {
          parsed = me.parseObjectData(meta, data, start, count);
        } else {
          parsed = me.parsePrimitiveData(meta, data, start, count);
        }
        const isNotInOrderComparedToPrev = () => cur[iAxis] === null || (prev && cur[iAxis] < prev[iAxis]);
        for (i = 0; i < count; ++i) {
          meta._parsed[i + start] = cur = parsed[i];
          if (sorted) {
            if (isNotInOrderComparedToPrev()) {
              sorted = false;
            }
            prev = cur;
          }
        }
        meta._sorted = sorted;
      }
      if (_stacked) {
        updateStacks(me, parsed);
      }
    }
    parsePrimitiveData(meta, data, start, count) {
      const {iScale, vScale} = meta;
      const iAxis = iScale.axis;
      const vAxis = vScale.axis;
      const labels = iScale.getLabels();
      const singleScale = iScale === vScale;
      const parsed = new Array(count);
      let i, ilen, index;
      for (i = 0, ilen = count; i < ilen; ++i) {
        index = i + start;
        parsed[i] = {
          [iAxis]: singleScale || iScale.parse(labels[index], index),
          [vAxis]: vScale.parse(data[index], index)
        };
      }
      return parsed;
    }
    parseArrayData(meta, data, start, count) {
      const {xScale, yScale} = meta;
      const parsed = new Array(count);
      let i, ilen, index, item;
      for (i = 0, ilen = count; i < ilen; ++i) {
        index = i + start;
        item = data[index];
        parsed[i] = {
          x: xScale.parse(item[0], index),
          y: yScale.parse(item[1], index)
        };
      }
      return parsed;
    }
    parseObjectData(meta, data, start, count) {
      const {xScale, yScale} = meta;
      const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
      const parsed = new Array(count);
      let i, ilen, index, item;
      for (i = 0, ilen = count; i < ilen; ++i) {
        index = i + start;
        item = data[index];
        parsed[i] = {
          x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
          y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
        };
      }
      return parsed;
    }
    getParsed(index) {
      return this._cachedMeta._parsed[index];
    }
    getDataElement(index) {
      return this._cachedMeta.data[index];
    }
    applyStack(scale, parsed, mode) {
      const chart = this.chart;
      const meta = this._cachedMeta;
      const value = parsed[scale.axis];
      const stack = {
        keys: getSortedDatasetIndices(chart, true),
        values: parsed._stacks[scale.axis]
      };
      return applyStack(stack, value, meta.index, {mode});
    }
    updateRangeFromParsed(range, scale, parsed, stack) {
      const parsedValue = parsed[scale.axis];
      let value = parsedValue === null ? NaN : parsedValue;
      const values = stack && parsed._stacks[scale.axis];
      if (stack && values) {
        stack.values = values;
        range.min = Math.min(range.min, value);
        range.max = Math.max(range.max, value);
        value = applyStack(stack, parsedValue, this._cachedMeta.index, {all: true});
      }
      range.min = Math.min(range.min, value);
      range.max = Math.max(range.max, value);
    }
    getMinMax(scale, canStack) {
      const me = this;
      const meta = me._cachedMeta;
      const _parsed = meta._parsed;
      const sorted = meta._sorted && scale === meta.iScale;
      const ilen = _parsed.length;
      const otherScale = me._getOtherScale(scale);
      const stack = canStack && meta._stacked && {keys: getSortedDatasetIndices(me.chart, true), values: null};
      const range = {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY};
      const {min: otherMin, max: otherMax} = getUserBounds(otherScale);
      let i, value, parsed, otherValue;
      function _skip() {
        parsed = _parsed[i];
        value = parsed[scale.axis];
        otherValue = parsed[otherScale.axis];
        return !isNumberFinite(value) || otherMin > otherValue || otherMax < otherValue;
      }
      for (i = 0; i < ilen; ++i) {
        if (_skip()) {
          continue;
        }
        me.updateRangeFromParsed(range, scale, parsed, stack);
        if (sorted) {
          break;
        }
      }
      if (sorted) {
        for (i = ilen - 1; i >= 0; --i) {
          if (_skip()) {
            continue;
          }
          me.updateRangeFromParsed(range, scale, parsed, stack);
          break;
        }
      }
      return range;
    }
    getAllParsedValues(scale) {
      const parsed = this._cachedMeta._parsed;
      const values = [];
      let i, ilen, value;
      for (i = 0, ilen = parsed.length; i < ilen; ++i) {
        value = parsed[i][scale.axis];
        if (isNumberFinite(value)) {
          values.push(value);
        }
      }
      return values;
    }
    getMaxOverflow() {
      return false;
    }
    getLabelAndValue(index) {
      const me = this;
      const meta = me._cachedMeta;
      const iScale = meta.iScale;
      const vScale = meta.vScale;
      const parsed = me.getParsed(index);
      return {
        label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
        value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
      };
    }
    _update(mode) {
      const me = this;
      const meta = me._cachedMeta;
      me.configure();
      me._cachedDataOpts = {};
      me.update(mode || 'default');
      meta._clip = toClip(valueOrDefault(me.options.clip, defaultClip(meta.xScale, meta.yScale, me.getMaxOverflow())));
    }
    update(mode) {}
    draw() {
      const me = this;
      const ctx = me._ctx;
      const chart = me.chart;
      const meta = me._cachedMeta;
      const elements = meta.data || [];
      const area = chart.chartArea;
      const active = [];
      const start = me._drawStart || 0;
      const count = me._drawCount || (elements.length - start);
      let i;
      if (meta.dataset) {
        meta.dataset.draw(ctx, area, start, count);
      }
      for (i = start; i < start + count; ++i) {
        const element = elements[i];
        if (element.active) {
          active.push(element);
        } else {
          element.draw(ctx, area);
        }
      }
      for (i = 0; i < active.length; ++i) {
        active[i].draw(ctx, area);
      }
    }
    getStyle(index, active) {
      const mode = active ? 'active' : 'default';
      return index === undefined && this._cachedMeta.dataset
        ? this.resolveDatasetElementOptions(mode)
        : this.resolveDataElementOptions(index || 0, mode);
    }
    getContext(index, active, mode) {
      const me = this;
      const dataset = me.getDataset();
      let context;
      if (index >= 0 && index < me._cachedMeta.data.length) {
        const element = me._cachedMeta.data[index];
        context = element.$context ||
          (element.$context = createDataContext(me.getContext(), index, element));
        context.parsed = me.getParsed(index);
        context.raw = dataset.data[index];
      } else {
        context = me.$context ||
          (me.$context = createDatasetContext(me.chart.getContext(), me.index));
        context.dataset = dataset;
      }
      context.active = !!active;
      context.mode = mode;
      return context;
    }
    resolveDatasetElementOptions(mode) {
      return this._resolveElementOptions(this.datasetElementType.id, mode);
    }
    resolveDataElementOptions(index, mode) {
      return this._resolveElementOptions(this.dataElementType.id, mode, index);
    }
    _resolveElementOptions(elementType, mode = 'default', index) {
      const me = this;
      const active = mode === 'active';
      const cache = me._cachedDataOpts;
      const cacheKey = elementType + '-' + mode;
      const cached = cache[cacheKey];
      const sharing = me.enableOptionSharing && defined(index);
      if (cached) {
        return cloneIfNotShared(cached, sharing);
      }
      const config = me.chart.config;
      const scopeKeys = config.datasetElementScopeKeys(me._type, elementType);
      const prefixes = active ? [`${elementType}Hover`, 'hover', elementType, ''] : [elementType, ''];
      const scopes = config.getOptionScopes(me.getDataset(), scopeKeys);
      const names = Object.keys(defaults.elements[elementType]);
      const context = () => me.getContext(index, active);
      const values = config.resolveNamedOptions(scopes, names, context, prefixes);
      if (values.$shared) {
        values.$shared = sharing;
        cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
      }
      return values;
    }
    _resolveAnimations(index, transition, active) {
      const me = this;
      const chart = me.chart;
      const cache = me._cachedDataOpts;
      const cacheKey = `animation-${transition}`;
      const cached = cache[cacheKey];
      if (cached) {
        return cached;
      }
      let options;
      if (chart.options.animation !== false) {
        const config = me.chart.config;
        const scopeKeys = config.datasetAnimationScopeKeys(me._type, transition);
        const scopes = config.getOptionScopes(me.getDataset(), scopeKeys);
        options = config.createResolver(scopes, me.getContext(index, active, transition));
      }
      const animations = new Animations(chart, options && options.animations);
      if (options && options._cacheable) {
        cache[cacheKey] = Object.freeze(animations);
      }
      return animations;
    }
    getSharedOptions(options) {
      if (!options.$shared) {
        return;
      }
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
    }
    includeOptions(mode, sharedOptions) {
      return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
    }
    updateElement(element, index, properties, mode) {
      if (isDirectUpdateMode(mode)) {
        Object.assign(element, properties);
      } else {
        this._resolveAnimations(index, mode).update(element, properties);
      }
    }
    updateSharedOptions(sharedOptions, mode, newOptions) {
      if (sharedOptions && !isDirectUpdateMode(mode)) {
        this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions);
      }
    }
    _setStyle(element, index, mode, active) {
      element.active = active;
      const options = this.getStyle(index, active);
      this._resolveAnimations(index, mode, active).update(element, {
        options: (!active && this.getSharedOptions(options)) || options
      });
    }
    removeHoverStyle(element, datasetIndex, index) {
      this._setStyle(element, index, 'active', false);
    }
    setHoverStyle(element, datasetIndex, index) {
      this._setStyle(element, index, 'active', true);
    }
    _removeDatasetHoverStyle() {
      const element = this._cachedMeta.dataset;
      if (element) {
        this._setStyle(element, undefined, 'active', false);
      }
    }
    _setDatasetHoverStyle() {
      const element = this._cachedMeta.dataset;
      if (element) {
        this._setStyle(element, undefined, 'active', true);
      }
    }
    _resyncElements(resetNewElements) {
      const me = this;
      const numMeta = me._cachedMeta.data.length;
      const numData = me._data.length;
      if (numData > numMeta) {
        me._insertElements(numMeta, numData - numMeta, resetNewElements);
      } else if (numData < numMeta) {
        me._removeElements(numData, numMeta - numData);
      }
      const count = Math.min(numData, numMeta);
      if (count) {
        me.parse(0, count);
      }
    }
    _insertElements(start, count, resetNewElements = true) {
      const me = this;
      const meta = me._cachedMeta;
      const data = meta.data;
      const end = start + count;
      let i;
      const move = (arr) => {
        arr.length += count;
        for (i = arr.length - 1; i >= end; i--) {
          arr[i] = arr[i - count];
        }
      };
      move(data);
      for (i = start; i < end; ++i) {
        data[i] = new me.dataElementType();
      }
      if (me._parsing) {
        move(meta._parsed);
      }
      me.parse(start, count);
      if (resetNewElements) {
        me.updateElements(data, start, count, 'reset');
      }
    }
    updateElements(element, start, count, mode) {}
    _removeElements(start, count) {
      const me = this;
      const meta = me._cachedMeta;
      if (me._parsing) {
        const removed = meta._parsed.splice(start, count);
        if (meta._stacked) {
          clearStacks(meta, removed);
        }
      }
      meta.data.splice(start, count);
    }
    _onDataPush() {
      const count = arguments.length;
      this._insertElements(this.getDataset().data.length - count, count);
    }
    _onDataPop() {
      this._removeElements(this._cachedMeta.data.length - 1, 1);
    }
    _onDataShift() {
      this._removeElements(0, 1);
    }
    _onDataSplice(start, count) {
      this._removeElements(start, count);
      this._insertElements(start, arguments.length - 2);
    }
    _onDataUnshift() {
      this._insertElements(0, arguments.length);
    }
  }
  DatasetController.defaults = {};
  DatasetController.prototype.datasetElementType = null;
  DatasetController.prototype.dataElementType = null;

  function getRelativePosition(e, chart) {
    if ('native' in e) {
      return {
        x: e.x,
        y: e.y
      };
    }
    return getRelativePosition$1(e, chart);
  }
  function evaluateAllVisibleItems(chart, handler) {
    const metasets = chart.getSortedVisibleDatasetMetas();
    let index, data, element;
    for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
      ({index, data} = metasets[i]);
      for (let j = 0, jlen = data.length; j < jlen; ++j) {
        element = data[j];
        if (!element.skip) {
          handler(element, index, j);
        }
      }
    }
  }
  function binarySearch(metaset, axis, value, intersect) {
    const {controller, data, _sorted} = metaset;
    const iScale = controller._cachedMeta.iScale;
    if (iScale && axis === iScale.axis && _sorted && data.length) {
      const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
      if (!intersect) {
        return lookupMethod(data, axis, value);
      } else if (controller._sharedOptions) {
        const el = data[0];
        const range = typeof el.getRange === 'function' && el.getRange(axis);
        if (range) {
          const start = lookupMethod(data, axis, value - range);
          const end = lookupMethod(data, axis, value + range);
          return {lo: start.lo, hi: end.hi};
        }
      }
    }
    return {lo: 0, hi: data.length - 1};
  }
  function optimizedEvaluateItems(chart, axis, position, handler, intersect) {
    const metasets = chart.getSortedVisibleDatasetMetas();
    const value = position[axis];
    for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
      const {index, data} = metasets[i];
      const {lo, hi} = binarySearch(metasets[i], axis, value, intersect);
      for (let j = lo; j <= hi; ++j) {
        const element = data[j];
        if (!element.skip) {
          handler(element, index, j);
        }
      }
    }
  }
  function getDistanceMetricForAxis(axis) {
    const useX = axis.indexOf('x') !== -1;
    const useY = axis.indexOf('y') !== -1;
    return function(pt1, pt2) {
      const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
      const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
      return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    };
  }
  function getIntersectItems(chart, position, axis, useFinalPosition) {
    const items = [];
    if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
      return items;
    }
    const evaluationFunc = function(element, datasetIndex, index) {
      if (element.inRange(position.x, position.y, useFinalPosition)) {
        items.push({element, datasetIndex, index});
      }
    };
    optimizedEvaluateItems(chart, axis, position, evaluationFunc, true);
    return items;
  }
  function getNearestItems(chart, position, axis, intersect, useFinalPosition) {
    const distanceMetric = getDistanceMetricForAxis(axis);
    let minDistance = Number.POSITIVE_INFINITY;
    let items = [];
    if (!_isPointInArea(position, chart.chartArea, chart._minPadding)) {
      return items;
    }
    const evaluationFunc = function(element, datasetIndex, index) {
      if (intersect && !element.inRange(position.x, position.y, useFinalPosition)) {
        return;
      }
      const center = element.getCenterPoint(useFinalPosition);
      const distance = distanceMetric(position, center);
      if (distance < minDistance) {
        items = [{element, datasetIndex, index}];
        minDistance = distance;
      } else if (distance === minDistance) {
        items.push({element, datasetIndex, index});
      }
    };
    optimizedEvaluateItems(chart, axis, position, evaluationFunc);
    return items;
  }
  function getAxisItems(chart, e, options, useFinalPosition) {
    const position = getRelativePosition(e, chart);
    const items = [];
    const axis = options.axis;
    const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
    let intersectsItem = false;
    evaluateAllVisibleItems(chart, (element, datasetIndex, index) => {
      if (element[rangeMethod](position[axis], useFinalPosition)) {
        items.push({element, datasetIndex, index});
      }
      if (element.inRange(position.x, position.y, useFinalPosition)) {
        intersectsItem = true;
      }
    });
    if (options.intersect && !intersectsItem) {
      return [];
    }
    return items;
  }
  var Interaction = {
    modes: {
      index(chart, e, options, useFinalPosition) {
        const position = getRelativePosition(e, chart);
        const axis = options.axis || 'x';
        const items = options.intersect
          ? getIntersectItems(chart, position, axis, useFinalPosition)
          : getNearestItems(chart, position, axis, false, useFinalPosition);
        const elements = [];
        if (!items.length) {
          return [];
        }
        chart.getSortedVisibleDatasetMetas().forEach((meta) => {
          const index = items[0].index;
          const element = meta.data[index];
          if (element && !element.skip) {
            elements.push({element, datasetIndex: meta.index, index});
          }
        });
        return elements;
      },
      dataset(chart, e, options, useFinalPosition) {
        const position = getRelativePosition(e, chart);
        const axis = options.axis || 'xy';
        let items = options.intersect
          ? getIntersectItems(chart, position, axis, useFinalPosition) :
          getNearestItems(chart, position, axis, false, useFinalPosition);
        if (items.length > 0) {
          const datasetIndex = items[0].datasetIndex;
          const data = chart.getDatasetMeta(datasetIndex).data;
          items = [];
          for (let i = 0; i < data.length; ++i) {
            items.push({element: data[i], datasetIndex, index: i});
          }
        }
        return items;
      },
      point(chart, e, options, useFinalPosition) {
        const position = getRelativePosition(e, chart);
        const axis = options.axis || 'xy';
        return getIntersectItems(chart, position, axis, useFinalPosition);
      },
      nearest(chart, e, options, useFinalPosition) {
        const position = getRelativePosition(e, chart);
        const axis = options.axis || 'xy';
        return getNearestItems(chart, position, axis, options.intersect, useFinalPosition);
      },
      x(chart, e, options, useFinalPosition) {
        options.axis = 'x';
        return getAxisItems(chart, e, options, useFinalPosition);
      },
      y(chart, e, options, useFinalPosition) {
        options.axis = 'y';
        return getAxisItems(chart, e, options, useFinalPosition);
      }
    }
  };

  const STATIC_POSITIONS = ['left', 'top', 'right', 'bottom'];
  function filterByPosition(array, position) {
    return array.filter(v => v.pos === position);
  }
  function filterDynamicPositionByAxis(array, axis) {
    return array.filter(v => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
  }
  function sortByWeight(array, reverse) {
    return array.sort((a, b) => {
      const v0 = reverse ? b : a;
      const v1 = reverse ? a : b;
      return v0.weight === v1.weight ?
        v0.index - v1.index :
        v0.weight - v1.weight;
    });
  }
  function wrapBoxes(boxes) {
    const layoutBoxes = [];
    let i, ilen, box;
    for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
      box = boxes[i];
      layoutBoxes.push({
        index: i,
        box,
        pos: box.position,
        horizontal: box.isHorizontal(),
        weight: box.weight
      });
    }
    return layoutBoxes;
  }
  function setLayoutDims(layouts, params) {
    let i, ilen, layout;
    for (i = 0, ilen = layouts.length; i < ilen; ++i) {
      layout = layouts[i];
      if (layout.horizontal) {
        layout.width = layout.box.fullSize && params.availableWidth;
        layout.height = params.hBoxMaxHeight;
      } else {
        layout.width = params.vBoxMaxWidth;
        layout.height = layout.box.fullSize && params.availableHeight;
      }
    }
  }
  function buildLayoutBoxes(boxes) {
    const layoutBoxes = wrapBoxes(boxes);
    const fullSize = sortByWeight(layoutBoxes.filter(wrap => wrap.box.fullSize), true);
    const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
    const right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
    const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
    const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
    const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
    const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');
    return {
      fullSize,
      leftAndTop: left.concat(top),
      rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
      chartArea: filterByPosition(layoutBoxes, 'chartArea'),
      vertical: left.concat(right).concat(centerVertical),
      horizontal: top.concat(bottom).concat(centerHorizontal)
    };
  }
  function getCombinedMax(maxPadding, chartArea, a, b) {
    return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
  }
  function updateMaxPadding(maxPadding, boxPadding) {
    maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
    maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
    maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
    maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
  }
  function updateDims(chartArea, params, layout) {
    const box = layout.box;
    const maxPadding = chartArea.maxPadding;
    if (!isObject(layout.pos)) {
      if (layout.size) {
        chartArea[layout.pos] -= layout.size;
      }
      layout.size = layout.horizontal ? box.height : box.width;
      chartArea[layout.pos] += layout.size;
    }
    if (box.getPadding) {
      updateMaxPadding(maxPadding, box.getPadding());
    }
    const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right'));
    const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom'));
    const widthChanged = newWidth !== chartArea.w;
    const heightChanged = newHeight !== chartArea.h;
    chartArea.w = newWidth;
    chartArea.h = newHeight;
    return layout.horizontal
      ? {same: widthChanged, other: heightChanged}
      : {same: heightChanged, other: widthChanged};
  }
  function handleMaxPadding(chartArea) {
    const maxPadding = chartArea.maxPadding;
    function updatePos(pos) {
      const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
      chartArea[pos] += change;
      return change;
    }
    chartArea.y += updatePos('top');
    chartArea.x += updatePos('left');
    updatePos('right');
    updatePos('bottom');
  }
  function getMargins(horizontal, chartArea) {
    const maxPadding = chartArea.maxPadding;
    function marginForPositions(positions) {
      const margin = {left: 0, top: 0, right: 0, bottom: 0};
      positions.forEach((pos) => {
        margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
      });
      return margin;
    }
    return horizontal
      ? marginForPositions(['left', 'right'])
      : marginForPositions(['top', 'bottom']);
  }
  function fitBoxes(boxes, chartArea, params) {
    const refitBoxes = [];
    let i, ilen, layout, box, refit, changed;
    for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
      layout = boxes[i];
      box = layout.box;
      box.update(
        layout.width || chartArea.w,
        layout.height || chartArea.h,
        getMargins(layout.horizontal, chartArea)
      );
      const {same, other} = updateDims(chartArea, params, layout);
      refit |= same && refitBoxes.length;
      changed = changed || other;
      if (!box.fullSize) {
        refitBoxes.push(layout);
      }
    }
    return refit && fitBoxes(refitBoxes, chartArea, params) || changed;
  }
  function placeBoxes(boxes, chartArea, params) {
    const userPadding = params.padding;
    let x = chartArea.x;
    let y = chartArea.y;
    let i, ilen, layout, box;
    for (i = 0, ilen = boxes.length; i < ilen; ++i) {
      layout = boxes[i];
      box = layout.box;
      if (layout.horizontal) {
        box.left = box.fullSize ? userPadding.left : chartArea.left;
        box.right = box.fullSize ? params.outerWidth - userPadding.right : chartArea.left + chartArea.w;
        box.top = y;
        box.bottom = y + box.height;
        box.width = box.right - box.left;
        y = box.bottom;
      } else {
        box.left = x;
        box.right = x + box.width;
        box.top = box.fullSize ? userPadding.top : chartArea.top;
        box.bottom = box.fullSize ? params.outerHeight - userPadding.right : chartArea.top + chartArea.h;
        box.height = box.bottom - box.top;
        x = box.right;
      }
    }
    chartArea.x = x;
    chartArea.y = y;
  }
  defaults.set('layout', {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
  var layouts = {
    addBox(chart, item) {
      if (!chart.boxes) {
        chart.boxes = [];
      }
      item.fullSize = item.fullSize || false;
      item.position = item.position || 'top';
      item.weight = item.weight || 0;
      item._layers = item._layers || function() {
        return [{
          z: 0,
          draw(chartArea) {
            item.draw(chartArea);
          }
        }];
      };
      chart.boxes.push(item);
    },
    removeBox(chart, layoutItem) {
      const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
      if (index !== -1) {
        chart.boxes.splice(index, 1);
      }
    },
    configure(chart, item, options) {
      item.fullSize = options.fullSize;
      item.position = options.position;
      item.weight = options.weight;
    },
    update(chart, width, height, minPadding) {
      if (!chart) {
        return;
      }
      const padding = toPadding(chart.options.layout.padding);
      const availableWidth = width - padding.width;
      const availableHeight = height - padding.height;
      const boxes = buildLayoutBoxes(chart.boxes);
      const verticalBoxes = boxes.vertical;
      const horizontalBoxes = boxes.horizontal;
      each(chart.boxes, box => {
        if (typeof box.beforeLayout === 'function') {
          box.beforeLayout();
        }
      });
      const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) =>
        wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
      const params = Object.freeze({
        outerWidth: width,
        outerHeight: height,
        padding,
        availableWidth,
        availableHeight,
        vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
        hBoxMaxHeight: availableHeight / 2
      });
      const maxPadding = Object.assign({}, padding);
      updateMaxPadding(maxPadding, toPadding(minPadding));
      const chartArea = Object.assign({
        maxPadding,
        w: availableWidth,
        h: availableHeight,
        x: padding.left,
        y: padding.top
      }, padding);
      setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
      fitBoxes(boxes.fullSize, chartArea, params);
      fitBoxes(verticalBoxes, chartArea, params);
      if (fitBoxes(horizontalBoxes, chartArea, params)) {
        fitBoxes(verticalBoxes, chartArea, params);
      }
      handleMaxPadding(chartArea);
      placeBoxes(boxes.leftAndTop, chartArea, params);
      chartArea.x += chartArea.w;
      chartArea.y += chartArea.h;
      placeBoxes(boxes.rightAndBottom, chartArea, params);
      chart.chartArea = {
        left: chartArea.left,
        top: chartArea.top,
        right: chartArea.left + chartArea.w,
        bottom: chartArea.top + chartArea.h,
        height: chartArea.h,
        width: chartArea.w,
      };
      each(boxes.chartArea, (layout) => {
        const box = layout.box;
        Object.assign(box, chart.chartArea);
        box.update(chartArea.w, chartArea.h);
      });
    }
  };

  class BasePlatform {
    acquireContext(canvas, aspectRatio) {}
    releaseContext(context) {
      return false;
    }
    addEventListener(chart, type, listener) {}
    removeEventListener(chart, type, listener) {}
    getDevicePixelRatio() {
      return 1;
    }
    getMaximumSize(element, width, height, aspectRatio) {
      width = Math.max(0, width || element.width);
      height = height || element.height;
      return {
        width,
        height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
      };
    }
    isAttached(canvas) {
      return true;
    }
  }

  class BasicPlatform extends BasePlatform {
    acquireContext(item) {
      return item && item.getContext && item.getContext('2d') || null;
    }
  }

  const EXPANDO_KEY = '$chartjs';
  const EVENT_TYPES = {
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',
    pointerenter: 'mouseenter',
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointerleave: 'mouseout',
    pointerout: 'mouseout'
  };
  const isNullOrEmpty = value => value === null || value === '';
  function initCanvas(canvas, aspectRatio) {
    const style = canvas.style;
    const renderHeight = canvas.getAttribute('height');
    const renderWidth = canvas.getAttribute('width');
    canvas[EXPANDO_KEY] = {
      initial: {
        height: renderHeight,
        width: renderWidth,
        style: {
          display: style.display,
          height: style.height,
          width: style.width
        }
      }
    };
    style.display = style.display || 'block';
    style.boxSizing = style.boxSizing || 'border-box';
    if (isNullOrEmpty(renderWidth)) {
      const displayWidth = readUsedSize(canvas, 'width');
      if (displayWidth !== undefined) {
        canvas.width = displayWidth;
      }
    }
    if (isNullOrEmpty(renderHeight)) {
      if (canvas.style.height === '') {
        canvas.height = canvas.width / (aspectRatio || 2);
      } else {
        const displayHeight = readUsedSize(canvas, 'height');
        if (displayHeight !== undefined) {
          canvas.height = displayHeight;
        }
      }
    }
    return canvas;
  }
  const eventListenerOptions = supportsEventListenerOptions ? {passive: true} : false;
  function addListener(node, type, listener) {
    node.addEventListener(type, listener, eventListenerOptions);
  }
  function removeListener(chart, type, listener) {
    chart.canvas.removeEventListener(type, listener, eventListenerOptions);
  }
  function fromNativeEvent(event, chart) {
    const type = EVENT_TYPES[event.type] || event.type;
    const {x, y} = getRelativePosition$1(event, chart);
    return {
      type,
      chart,
      native: event,
      x: x !== undefined ? x : null,
      y: y !== undefined ? y : null,
    };
  }
  function createAttachObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const container = canvas && _getParentNode(canvas);
    const element = container || canvas;
    const observer = new MutationObserver(entries => {
      const parent = _getParentNode(element);
      entries.forEach(entry => {
        for (let i = 0; i < entry.addedNodes.length; i++) {
          const added = entry.addedNodes[i];
          if (added === element || added === parent) {
            listener(entry.target);
          }
        }
      });
    });
    observer.observe(document, {childList: true, subtree: true});
    return observer;
  }
  function createDetachObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const container = canvas && _getParentNode(canvas);
    if (!container) {
      return;
    }
    const observer = new MutationObserver(entries => {
      entries.forEach(entry => {
        for (let i = 0; i < entry.removedNodes.length; i++) {
          if (entry.removedNodes[i] === canvas) {
            listener();
            break;
          }
        }
      });
    });
    observer.observe(container, {childList: true});
    return observer;
  }
  const drpListeningCharts = new Map();
  let oldDevicePixelRatio = 0;
  function onWindowResize() {
    const dpr = window.devicePixelRatio;
    if (dpr === oldDevicePixelRatio) {
      return;
    }
    oldDevicePixelRatio = dpr;
    drpListeningCharts.forEach((resize, chart) => {
      if (chart.currentDevicePixelRatio !== dpr) {
        resize();
      }
    });
  }
  function listenDevicePixelRatioChanges(chart, resize) {
    if (!drpListeningCharts.size) {
      window.addEventListener('resize', onWindowResize);
    }
    drpListeningCharts.set(chart, resize);
  }
  function unlistenDevicePixelRatioChanges(chart) {
    drpListeningCharts.delete(chart);
    if (!drpListeningCharts.size) {
      window.removeEventListener('resize', onWindowResize);
    }
  }
  function createResizeObserver(chart, type, listener) {
    const canvas = chart.canvas;
    const container = canvas && _getParentNode(canvas);
    if (!container) {
      return;
    }
    const resize = throttled((width, height) => {
      const w = container.clientWidth;
      listener(width, height);
      if (w < container.clientWidth) {
        listener();
      }
    }, window);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      if (width === 0 && height === 0) {
        return;
      }
      resize(width, height);
    });
    observer.observe(container);
    listenDevicePixelRatioChanges(chart, resize);
    return observer;
  }
  function releaseObserver(chart, type, observer) {
    if (observer) {
      observer.disconnect();
    }
    if (type === 'resize') {
      unlistenDevicePixelRatioChanges(chart);
    }
  }
  function createProxyAndListen(chart, type, listener) {
    const canvas = chart.canvas;
    const proxy = throttled((event) => {
      if (chart.ctx !== null) {
        listener(fromNativeEvent(event, chart));
      }
    }, chart, (args) => {
      const event = args[0];
      return [event, event.offsetX, event.offsetY];
    });
    addListener(canvas, type, proxy);
    return proxy;
  }
  class DomPlatform extends BasePlatform {
    acquireContext(canvas, aspectRatio) {
      const context = canvas && canvas.getContext && canvas.getContext('2d');
      if (context && context.canvas === canvas) {
        initCanvas(canvas, aspectRatio);
        return context;
      }
      return null;
    }
    releaseContext(context) {
      const canvas = context.canvas;
      if (!canvas[EXPANDO_KEY]) {
        return false;
      }
      const initial = canvas[EXPANDO_KEY].initial;
      ['height', 'width'].forEach((prop) => {
        const value = initial[prop];
        if (isNullOrUndef(value)) {
          canvas.removeAttribute(prop);
        } else {
          canvas.setAttribute(prop, value);
        }
      });
      const style = initial.style || {};
      Object.keys(style).forEach((key) => {
        canvas.style[key] = style[key];
      });
      canvas.width = canvas.width;
      delete canvas[EXPANDO_KEY];
      return true;
    }
    addEventListener(chart, type, listener) {
      this.removeEventListener(chart, type);
      const proxies = chart.$proxies || (chart.$proxies = {});
      const handlers = {
        attach: createAttachObserver,
        detach: createDetachObserver,
        resize: createResizeObserver
      };
      const handler = handlers[type] || createProxyAndListen;
      proxies[type] = handler(chart, type, listener);
    }
    removeEventListener(chart, type) {
      const proxies = chart.$proxies || (chart.$proxies = {});
      const proxy = proxies[type];
      if (!proxy) {
        return;
      }
      const handlers = {
        attach: releaseObserver,
        detach: releaseObserver,
        resize: releaseObserver
      };
      const handler = handlers[type] || removeListener;
      handler(chart, type, proxy);
      proxies[type] = undefined;
    }
    getDevicePixelRatio() {
      return window.devicePixelRatio;
    }
    getMaximumSize(canvas, width, height, aspectRatio) {
      return getMaximumSize(canvas, width, height, aspectRatio);
    }
    isAttached(canvas) {
      const container = _getParentNode(canvas);
      return !!(container && _getParentNode(container));
    }
  }

  class Element {
    constructor() {
      this.x = undefined;
      this.y = undefined;
      this.active = false;
      this.options = undefined;
      this.$animations = undefined;
    }
    tooltipPosition(useFinalPosition) {
      const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
      return {x, y};
    }
    hasValue() {
      return isNumber(this.x) && isNumber(this.y);
    }
    getProps(props, final) {
      const me = this;
      const anims = this.$animations;
      if (!final || !anims) {
        return me;
      }
      const ret = {};
      props.forEach(prop => {
        ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : me[prop];
      });
      return ret;
    }
  }
  Element.defaults = {};
  Element.defaultRoutes = undefined;

  const formatters = {
    values(value) {
      return isArray(value) ? value : '' + value;
    },
    numeric(tickValue, index, ticks) {
      if (tickValue === 0) {
        return '0';
      }
      const locale = this.chart.options.locale;
      let notation;
      let delta = tickValue;
      if (ticks.length > 1) {
        const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
        if (maxTick < 1e-4 || maxTick > 1e+15) {
          notation = 'scientific';
        }
        delta = calculateDelta(tickValue, ticks);
      }
      const logDelta = log10(Math.abs(delta));
      const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
      const options = {notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal};
      Object.assign(options, this.options.ticks.format);
      return formatNumber(tickValue, locale, options);
    },
    logarithmic(tickValue, index, ticks) {
      if (tickValue === 0) {
        return '0';
      }
      const remain = tickValue / (Math.pow(10, Math.floor(log10(tickValue))));
      if (remain === 1 || remain === 2 || remain === 5) {
        return formatters.numeric.call(this, tickValue, index, ticks);
      }
      return '';
    }
  };
  function calculateDelta(tickValue, ticks) {
    let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
    if (Math.abs(delta) > 1 && tickValue !== Math.floor(tickValue)) {
      delta = tickValue - Math.floor(tickValue);
    }
    return delta;
  }
  var Ticks = {formatters};

  defaults.set('scale', {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,
    bounds: 'ticks',
    grace: 0,
    grid: {
      display: true,
      lineWidth: 1,
      drawBorder: true,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: (_ctx, options) => options.lineWidth,
      tickColor: (_ctx, options) => options.color,
      offset: false,
      borderDash: [],
      borderDashOffset: 0.0,
      borderWidth: 1
    },
    title: {
      display: false,
      text: '',
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: '',
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: 'center',
      crossAlign: 'near',
    }
  });
  defaults.route('scale.ticks', 'color', '', 'color');
  defaults.route('scale.grid', 'color', '', 'borderColor');
  defaults.route('scale.grid', 'borderColor', '', 'borderColor');
  defaults.route('scale.title', 'color', '', 'color');
  defaults.describe('scale', {
    _fallback: false,
    _scriptable: (name) => !name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser',
    _indexable: (name) => name !== 'borderDash' && name !== 'tickBorderDash',
  });
  defaults.describe('scales', {
    _fallback: 'scale',
  });

  function autoSkip(scale, ticks) {
    const tickOpts = scale.options.ticks;
    const ticksLimit = tickOpts.maxTicksLimit || determineMaxTicks(scale);
    const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
    const numMajorIndices = majorIndices.length;
    const first = majorIndices[0];
    const last = majorIndices[numMajorIndices - 1];
    const newTicks = [];
    if (numMajorIndices > ticksLimit) {
      skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
      return newTicks;
    }
    const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
    if (numMajorIndices > 0) {
      let i, ilen;
      const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
      skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
      for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
        skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
      }
      skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
      return newTicks;
    }
    skip(ticks, newTicks, spacing);
    return newTicks;
  }
  function determineMaxTicks(scale) {
    const offset = scale.options.offset;
    const tickLength = scale._tickSize();
    const maxScale = scale._length / tickLength + (offset ? 0 : 1);
    const maxChart = scale._maxLength / tickLength;
    return Math.floor(Math.min(maxScale, maxChart));
  }
  function calculateSpacing(majorIndices, ticks, ticksLimit) {
    const evenMajorSpacing = getEvenSpacing(majorIndices);
    const spacing = ticks.length / ticksLimit;
    if (!evenMajorSpacing) {
      return Math.max(spacing, 1);
    }
    const factors = _factorize(evenMajorSpacing);
    for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
      const factor = factors[i];
      if (factor > spacing) {
        return factor;
      }
    }
    return Math.max(spacing, 1);
  }
  function getMajorIndices(ticks) {
    const result = [];
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (ticks[i].major) {
        result.push(i);
      }
    }
    return result;
  }
  function skipMajors(ticks, newTicks, majorIndices, spacing) {
    let count = 0;
    let next = majorIndices[0];
    let i;
    spacing = Math.ceil(spacing);
    for (i = 0; i < ticks.length; i++) {
      if (i === next) {
        newTicks.push(ticks[i]);
        count++;
        next = majorIndices[count * spacing];
      }
    }
  }
  function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
    const start = valueOrDefault(majorStart, 0);
    const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
    let count = 0;
    let length, i, next;
    spacing = Math.ceil(spacing);
    if (majorEnd) {
      length = majorEnd - majorStart;
      spacing = length / Math.floor(length / spacing);
    }
    next = start;
    while (next < 0) {
      count++;
      next = Math.round(start + count * spacing);
    }
    for (i = Math.max(start, 0); i < end; i++) {
      if (i === next) {
        newTicks.push(ticks[i]);
        count++;
        next = Math.round(start + count * spacing);
      }
    }
  }
  function getEvenSpacing(arr) {
    const len = arr.length;
    let i, diff;
    if (len < 2) {
      return false;
    }
    for (diff = arr[0], i = 1; i < len; ++i) {
      if (arr[i] - arr[i - 1] !== diff) {
        return false;
      }
    }
    return diff;
  }

  const reverseAlign = (align) => align === 'left' ? 'right' : align === 'right' ? 'left' : align;
  const offsetFromEdge = (scale, edge, offset) => edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset;
  function sample(arr, numItems) {
    const result = [];
    const increment = arr.length / numItems;
    const len = arr.length;
    let i = 0;
    for (; i < len; i += increment) {
      result.push(arr[Math.floor(i)]);
    }
    return result;
  }
  function getPixelForGridLine(scale, index, offsetGridLines) {
    const length = scale.ticks.length;
    const validIndex = Math.min(index, length - 1);
    const start = scale._startPixel;
    const end = scale._endPixel;
    const epsilon = 1e-6;
    let lineValue = scale.getPixelForTick(validIndex);
    let offset;
    if (offsetGridLines) {
      if (length === 1) {
        offset = Math.max(lineValue - start, end - lineValue);
      } else if (index === 0) {
        offset = (scale.getPixelForTick(1) - lineValue) / 2;
      } else {
        offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
      }
      lineValue += validIndex < index ? offset : -offset;
      if (lineValue < start - epsilon || lineValue > end + epsilon) {
        return;
      }
    }
    return lineValue;
  }
  function garbageCollect(caches, length) {
    each(caches, (cache) => {
      const gc = cache.gc;
      const gcLen = gc.length / 2;
      let i;
      if (gcLen > length) {
        for (i = 0; i < gcLen; ++i) {
          delete cache.data[gc[i]];
        }
        gc.splice(0, gcLen);
      }
    });
  }
  function getTickMarkLength(options) {
    return options.drawTicks ? options.tickLength : 0;
  }
  function getTitleHeight(options, fallback) {
    if (!options.display) {
      return 0;
    }
    const font = toFont(options.font, fallback);
    const padding = toPadding(options.padding);
    const lines = isArray(options.text) ? options.text.length : 1;
    return (lines * font.lineHeight) + padding.height;
  }
  function createScaleContext(parent, scale) {
    return Object.assign(Object.create(parent), {
      scale,
      type: 'scale'
    });
  }
  function createTickContext(parent, index, tick) {
    return Object.assign(Object.create(parent), {
      tick,
      index,
      type: 'tick'
    });
  }
  function titleAlign(align, position, reverse) {
    let ret = _toLeftRightCenter(align);
    if ((reverse && position !== 'right') || (!reverse && position === 'right')) {
      ret = reverseAlign(ret);
    }
    return ret;
  }
  function titleArgs(scale, offset, position, align) {
    const {top, left, bottom, right} = scale;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    if (scale.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      titleY = offsetFromEdge(scale, position, offset);
      maxWidth = right - left;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
      titleY = _alignStartEnd(align, bottom, top);
      rotation = position === 'left' ? -HALF_PI : HALF_PI;
    }
    return {titleX, titleY, maxWidth, rotation};
  }
  class Scale extends Element {
    constructor(cfg) {
      super();
      this.id = cfg.id;
      this.type = cfg.type;
      this.options = undefined;
      this.ctx = cfg.ctx;
      this.chart = cfg.chart;
      this.top = undefined;
      this.bottom = undefined;
      this.left = undefined;
      this.right = undefined;
      this.width = undefined;
      this.height = undefined;
      this._margins = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      this.maxWidth = undefined;
      this.maxHeight = undefined;
      this.paddingTop = undefined;
      this.paddingBottom = undefined;
      this.paddingLeft = undefined;
      this.paddingRight = undefined;
      this.axis = undefined;
      this.labelRotation = undefined;
      this.min = undefined;
      this.max = undefined;
      this.ticks = [];
      this._gridLineItems = null;
      this._labelItems = null;
      this._labelSizes = null;
      this._length = 0;
      this._maxLength = 0;
      this._longestTextCache = {};
      this._startPixel = undefined;
      this._endPixel = undefined;
      this._reversePixels = false;
      this._userMax = undefined;
      this._userMin = undefined;
      this._suggestedMax = undefined;
      this._suggestedMin = undefined;
      this._ticksLength = 0;
      this._borderValue = 0;
      this._cache = {};
      this._dataLimitsCached = false;
      this.$context = undefined;
    }
    init(options) {
      const me = this;
      me.options = options.setContext(me.getContext());
      me.axis = options.axis;
      me._userMin = me.parse(options.min);
      me._userMax = me.parse(options.max);
      me._suggestedMin = me.parse(options.suggestedMin);
      me._suggestedMax = me.parse(options.suggestedMax);
    }
    parse(raw, index) {
      return raw;
    }
    getUserBounds() {
      let {_userMin, _userMax, _suggestedMin, _suggestedMax} = this;
      _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
      _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
      _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
      _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
      return {
        min: finiteOrDefault(_userMin, _suggestedMin),
        max: finiteOrDefault(_userMax, _suggestedMax),
        minDefined: isNumberFinite(_userMin),
        maxDefined: isNumberFinite(_userMax)
      };
    }
    getMinMax(canStack) {
      const me = this;
      let {min, max, minDefined, maxDefined} = me.getUserBounds();
      let range;
      if (minDefined && maxDefined) {
        return {min, max};
      }
      const metas = me.getMatchingVisibleMetas();
      for (let i = 0, ilen = metas.length; i < ilen; ++i) {
        range = metas[i].controller.getMinMax(me, canStack);
        if (!minDefined) {
          min = Math.min(min, range.min);
        }
        if (!maxDefined) {
          max = Math.max(max, range.max);
        }
      }
      return {
        min: finiteOrDefault(min, finiteOrDefault(max, min)),
        max: finiteOrDefault(max, finiteOrDefault(min, max))
      };
    }
    getPadding() {
      const me = this;
      return {
        left: me.paddingLeft || 0,
        top: me.paddingTop || 0,
        right: me.paddingRight || 0,
        bottom: me.paddingBottom || 0
      };
    }
    getTicks() {
      return this.ticks;
    }
    getLabels() {
      const data = this.chart.data;
      return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
    }
    beforeLayout() {
      this._cache = {};
      this._dataLimitsCached = false;
    }
    beforeUpdate() {
      callback(this.options.beforeUpdate, [this]);
    }
    update(maxWidth, maxHeight, margins) {
      const me = this;
      const tickOpts = me.options.ticks;
      const sampleSize = tickOpts.sampleSize;
      me.beforeUpdate();
      me.maxWidth = maxWidth;
      me.maxHeight = maxHeight;
      me._margins = margins = Object.assign({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, margins);
      me.ticks = null;
      me._labelSizes = null;
      me._gridLineItems = null;
      me._labelItems = null;
      me.beforeSetDimensions();
      me.setDimensions();
      me.afterSetDimensions();
      me._maxLength = me.isHorizontal()
        ? me.width + margins.left + margins.right
        : me.height + margins.top + margins.bottom;
      if (!me._dataLimitsCached) {
        me.beforeDataLimits();
        me.determineDataLimits();
        me.afterDataLimits();
        me._dataLimitsCached = true;
      }
      me.beforeBuildTicks();
      me.ticks = me.buildTicks() || [];
      me.afterBuildTicks();
      const samplingEnabled = sampleSize < me.ticks.length;
      me._convertTicksToLabels(samplingEnabled ? sample(me.ticks, sampleSize) : me.ticks);
      me.configure();
      me.beforeCalculateLabelRotation();
      me.calculateLabelRotation();
      me.afterCalculateLabelRotation();
      if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
        me.ticks = autoSkip(me, me.ticks);
        me._labelSizes = null;
      }
      if (samplingEnabled) {
        me._convertTicksToLabels(me.ticks);
      }
      me.beforeFit();
      me.fit();
      me.afterFit();
      me.afterUpdate();
    }
    configure() {
      const me = this;
      let reversePixels = me.options.reverse;
      let startPixel, endPixel;
      if (me.isHorizontal()) {
        startPixel = me.left;
        endPixel = me.right;
      } else {
        startPixel = me.top;
        endPixel = me.bottom;
        reversePixels = !reversePixels;
      }
      me._startPixel = startPixel;
      me._endPixel = endPixel;
      me._reversePixels = reversePixels;
      me._length = endPixel - startPixel;
      me._alignToPixels = me.options.alignToPixels;
    }
    afterUpdate() {
      callback(this.options.afterUpdate, [this]);
    }
    beforeSetDimensions() {
      callback(this.options.beforeSetDimensions, [this]);
    }
    setDimensions() {
      const me = this;
      if (me.isHorizontal()) {
        me.width = me.maxWidth;
        me.left = 0;
        me.right = me.width;
      } else {
        me.height = me.maxHeight;
        me.top = 0;
        me.bottom = me.height;
      }
      me.paddingLeft = 0;
      me.paddingTop = 0;
      me.paddingRight = 0;
      me.paddingBottom = 0;
    }
    afterSetDimensions() {
      callback(this.options.afterSetDimensions, [this]);
    }
    _callHooks(name) {
      const me = this;
      me.chart.notifyPlugins(name, me.getContext());
      callback(me.options[name], [me]);
    }
    beforeDataLimits() {
      this._callHooks('beforeDataLimits');
    }
    determineDataLimits() {}
    afterDataLimits() {
      this._callHooks('afterDataLimits');
    }
    beforeBuildTicks() {
      this._callHooks('beforeBuildTicks');
    }
    buildTicks() {
      return [];
    }
    afterBuildTicks() {
      this._callHooks('afterBuildTicks');
    }
    beforeTickToLabelConversion() {
      callback(this.options.beforeTickToLabelConversion, [this]);
    }
    generateTickLabels(ticks) {
      const me = this;
      const tickOpts = me.options.ticks;
      let i, ilen, tick;
      for (i = 0, ilen = ticks.length; i < ilen; i++) {
        tick = ticks[i];
        tick.label = callback(tickOpts.callback, [tick.value, i, ticks], me);
      }
    }
    afterTickToLabelConversion() {
      callback(this.options.afterTickToLabelConversion, [this]);
    }
    beforeCalculateLabelRotation() {
      callback(this.options.beforeCalculateLabelRotation, [this]);
    }
    calculateLabelRotation() {
      const me = this;
      const options = me.options;
      const tickOpts = options.ticks;
      const numTicks = me.ticks.length;
      const minRotation = tickOpts.minRotation || 0;
      const maxRotation = tickOpts.maxRotation;
      let labelRotation = minRotation;
      let tickWidth, maxHeight, maxLabelDiagonal;
      if (!me._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !me.isHorizontal()) {
        me.labelRotation = minRotation;
        return;
      }
      const labelSizes = me._getLabelSizes();
      const maxLabelWidth = labelSizes.widest.width;
      const maxLabelHeight = labelSizes.highest.height;
      const maxWidth = _limitValue(me.chart.width - maxLabelWidth, 0, me.maxWidth);
      tickWidth = options.offset ? me.maxWidth / numTicks : maxWidth / (numTicks - 1);
      if (maxLabelWidth + 6 > tickWidth) {
        tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
        maxHeight = me.maxHeight - getTickMarkLength(options.grid)
  				- tickOpts.padding - getTitleHeight(options.title, me.chart.options.font);
        maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
        labelRotation = toDegrees(Math.min(
          Math.asin(Math.min((labelSizes.highest.height + 6) / tickWidth, 1)),
          Math.asin(Math.min(maxHeight / maxLabelDiagonal, 1)) - Math.asin(maxLabelHeight / maxLabelDiagonal)
        ));
        labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
      }
      me.labelRotation = labelRotation;
    }
    afterCalculateLabelRotation() {
      callback(this.options.afterCalculateLabelRotation, [this]);
    }
    beforeFit() {
      callback(this.options.beforeFit, [this]);
    }
    fit() {
      const me = this;
      const minSize = {
        width: 0,
        height: 0
      };
      const {chart, options: {ticks: tickOpts, title: titleOpts, grid: gridOpts}} = me;
      const display = me._isVisible();
      const isHorizontal = me.isHorizontal();
      if (display) {
        const titleHeight = getTitleHeight(titleOpts, chart.options.font);
        if (isHorizontal) {
          minSize.width = me.maxWidth;
          minSize.height = getTickMarkLength(gridOpts) + titleHeight;
        } else {
          minSize.height = me.maxHeight;
          minSize.width = getTickMarkLength(gridOpts) + titleHeight;
        }
        if (tickOpts.display && me.ticks.length) {
          const {first, last, widest, highest} = me._getLabelSizes();
          const tickPadding = tickOpts.padding * 2;
          const angleRadians = toRadians(me.labelRotation);
          const cos = Math.cos(angleRadians);
          const sin = Math.sin(angleRadians);
          if (isHorizontal) {
            const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
            minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);
          } else {
            const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
            minSize.width = Math.min(me.maxWidth, minSize.width + labelWidth + tickPadding);
          }
          me._calculatePadding(first, last, sin, cos);
        }
      }
      me._handleMargins();
      if (isHorizontal) {
        me.width = me._length = chart.width - me._margins.left - me._margins.right;
        me.height = minSize.height;
      } else {
        me.width = minSize.width;
        me.height = me._length = chart.height - me._margins.top - me._margins.bottom;
      }
    }
    _calculatePadding(first, last, sin, cos) {
      const me = this;
      const {ticks: {align, padding}, position} = me.options;
      const isRotated = me.labelRotation !== 0;
      const labelsBelowTicks = position !== 'top' && me.axis === 'x';
      if (me.isHorizontal()) {
        const offsetLeft = me.getPixelForTick(0) - me.left;
        const offsetRight = me.right - me.getPixelForTick(me.ticks.length - 1);
        let paddingLeft = 0;
        let paddingRight = 0;
        if (isRotated) {
          if (labelsBelowTicks) {
            paddingLeft = cos * first.width;
            paddingRight = sin * last.height;
          } else {
            paddingLeft = sin * first.height;
            paddingRight = cos * last.width;
          }
        } else if (align === 'start') {
          paddingRight = last.width;
        } else if (align === 'end') {
          paddingLeft = first.width;
        } else {
          paddingLeft = first.width / 2;
          paddingRight = last.width / 2;
        }
        me.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * me.width / (me.width - offsetLeft), 0);
        me.paddingRight = Math.max((paddingRight - offsetRight + padding) * me.width / (me.width - offsetRight), 0);
      } else {
        let paddingTop = last.height / 2;
        let paddingBottom = first.height / 2;
        if (align === 'start') {
          paddingTop = 0;
          paddingBottom = first.height;
        } else if (align === 'end') {
          paddingTop = last.height;
          paddingBottom = 0;
        }
        me.paddingTop = paddingTop + padding;
        me.paddingBottom = paddingBottom + padding;
      }
    }
    _handleMargins() {
      const me = this;
      if (me._margins) {
        me._margins.left = Math.max(me.paddingLeft, me._margins.left);
        me._margins.top = Math.max(me.paddingTop, me._margins.top);
        me._margins.right = Math.max(me.paddingRight, me._margins.right);
        me._margins.bottom = Math.max(me.paddingBottom, me._margins.bottom);
      }
    }
    afterFit() {
      callback(this.options.afterFit, [this]);
    }
    isHorizontal() {
      const {axis, position} = this.options;
      return position === 'top' || position === 'bottom' || axis === 'x';
    }
    isFullSize() {
      return this.options.fullSize;
    }
    _convertTicksToLabels(ticks) {
      const me = this;
      me.beforeTickToLabelConversion();
      me.generateTickLabels(ticks);
      me.afterTickToLabelConversion();
    }
    _getLabelSizes() {
      const me = this;
      let labelSizes = me._labelSizes;
      if (!labelSizes) {
        const sampleSize = me.options.ticks.sampleSize;
        let ticks = me.ticks;
        if (sampleSize < ticks.length) {
          ticks = sample(ticks, sampleSize);
        }
        me._labelSizes = labelSizes = me._computeLabelSizes(ticks, ticks.length);
      }
      return labelSizes;
    }
    _computeLabelSizes(ticks, length) {
      const {ctx, _longestTextCache: caches} = this;
      const widths = [];
      const heights = [];
      let widestLabelSize = 0;
      let highestLabelSize = 0;
      let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
      for (i = 0; i < length; ++i) {
        label = ticks[i].label;
        tickFont = this._resolveTickFontOptions(i);
        ctx.font = fontString = tickFont.string;
        cache = caches[fontString] = caches[fontString] || {data: {}, gc: []};
        lineHeight = tickFont.lineHeight;
        width = height = 0;
        if (!isNullOrUndef(label) && !isArray(label)) {
          width = _measureText(ctx, cache.data, cache.gc, width, label);
          height = lineHeight;
        } else if (isArray(label)) {
          for (j = 0, jlen = label.length; j < jlen; ++j) {
            nestedLabel = label[j];
            if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
              width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
              height += lineHeight;
            }
          }
        }
        widths.push(width);
        heights.push(height);
        widestLabelSize = Math.max(width, widestLabelSize);
        highestLabelSize = Math.max(height, highestLabelSize);
      }
      garbageCollect(caches, length);
      const widest = widths.indexOf(widestLabelSize);
      const highest = heights.indexOf(highestLabelSize);
      const valueAt = (idx) => ({width: widths[idx] || 0, height: heights[idx] || 0});
      return {
        first: valueAt(0),
        last: valueAt(length - 1),
        widest: valueAt(widest),
        highest: valueAt(highest)
      };
    }
    getLabelForValue(value) {
      return value;
    }
    getPixelForValue(value, index) {
      return NaN;
    }
    getValueForPixel(pixel) {}
    getPixelForTick(index) {
      const ticks = this.ticks;
      if (index < 0 || index > ticks.length - 1) {
        return null;
      }
      return this.getPixelForValue(ticks[index].value);
    }
    getPixelForDecimal(decimal) {
      const me = this;
      if (me._reversePixels) {
        decimal = 1 - decimal;
      }
      const pixel = me._startPixel + decimal * me._length;
      return _int16Range(me._alignToPixels ? _alignPixel(me.chart, pixel, 0) : pixel);
    }
    getDecimalForPixel(pixel) {
      const decimal = (pixel - this._startPixel) / this._length;
      return this._reversePixels ? 1 - decimal : decimal;
    }
    getBasePixel() {
      return this.getPixelForValue(this.getBaseValue());
    }
    getBaseValue() {
      const {min, max} = this;
      return min < 0 && max < 0 ? max :
        min > 0 && max > 0 ? min :
        0;
    }
    getContext(index) {
      const me = this;
      const ticks = me.ticks || [];
      if (index >= 0 && index < ticks.length) {
        const tick = ticks[index];
        return tick.$context ||
  				(tick.$context = createTickContext(me.getContext(), index, tick));
      }
      return me.$context ||
  			(me.$context = createScaleContext(me.chart.getContext(), me));
    }
    _tickSize() {
      const me = this;
      const optionTicks = me.options.ticks;
      const rot = toRadians(me.labelRotation);
      const cos = Math.abs(Math.cos(rot));
      const sin = Math.abs(Math.sin(rot));
      const labelSizes = me._getLabelSizes();
      const padding = optionTicks.autoSkipPadding || 0;
      const w = labelSizes ? labelSizes.widest.width + padding : 0;
      const h = labelSizes ? labelSizes.highest.height + padding : 0;
      return me.isHorizontal()
        ? h * cos > w * sin ? w / cos : h / sin
        : h * sin < w * cos ? h / cos : w / sin;
    }
    _isVisible() {
      const display = this.options.display;
      if (display !== 'auto') {
        return !!display;
      }
      return this.getMatchingVisibleMetas().length > 0;
    }
    _computeGridLineItems(chartArea) {
      const me = this;
      const axis = me.axis;
      const chart = me.chart;
      const options = me.options;
      const {grid, position} = options;
      const offset = grid.offset;
      const isHorizontal = me.isHorizontal();
      const ticks = me.ticks;
      const ticksLength = ticks.length + (offset ? 1 : 0);
      const tl = getTickMarkLength(grid);
      const items = [];
      const borderOpts = grid.setContext(me.getContext(0));
      const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0;
      const axisHalfWidth = axisWidth / 2;
      const alignBorderValue = function(pixel) {
        return _alignPixel(chart, pixel, axisWidth);
      };
      let borderValue, i, lineValue, alignedLineValue;
      let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
      if (position === 'top') {
        borderValue = alignBorderValue(me.bottom);
        ty1 = me.bottom - tl;
        ty2 = borderValue - axisHalfWidth;
        y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
        y2 = chartArea.bottom;
      } else if (position === 'bottom') {
        borderValue = alignBorderValue(me.top);
        y1 = chartArea.top;
        y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
        ty1 = borderValue + axisHalfWidth;
        ty2 = me.top + tl;
      } else if (position === 'left') {
        borderValue = alignBorderValue(me.right);
        tx1 = me.right - tl;
        tx2 = borderValue - axisHalfWidth;
        x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
        x2 = chartArea.right;
      } else if (position === 'right') {
        borderValue = alignBorderValue(me.left);
        x1 = chartArea.left;
        x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
        tx1 = borderValue + axisHalfWidth;
        tx2 = me.left + tl;
      } else if (axis === 'x') {
        if (position === 'center') {
          borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
        } else if (isObject(position)) {
          const positionAxisID = Object.keys(position)[0];
          const value = position[positionAxisID];
          borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
        }
        y1 = chartArea.top;
        y2 = chartArea.bottom;
        ty1 = borderValue + axisHalfWidth;
        ty2 = ty1 + tl;
      } else if (axis === 'y') {
        if (position === 'center') {
          borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
        } else if (isObject(position)) {
          const positionAxisID = Object.keys(position)[0];
          const value = position[positionAxisID];
          borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
        }
        tx1 = borderValue - axisHalfWidth;
        tx2 = tx1 - tl;
        x1 = chartArea.left;
        x2 = chartArea.right;
      }
      for (i = 0; i < ticksLength; ++i) {
        const optsAtIndex = grid.setContext(me.getContext(i));
        const lineWidth = optsAtIndex.lineWidth;
        const lineColor = optsAtIndex.color;
        const borderDash = grid.borderDash || [];
        const borderDashOffset = optsAtIndex.borderDashOffset;
        const tickWidth = optsAtIndex.tickWidth;
        const tickColor = optsAtIndex.tickColor;
        const tickBorderDash = optsAtIndex.tickBorderDash || [];
        const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
        lineValue = getPixelForGridLine(me, i, offset);
        if (lineValue === undefined) {
          continue;
        }
        alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
        if (isHorizontal) {
          tx1 = tx2 = x1 = x2 = alignedLineValue;
        } else {
          ty1 = ty2 = y1 = y2 = alignedLineValue;
        }
        items.push({
          tx1,
          ty1,
          tx2,
          ty2,
          x1,
          y1,
          x2,
          y2,
          width: lineWidth,
          color: lineColor,
          borderDash,
          borderDashOffset,
          tickWidth,
          tickColor,
          tickBorderDash,
          tickBorderDashOffset,
        });
      }
      me._ticksLength = ticksLength;
      me._borderValue = borderValue;
      return items;
    }
    _computeLabelItems(chartArea) {
      const me = this;
      const axis = me.axis;
      const options = me.options;
      const {position, ticks: optionTicks} = options;
      const isHorizontal = me.isHorizontal();
      const ticks = me.ticks;
      const {align, crossAlign, padding, mirror} = optionTicks;
      const tl = getTickMarkLength(options.grid);
      const tickAndPadding = tl + padding;
      const hTickAndPadding = mirror ? -padding : tickAndPadding;
      const rotation = -toRadians(me.labelRotation);
      const items = [];
      let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
      let textBaseline = 'middle';
      if (position === 'top') {
        y = me.bottom - hTickAndPadding;
        textAlign = me._getXAxisLabelAlignment();
      } else if (position === 'bottom') {
        y = me.top + hTickAndPadding;
        textAlign = me._getXAxisLabelAlignment();
      } else if (position === 'left') {
        const ret = me._getYAxisLabelAlignment(tl);
        textAlign = ret.textAlign;
        x = ret.x;
      } else if (position === 'right') {
        const ret = me._getYAxisLabelAlignment(tl);
        textAlign = ret.textAlign;
        x = ret.x;
      } else if (axis === 'x') {
        if (position === 'center') {
          y = ((chartArea.top + chartArea.bottom) / 2) + tickAndPadding;
        } else if (isObject(position)) {
          const positionAxisID = Object.keys(position)[0];
          const value = position[positionAxisID];
          y = me.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
        }
        textAlign = me._getXAxisLabelAlignment();
      } else if (axis === 'y') {
        if (position === 'center') {
          x = ((chartArea.left + chartArea.right) / 2) - tickAndPadding;
        } else if (isObject(position)) {
          const positionAxisID = Object.keys(position)[0];
          const value = position[positionAxisID];
          x = me.chart.scales[positionAxisID].getPixelForValue(value);
        }
        textAlign = me._getYAxisLabelAlignment(tl).textAlign;
      }
      if (axis === 'y') {
        if (align === 'start') {
          textBaseline = 'top';
        } else if (align === 'end') {
          textBaseline = 'bottom';
        }
      }
      const labelSizes = me._getLabelSizes();
      for (i = 0, ilen = ticks.length; i < ilen; ++i) {
        tick = ticks[i];
        label = tick.label;
        const optsAtIndex = optionTicks.setContext(me.getContext(i));
        pixel = me.getPixelForTick(i) + optionTicks.labelOffset;
        font = me._resolveTickFontOptions(i);
        lineHeight = font.lineHeight;
        lineCount = isArray(label) ? label.length : 1;
        const halfCount = lineCount / 2;
        const color = optsAtIndex.color;
        const strokeColor = optsAtIndex.textStrokeColor;
        const strokeWidth = optsAtIndex.textStrokeWidth;
        if (isHorizontal) {
          x = pixel;
          if (position === 'top') {
            if (crossAlign === 'near' || rotation !== 0) {
              textOffset = -lineCount * lineHeight + lineHeight / 2;
            } else if (crossAlign === 'center') {
              textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
            } else {
              textOffset = -labelSizes.highest.height + lineHeight / 2;
            }
          } else {
            if (crossAlign === 'near' || rotation !== 0) {
              textOffset = lineHeight / 2;
            } else if (crossAlign === 'center') {
              textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
            } else {
              textOffset = labelSizes.highest.height - lineCount * lineHeight;
            }
          }
          if (mirror) {
            textOffset *= -1;
          }
        } else {
          y = pixel;
          textOffset = (1 - lineCount) * lineHeight / 2;
        }
        items.push({
          rotation,
          label,
          font,
          color,
          strokeColor,
          strokeWidth,
          textOffset,
          textAlign,
          textBaseline,
          translation: [x, y]
        });
      }
      return items;
    }
    _getXAxisLabelAlignment() {
      const me = this;
      const {position, ticks} = me.options;
      const rotation = -toRadians(me.labelRotation);
      if (rotation) {
        return position === 'top' ? 'left' : 'right';
      }
      let align = 'center';
      if (ticks.align === 'start') {
        align = 'left';
      } else if (ticks.align === 'end') {
        align = 'right';
      }
      return align;
    }
    _getYAxisLabelAlignment(tl) {
      const me = this;
      const {position, ticks: {crossAlign, mirror, padding}} = me.options;
      const labelSizes = me._getLabelSizes();
      const tickAndPadding = tl + padding;
      const widest = labelSizes.widest.width;
      let textAlign;
      let x;
      if (position === 'left') {
        if (mirror) {
          textAlign = 'left';
          x = me.right + padding;
        } else {
          x = me.right - tickAndPadding;
          if (crossAlign === 'near') {
            textAlign = 'right';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x -= (widest / 2);
          } else {
            textAlign = 'left';
            x = me.left;
          }
        }
      } else if (position === 'right') {
        if (mirror) {
          textAlign = 'right';
          x = me.left + padding;
        } else {
          x = me.left + tickAndPadding;
          if (crossAlign === 'near') {
            textAlign = 'left';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x += widest / 2;
          } else {
            textAlign = 'right';
            x = me.right;
          }
        }
      } else {
        textAlign = 'right';
      }
      return {textAlign, x};
    }
    _computeLabelArea() {
      const me = this;
      if (me.options.ticks.mirror) {
        return;
      }
      const chart = me.chart;
      const position = me.options.position;
      if (position === 'left' || position === 'right') {
        return {top: 0, left: me.left, bottom: chart.height, right: me.right};
      } if (position === 'top' || position === 'bottom') {
        return {top: me.top, left: 0, bottom: me.bottom, right: chart.width};
      }
    }
    drawBackground() {
      const {ctx, options: {backgroundColor}, left, top, width, height} = this;
      if (backgroundColor) {
        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(left, top, width, height);
        ctx.restore();
      }
    }
    getLineWidthForValue(value) {
      const me = this;
      const grid = me.options.grid;
      if (!me._isVisible() || !grid.display) {
        return 0;
      }
      const ticks = me.ticks;
      const index = ticks.findIndex(t => t.value === value);
      if (index >= 0) {
        const opts = grid.setContext(me.getContext(index));
        return opts.lineWidth;
      }
      return 0;
    }
    drawGrid(chartArea) {
      const me = this;
      const grid = me.options.grid;
      const ctx = me.ctx;
      const chart = me.chart;
      const borderOpts = grid.setContext(me.getContext());
      const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0;
      const items = me._gridLineItems || (me._gridLineItems = me._computeGridLineItems(chartArea));
      let i, ilen;
      const drawLine = (p1, p2, style) => {
        if (!style.width || !style.color) {
          return;
        }
        ctx.save();
        ctx.lineWidth = style.width;
        ctx.strokeStyle = style.color;
        ctx.setLineDash(style.borderDash || []);
        ctx.lineDashOffset = style.borderDashOffset;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      };
      if (grid.display) {
        for (i = 0, ilen = items.length; i < ilen; ++i) {
          const item = items[i];
          if (grid.drawOnChartArea) {
            drawLine(
              {x: item.x1, y: item.y1},
              {x: item.x2, y: item.y2},
              item
            );
          }
          if (grid.drawTicks) {
            drawLine(
              {x: item.tx1, y: item.ty1},
              {x: item.tx2, y: item.ty2},
              {
                color: item.tickColor,
                width: item.tickWidth,
                borderDash: item.tickBorderDash,
                borderDashOffset: item.tickBorderDashOffset
              }
            );
          }
        }
      }
      if (axisWidth) {
        const lastLineWidth = borderOpts.lineWidth;
        const borderValue = me._borderValue;
        let x1, x2, y1, y2;
        if (me.isHorizontal()) {
          x1 = _alignPixel(chart, me.left, axisWidth) - axisWidth / 2;
          x2 = _alignPixel(chart, me.right, lastLineWidth) + lastLineWidth / 2;
          y1 = y2 = borderValue;
        } else {
          y1 = _alignPixel(chart, me.top, axisWidth) - axisWidth / 2;
          y2 = _alignPixel(chart, me.bottom, lastLineWidth) + lastLineWidth / 2;
          x1 = x2 = borderValue;
        }
        drawLine(
          {x: x1, y: y1},
          {x: x2, y: y2},
          {width: axisWidth, color: borderOpts.borderColor});
      }
    }
    drawLabels(chartArea) {
      const me = this;
      const optionTicks = me.options.ticks;
      if (!optionTicks.display) {
        return;
      }
      const ctx = me.ctx;
      const area = me._computeLabelArea();
      if (area) {
        clipArea(ctx, area);
      }
      const items = me._labelItems || (me._labelItems = me._computeLabelItems(chartArea));
      let i, ilen;
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        const item = items[i];
        const tickFont = item.font;
        const label = item.label;
        let y = item.textOffset;
        renderText(ctx, label, 0, y, tickFont, item);
      }
      if (area) {
        unclipArea(ctx);
      }
    }
    drawTitle() {
      const {ctx, options: {position, title, reverse}} = this;
      if (!title.display) {
        return;
      }
      const font = toFont(title.font);
      const padding = toPadding(title.padding);
      const align = title.align;
      let offset = font.lineHeight / 2;
      if (position === 'bottom') {
        offset += padding.bottom;
        if (isArray(title.text)) {
          offset += font.lineHeight * (title.text.length - 1);
        }
      } else {
        offset += padding.top;
      }
      const {titleX, titleY, maxWidth, rotation} = titleArgs(this, offset, position, align);
      renderText(ctx, title.text, 0, 0, font, {
        color: title.color,
        maxWidth,
        rotation,
        textAlign: titleAlign(align, position, reverse),
        textBaseline: 'middle',
        translation: [titleX, titleY],
      });
    }
    draw(chartArea) {
      const me = this;
      if (!me._isVisible()) {
        return;
      }
      me.drawBackground();
      me.drawGrid(chartArea);
      me.drawTitle();
      me.drawLabels(chartArea);
    }
    _layers() {
      const me = this;
      const opts = me.options;
      const tz = opts.ticks && opts.ticks.z || 0;
      const gz = opts.grid && opts.grid.z || 0;
      if (!me._isVisible() || tz === gz || me.draw !== Scale.prototype.draw) {
        return [{
          z: tz,
          draw(chartArea) {
            me.draw(chartArea);
          }
        }];
      }
      return [{
        z: gz,
        draw(chartArea) {
          me.drawBackground();
          me.drawGrid(chartArea);
          me.drawTitle();
        }
      }, {
        z: tz,
        draw(chartArea) {
          me.drawLabels(chartArea);
        }
      }];
    }
    getMatchingVisibleMetas(type) {
      const me = this;
      const metas = me.chart.getSortedVisibleDatasetMetas();
      const axisID = me.axis + 'AxisID';
      const result = [];
      let i, ilen;
      for (i = 0, ilen = metas.length; i < ilen; ++i) {
        const meta = metas[i];
        if (meta[axisID] === me.id && (!type || meta.type === type)) {
          result.push(meta);
        }
      }
      return result;
    }
    _resolveTickFontOptions(index) {
      const opts = this.options.ticks.setContext(this.getContext(index));
      return toFont(opts.font);
    }
  }

  class TypedRegistry {
    constructor(type, scope, override) {
      this.type = type;
      this.scope = scope;
      this.override = override;
      this.items = Object.create(null);
    }
    isForType(type) {
      return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
    }
    register(item) {
      const me = this;
      const proto = Object.getPrototypeOf(item);
      let parentScope;
      if (isIChartComponent(proto)) {
        parentScope = me.register(proto);
      }
      const items = me.items;
      const id = item.id;
      const scope = me.scope + '.' + id;
      if (!id) {
        throw new Error('class does not have id: ' + item);
      }
      if (id in items) {
        return scope;
      }
      items[id] = item;
      registerDefaults(item, scope, parentScope);
      if (me.override) {
        defaults.override(item.id, item.overrides);
      }
      return scope;
    }
    get(id) {
      return this.items[id];
    }
    unregister(item) {
      const items = this.items;
      const id = item.id;
      const scope = this.scope;
      if (id in items) {
        delete items[id];
      }
      if (scope && id in defaults[scope]) {
        delete defaults[scope][id];
        if (this.override) {
          delete overrides[id];
        }
      }
    }
  }
  function registerDefaults(item, scope, parentScope) {
    const itemDefaults = merge(Object.create(null), [
      parentScope ? defaults.get(parentScope) : {},
      defaults.get(scope),
      item.defaults
    ]);
    defaults.set(scope, itemDefaults);
    if (item.defaultRoutes) {
      routeDefaults(scope, item.defaultRoutes);
    }
    if (item.descriptors) {
      defaults.describe(scope, item.descriptors);
    }
  }
  function routeDefaults(scope, routes) {
    Object.keys(routes).forEach(property => {
      const propertyParts = property.split('.');
      const sourceName = propertyParts.pop();
      const sourceScope = [scope].concat(propertyParts).join('.');
      const parts = routes[property].split('.');
      const targetName = parts.pop();
      const targetScope = parts.join('.');
      defaults.route(sourceScope, sourceName, targetScope, targetName);
    });
  }
  function isIChartComponent(proto) {
    return 'id' in proto && 'defaults' in proto;
  }

  class Registry {
    constructor() {
      this.controllers = new TypedRegistry(DatasetController, 'datasets', true);
      this.elements = new TypedRegistry(Element, 'elements');
      this.plugins = new TypedRegistry(Object, 'plugins');
      this.scales = new TypedRegistry(Scale, 'scales');
      this._typedRegistries = [this.controllers, this.scales, this.elements];
    }
    add(...args) {
      this._each('register', args);
    }
    remove(...args) {
      this._each('unregister', args);
    }
    addControllers(...args) {
      this._each('register', args, this.controllers);
    }
    addElements(...args) {
      this._each('register', args, this.elements);
    }
    addPlugins(...args) {
      this._each('register', args, this.plugins);
    }
    addScales(...args) {
      this._each('register', args, this.scales);
    }
    getController(id) {
      return this._get(id, this.controllers, 'controller');
    }
    getElement(id) {
      return this._get(id, this.elements, 'element');
    }
    getPlugin(id) {
      return this._get(id, this.plugins, 'plugin');
    }
    getScale(id) {
      return this._get(id, this.scales, 'scale');
    }
    removeControllers(...args) {
      this._each('unregister', args, this.controllers);
    }
    removeElements(...args) {
      this._each('unregister', args, this.elements);
    }
    removePlugins(...args) {
      this._each('unregister', args, this.plugins);
    }
    removeScales(...args) {
      this._each('unregister', args, this.scales);
    }
    _each(method, args, typedRegistry) {
      const me = this;
      [...args].forEach(arg => {
        const reg = typedRegistry || me._getRegistryForType(arg);
        if (typedRegistry || reg.isForType(arg) || (reg === me.plugins && arg.id)) {
          me._exec(method, reg, arg);
        } else {
          each(arg, item => {
            const itemReg = typedRegistry || me._getRegistryForType(item);
            me._exec(method, itemReg, item);
          });
        }
      });
    }
    _exec(method, registry, component) {
      const camelMethod = _capitalize(method);
      callback(component['before' + camelMethod], [], component);
      registry[method](component);
      callback(component['after' + camelMethod], [], component);
    }
    _getRegistryForType(type) {
      for (let i = 0; i < this._typedRegistries.length; i++) {
        const reg = this._typedRegistries[i];
        if (reg.isForType(type)) {
          return reg;
        }
      }
      return this.plugins;
    }
    _get(id, typedRegistry, type) {
      const item = typedRegistry.get(id);
      if (item === undefined) {
        throw new Error('"' + id + '" is not a registered ' + type + '.');
      }
      return item;
    }
  }
  var registry = new Registry();

  class PluginService {
    constructor() {
      this._init = [];
    }
    notify(chart, hook, args, filter) {
      const me = this;
      if (hook === 'beforeInit') {
        me._init = me._createDescriptors(chart, true);
        me._notify(me._init, chart, 'install');
      }
      const descriptors = filter ? me._descriptors(chart).filter(filter) : me._descriptors(chart);
      const result = me._notify(descriptors, chart, hook, args);
      if (hook === 'destroy') {
        me._notify(descriptors, chart, 'stop');
        me._notify(me._init, chart, 'uninstall');
      }
      return result;
    }
    _notify(descriptors, chart, hook, args) {
      args = args || {};
      for (const descriptor of descriptors) {
        const plugin = descriptor.plugin;
        const method = plugin[hook];
        const params = [chart, args, descriptor.options];
        if (callback(method, params, plugin) === false && args.cancelable) {
          return false;
        }
      }
      return true;
    }
    invalidate() {
      if (!isNullOrUndef(this._cache)) {
        this._oldCache = this._cache;
        this._cache = undefined;
      }
    }
    _descriptors(chart) {
      if (this._cache) {
        return this._cache;
      }
      const descriptors = this._cache = this._createDescriptors(chart);
      this._notifyStateChanges(chart);
      return descriptors;
    }
    _createDescriptors(chart, all) {
      const config = chart && chart.config;
      const options = valueOrDefault(config.options && config.options.plugins, {});
      const plugins = allPlugins(config);
      return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
    }
    _notifyStateChanges(chart) {
      const previousDescriptors = this._oldCache || [];
      const descriptors = this._cache;
      const diff = (a, b) => a.filter(x => !b.some(y => x.plugin.id === y.plugin.id));
      this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
      this._notify(diff(descriptors, previousDescriptors), chart, 'start');
    }
  }
  function allPlugins(config) {
    const plugins = [];
    const keys = Object.keys(registry.plugins.items);
    for (let i = 0; i < keys.length; i++) {
      plugins.push(registry.getPlugin(keys[i]));
    }
    const local = config.plugins || [];
    for (let i = 0; i < local.length; i++) {
      const plugin = local[i];
      if (plugins.indexOf(plugin) === -1) {
        plugins.push(plugin);
      }
    }
    return plugins;
  }
  function getOpts(options, all) {
    if (!all && options === false) {
      return null;
    }
    if (options === true) {
      return {};
    }
    return options;
  }
  function createDescriptors(chart, plugins, options, all) {
    const result = [];
    const context = chart.getContext();
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      const id = plugin.id;
      const opts = getOpts(options[id], all);
      if (opts === null) {
        continue;
      }
      result.push({
        plugin,
        options: pluginOpts(chart.config, plugin, opts, context)
      });
    }
    return result;
  }
  function pluginOpts(config, plugin, opts, context) {
    const keys = config.pluginScopeKeys(plugin);
    const scopes = config.getOptionScopes(opts, keys);
    return config.createResolver(scopes, context, [''], {scriptable: false, indexable: false, allKeys: true});
  }

  function getIndexAxis(type, options) {
    const datasetDefaults = defaults.datasets[type] || {};
    const datasetOptions = (options.datasets || {})[type] || {};
    return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
  }
  function getAxisFromDefaultScaleID(id, indexAxis) {
    let axis = id;
    if (id === '_index_') {
      axis = indexAxis;
    } else if (id === '_value_') {
      axis = indexAxis === 'x' ? 'y' : 'x';
    }
    return axis;
  }
  function getDefaultScaleIDFromAxis(axis, indexAxis) {
    return axis === indexAxis ? '_index_' : '_value_';
  }
  function axisFromPosition(position) {
    if (position === 'top' || position === 'bottom') {
      return 'x';
    }
    if (position === 'left' || position === 'right') {
      return 'y';
    }
  }
  function determineAxis(id, scaleOptions) {
    if (id === 'x' || id === 'y') {
      return id;
    }
    return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
  }
  function mergeScaleConfig(config, options) {
    const chartDefaults = overrides[config.type] || {scales: {}};
    const configScales = options.scales || {};
    const chartIndexAxis = getIndexAxis(config.type, options);
    const firstIDs = Object.create(null);
    const scales = Object.create(null);
    Object.keys(configScales).forEach(id => {
      const scaleConf = configScales[id];
      const axis = determineAxis(id, scaleConf);
      const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
      const defaultScaleOptions = chartDefaults.scales || {};
      firstIDs[axis] = firstIDs[axis] || id;
      scales[id] = mergeIf(Object.create(null), [{axis}, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
    });
    config.data.datasets.forEach(dataset => {
      const type = dataset.type || config.type;
      const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
      const datasetDefaults = overrides[type] || {};
      const defaultScaleOptions = datasetDefaults.scales || {};
      Object.keys(defaultScaleOptions).forEach(defaultID => {
        const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
        const id = dataset[axis + 'AxisID'] || firstIDs[axis] || axis;
        scales[id] = scales[id] || Object.create(null);
        mergeIf(scales[id], [{axis}, configScales[id], defaultScaleOptions[defaultID]]);
      });
    });
    Object.keys(scales).forEach(key => {
      const scale = scales[key];
      mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
    });
    return scales;
  }
  function initOptions(config) {
    const options = config.options || (config.options = {});
    options.plugins = valueOrDefault(options.plugins, {});
    options.scales = mergeScaleConfig(config, options);
  }
  function initConfig(config) {
    config = config || {};
    const data = config.data = config.data || {datasets: [], labels: []};
    data.datasets = data.datasets || [];
    data.labels = data.labels || [];
    initOptions(config);
    return config;
  }
  const keyCache = new Map();
  const keysCached = new Set();
  function cachedKeys(cacheKey, generate) {
    let keys = keyCache.get(cacheKey);
    if (!keys) {
      keys = generate();
      keyCache.set(cacheKey, keys);
      keysCached.add(keys);
    }
    return keys;
  }
  const addIfFound = (set, obj, key) => {
    const opts = resolveObjectKey(obj, key);
    if (opts !== undefined) {
      set.add(opts);
    }
  };
  class Config {
    constructor(config) {
      this._config = initConfig(config);
      this._scopeCache = new Map();
      this._resolverCache = new Map();
    }
    get type() {
      return this._config.type;
    }
    set type(type) {
      this._config.type = type;
    }
    get data() {
      return this._config.data;
    }
    set data(data) {
      this._config.data = data;
    }
    get options() {
      return this._config.options;
    }
    set options(options) {
      this._config.options = options;
    }
    get plugins() {
      return this._config.plugins;
    }
    update() {
      const config = this._config;
      this.clearCache();
      initOptions(config);
    }
    clearCache() {
      this._scopeCache.clear();
      this._resolverCache.clear();
    }
    datasetScopeKeys(datasetType) {
      return cachedKeys(datasetType,
        () => [[
          `datasets.${datasetType}`,
          ''
        ]]);
    }
    datasetAnimationScopeKeys(datasetType, transition) {
      return cachedKeys(`${datasetType}.transition.${transition}`,
        () => [
          [
            `datasets.${datasetType}.transitions.${transition}`,
            `transitions.${transition}`,
          ],
          [
            `datasets.${datasetType}`,
            ''
          ]
        ]);
    }
    datasetElementScopeKeys(datasetType, elementType) {
      return cachedKeys(`${datasetType}-${elementType}`,
        () => [[
          `datasets.${datasetType}.elements.${elementType}`,
          `datasets.${datasetType}`,
          `elements.${elementType}`,
          ''
        ]]);
    }
    pluginScopeKeys(plugin) {
      const id = plugin.id;
      const type = this.type;
      return cachedKeys(`${type}-plugin-${id}`,
        () => [[
          `plugins.${id}`,
          ...plugin.additionalOptionScopes || [],
        ]]);
    }
    _cachedScopes(mainScope, resetCache) {
      const _scopeCache = this._scopeCache;
      let cache = _scopeCache.get(mainScope);
      if (!cache || resetCache) {
        cache = new Map();
        _scopeCache.set(mainScope, cache);
      }
      return cache;
    }
    getOptionScopes(mainScope, keyLists, resetCache) {
      const {options, type} = this;
      const cache = this._cachedScopes(mainScope, resetCache);
      const cached = cache.get(keyLists);
      if (cached) {
        return cached;
      }
      const scopes = new Set();
      keyLists.forEach(keys => {
        if (mainScope) {
          scopes.add(mainScope);
          keys.forEach(key => addIfFound(scopes, mainScope, key));
        }
        keys.forEach(key => addIfFound(scopes, options, key));
        keys.forEach(key => addIfFound(scopes, overrides[type] || {}, key));
        keys.forEach(key => addIfFound(scopes, defaults, key));
        keys.forEach(key => addIfFound(scopes, descriptors, key));
      });
      const array = [...scopes];
      if (keysCached.has(keyLists)) {
        cache.set(keyLists, array);
      }
      return array;
    }
    chartOptionScopes() {
      const {options, type} = this;
      return [
        options,
        overrides[type] || {},
        defaults.datasets[type] || {},
        {type},
        defaults,
        descriptors
      ];
    }
    resolveNamedOptions(scopes, names, context, prefixes = ['']) {
      const result = {$shared: true};
      const {resolver, subPrefixes} = getResolver(this._resolverCache, scopes, prefixes);
      let options = resolver;
      if (needContext(resolver, names)) {
        result.$shared = false;
        context = isFunction(context) ? context() : context;
        const subResolver = this.createResolver(scopes, context, subPrefixes);
        options = _attachContext(resolver, context, subResolver);
      }
      for (const prop of names) {
        result[prop] = options[prop];
      }
      return result;
    }
    createResolver(scopes, context, prefixes = [''], descriptorDefaults) {
      const {resolver} = getResolver(this._resolverCache, scopes, prefixes);
      return isObject(context)
        ? _attachContext(resolver, context, undefined, descriptorDefaults)
        : resolver;
    }
  }
  function getResolver(resolverCache, scopes, prefixes) {
    let cache = resolverCache.get(scopes);
    if (!cache) {
      cache = new Map();
      resolverCache.set(scopes, cache);
    }
    const cacheKey = prefixes.join();
    let cached = cache.get(cacheKey);
    if (!cached) {
      const resolver = _createResolver(scopes, prefixes);
      cached = {
        resolver,
        subPrefixes: prefixes.filter(p => !p.toLowerCase().includes('hover'))
      };
      cache.set(cacheKey, cached);
    }
    return cached;
  }
  function needContext(proxy, names) {
    const {isScriptable, isIndexable} = _descriptors(proxy);
    for (const prop of names) {
      if ((isScriptable(prop) && isFunction(proxy[prop]))
        || (isIndexable(prop) && isArray(proxy[prop]))) {
        return true;
      }
    }
    return false;
  }

  var version = "3.1.0";

  const KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea'];
  function positionIsHorizontal(position, axis) {
    return position === 'top' || position === 'bottom' || (KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x');
  }
  function compare2Level(l1, l2) {
    return function(a, b) {
      return a[l1] === b[l1]
        ? a[l2] - b[l2]
        : a[l1] - b[l1];
    };
  }
  function onAnimationsComplete(context) {
    const chart = context.chart;
    const animationOptions = chart.options.animation;
    chart.notifyPlugins('afterRender');
    callback(animationOptions && animationOptions.onComplete, [context], chart);
  }
  function onAnimationProgress(context) {
    const chart = context.chart;
    const animationOptions = chart.options.animation;
    callback(animationOptions && animationOptions.onProgress, [context], chart);
  }
  function isDomSupported() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  function getCanvas(item) {
    if (isDomSupported() && typeof item === 'string') {
      item = document.getElementById(item);
    } else if (item && item.length) {
      item = item[0];
    }
    if (item && item.canvas) {
      item = item.canvas;
    }
    return item;
  }
  const instances = {};
  const getChart = (key) => {
    const canvas = getCanvas(key);
    return Object.values(instances).filter((c) => c.canvas === canvas).pop();
  };
  class Chart {
    constructor(item, config) {
      const me = this;
      this.config = config = new Config(config);
      const initialCanvas = getCanvas(item);
      const existingChart = getChart(initialCanvas);
      if (existingChart) {
        throw new Error(
          'Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' +
  				' must be destroyed before the canvas can be reused.'
        );
      }
      const options = config.createResolver(config.chartOptionScopes(), me.getContext());
      this.platform = me._initializePlatform(initialCanvas, config);
      const context = me.platform.acquireContext(initialCanvas, options.aspectRatio);
      const canvas = context && context.canvas;
      const height = canvas && canvas.height;
      const width = canvas && canvas.width;
      this.id = uid();
      this.ctx = context;
      this.canvas = canvas;
      this.width = width;
      this.height = height;
      this._options = options;
      this._aspectRatio = this.aspectRatio;
      this._layers = [];
      this._metasets = [];
      this._stacks = undefined;
      this.boxes = [];
      this.currentDevicePixelRatio = undefined;
      this.chartArea = undefined;
      this._active = [];
      this._lastEvent = undefined;
      this._listeners = {};
      this._sortedMetasets = [];
      this.scales = {};
      this.scale = undefined;
      this._plugins = new PluginService();
      this.$proxies = {};
      this._hiddenIndices = {};
      this.attached = false;
      this._animationsDisabled = undefined;
      this.$context = undefined;
      this._doResize = debounce(() => this.update('resize'), options.resizeDelay || 0);
      instances[me.id] = me;
      if (!context || !canvas) {
        console.error("Failed to create chart: can't acquire context from the given item");
        return;
      }
      animator.listen(me, 'complete', onAnimationsComplete);
      animator.listen(me, 'progress', onAnimationProgress);
      me._initialize();
      if (me.attached) {
        me.update();
      }
    }
    get aspectRatio() {
      const {options: {aspectRatio, maintainAspectRatio}, width, height, _aspectRatio} = this;
      if (!isNullOrUndef(aspectRatio)) {
        return aspectRatio;
      }
      if (maintainAspectRatio && _aspectRatio) {
        return _aspectRatio;
      }
      return height ? width / height : null;
    }
    get data() {
      return this.config.data;
    }
    set data(data) {
      this.config.data = data;
    }
    get options() {
      return this._options;
    }
    set options(options) {
      this.config.options = options;
    }
    _initialize() {
      const me = this;
      me.notifyPlugins('beforeInit');
      if (me.options.responsive) {
        me.resize();
      } else {
        retinaScale(me, me.options.devicePixelRatio);
      }
      me.bindEvents();
      me.notifyPlugins('afterInit');
      return me;
    }
    _initializePlatform(canvas, config) {
      if (config.platform) {
        return new config.platform();
      } else if (!isDomSupported() || (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas)) {
        return new BasicPlatform();
      }
      return new DomPlatform();
    }
    clear() {
      clearCanvas(this.canvas, this.ctx);
      return this;
    }
    stop() {
      animator.stop(this);
      return this;
    }
    resize(width, height) {
      if (!animator.running(this)) {
        this._resize(width, height);
      } else {
        this._resizeBeforeDraw = {width, height};
      }
    }
    _resize(width, height) {
      const me = this;
      const options = me.options;
      const canvas = me.canvas;
      const aspectRatio = options.maintainAspectRatio && me.aspectRatio;
      const newSize = me.platform.getMaximumSize(canvas, width, height, aspectRatio);
      const oldRatio = me.currentDevicePixelRatio;
      const newRatio = options.devicePixelRatio || me.platform.getDevicePixelRatio();
      if (me.width === newSize.width && me.height === newSize.height && oldRatio === newRatio) {
        return;
      }
      me.width = newSize.width;
      me.height = newSize.height;
      me._aspectRatio = me.aspectRatio;
      retinaScale(me, newRatio, true);
      me.notifyPlugins('resize', {size: newSize});
      callback(options.onResize, [me, newSize], me);
      if (me.attached) {
        if (me._doResize()) {
          me.render();
        }
      }
    }
    ensureScalesHaveIDs() {
      const options = this.options;
      const scalesOptions = options.scales || {};
      each(scalesOptions, (axisOptions, axisID) => {
        axisOptions.id = axisID;
      });
    }
    buildOrUpdateScales() {
      const me = this;
      const options = me.options;
      const scaleOpts = options.scales;
      const scales = me.scales;
      const updated = Object.keys(scales).reduce((obj, id) => {
        obj[id] = false;
        return obj;
      }, {});
      let items = [];
      if (scaleOpts) {
        items = items.concat(
          Object.keys(scaleOpts).map((id) => {
            const scaleOptions = scaleOpts[id];
            const axis = determineAxis(id, scaleOptions);
            const isRadial = axis === 'r';
            const isHorizontal = axis === 'x';
            return {
              options: scaleOptions,
              dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
              dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
            };
          })
        );
      }
      each(items, (item) => {
        const scaleOptions = item.options;
        const id = scaleOptions.id;
        const axis = determineAxis(id, scaleOptions);
        const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
        if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
          scaleOptions.position = item.dposition;
        }
        updated[id] = true;
        let scale = null;
        if (id in scales && scales[id].type === scaleType) {
          scale = scales[id];
        } else {
          const scaleClass = registry.getScale(scaleType);
          scale = new scaleClass({
            id,
            type: scaleType,
            ctx: me.ctx,
            chart: me
          });
          scales[scale.id] = scale;
        }
        scale.init(scaleOptions, options);
      });
      each(updated, (hasUpdated, id) => {
        if (!hasUpdated) {
          delete scales[id];
        }
      });
      each(scales, (scale) => {
        layouts.configure(me, scale, scale.options);
        layouts.addBox(me, scale);
      });
    }
    _updateMetasetIndex(meta, index) {
      const metasets = this._metasets;
      const oldIndex = meta.index;
      if (oldIndex !== index) {
        metasets[oldIndex] = metasets[index];
        metasets[index] = meta;
        meta.index = index;
      }
    }
    _updateMetasets() {
      const me = this;
      const metasets = me._metasets;
      const numData = me.data.datasets.length;
      const numMeta = metasets.length;
      if (numMeta > numData) {
        for (let i = numData; i < numMeta; ++i) {
          me._destroyDatasetMeta(i);
        }
        metasets.splice(numData, numMeta - numData);
      }
      me._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
    }
    _removeUnreferencedMetasets() {
      const me = this;
      const {_metasets: metasets, data: {datasets}} = me;
      if (metasets.length > datasets.length) {
        delete me._stacks;
      }
      metasets.forEach((meta, index) => {
        if (datasets.filter(x => x === meta._dataset).length === 0) {
          me._destroyDatasetMeta(index);
        }
      });
    }
    buildOrUpdateControllers() {
      const me = this;
      const newControllers = [];
      const datasets = me.data.datasets;
      let i, ilen;
      me._removeUnreferencedMetasets();
      for (i = 0, ilen = datasets.length; i < ilen; i++) {
        const dataset = datasets[i];
        let meta = me.getDatasetMeta(i);
        const type = dataset.type || me.config.type;
        if (meta.type && meta.type !== type) {
          me._destroyDatasetMeta(i);
          meta = me.getDatasetMeta(i);
        }
        meta.type = type;
        meta.indexAxis = dataset.indexAxis || getIndexAxis(type, me.options);
        meta.order = dataset.order || 0;
        me._updateMetasetIndex(meta, i);
        meta.label = '' + dataset.label;
        meta.visible = me.isDatasetVisible(i);
        if (meta.controller) {
          meta.controller.updateIndex(i);
          meta.controller.linkScales();
        } else {
          const ControllerClass = registry.getController(type);
          const {datasetElementType, dataElementType} = defaults.datasets[type];
          Object.assign(ControllerClass.prototype, {
            dataElementType: registry.getElement(dataElementType),
            datasetElementType: datasetElementType && registry.getElement(datasetElementType)
          });
          meta.controller = new ControllerClass(me, i);
          newControllers.push(meta.controller);
        }
      }
      me._updateMetasets();
      return newControllers;
    }
    _resetElements() {
      const me = this;
      each(me.data.datasets, (dataset, datasetIndex) => {
        me.getDatasetMeta(datasetIndex).controller.reset();
      }, me);
    }
    reset() {
      this._resetElements();
      this.notifyPlugins('reset');
    }
    update(mode) {
      const me = this;
      const config = me.config;
      config.update();
      me._options = config.createResolver(config.chartOptionScopes(), me.getContext());
      each(me.scales, (scale) => {
        layouts.removeBox(me, scale);
      });
      const animsDisabled = me._animationsDisabled = !me.options.animation;
      me.ensureScalesHaveIDs();
      me.buildOrUpdateScales();
      me._plugins.invalidate();
      if (me.notifyPlugins('beforeUpdate', {mode, cancelable: true}) === false) {
        return;
      }
      const newControllers = me.buildOrUpdateControllers();
      me.notifyPlugins('beforeElementsUpdate');
      let minPadding = 0;
      for (let i = 0, ilen = me.data.datasets.length; i < ilen; i++) {
        const {controller} = me.getDatasetMeta(i);
        const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
        controller.buildOrUpdateElements(reset);
        minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
      }
      me._minPadding = minPadding;
      me._updateLayout(minPadding);
      if (!animsDisabled) {
        each(newControllers, (controller) => {
          controller.reset();
        });
      }
      me._updateDatasets(mode);
      me.notifyPlugins('afterUpdate', {mode});
      me._layers.sort(compare2Level('z', '_idx'));
      if (me._lastEvent) {
        me._eventHandler(me._lastEvent, true);
      }
      me.render();
    }
    _updateLayout(minPadding) {
      const me = this;
      if (me.notifyPlugins('beforeLayout', {cancelable: true}) === false) {
        return;
      }
      layouts.update(me, me.width, me.height, minPadding);
      const area = me.chartArea;
      const noArea = area.width <= 0 || area.height <= 0;
      me._layers = [];
      each(me.boxes, (box) => {
        if (noArea && box.position === 'chartArea') {
          return;
        }
        if (box.configure) {
          box.configure();
        }
        me._layers.push(...box._layers());
      }, me);
      me._layers.forEach((item, index) => {
        item._idx = index;
      });
      me.notifyPlugins('afterLayout');
    }
    _updateDatasets(mode) {
      const me = this;
      const isFunction = typeof mode === 'function';
      if (me.notifyPlugins('beforeDatasetsUpdate', {mode, cancelable: true}) === false) {
        return;
      }
      for (let i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
        me._updateDataset(i, isFunction ? mode({datasetIndex: i}) : mode);
      }
      me.notifyPlugins('afterDatasetsUpdate', {mode});
    }
    _updateDataset(index, mode) {
      const me = this;
      const meta = me.getDatasetMeta(index);
      const args = {meta, index, mode, cancelable: true};
      if (me.notifyPlugins('beforeDatasetUpdate', args) === false) {
        return;
      }
      meta.controller._update(mode);
      args.cancelable = false;
      me.notifyPlugins('afterDatasetUpdate', args);
    }
    render() {
      const me = this;
      if (me.notifyPlugins('beforeRender', {cancelable: true}) === false) {
        return;
      }
      if (animator.has(me)) {
        if (me.attached && !animator.running(me)) {
          animator.start(me);
        }
      } else {
        me.draw();
        onAnimationsComplete({chart: me});
      }
    }
    draw() {
      const me = this;
      let i;
      if (me._resizeBeforeDraw) {
        const {width, height} = me._resizeBeforeDraw;
        me._resize(width, height);
        me._resizeBeforeDraw = null;
      }
      me.clear();
      if (me.width <= 0 || me.height <= 0) {
        return;
      }
      if (me.notifyPlugins('beforeDraw', {cancelable: true}) === false) {
        return;
      }
      const layers = me._layers;
      for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
        layers[i].draw(me.chartArea);
      }
      me._drawDatasets();
      for (; i < layers.length; ++i) {
        layers[i].draw(me.chartArea);
      }
      me.notifyPlugins('afterDraw');
    }
    _getSortedDatasetMetas(filterVisible) {
      const me = this;
      const metasets = me._sortedMetasets;
      const result = [];
      let i, ilen;
      for (i = 0, ilen = metasets.length; i < ilen; ++i) {
        const meta = metasets[i];
        if (!filterVisible || meta.visible) {
          result.push(meta);
        }
      }
      return result;
    }
    getSortedVisibleDatasetMetas() {
      return this._getSortedDatasetMetas(true);
    }
    _drawDatasets() {
      const me = this;
      if (me.notifyPlugins('beforeDatasetsDraw', {cancelable: true}) === false) {
        return;
      }
      const metasets = me.getSortedVisibleDatasetMetas();
      for (let i = metasets.length - 1; i >= 0; --i) {
        me._drawDataset(metasets[i]);
      }
      me.notifyPlugins('afterDatasetsDraw');
    }
    _drawDataset(meta) {
      const me = this;
      const ctx = me.ctx;
      const clip = meta._clip;
      const area = me.chartArea;
      const args = {
        meta,
        index: meta.index,
        cancelable: true
      };
      if (me.notifyPlugins('beforeDatasetDraw', args) === false) {
        return;
      }
      clipArea(ctx, {
        left: clip.left === false ? 0 : area.left - clip.left,
        right: clip.right === false ? me.width : area.right + clip.right,
        top: clip.top === false ? 0 : area.top - clip.top,
        bottom: clip.bottom === false ? me.height : area.bottom + clip.bottom
      });
      meta.controller.draw();
      unclipArea(ctx);
      args.cancelable = false;
      me.notifyPlugins('afterDatasetDraw', args);
    }
    getElementsAtEventForMode(e, mode, options, useFinalPosition) {
      const method = Interaction.modes[mode];
      if (typeof method === 'function') {
        return method(this, e, options, useFinalPosition);
      }
      return [];
    }
    getDatasetMeta(datasetIndex) {
      const me = this;
      const dataset = me.data.datasets[datasetIndex];
      const metasets = me._metasets;
      let meta = metasets.filter(x => x && x._dataset === dataset).pop();
      if (!meta) {
        meta = metasets[datasetIndex] = {
          type: null,
          data: [],
          dataset: null,
          controller: null,
          hidden: null,
          xAxisID: null,
          yAxisID: null,
          order: dataset && dataset.order || 0,
          index: datasetIndex,
          _dataset: dataset,
          _parsed: [],
          _sorted: false
        };
      }
      return meta;
    }
    getContext() {
      return this.$context || (this.$context = {chart: this, type: 'chart'});
    }
    getVisibleDatasetCount() {
      return this.getSortedVisibleDatasetMetas().length;
    }
    isDatasetVisible(datasetIndex) {
      const dataset = this.data.datasets[datasetIndex];
      if (!dataset) {
        return false;
      }
      const meta = this.getDatasetMeta(datasetIndex);
      return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
    }
    setDatasetVisibility(datasetIndex, visible) {
      const meta = this.getDatasetMeta(datasetIndex);
      meta.hidden = !visible;
    }
    toggleDataVisibility(index) {
      this._hiddenIndices[index] = !this._hiddenIndices[index];
    }
    getDataVisibility(index) {
      return !this._hiddenIndices[index];
    }
    _updateDatasetVisibility(datasetIndex, visible) {
      const me = this;
      const mode = visible ? 'show' : 'hide';
      const meta = me.getDatasetMeta(datasetIndex);
      const anims = meta.controller._resolveAnimations(undefined, mode);
      me.setDatasetVisibility(datasetIndex, visible);
      anims.update(meta, {visible});
      me.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : undefined);
    }
    hide(datasetIndex) {
      this._updateDatasetVisibility(datasetIndex, false);
    }
    show(datasetIndex) {
      this._updateDatasetVisibility(datasetIndex, true);
    }
    _destroyDatasetMeta(datasetIndex) {
      const me = this;
      const meta = me._metasets && me._metasets[datasetIndex];
      if (meta && meta.controller) {
        meta.controller._destroy();
        delete me._metasets[datasetIndex];
      }
    }
    destroy() {
      const me = this;
      const {canvas, ctx} = me;
      let i, ilen;
      me.stop();
      animator.remove(me);
      for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
        me._destroyDatasetMeta(i);
      }
      me.config.clearCache();
      if (canvas) {
        me.unbindEvents();
        clearCanvas(canvas, ctx);
        me.platform.releaseContext(ctx);
        me.canvas = null;
        me.ctx = null;
      }
      me.notifyPlugins('destroy');
      delete instances[me.id];
    }
    toBase64Image(...args) {
      return this.canvas.toDataURL(...args);
    }
    bindEvents() {
      const me = this;
      const listeners = me._listeners;
      const platform = me.platform;
      const _add = (type, listener) => {
        platform.addEventListener(me, type, listener);
        listeners[type] = listener;
      };
      const _remove = (type, listener) => {
        if (listeners[type]) {
          platform.removeEventListener(me, type, listener);
          delete listeners[type];
        }
      };
      let listener = function(e, x, y) {
        e.offsetX = x;
        e.offsetY = y;
        me._eventHandler(e);
      };
      each(me.options.events, (type) => _add(type, listener));
      if (me.options.responsive) {
        listener = (width, height) => {
          if (me.canvas) {
            me.resize(width, height);
          }
        };
        let detached;
        const attached = () => {
          _remove('attach', attached);
          me.attached = true;
          me.resize();
          _add('resize', listener);
          _add('detach', detached);
        };
        detached = () => {
          me.attached = false;
          _remove('resize', listener);
          _add('attach', attached);
        };
        if (platform.isAttached(me.canvas)) {
          attached();
        } else {
          detached();
        }
      } else {
        me.attached = true;
      }
    }
    unbindEvents() {
      const me = this;
      const listeners = me._listeners;
      if (!listeners) {
        return;
      }
      delete me._listeners;
      each(listeners, (listener, type) => {
        me.platform.removeEventListener(me, type, listener);
      });
    }
    updateHoverStyle(items, mode, enabled) {
      const prefix = enabled ? 'set' : 'remove';
      let meta, item, i, ilen;
      if (mode === 'dataset') {
        meta = this.getDatasetMeta(items[0].datasetIndex);
        meta.controller['_' + prefix + 'DatasetHoverStyle']();
      }
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        item = items[i];
        const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
        if (controller) {
          controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
        }
      }
    }
    getActiveElements() {
      return this._active || [];
    }
    setActiveElements(activeElements) {
      const me = this;
      const lastActive = me._active || [];
      const active = activeElements.map(({datasetIndex, index}) => {
        const meta = me.getDatasetMeta(datasetIndex);
        if (!meta) {
          throw new Error('No dataset found at index ' + datasetIndex);
        }
        return {
          datasetIndex,
          element: meta.data[index],
          index,
        };
      });
      const changed = !_elementsEqual(active, lastActive);
      if (changed) {
        me._active = active;
        me._updateHoverStyles(active, lastActive);
      }
    }
    notifyPlugins(hook, args, filter) {
      return this._plugins.notify(this, hook, args, filter);
    }
    _updateHoverStyles(active, lastActive, replay) {
      const me = this;
      const hoverOptions = me.options.hover;
      const diff = (a, b) => a.filter(x => !b.some(y => x.datasetIndex === y.datasetIndex && x.index === y.index));
      const deactivated = diff(lastActive, active);
      const activated = replay ? active : diff(active, lastActive);
      if (deactivated.length) {
        me.updateHoverStyle(deactivated, hoverOptions.mode, false);
      }
      if (activated.length && hoverOptions.mode) {
        me.updateHoverStyle(activated, hoverOptions.mode, true);
      }
    }
    _eventHandler(e, replay) {
      const me = this;
      const args = {event: e, replay, cancelable: true};
      const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e.type);
      if (me.notifyPlugins('beforeEvent', args, eventFilter) === false) {
        return;
      }
      const changed = me._handleEvent(e, replay);
      args.cancelable = false;
      me.notifyPlugins('afterEvent', args, eventFilter);
      if (changed || args.changed) {
        me.render();
      }
      return me;
    }
    _handleEvent(e, replay) {
      const me = this;
      const {_active: lastActive = [], options} = me;
      const hoverOptions = options.hover;
      const useFinalPosition = replay;
      let active = [];
      let changed = false;
      let lastEvent = null;
      if (e.type !== 'mouseout') {
        active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
        lastEvent = e.type === 'click' ? me._lastEvent : e;
      }
      me._lastEvent = null;
      if (_isPointInArea(e, me.chartArea, me._minPadding)) {
        callback(options.onHover, [e, active, me], me);
        if (e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu') {
          callback(options.onClick, [e, active, me], me);
        }
      }
      changed = !_elementsEqual(active, lastActive);
      if (changed || replay) {
        me._active = active;
        me._updateHoverStyles(active, lastActive, replay);
      }
      me._lastEvent = lastEvent;
      return changed;
    }
  }
  const invalidatePlugins = () => each(Chart.instances, (chart) => chart._plugins.invalidate());
  const enumerable = true;
  Object.defineProperties(Chart, {
    defaults: {
      enumerable,
      value: defaults
    },
    instances: {
      enumerable,
      value: instances
    },
    overrides: {
      enumerable,
      value: overrides
    },
    registry: {
      enumerable,
      value: registry
    },
    version: {
      enumerable,
      value: version
    },
    getChart: {
      enumerable,
      value: getChart
    },
    register: {
      enumerable,
      value: (...items) => {
        registry.add(...items);
        invalidatePlugins();
      }
    },
    unregister: {
      enumerable,
      value: (...items) => {
        registry.remove(...items);
        invalidatePlugins();
      }
    }
  });

  /**
   * --------------------------------------------------------------------------
   * Custom Tooltips for Chart.js (v3.0.0-alpha.0): custom-tooltips.js
   * Licensed under MIT (https://coreui.io/plugins/chart.js)
   * --------------------------------------------------------------------------
   */
  const ClassName = {
    TOOLTIP: 'chartjs-tooltip',
    TOOLTIP_BODY: 'chartjs-tooltip-body',
    TOOLTIP_BODY_ITEM: 'chartjs-tooltip-body-item',
    TOOLTIP_HEADER: 'chartjs-tooltip-header',
    TOOLTIP_HEADER_ITEM: 'chartjs-tooltip-header-item'
  };

  const getOrCreateTooltip = chart => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.classList.add(ClassName.TOOLTIP);
      const table = document.createElement('table');
      table.style.margin = '0px';
      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  function customTooltips(context) {
    // Tooltip Element
    const {
      chart,
      tooltip
    } = context;
    const tooltipEl = getOrCreateTooltip(chart); // Hide if no tooltip

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    } // Set Text


    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines);
      const tableHead = document.createElement('thead');
      tableHead.classList.add(ClassName.TOOLTIP_HEADER);
      titleLines.forEach(title => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = 0;
        tr.classList.add(ClassName.TOOLTIP_HEADER_ITEM);
        const th = document.createElement('th');
        th.style.borderWidth = 0;
        const text = document.createTextNode(title);
        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });
      const tableBody = document.createElement('tbody');
      tableBody.classList.add(ClassName.TOOLTIP_BODY);
      bodyLines.forEach((body, i) => {
        const colors = tooltip.labelColors[i];
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = colors.borderColor;
        span.style.borderWidth = '2px';
        span.style.marginRight = '10px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';
        const tr = document.createElement('tr');
        tr.classList.add(ClassName.TOOLTIP_BODY_ITEM);
        const td = document.createElement('td');
        td.style.borderWidth = 0;
        const text = document.createTextNode(body);
        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });
      const tableRoot = tooltipEl.querySelector('table'); // Remove old children

      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      } // Add new children


      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }

    const {
      offsetLeft: positionX,
      offsetTop: positionY
    } = chart.canvas; // Display, position, and set styles for font

    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.padding + 'px ' + tooltip.padding + 'px';
  }

  /**
   * --------------------------------------------------------------------------
   * Custom Tooltips for Chart.js (v3.0.0-alpha.0): index.umd.js
   * Licensed under MIT (https://github.com/@coreui/coreui-chartjs/LICENSE)
   * --------------------------------------------------------------------------
   */
  var index_umd = {
    customTooltips
  };

  return index_umd;

})));
//# sourceMappingURL=coreui-chartjs.bundle.js.map
