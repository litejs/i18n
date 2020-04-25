

const { describe, it } = require("litejs/test").describe

describe("i18n", function() {
	var mod = require("../index.js")
	, i18n = mod.i18n

	it("should define languages", function(assert) {
		assert.equal(i18n.current, null)

		i18n.def({
			"et": "Eesti keeles",
			"ar": "Arabic",
			"en": "In English",
			"fr-CH": "French (Switzerland)"
		})

		assert.equal(i18n.current, "et")
		.equal(i18n.list, ["et", "ar", "en", "fr-CH"])
		.end()
	})

	it("should get translation by key", function(assert) {
		i18n.use("en")
		i18n.add("en", {
			page: {
				title: "Title"
			},
			save: "Save",
			user: {
				"": "User",
				"*": "1 user;# users",
				"save": "Save User"
			}
		})

		assert
		.equal(i18n("page"), "page")
		.equal(i18n("page.save"), "Save")
		.equal(i18n("page.title"), "Title")
		.equal(i18n("save"), "Save")
		.equal(i18n("unknown.save"), "Save")
		.equal(i18n("unknown.txt"), "unknown.txt")
		.equal(i18n("user"), "User")
		.equal(i18n("user.save"), "Save User")
		.end()
	})

	it("should detect language", function(assert, mock) {

		assert.equal(i18n.detect(), "et")
		// i18n.detect
		mock.replace(Intl, "DateTimeFormat", null)
		mod.navigator = {language: "et-EE"}
		assert.equal(i18n.detect(), "et")
		mod.navigator = {languages: ["zh-CN", "en-US", "ja-JP"]}
		assert.equal(i18n.detect(), "en")
		assert.equal(i18n.current, "en")
		mod.navigator = {userLanguage: "et"}
		assert.equal(i18n.detect(), "et")
		mod.navigator = {userLanguage: "ru"}
		assert.equal(i18n.detect("et-EE"), "et")
		assert.equal(i18n.detect("eq"), "et")
		assert.end()
	})

	it("should format", function(assert, mock) {

		i18n.vals.abc = "A B"

		i18n.add("et", {
			_: {
				num: "#1;-",
				num1: "#0,1;-"
			},
			ordinal: '"."',
			Home: "Ko'du",
			Name: "Nimi",
			replace: "{pre}Ni'mi {name;upcase},\n{deep.map.toUpperCase() + xx} vanus {age;#1}{unit} {3+1}",
			list: "{arr;map:'{name;map};{val}'}",
			button: {
				Name: "Nupu nimi",
				save: "Salvesta"
			},
			"a.Name": "Nimi A"
		})
		i18n.add("en", {
			ordinal: "th;st;nd;rd;o[n%=100]||o[(n-20)%10]||o[0]",
			plural: {
				_: "n!=1"

			}
		})

		i18n.add("fr-ch", {
			ordinal: "ème;er;o[n==1?1:0]",
			num: "#'###,01"
		})

		assert.equal(i18n.current, "et")
		assert.equal(i18n("Name"), "Nimi")
		assert.equal(i18n(3), "3")
		assert.equal(i18n("{\\name}"), "{name}")
		assert.equal(i18n("\\{name}"), "{name}")
		assert.equal(i18n("a.Name"), "Nimi A")
		assert.equal(i18n("b.Name"), "Nimi")
		assert.equal(i18n(["b.Name","a.Name"]), "Nimi")
		assert.equal(i18n("button"), "button")
		assert.equal(i18n("button.Name"), "Nupu nimi")
		assert.equal(i18n("button.Home"), "Ko'du")
		assert.equal(i18n("replace", {name:"Foo", age:10.1, deep:{map:"bar"}}), "Ni'mi FOO,\nBAR vanus 10 4")
		assert.equal(i18n("list", {arr: [{name:"a",val:1},{name:"b",val:2}]}), "a;1, b;2")
		assert.equal(i18n("{a;map:'{$}',', ',', and '}", {a: ["Key", "Foo", "Bar"]}), "Key, Foo, and Bar")
		assert.equal(i18n("{val;_.num}C {val;_.num1}K", {val:12.3}), "12C 12,3K")

		assert.equal(i18n("{lo;upcase}", { lo: "loCase" }), "LOCASE")
		assert.equal(i18n("{lo;upcase}", { lo: 10 }), "10")
		assert.equal(i18n("{lo;upcase}", { lo: null }), "")
		assert.equal(i18n("{up;locase}", { up: "UPCASE" }), "upcase")
		assert.equal(i18n("{up;locase}", { up: 20 }), "20")
		assert.equal(i18n("{up;locase}", { up: void 0 }), "")
		assert.equal(i18n("{arr[0]}", { arr: ["A"] }), "A")
		assert.equal(i18n("{arr[0].x}", { arr: [{x:"B"}] }), "B")
		assert.equal(i18n("{arr[0].toLocaleString()}", { arr: ["C"] }), "C")
		assert.equal(i18n("{arr[0].toLocaleString();locase}", { arr: ["C"] }), "c")
		assert.equal(i18n("{abc}"), "A B")
		assert.equal(i18n("{abc}", {}), "A B")
		assert.equal(i18n("{abc}", {abc: "A C"}), "A C")
		assert.equal(i18n("{$abc}"), "A B")
		assert.equal(i18n("{$abc}", {}), "A B")
		assert.equal(i18n("{$abc}", {abc: "A C"}), "A B")
		assert.end()
	})

	it("should format map", function(assert, mock) {
		assert.equal(i18n('{{a:1+2};json}'), '{"a":3}')
		assert.equal(i18n('{[1+2,"2"];json}'), '[3,"2"]')
		assert.equal(i18n('{[{a:1+2},"2"];json}'), '[{"a":3},"2"]')
		assert.equal(i18n('{[{a:1+2},"2"];json:}'), '[{"a":3},"2"]')
		assert.equal(i18n('{[{a:1+2},"2"];json:null}'), '[{"a":3},"2"]')
		assert.equal(i18n('{[{a:1+2},"2"];json:null,1}'), '[\n {\n  "a": 3\n },\n "2"\n]')
		assert.end()
	})

	it("should format numbers", function(assert) {
		// i18n.number
		// format;0-value?;NaN-value;roundPoint;negFormat
		assert
		.equal(i18n.number(0, "#.01"), ".00")
		.equal(i18n.number(0, "#.01;-"), ".00")
		.equal(i18n.number(NaN, "#.05"), "")
		.equal(i18n.number(NaN, "#.05;-"), "-")
		.equal(i18n.number(null, "#.05"), "")
		.equal(i18n.number(null, "#.05;-"), "-")
		.equal(i18n.number(void 0, "#.05"), "")
		.equal(i18n.number(void 0, "#.05;-"), "-")
		.equal(i18n.number(.34, "#,###.05"), ".35")
		.equal(i18n("{.34;#,###.05}"), ".35")
		.equal(i18n.number(1234.34,  "$ #,###.05 ;;;($#)"), "$ 1,234.35 ")
		.equal(i18n.number(-1234.34, "$ #,###.05 ;;;($#)"), "($1,234.35)")
		.equal(i18n.number(-1234.34, "#,###.05 ;;;(#)"), "(1,234.35)")
		.equal(i18n.number(-1234.34, "#,###.05 ;;;#-"), "1,234.35-")
		.equal(i18n.number(.34, "#,###.05 ;;;(#)"), ".35 ")
		.equal(i18n.number(.36, "#,##0.05"), "0.35")
		.equal(i18n.number(.31, "#,#00.05"), "00.30")
		.equal(i18n.number(1.005, "0.01"), "1.01")
		.equal(i18n.number(1.005, "0.01;;.1"), "1.00")
		.equal(i18n.number(1.005, "0.01;;.5"), "1.01")
		.equal(i18n.number(1.005, "0.01;;1"), "1.01")
		.equal(i18n.number(1.005, "#.01"), "1.01")
		.equal(i18n.number(9, "#10"), "10")
		.equal(i18n.number(-9, "#10"), "-10")
		.equal(i18n.number(30000.65, "# ##0,01"), "30 000,65")
		.equal(i18n.number(9007199254740990, "# ##1"), "9 007 199 254 740 990")
		.equal(i18n.number(123567890, "#,###,##,##2"), "1,235,67,890")
		.equal(i18n.number(123567890, "#,####,###1"), "1,2356,7890")
		.equal(i18n.number(123567890, "#,###_##'##2.00"), "1,235_67'890.00")
		.equal(i18n.number(23567890, "#,###,##,##2.00"), "235,67,890.00")
		.equal(i18n.number(3567890, "#,###,##,##2.00"), "35,67,890.00")
		.equal(i18n.number(567890, "#,###,##,##2.00"), "5,67,890.00")
		.equal(i18n.number(67890, "#,###,##,##2.00"), "67,890.00")
		.equal(i18n.number(7890, "#,###,##,##2.00"), "7,890.00")
		.equal(i18n.number(890, "#,###,##,##2.00"), "890.00")
		.equal(i18n.number(90, "#,###,##,##2.00"), "90.00")

		.equal(i18n.number(1235.123, "00,005.00"), "01,235.00")

		assert
		.equal(i18n.number(.70, "#.25"), ".75")
		.equal(i18n.number(.10, "#/4"), "0")
		.equal(i18n.number(.20, "#/4"), "¼")
		.equal(i18n.number(.20, "0/4"), "0¼")
		.equal(i18n.number(.30, "#/4"), "¼")
		.equal(i18n.number(.40, "#/4"), "½")
		.equal(i18n.number(.50, "#/4"), "½")
		.equal(i18n.number(.60, "#/4"), "½")
		.equal(i18n.number(.70, "#/4"), "¾")
		.equal(i18n.number(.80, "#/4"), "¾")
		.equal(i18n.number(.90, "#/4"), "1")
		.equal(i18n.number(1.0, "#/4"), "1")
		.equal(i18n.number(1.1, "#/4"), "1")
		.equal(i18n.number(1.2, "#/4"), "1¼")
		.equal(i18n.number(.70, "#/8", 1), "¾")

		.equal(i18n.number(1.05, "#/5"), "1")
		.equal(i18n.number(1.15, "#/5"), "1⅕")
		.equal(i18n.number(1.25, "#/5"), "1⅕")
		.equal(i18n.number(1.4,  "#/5"), "1⅖")
		.equal(i18n.number(1.6,  "#/5"), "1⅗")
		.equal(i18n.number(1.8,  "#/5"), "1⅘")

		//assert.equal(i18n.number(1235, "#.1{1000k1000M1000G}"), "1.2k")
		.equal(i18n.number(0,       "1s"), "0")
		.equal(i18n.number(0.2,     "1s"), "0")
		.equal(i18n.number(1,       "1s"), "1")
		.equal(i18n.number(12,      "1s"), "12")
		.equal(i18n.number(123,     "1s"), "123")
		.equal(i18n.number(1234,    "1s"), "1k")
		.equal(i18n.number(12345,   "1s"), "12k")
		.equal(i18n.number(123456,  "1s"), "123k")
		.equal(i18n.number(1234567, "1s"), "1M")

		.equal(i18n.number(0,       "0.1s"), "0.0")
		.equal(i18n.number(0.2,     "0.1s"), "0.2")
		.equal(i18n.number(1,       "0.1s"), "1.0")
		.equal(i18n.number(12,      "0.1s"), "12.0")
		.equal(i18n.number(123,     "0.1s"), "123.0")
		.equal(i18n.number(1234,    "0.1s"), "1.2k")
		.equal(i18n.number(12345,   "0.1s"), "12.3k")
		.equal(i18n.number(123456,  "0.1s"), "123.5k")
		.equal(i18n.number(1234567, "0.1s"), "1.2M")

		.equal(i18n.number(0,       "#.1s"), ".0")
		.equal(i18n.number(0.2,     "#.1s"), ".2")
		.equal(i18n.number(1,       "#.1s"), "1.0")
		.equal(i18n.number(12,      "#.1s"), "12.0")
		.equal(i18n.number(123,     "#.1s"), "123.0")
		.equal(i18n.number(1234,    "#.1s"), "1.2k")
		.equal(i18n.number(12345,   "#.1s"), "12.3k")
		.equal(i18n.number(123456,  "#.1s"), "123.5k")
		.equal(i18n.number(1234567, "#.1s"), "1.2M")

		.equal(i18n.number(123,     "#.1s1"), "123")
		.equal(i18n.number(123,     "#.1s2"), "123")
		.equal(i18n.number(123,     "#.1s3"), "123")
		.equal(i18n.number(123,     "#.1s4"), "123")
		.equal(i18n.number(123,     "#.1s5"), "123")

		.equal(i18n.number(1,       "0.01s4"), "1")
		.equal(i18n.number(12,      "0.01s4"), "12")
		.equal(i18n.number(123,     "0.01s4"), "123")
		.equal(i18n.number(1234,    "0.01s4"), "1.2k")
		.equal(i18n.number(1234,    "0.1s4"), "1.2k")
		.equal(i18n.number(1234,    "0,1s4"), "1,2k")
		.equal(i18n.number(12345,   "0.01s4"), "12k")

		.equal(i18n.number(1,       "0.01s5"), "1")
		.equal(i18n.number(12,      "0.01s5"), "12")
		.equal(i18n.number(123,     "0.01s5"), "123")
		.equal(i18n.number(1234,    "0.01s5"), "1.23k")
		.equal(i18n.number(12345,   "0.01s5"), "12.3k")

		.equal(i18n.number(1235,    "#.1s3"), "1.2k")
		.equal(i18n.number(123.456, "#.01s"), "123.46")
		.equal(i18n.number(123.456, "#.01s5"), "123.5")
		.equal(i18n.number(1235,    "#.1 s"), "1.2 k")
		.equal(i18n.number(1235000, "#.001s"), "1.235M")
		.equal(i18n.number(1235000, "#.001s5"), "1.24M")
		.equal(i18n.number(12350000, "#.001s5"), "12.3M")
		.equal(i18n.number(123500000, "#.001s5"), "124M")

		i18n.number.pre["%"] = "o+=(d*=100,'%'),"
		// custom formats
		assert.equal(i18n.number(0.3363, "0.01 %"), "33.63 %")


		function assertOrdinal(i) {
			assert.equal(i18n.number(parseInt(i), "1o"), i)
		}

		assert.equal(i18n.detect("et"), "et")
		;[ "0.", "1.", "2.", "3.", "101."].forEach(assertOrdinal)

		assert.equal(i18n.detect("en"), "en")
		;[
			"0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
			"10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th",
			"20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th",
			"90th", "91st", "92nd", "93rd", "94th", "95th", "96th", "97th", "98th", "99th",
			"100th", "101st", "102nd", "103rd", "104th", "105th", "106th", "107th", "108th", "109th",
			"110th", "111th", "112th", "113th", "114th"
		].forEach(assertOrdinal)

		assert.equal(i18n.detect("fr-CH"), "fr-ch")
		;[ "1er", "2ème"].forEach(assertOrdinal)

		assert.end()
	})
})


