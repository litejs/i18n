
!function(exports) {
	var currentLang
	, globalTexts = {}
	, hasOwn = globalTexts.hasOwnProperty
	, list = i18n.list = []

	exports.i18n = i18n
	i18n.add = add
	i18n.get = get
	i18n.use = use


	function i18n(str) {
		var tmp
		, map = i18n[currentLang]
		return typeof str === "string" ? (
			map[str] || (tmp = str.split("."))[1] && (
				typeof map[tmp[0]] === "object" &&
				map[tmp[0]][tmp[1]] ||
				map[tmp[1]]
			) || str
		) : ""
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
			i18n[currentLang = i18n.current = lang] = i18n[currentLang] || {}
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

}(this)

