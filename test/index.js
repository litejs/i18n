
require("..")
.test("lib/i18n", function(assert, mock) {
	var mod = require("../../lib/i18n.js")
	, i18n = mod.i18n

	global.Fn = require("../../lib/fn").Fn
	global.Event = require("../../lib/events")
	global.Item = require("../../model").Item


	i18n.def({
		"et": "Eesti keeles",
		"ar": "Arabic",
		"en": "In English",
		"fr-CH": "French (Switzerland)"
	})

	i18n.add("et", {
		ordinal: '"."',
		Home: "Ko'du",
		Name: "Nimi",
		replace: "{pre}Ni'mi {name}, {deep.map.toUpperCase() + xx} vanus {age;#1}{unit} {3+1}",
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
	assert.equal(i18n("a.Name"), "Nimi A")
	assert.equal(i18n("b.Name"), "Nimi")
	assert.equal(i18n("b.Age"), "Age")
	assert.equal(i18n(["b.Name","a.Name"]), "Age")
	assert.equal(i18n("button.Name"), "Nupu nimi")
	assert.equal(i18n("button.Home"), "Ko'du")
	assert.equal(i18n("replace", {name:"Foo", age:10.1, deep:{map:"bar"}}), "Ni'mi Foo, BAR vanus 10 4")

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

	// i18n.number
	assert
	.equal(i18n.number(null, "#.05"), "")
	.equal(i18n.number(null, "#.05;-"), "-")
	.equal(i18n.number(.34, "#,###.05"), ".35")
	.equal(i18n("{.34;#,###.05}"), ".35")
	.equal(i18n.number(-.34, "#,###.05 ;;;(#)"), "(.35)")
	.equal(i18n.number(-.34, "#,###.05 ;;;#-"), ".35-")
	.equal(i18n.number(.34, "#,###.05 ;;;(#)"), ".35 ")
	.equal(i18n.number(.36, "#,##0.05"), "0.35")
	.equal(i18n.number(.31, "#,#00.05"), "00.30")
	.equal(i18n.number(1.005, "0.01"), "1.01")
	.equal(i18n.number(1.005, "#.01"), "1.01")
	.equal(i18n.number(9, "#10"), "10")
	.equal(i18n.number(-9, "#10"), "-10")
	.equal(i18n.number(30000.65, "# ##0,01"), "30 000,65")
	.equal(i18n.number(1234567890, "# ##1"), "1 234 567 890")

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

	.equal(i18n.number(1235, "#,###,##,##2.00"), "1,236.00")
	.equal(i18n.number(1235.123, "00,005.00"), "01,235.00")
	//assert.equal(i18n.number(1235, "#.1{1000k1000M1000G}"), "1.2k")
	.equal(i18n.number(123, "#.1s"), "123.0")
	.equal(i18n.number(1235, "#.1s"), "1.2k")
	.equal(i18n.number(1235000, "#.1s"), "1.2M")


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

