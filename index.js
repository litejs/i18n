
!function(exports, Object, Function) {
	var currentLang, currentMap
	, cache = {}
	, formatRe = /\\{|{\\|'|{((?:("|')(?:\\?.)*?\2|[^;\}])+?)(?:;(.*?))?}/g
	, exprFound
	, exprRe = /(['"\/])(?:\\?.)*?\1[gim]*|\b(?:false|in|null|true|typeof|void)\b|\.\w+\s*\(|\w+\s*:|\b([a-z_$](?:[\w$]|\.(?!\w+\s*\()|\[\d+\])*)(?:\|\|(('|")(?:\\?.)*?\4|\d+))?/g
	, pointerRe = /^([\w ]+)\.([\w ]+)$/
	, globalTexts = {}
	, hasOwn = globalTexts.hasOwnProperty
	// you can use Unicode's fraction slash (U+2044) with superscript and subscript numerals: e.g. ³⁄₄₇
	// 2^53-1= 9007199254740991 == Number.MAX_SAFE_INTEGER
	, list = i18n.list = []
	, ext = i18n.ext = {}
	, fnScope = {}

	exports.i18n = i18n
	i18n.add = add
	i18n.get = get
	i18n.use = use

	function i18n(str, data) {
		var out = typeof str === "number" ? "" + str :
		cache[str] || (cache[str] = makeFn(getFn(str, currentMap) || str))
		return isString(out) ? out : out(data || {}, Item.get, i18n)
	}

	function getFn(str, map, fallback) {
		var tmp
		return isString(str) ? (
			isString(map[str]) ? map[str] : (tmp = pointerRe.exec(str)) && (
				typeof map[tmp[1]] === "object" &&
				map[tmp[1]][tmp[2]] ||
				map[tmp[2]] ||
				tmp[2]
			) || fallback
		) :
		Array.isArray(str) ?
		getFn(str[0], map, getFn(str[1], map, getFn(str[2], map, fallback))) :
		fallback
	}


	function makeFn(str) {
		exprFound = 0
		var fn = str.replace(formatRe, formatFn)
		if (exprFound) try {
			return Function("d,g,i", "return('" + fn + "')")
		} catch (e) {
			/*** debug ***/
			console.log("makeFn", fn)
			console.log(e)
			/**/
		}
		return str
	}

	function formatFn(_, expr, q, pattern) {
		if (expr) {
			exprFound = 1
			var m
			, lastIndex = 0
			, rep = []

			for (; m = exprRe.exec(expr); ) if (m[2]) {
				rep.push(
					expr.slice(lastIndex, lastIndex = m.index),
					"g(d,'" + m[2] + "'," + (m[3] || "''") + ")"
				)
				lastIndex += m[0].length
			}
			expr = rep.join("") + expr.slice(lastIndex)
			pattern = getFn(pattern, currentMap, pattern)

			return pattern ?
			"'+i." + ext[pattern.charAt(0)] + "(" + expr + ",'" + pattern.replace(/'/g, "\\'") + "')+'" :
			"'+(" + expr + ")+'"
		}
		return _ == "'" ?  "\\'" : "{"
	}

	function add(lang, texts) {
		if (list.indexOf(lang) < 0) {
			i18n[lang] = Object.create(globalTexts)
			list.push(lang)
			if (!currentLang) use(lang)
		}
		merge(i18n[lang], texts)
	}

	function merge(target, map) {
		for (var k in map) if (hasOwn.call(map, k)) {
			target[k] = map[k] && map[k].constructor === Object ? merge(Object.create(target), map[k]) : map[k]
		}
		return target
	}

	i18n.def = function(map) {
		for (var k in map) if (hasOwn.call(map, k)) {
			add(k, map)
		}
	}

	function get(lang) {
		return lang && (
			i18n[lang = ("" + lang).toLowerCase()] ||
			i18n[lang = lang.split("-")[0]]
		) && lang
	}

	function use(lang) {
		lang = get(lang)
		if (lang && currentLang != lang) {
			cache = {}
			currentMap = i18n[currentLang = i18n.current = lang] = i18n[currentLang] || {}
		}
		return currentLang
	}

	function isString(str) {
		return typeof str === "string"
	}

	/*** i18n.detect ***/
	i18n.detect = function(fallback) {
		var navigator = exports.navigator || exports

		// navigator.userLanguage for IE, navigator.language for others
		return use([navigator.language, navigator.userLanguage].concat(
			navigator.languages, fallback, list[0]
		).filter(get)[0])
	}
	/**/

	/*** i18n.number ***/
	i18n[ext["#"] = "number"] = number
	fnScope.p = "0000000000000000"
	function number(input, format) {
		return (cache[format] || (cache[format] = Function(
			"d,g",
			"var s,i,N,n,r,o;return " + numStr(format)
		)))(input, fnScope)
	}
	number.pre = {
		s: "(o+=d>1e9?(d/=1e9,'G'):d>1e6?(d/=1e6,'M'):d>1e3?(d/=1e3,'k'):''),"
	}
	number.post = {
	}

	function numStr(format) {
		// totalLength
		// format;0-value?;NaN-value;roundPoint;negFormat
		var conf = format.split(";")
		, m2 = /([^\d#]*)([\d# .,_·']*\/?\d+)(?:(\s*)([a-z%]+)(\d*))?(.*)/.exec(conf[0])
		, m3 = /([.,\/])(\d+)(?![\d.,])/.exec(m2[2])
		, decimals = m3 && m3[2].length || 0
		, full = m3 ? m2[2].slice(0, m3.index) : m2[2]
		, num = full.replace(/\D+/g, "")
		, sLen = num.length
		, step = decimals ? +(m3[1] === "/" ? 1 / m3[2] : num + "." + m3[2]) : num
		, decSep = m3 && m3[1]
		, fn = "d<0&&(N=d=-d)||d>0||d===0?(o='" + m2[3] + "'," + (number.pre[m2[4]] || "") + "s=" + (
			// Use exponential notation to fix float rounding
			// Math.round(1.005*100)/100 = 1 instead of 1.01
			decimals ?
			"(d+'e" + decimals + "')/" + (step + "e" + decimals) :
			"d/" + num
		) + ",i=Math.floor(" + (
			conf[2] == 1 ? "s%1?s+1:s" : "s+" + (conf[2] || .5)
		) + ")*" + step

		if (decimals) {
			fn += ",r=i.toFixed(" + decimals + ")"
			if (decSep == "/") {
				fn += ".replace(/\\.\\d+/,'" + (
					m3[2] == 5 ?
					"⅕⅖⅗⅘'.charAt(5" :
					"⅛¼⅜½⅝¾⅞'.charAt(8"
				) + "*(i%1)-1))"
			} else if (decSep != ".") {
				fn += ".replace('.','" + decSep + "')"
			}
			if (sLen === 0) {
				fn += ",i<1&&i!==0&&(r=r.slice(1))"
			}
		} else {
			fn += ",r=''+i"
		}
		if (sLen > 1) {
			if (decimals) sLen += decimals + 1
			fn += ",r=(r.length<" + sLen + "?(g.p+r).slice(-" + sLen + "):r)"
		}

		if (num = full.match(/[^\d#][\d#]+/g)) {
			fn += ",r=" + numJunk(num, num.length - 1, 0, decimals ? decimals + 1 : 0)
		}

		if (m2[4] == "o") {
			number.post.o = "r+(n=d,o=g.o," + (
				fnScope.o = getFn("ordinal", currentMap).split(";")
			).pop() + ")"
		}

		fn += (
			(m2[4] ? ",r=" + (number.post[m2[4]] || "r+o") : "") +
			// negative format
			",N?'" + (conf[3] || "-#").replace("#", "'+r+'") + "':" +
			(m2[1] ? "'" + m2[1]+ "'+r" : "r") +
			(m2[6] ? "+'" + m2[6] + "'" : "")
		)

		return fn + "):'" + (conf[1] || "") + "'"
	}

	function numJunk(arr, i, lastLen, dec) {
		var len = lastLen + arr[i].length - 1

		return "(i<1e" + len + "?r" + (
			lastLen ? ".slice(0,-" + (lastLen + dec) + "):" : ":"
		) + (
			len < 16 ? numJunk(arr, i?i-1:i, len, dec) : "r.slice(0,-" + (lastLen + dec) + ")"
		) + "+'" + arr[i].charAt(0).replace("'", "\\'") + "'+r.slice(-" + (len + dec) + (
			lastLen ? ",-" + (lastLen + dec) : "") + ")"
		+ ")"
	}
	/**/


}(this, Object, Function)


