
!function(exports, Object, Function) {
	var currentLang, currentMap
	, cache = {}
	, formatRe = /\\{|{\\|'|{((?:("|')(?:\\?.)*?\2|[^;\}])+?)(?:;((.).*?))?}/g
	, exprFound
	, exprRe = /(['"\/])(?:\\?.)*?\1[gim]*|\b(?:false|in|null|true|typeof|void)\b|\.\w+\(|\w+:|\b([a-z_$](?:[\w$]|\.(?!\w+\()|\[\d+\])*)(?:\|\|(('|")(?:\\?.)*?\4|\d+))?/g
	, pointerRe = /^([\w ]+)\.([\w ]+)$/
	, fnClearRe = /''\+|\+''/g
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
		return typeof out === "string" ? out : out(data || {}, Item.get, i18n)
	}

	function getFn(str, map, fallback) {
		var tmp
		return typeof str === "string" ? (
			map[str] || (tmp = pointerRe.exec(str)) && (
				typeof map[tmp[1]] === "object" &&
				map[tmp[1]][tmp[2]] ||
				map[tmp[2]] ||
				fallback || tmp[2]
			)
		) :
		Array.isArray(str) ?
		getFn(str[0], map, getFn(str[1], map, getFn(str[2], map, fallback))) :
		fallback
	}


	function makeFn(str) {
		exprFound = 0
		var fn = str.replace(formatRe, formatFn)
		if (exprFound) try {
			return Function("d,g,i", "return('" + fn.replace(fnClearRe, "") + "')")
		} catch (e) {}
		return str
	}

	function formatFn(_, expr, q, pattern, prefix) {
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

			return pattern ?
			"'+i." + ext[prefix] + "(" + expr + ",'" + pattern.replace(/'/g, "\\'") + "')+'" :
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

	/*** i18n.detect ***/
	i18n.detect = function(fallback) {
		var locale
		, navigator = exports.navigator || exports
		try {
			// { locale: "et", timeZone: "Europe/Tallinn" }
			locale = Intl.DateTimeFormat().resolvedOptions().locale
		} catch(e) {}

		// navigator.userLanguage for IE, navigator.language for others
		return use([locale, navigator.language, navigator.userLanguage].concat(
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
			"var s,i,n,r,o;return " + numStr(format)
		)))(input, fnScope)
	}
	number.pre = {
		s: "(o=d>1e9?(d/=1e9,'G'):d>1e6?(d/=1e6,'M'):d>1e3?(d/=1e3,'k'):''),"
	}

	function numStr(format) {
		// totalLength
		// format;0-value;NaN-value;roundPoint;negFormat
		var conf = format.split(";")
		, m2 = /(.*?)([\d# .,_·']*[\d\/]+)([os]?)(.*)/.exec(conf[0])
		, m3 = /([.,\/])(\d+)(?![\d.,])/.exec(m2[2])
		, decimals = m3 && m3[2].length || 0
		, full = m3 ? m2[2].slice(0, m3.index) : m2[2]
		, num = full.replace(/\D+/g, "")
		, sLen = num.length
		, step = decimals ? +(m3[1] === "/" ? 1 / m3[2] : num + "." + m3[2]) : num
		, decSep = m3 && m3[1]
		, fn = "d<0&&(d=-d,n=1)||d>0||d===0?(" + (number.pre[m2[3]] || "") + "s=" + (
			// Use exponential notation to fix float rounding
			// Math.round(1.005*100)/100 = 1 instead of 1.01
			decimals ?
			"(d+'e" + decimals + "')/" + (step + "e" + decimals) :
			"d/" + num
		) + ",i=~~(" + (
			conf[2] == 1 ? "s===~~s?s:s+1" : "s+" + (conf[2] || .5)
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
			fn += ",r=(''+i)"
		}
		if (sLen > 1) {
			if (decimals) sLen += decimals + 1
			fn += ",r=(r.length<" + sLen + "?(g.p+r).slice(-" + sLen + "):r)"
		}

		if (num = full.match(/[ ,.'][\d#]+/g)) {
			fn += ".replace(/\\d(?=" + (
				"(((((".slice(-num.length) + num.join(")?").replace(/[ ,.]/g,"").replace(/[\d#]/g, "\\d") + ")+"
			) + (decimals ? "\\" + decSep : "$") + ")/g,'$&" + num[0].charAt(0) + "')"
		}

		fn += (
			// negative format
			",n?'" + (conf[3] || "-#").replace("#", "'+r+'") + "':" +
			(m2[1] ? "'" + m2[1]+ "'+r" : "r") +
			// ordinal 1st
			(m2[3] == "o" ? "+(n=d,o=g.o," +
				(fnScope.o = getFn("ordinal", currentMap).split(";")).pop() + ")" : "") +
			(m2[3] == "s" ? "+o" : "" ) +
			(m2[4] ? "+'" + m2[4]+ "'" : "")
		)

		return fn + "):'" + (conf[1] || "") + "'"
	}
	/**/


}(this, Object, Function)


