(function () {
    const trimLeft = /^\s+/,
        trimRight = /\s+$/,
        mathRound = Math.round,
        mathMin = Math.min,
        mathMax = Math.max;

    // tinycolor构造函数，构造微小的颜色对象
    function tinycolor(color, opts) {
        // 设置color和opts的默认值
        color = color || "";
        opts = opts || {};
        // 如果color已经是tinycolor的实例, 则直接返回color即可
        if (color instanceof tinycolor) { return color }
        // 将new操作符调到函数内部来执行（如果this不是tinycolor的实例，则返回tinycolor的实例）
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }
        // 颜色值转为rgb格式的对象
        const rgb = inputToRGB(color);
        this._r = rgb.r;
        this._g = rgb.g;
        this._b = rgb.b;
        this._a = rgb.a;
        this._roundA = mathRound(100 * this._a) / 100;
        this._format = opts.format || rgb.format;
        // 将小于1的三原色值四舍五入
        if (this._r < 1) { this._r = mathRound(this._r) }
        if (this._g < 1) { this._g = mathRound(this._g) }
        if (this._b < 1) { this._b = mathRound(this._b) }
        // rbg的状态
        this._ok = rgb.ok;
    }

    tinycolor.prototype = {
        // 根据rgb对象的状态, 检验合格性
        isValid() {
            return this._ok;
        },
        // 转为hsv格式的字符串
        toHsvString() {
            // rgb转为hsv对象
            const hsv = rgbToHsv(this._r, this._g, this._b),
                h = mathRound(hsv.h * 360),
                s = mathRound(hsv.s * 100),
                v = mathRound(hsv.v * 100);
            // 透明度如果为1，则忽略
            return this._a === 1 ? `hsv(${h}, ${s}%, ${v}%)` : `hsva(${h}, ${s}%, ${v}%, ${this._roundA})`;
        },
        // 转为hsl对象
        toHsl() {
            const hsl = rgbToHsl(this._r, this._g, this._b);
            return {
                h: hsl.h * 360,
                s: hsl.s,
                l: hsl.l,
                a: this._a
            };
        },
        // 转为hsl字符串
        toHslString() {
            const hsl = rgbToHsl(this._r, this._g, this._b),
                h = mathRound(hsl.h * 360),
                s = mathRound(hsl.s * 100),
                l = mathRound(hsl.l * 100);
            return this._a === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsva(${h}, ${s}%, ${l}%, ${this._roundA})`;
        },
        // 转为hex字符串
        toHex(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        // 转为hex颜色值
        toHexString(allow3Char) {
            return `#${this.toHex(allow3Char)}`;
        },
        // 转为rgba对象
        toRgb() {
            return {
                r: mathRound(this._r),
                g: mathRound(this._g),
                b: mathRound(this._b),
                a: this._a
            }
        },
        // 转为rgb字符串
        toRgbString() {
            const r = mathRound(this._r),
                g = mathRound(this._g),
                b = mathRound(this._b);
            return this._a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${this._roundA})`;
        },
        // // 转为颜色的名称
        toName() {
            // 透明度为0，表示透明
            if (this._a === 0) {
                return "transparent";
            }
            // 颜色名称的透明度均为1
            if (this._a < 1) {
                return false;
            }
            // 如果有十六机制的名称，则返回它；没有，则返回false
            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        }
    };

    // 转为rgb对象
    function inputToRGB(color) {
        // rgb对象初始状态
        let rgb = { r: 0, g: 0, b: 0 },
            alpha = 1, // 透明度
            ok = false, // 转换状态
            format = ""; // 格式标识
        // 如果是字符串，则转为对应的color对象
        if (typeof color === "string") {
            color = stringInputToObject(color);
        }
        // 如果是对象，转为格式化的rgb对象
        if (typeof color === "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                // 如果是rgb对象，则将其转为格式化的rgb对象
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                // 格式标识
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else {
                // 如果是hsv对象，则将其转为格式化的rgb对象
                if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    // 转为百分比值
                    color.s = convertToPercentage(color.s);
                    color.v = convertToPercentage(color.v);
                    // hsv对象转为rgb对象
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                } else {
                    // 如果是hsl对象，则将其转为格式化的rgb对象
                    if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                        color.s = convertToPercentage(color.s);
                        color.l = convertToPercentage(color.l);
                        // hsl对象转为rgb对象
                        rgb = hslToRgb(color.h, color.s, color.l);
                        ok = true;
                        format = "hsl";
                    }
                }
            }
            // 如果有透明度，获取透明度
            if (color.hasOwnProperty("a")) {
                alpha = color.a;
            }
        }
        // 约束透明度
        alpha = boundAlpha(alpha);
        return {
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            ok: ok,
            format: color.format || format,
            a: alpha
        }
    }
    // 将rgb值转为rgb对象
    function rgbToRgb(r, g, b) {
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        }
    }
    // 将rgb值转为hsl对象
    function rgbToHsl(r, g, b) {
        // 将三原色换为比例值
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        // 取三原色中的最大值和最小值
        const min = mathMin(r, g, b),
            max = mathMax(r, g, b),
            sum = max + min,
            l = sum / 2;
        let h = 0,
            s = 0;
        if (max > min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - sum) : d / sum;
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0); break;
                case g:
                    h = (b - r) / d + 2; break;
                case b:
                    h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    }
    // rgb转为hsv对象
    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        const min = mathMin(r, g, b),
            max = mathMax(r, g, b),
            d = max - min,
            s = max === 0 ? 0 : d / max,
            v = max;
        let h = 0;
        if (max > min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, v };
    }
    // hsl转为rgb对象
    function hslToRgb(h, s, l) {
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        let r, g, b;
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                  p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: r * 255,
            g: g * 255,
            b: b * 255
        };
    }
    // hsv转为rgb对象
    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        const i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];
        return {
            r: r * 255,
            g: g * 255,
            b: b * 255
        };
    }
    // rgb转为hex字符串
    function rgbToHex(r, g, b, allow3Char) {
        // 四舍五入，转为十六进制字符串，长度补齐为2
        const hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ],
            hex00 = hex[0][0], hex01 = hex[0][1],
            hex10 = hex[1][0], hex11 = hex[1][1],
            hex20 = hex[2][0], hex21 = hex[2][1];
        // 如果允许三位颜色值且颜色是两位重复的六位颜色值（如aabbcc），则转为三位颜色值（如abc）
        if (allow3Char && hex00 === hex01 && hex10 === hex11 && hex20 === hex21) {
            return hex00 + hex10 + hex20;
        }
        // 其余情况，直接拼接即可
        return hex.join("");
    }
    // 约束透明度，范围[0, 1]
    function boundAlpha(a) {
        a = parseFloat(a);
        if (isNaN(a) || a < 0 || a > 1) a = 1;
        return a;
    }
    // 约束n/max的值，限制为[0, 1]
    function bound01(n, max) {
        // 如果是浮点值1.0，则转为100%
        if (isOnePointZero(n)) n = "100%";
        // 是否是百分比数值
        const processPercent = isPercentage(n);
        // 限制数值范围：[0, max]
        n = mathMin(mathMax(0, parseFloat(n)), max);
        // 如果是百分比数值，转为浮点值
        if (processPercent) n = parseInt(n * max) / 100;
        // 如果n接近于max（差值小于百万分之一），则视为相等
        if ((Math.abs(n - max) < 0.000001)) return 1;
        // 返回n与max的比值
        return (n % max) / parseFloat(max);
    }
    // 从十六进制值中取整为十进制值
    function parseIntFromHex(value) {
        return parseInt(value, 16);
    }
    // 是否是浮点值1.0
    function isOnePointZero(n) {
        return parseFloat(n) - 1 < 0.000001 && parseInt(n) === 1;
    }
    // 是否是百分比数值
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf("%") !== -1;
    }
    // 补齐长度为两位的字符串
    function pad2(str) {
        return str.padStart(2, "0");
    }
    // 转为百分比值
    function convertToPercentage(n) {
        if (n <= 1) {
            n = `${n * 100}%`;
        }
        return n;
    }
    // 将十六进制转为十进制
    function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
    }
    // 创建正则对象
    const matchers = (function () {
        const CSS_INTEGER = "[-\\+]?\\d+%?",
            CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?",
            CSS_UNIT = `(?:${CSS_NUMBER})|(?:${CSS_INTEGER})`,
            PERMISSIVE_MATCH3 = `[\\s|\\(]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})\\s*\\)?`,
            PERMISSIVE_MATCH4 = `[\\s|\\(]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})[,|\\s]+(${CSS_UNIT})\\s*\\)?`;
        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        }
    })();
    // 颜色名称对象
    const names = tinycolor.names = {
        aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "0ff",
        aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc",
        bisque: "ffe4c4", black: "000", blanchedalmond: "ffebcd",
        blue: "00f", blueviolet: "8a2be2", brown: "a52a2a",
        burlywood: "deb887", burntsienna: "ea7e5d", cadetblue: "5f9ea0",
        chartreuse: "7fff00", chocolate: "d2691e", coral: "ff7f50",
        cornflowerblue: "6495ed", cornsilk: "fff8dc", crimson: "dc143c",
        cyan: "0ff", darkblue: "00008b", darkcyan: "008b8b",
        darkgoldenrod: "b8860b", darkgray: "a9a9a9", darkgreen: "006400",
        darkgrey: "a9a9a9", darkkhaki: "bdb76b", darkmagenta: "8b008b",
        darkolivegreen: "556b2f", darkorange: "ff8c00", darkorchid: "9932cc",
        darkred: "8b0000", darksalmon: "e9967a", darkseagreen: "8fbc8f",
        darkslateblue: "483d8b", darkslategray: "2f4f4f", darkslategrey: "2f4f4f",
        darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493",
        deepskyblue: "00bfff", dimgray: "696969", dimgrey: "696969",
        dodgerblue: "1e90ff", firebrick: "b22222", floralwhite: "fffaf0",
        forestgreen: "228b22", fuchsia: "f0f", gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520",
        gray: "808080", green: "008000", greenyellow: "adff2f",
        grey: "808080", honeydew: "f0fff0", hotpink: "ff69b4",
        indianred: "cd5c5c", indigo: "4b0082", ivory: "fffff0",
        khaki: "f0e68c", lavender: "e6e6fa", lavenderblush: "fff0f5",
        lawngreen: "7cfc00", lemonchiffon: "fffacd", lightblue: "add8e6",
        lightcoral: "f08080", lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3", lightgreen: "90ee90", lightgrey: "d3d3d3",
        lightpink: "ffb6c1", lightsalmon: "ffa07a", lightseagreen: "20b2aa",
        lightskyblue: "87cefa", lightslategray: "789", lightslategrey: "789",
        lightsteelblue: "b0c4de", lightyellow: "ffffe0", lime: "0f0",
        limegreen: "32cd32", linen: "faf0e6", magenta: "f0f",
        maroon: "800000", mediumaquamarine: "66cdaa", mediumblue: "0000cd",
        mediumorchid: "ba55d3", mediumpurple: "9370db", mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a", mediumturquoise: "48d1cc",
        mediumvioletred: "c71585", midnightblue: "191970", mintcream: "f5fffa",
        mistyrose: "ffe4e1", moccasin: "ffe4b5", navajowhite: "ffdead",
        navy: "000080", oldlace: "fdf5e6", olive: "808000",
        olivedrab: "6b8e23", orange: "ffa500", orangered: "ff4500",
        orchid: "da70d6", palegoldenrod: "eee8aa", palegreen: "98fb98",
        paleturquoise: "afeeee", palevioletred: "db7093", papayawhip: "ffefd5",
        peachpuff: "ffdab9", peru: "cd853f", pink: "ffc0cb",
        plum: "dda0dd", powderblue: "b0e0e6", purple: "800080",
        rebeccapurple: "663399", red: "f00", rosybrown: "bc8f8f",
        royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072",
        sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee",
        sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb",
        slateblue: "6a5acd", slategray: "708090", slategrey: "708090",
        snow: "fffafa", springgreen: "00ff7f", steelblue: "4682b4",
        tan: "d2b48c", teal: "008080", thistle: "d8bfd8",
        tomato: "ff6347", turquoise: "40e0d0", violet: "ee82ee",
        wheat: "f5deb3", white: "fff", whitesmoke: "f5f5f5",
        yellow: "ff0", yellowgreen: "9acd32"
    };
    // 十六进制格式的颜色名称对象
    const hexNames = tinycolor.hexNames = flip(names);
    // 将对象的属性和值对调，转存到新对象中
    function flip(obj) {
        const flipped = {},
            keys = Object.keys(obj);
        for (const key of keys) {
            flipped[obj[key]] = key;
        }
        return flipped;
    }
    // 将字符串输入转为对象
    function stringInputToObject(color) {
        // 清除左右空格，转为全小写
        color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
        // 是否是颜色名称
        let named = false;
        // 如果颜色名称对象中有对应的颜色，则取其颜色值
        if (names[color]) {
            color = names[color];
            named = true;
        } else {
            // 如果颜色为透明，则直接返回透明颜色的rgb对象
            if (color === "transparent") {
                return {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0,
                    format: "name"
                };
            }
        }
        // 正则匹配的结果
        let match;
        // 匹配颜色的格式，返回相应格式的color对象
        if (match = matchers.rgb.exec(color)) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if (match = matchers.rgba.exec(color)) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if (match = matchers.hsl.exec(color)) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if (match = matchers.hsla.exec(color)) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] }
        }
        if (match = matchers.hsv.exec(color)) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if (match = matchers.hsva.exec(color)) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if (match = matchers.hex8.exec(color)) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            }
        }
        if (match = matchers.hex6.exec(color)) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            }
        }
        if (match = matchers.hex3.exec(color)) {
            return {
                r: parseIntFromHex(match[1] + "" + match[1]),
                g: parseIntFromHex(match[2] + "" + match[2]),
                b: parseIntFromHex(match[3] + "" + match[3]),
                format: named ? "name" : "hex"
            }
        }
        // 转换失败，返回false
        return false;
    }
    // 导出tinycolor方法
    if (typeof module !== "undefined" && module.exports) {
        // 模块导出
        module.exports = tinycolor;
    } else {
        // define导出
        if (typeof define === "function" && define.amd) {
            define(function () { return tinycolor });
        } else {
            // window导出
            window.tinycolor = tinycolor;
        }
    }
})();