/*
// List of SI prefixes
yotta  Y   1000⁸     10²⁴    1000000000000000000000000    septillion      quadrillion    1991
zetta  Z   1000⁷     10²¹    1000000000000000000000       sextillion      trilliard      1991
exa    E   1000⁶     10¹⁸    1000000000000000000          quintillion     trillion       1975
peta   P   1000⁵     10¹⁵    1000000000000000             quadrillion     billiard       1975
tera   T   1000⁴     10¹²    1000000000000                trillion        billion        1960
giga   G   1000³     10⁹     1000000000                   billion         milliard       1960
mega   M   1000²     10⁶     1000000                      million                        1873
kilo   k   1000¹     10³     1000                         thousand                       1795
hecto  h   100       10²     100                          hundred                        1795
deca   da  10        10¹     10                           ten                            1795
	   1         10⁰     1                            one                            –
deci   d   10⁻¹      10⁻1    0.1                          tenth                          1795
centi  c   100⁻¹     10⁻2    0.01                         hundredth                      1795
milli  m   1000⁻¹    10⁻3    0.001                        thousandth                     1795
micro  µ   1000⁻²    10⁻6    0.000001                     millionth                      1873
nano   n   1000⁻³    10⁻9    0.000000001                  billionth       milliardth     1960
pico   p   1000⁻⁴    10⁻12   0.000000000001               trillionth      billionth      1960
femto  f   1000⁻⁵    10⁻15   0.000000000000001            quadrillionth   billiardth     1964
atto   a   1000⁻⁶    10⁻18   0.000000000000000001         quintillionth   trillionth     1964
zepto  z   1000⁻⁷    10⁻21   0.000000000000000000001      sextillionth    trilliardth    1991
yocto  y   1000⁻⁸    10⁻24   0.000000000000000000000001   septillionth    quadrillionth  1991
*/

