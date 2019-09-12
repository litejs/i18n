
require("..")
.test("i18n", function(assert, mock) {
	var mod = require("../../lib/i18n.js")
	, i18n = mod.i18n

	i18n.def({
		"et": "Eesti keeles",
		"ar": "Arabic",
		"en": "In English"
	})

	i18n.add("et", {
		ordinal: ".",
		Home: "Kodu",
		Name: "Nimi",
		button: {
			Name: "Nupu nimi",
			save: "Salvesta"
		},
		"a.Name": "Nimi A"
	})

	assert.equal(i18n.current, "et")
	assert.equal(i18n("Name"), "Nimi")
	assert.equal(i18n("b.Name"), "Nimi")
	assert.equal(i18n("a.Name"), "Nimi A")
	assert.equal(i18n("button.Name"), "Nupu nimi")
	assert.equal(i18n("button.Home"), "Kodu")

	// i18n-detect
	mock.replace(Intl, "DateTimeFormat", null)
	mod.navigator = {language: "et-EE"}
	assert.equal(i18n.detect(), "et")
	mod.navigator = {languages: ["zh-CN", "en-US", "ja-JP"]}
	assert.equal(i18n.detect(), "en")
	mod.navigator = {userLanguage: "et"}
	assert.equal(i18n.detect(), "et")
	mod.navigator = {userLanguage: "ru"}
	assert.equal(i18n.detect("et-EE"), "et")
	assert.equal(i18n.detect("eq"), "et")

	assert.end()
})


