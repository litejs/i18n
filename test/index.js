
require("..")
.test("i18n", function(assert) {
	var i18n = require("../../lib/i18n.js").i18n

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

	assert.end()
})


