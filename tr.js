
!function(i18n) {
	var cache = {}

	i18n.tr = function(map, text) {
		return (cache[map] || (cache[map] = makeTr(i18n.get(map))))(text)
	}

	function makeTr(str) {
		var map = {}
		, lines = str.split("\n")
		, word = lines[0]
		, chars = ""
		, re = []
		, args = "i,a"
		, lookback_b = ""
		, lookback_B = ""
		, i = 1, ii = lines.length

		for (; i < ii; i++) if (lines[i]) {
			var junks = lines[i].split("\0")
			, j = 0
			, jj = junks.length

			j: for (; j < jj; j++) if (junks[j]) {
				for (var c, c0, c1, pos = 0; c = junks[j].substr(pos, i); pos += i + j) {
					c0 = c.charAt(0)
					c1 = c.slice(-1)
					map[
						c1 == "." ? (c=c.slice(0,-1)) : c
					] = junks[j].substr(pos + i, j)
					if (i == 1) chars += c
					else {
						if (c1 == ".") {
							c += "(?=" + word + ")"
						}
						if (c0 == "^") {
							lookback_b += (lookback_b ? "|" : "") + c.slice(1)
						} else if (c0 == ".") {
							lookback_B += (lookback_B ? "|" : "") + c.slice(1)
						} else {
							re.push(c)
						}
					}
				}
			}
		}
		if (lookback_b) {
			args = "b," + args
			re.unshift("(" + lookback_b + ")")
		}
		if (lookback_B) {
			args = "B," + args
			re.unshift("(" + lookback_B + ")")
		}
		if (chars) {
			re.push("[" + chars + "]")
		}

		return Function("m,b,B",
			"var r=/" + re.join("|") + "/g,w=/^" + word + "/;function f(_," + args + "){" +
			"return (b||B)&&w.test(a.charAt(i-1))!=!b?(m[_]||_):m[b?'^'+b:B?'.'+B:_]};" +
			"return function(s){return s.replace(r,f)}"
		)(map)
	}
}(i18n)

