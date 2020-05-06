
!function(exports, Object, Function) {
	'use strict'
	var currentLang, currentMap
	, isArray = Array.isArray
	, cache = {}
	, formatRe = /\\{|{\\|'|\n|{({[\s\S]*}|\[[\s\S]*]|(?:("|')(?:\\?.)*?\2|[^;{}])+?)(?:;((?:(['"\/])(?:\\?.)*?\4[gim]*|[^}])*))?}/g
	, exprFound
	, exprRe = /(['"\/])(?:\\?.)*?\1[gim]*|\b(?:[$_]|false|in|null|true|typeof|void)\b|\.\w+|\w+\s*:|\s+/g
	, wordRe = /(\$?)([a-z_][\w$]*)/ig
	, pattRe = /(\w+)(?::((?:(['"\/])(?:\\?.)*?\3[gim]*|[^;])*))?/g
	, pointerRe = /^([\w ]+)\.([\w ]+)$/
	, globalTexts = {}
	, globalVals = i18n.vals = {}
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
		if (typeof str === "number") return "" + str
		var out = cache[str] || (
			cache[str] = makeFn(get(str) || str)
		)
		return isString(out) ? out : out(data || {}, i18n, globalVals)
	}

	function get(str, fallback) {
		var tmp
		return isString(str) ? (
			isString(currentMap[str]) ? currentMap[str] :
			typeof currentMap[str] === "object" ? currentMap[str][""] :
			(tmp = pointerRe.exec(str)) && (
				typeof currentMap[tmp[1]] === "object" &&
				currentMap[tmp[1]][tmp[2]] ||
				currentMap[tmp[2]]
			) || fallback
		) :
		isArray(str) ?
		get(str[0], get(str[1], get(str[2], fallback))) :
		fallback
	}


	function makeFn(str) {
		exprFound = 0
		var fn = str.replace(formatRe, formatFn)
		if (exprFound) try {
			var keys = Object.values(exprFound)
			return Function("$,_,$g", (keys[0] ? "var " + keys + ";": "") + "return('" + fn + "')")
		} catch (e) {
			/*** debug
			console.log("makeFn", fn)
			console.log(e)
			/**/
		}
		return fn.replace(/\\'/g, "'")
	}

	function formatFn(_, expr, q, pattern) {
		if (expr) {
			if (!exprFound) exprFound = {}
			var tmp
			, vars = expr.replace(exprRe, "")

			for (; tmp = wordRe.exec(vars); ) {
				exprFound[tmp[0]] = tmp[0] + (
					tmp[1] ? "=" : "=$['" + tmp[0] + "']!=null?$['" + tmp[0] + "']:"
				) + "$g['" + tmp[2] + "']!=null?$g['" + tmp[2] + "']:''"
			}

			if (pattern = get(pattern, pattern)) {
				if (ext[tmp = pattern.charAt(0)]) {
					expr = "_." + ext[tmp] + "(" + expr + ",'" + pattern.slice(tmp == "#" ? 0 : 1).replace(/'/g, "\\'") + "')"
				} else {
					for (; tmp = pattRe.exec(pattern); ) {
						expr = "_." + tmp[1] + ".call($," + expr + (tmp[2] ? "," + tmp[2] : "") + ")"
					}
				}
			}

			return "'+(" + expr + ")+'"
		}
		return _ == "'" ?  "\\'" : _ == "\n" ? "\\n" : "{"
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
		for (var k in map) {
			target[k] = map[k] && map[k].constructor === Object ? merge(Object.create(target), map[k]) : map[k]
		}
		return target
	}

	i18n.def = function(map) {
		for (var k in map) {
			add(k, map)
		}
	}

	function getLang(lang) {
		return lang && (
			i18n[lang = ("" + lang).toLowerCase()] ||
			i18n[lang = lang.split("-")[0]]
		) && lang
	}

	function use(lang) {
		lang = getLang(lang)
		if (lang && currentLang != lang) {
			cache = {}
			currentMap = i18n[currentLang = i18n.current = lang] = i18n[currentLang]
		}
		return currentLang
	}

	function isString(str) {
		return typeof str === "string"
	}
	function isObject(obj) {
		return obj && obj.constructor === Object
	}
	function getStr(sub, word, fallback) {
		return isObject(currentMap[word]) && currentMap[word][sub] ||
		isObject(currentMap[sub]) && currentMap[sub][word] ||
		currentMap[word || sub] || fallback
	}

	/*** i18n.date ***/
	// P3Y6M4DT12H30M5S - P is the duration designator (referred to as "period")
	//
	var dateRe = /([Md])\1\1\1?|([yMdHhmswSZ])(\2?)|[uUaSeoQ]|'((?:''|[^'])*)'|(["\\\n\r\u2028\u2029])/g
	, fns = Object.create(null)
	, tmp1 = new Date()
	, tmp2 = new Date()
	, map = {
		e: "Day()||7",
		M: "Month()+1",
		d: "Date()",
		H: "Hours()",
		h: "Hours()%12||12",
		m: "Minutes()",
		s: "Seconds()",
		S: "Milliseconds()"
	}


	i18n[ext["@"] = "date"] = date
	function date(input, _mask, _zone) {
		var offset, undef
		, date = typeof input === "number" ? input : isNaN(input) ? Date.parse(input) : +input
		, locale = currentMap["@"]
		, mask = locale[_mask] || _mask || locale.iso
		, zone = _zone != undef ? _zone : Date._tz != undef ? Date._tz : undef
		, utc = mask.slice(0, 4) == "UTC:"
		if (zone != undef && !utc) {
			offset = 60 * zone
			tmp1.setTime(date + offset * 6e4)
			utc = mask = "UTC:" + mask
		} else {
			tmp1.setTime(date)
			offset = utc ? 0 : -tmp1.getTimezoneOffset()
		}
		return isNaN(date) ? "" + date : (
			fns[mask] || (fns[mask] = Function("d,a,o,l", 'var t;return "' + dateStr(mask, utc) + '"')))(
			tmp1,
			tmp2,
			offset,
			locale
		)
	}

	date.dateStr = dateStr
	function dateStr(mask, utc) {
		var get = "d.get" + (utc ? "UTC" : "")
		, setA = "a.setTime(+d+((4-(" + get + map.e + "))*864e5))"
		return (utc ? mask.slice(4) : mask).replace(dateRe, function(match, MD, single, pad, text, esc) {
			var str = (
				esc            ? escape(esc).replace(/%u/g, "\\u").replace(/%/g, "\\x") :
				text != null   ? text.replace(/''/g, "'") :
				MD             ? "l.names[" + get + (MD == "M" ? "Month" : "Day" ) + "()+" + (match == "ddd" ? 24 : MD == "d" ? 31 : match == "MMM" ? 0 : 12) + "]" :
				match == "u"   ? "(d/1000)>>>0" :
				match == "U"   ? "+d" :
				match == "Q"   ? "((" + get + "Month()/3)|0)+1" :
				match == "a"   ? "l[" + get + map.H + ">11?'pm':'am']" :
				match == "o"   ? setA + ",a" + get.slice(1) + "FullYear()" :
				single == "y"  ? get + "FullYear()" + (pad == "y" ? "%100" : "") :
				single == "Z"  ? "(t=o)?(t<0?((t=-t),'-'):'+')+(t<600?'0':'')+(0|(t/60))" + (pad ? "" : "+':'") + "+((t%=60)>9?t:'0'+t):'Z'" :
				single == "w"  ? "Math.ceil(((" + setA + "-a.s" + get.slice(3) + "Month(0,1))/864e5+1)/7)" :
				get + map[single || match]
			)
			return text != null || esc ? str : '"+(' + (
				match == "SS" ? "(t=" + str + ")>9?t>99?t:'0'+t:'00'+t" :
				pad && single != "Z" ? "(t=" + str + ")>9?t:'0'+t" :
				str
			) + ')+"'
		})
	}

	/**/

	/*** i18n.detect ***/
	i18n.detect = function(fallback) {
		var navigator = exports.navigator || exports

		// navigator.userLanguage for IE, navigator.language for others
		return use([navigator.language, navigator.userLanguage].concat(
			navigator.languages, fallback, list[0]
		).filter(getLang)[0])
	}
	/**/

	/*** i18n.number ***/
	var numRe1 = /([^\d#]*)([\d# .,_·']*\/?\d+)(?:(\s*)([a-z%]+)(\d*))?(.*)/
	, numRe2 = /([.,\/])(\d+)(?![\d.,])/

	i18n[ext["#"] = "number"] = number
	function number(input, format) {
		return (cache[format] || (cache[format] = Function(
			"d,g",
			"var s,i,N,n,r,o;return " + numStr(format)
		)))(input, fnScope)
	}
	number.pre = {
		s: "(o+=d<1e3?'':d<1e6?(d/=1e3,'k'):d<1e9?(d/=1e6,'M'):(d/=1e9,'G')),"
	}
	number.post = {
	}

	function numStr(format) {
		// totalLength
		// format;0-value?;NaN-value;roundPoint;negFormat
		var conf = format.split(";")
		, m2 = numRe1.exec(conf[0])
		, m3 = numRe2.exec(m2[2])
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
		) + ",i=Math.floor(s" + (
			conf[2] == 1 ? "%1?s+1:s" : "+" + (conf[2] || .5)
		) + ")*" + step

		if (decimals) {
			fn += (m2[5] ?
				",r=(''+(+i.toFixed(" + (m2[5] < 4 ? 2 : m2[5]-2) + "-(i<10?0:i<100?1:2)-o.length" + ")))" :
				",r=i.toFixed(" + decimals + ")"
			)
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
				fn += ",i<1&&(r=r.slice(1)||'0')"
			}
		} else {
			fn += ",r=i+''"
		}
		if (sLen > 1) {
			if (decimals) sLen += decimals + 1
			fn += ",r=(r.length<" + sLen + "?('0000000000000000'+r).slice(-" + sLen + "):r)"
		}

		if (num = full.match(/[^\d#][\d#]+/g)) {
			fn += ",r=" + numJunk(num, num.length - 1, 0, decimals ? decimals + 1 : 0)
		}

		if (m2[4] == "o") {
			number.post.o = "r+(n=d,o=g.o," + (
				fnScope.o = get("ordinal").split(";")
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

	/*** i18n.pick ***/
	var pickRe1 = /(\w+)\?/g
	, pickRe2 = /[;=,]/
	i18n[ext["?"] = "pick"] = pick
	function pick(val, word) {
		for (var arr = getStr("?", word, word).replace(pickRe1, "$1=$1;").split(pickRe2), i = 1|arr.length; i > 0; ) {
			if ((i-=2) < 0 || arr[i] && (arr[i] == "" + val || +arr[i] <= val)) {
				return arr[i + 1] || ""
			}
		}
	}
	/**/

	/*** i18n.plural ***/
	i18n[ext["*"] = "plural"] = plural
	function plural(n, word) {
		var expr = getStr("*", "", "n!=1")
		return (cache[expr] || (cache[expr] = Function(
			"a,n",
			"return (a[+(" + expr + ")]||a[0]).replace('#',n)"
		)))((getStr("*", word, "# " + word)).split(";"), n)
	}
	/**/

	i18n.map = function(input, str, sep, lastSep) {
		if (!isArray(input)) return input
		var arr = input.map(function(data) {
			return i18n(str, data)
		})
		, end = lastSep && arr.length > 1 ? lastSep + arr.pop() : ""
		return arr.join(sep || ", ") + end
	}
	i18n.upcase = function(str) {
		return isString(str) ? str.toUpperCase() : "" + str
	}
	i18n.locase = function(str) {
		return isString(str) ? str.toLowerCase() : "" + str
	}
	i18n.json = JSON.stringify


}(this, Object, Function)


