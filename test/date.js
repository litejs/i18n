
describe(".date()", function() {
	var i18n = require("../i18n.js").i18n

	this
	.should("format date", function(assert) {
		// {start;date:'y-MM-dd'}
		// {start;@lt}


		var d2n = 1234567890123
		, d2d = new Date(d2n)
		, d2s = "" + 1234567890123
		, d1 = new Date(Date.UTC(1,1,3,4,5,6,7))

		d1.setUTCFullYear(1)

		i18n.use("et")
		i18n.add("et", {
			"@": {
				"": "jaan veeb märts apr mai juuni juuli aug sept okt nov dets jaanuar veebruar märts aprill mai juuni juuli august september oktoober november detsember P E T K N R L pühapäev esmaspäev teisipäev kolmapäev neljapäev reede laupäev".split(" "),
				am: "AM",
				pm: "PM",
				iso:   "UTC:y-MM-dd'T'HH:mm:ss'Z'",
				LT:    "HH:mm",
				LTS:   "HH:mm:ss",
				LD:    "dd.MM.y",
				LDD:   "d MMMM y",
				LDDT:  "d MMMM y HH:mm",
				LDDDT: "dddd, d MMMM y HH:mm"
			}
		})

		assert
		.equal( i18n.date(d1, "yy-MM-dd y/M/d"), "01-02-03 1/2/3" )

		// Pattern	Result (in a particular locale)
		// yyyy.MM.dd G 'at' HH:mm:ss zzz	1996.07.10 AD at 15:08:56 PDT
		// EEE, MMM d, ''yy	Wed, July 10, '96
		// h:mm a	12:08 PM
		// hh 'o''clock' a, zzzz	12 o'clock PM, Pacific Daylight Time
		// K:mm a, z	0:00 PM, PST
		// yyyyy.MMMM.dd GGG hh:mm aaa	01996.July.10 AD 12:08 PM

		assert
		.equal( i18n.date(d1, "h 'o''clock' a"), "5 o'clock AM" )
		.equal( i18n.date(d1, "M MM MMM MMMM"), "2 02 veeb veebruar" )
		.equal( i18n.date(d1, "d dd ddd dddd"), "3 03 L laupäev" )
		.equal( i18n.date(d2d, "u U"), "1234567890 1234567890123" )
		.equal( i18n.date(d2d, "Q Z ZZ"), "1 +02:00 +0200" )
		.equal( i18n.date(d2d, "SS"), "123" )


		assert
		.equal( i18n.date(d2n), "2009-02-13T23:31:30Z" )
		.equal( i18n.date(d2d), "2009-02-13T23:31:30Z" )
		.equal( i18n.date(d2s), "2009-02-13T23:31:30Z" )
		.equal( i18n.date(d2s, "LT"), "01:31" )
		.equal( i18n("{at;@LT}", {at: d2s}), "01:31" )

		assert.equal( i18n.date(d2s, "LT", 3), "02:31" )
		Date._tz = 4
		assert.equal( i18n.date(d2s, "HH:mm\n"), "03:31\n" )
		Date._tz = void 0
		assert.equal( i18n.date(NaN, "LT"), "Invalid Date" )

		// should format ISO 8601 week numbers in local time
		var key, map = {
			"2005-01-01T01:02": "2004-W53-6 1:2",
			"2005-01-02T01:02": "2004-W53-7 1:2",
			"2005-12-31T01:02": "2005-W52-6 1:2",
			"2007-01-01T01:02": "2007-W01-1 1:2",
			"2007-12-30T01:02": "2007-W52-7 1:2",
			"2007-12-31T01:02": "2008-W01-1 1:2",
			"2008-01-01T01:02": "2008-W01-2 1:2",
			"2008-12-28T01:02": "2008-W52-7 1:2",
			"2008-12-29T01:02": "2009-W01-1 1:2",
			"2008-12-30T01:02": "2009-W01-2 1:2",
			"2008-12-31T01:02": "2009-W01-3 1:2",
			"2009-01-01T01:02": "2009-W01-4 1:2",
			"2009-12-31T01:02": "2009-W53-4 1:2",
			"2010-01-01T01:02": "2009-W53-5 1:2",
			"2010-01-02T01:02": "2009-W53-6 1:2",
			"2010-01-03T01:02": "2009-W53-7 1:2"
		}
		for (key in map) assert.equal( i18n.date(key, "o-'W'ww-e h:m"), map[key] )

		assert.end()
	})

	.should("set global timezone")
	.should("set one time timezone")

})

