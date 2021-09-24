
describe(".pattern()", function() {
	var i18n = require("../i18n.js").i18n

	this
	.should("translate pattern", function(assert) {
		i18n.def({
			"et": "Eesti keeles"
		})
		i18n.use("et")
		i18n.add("et", {
			"~": {
				"Room #": "Tuba #"
			}
		})

		assert
		.equal(i18n.pattern("Room 1"), "Tuba 1")
		.equal(i18n.pattern("Room #"), "Room #")
		.equal(i18n.pattern("House 1"), "House 1")
		.equal(i18n("A {name;~}", {name: "Room 12"}), "A Tuba 12")
		assert.end()
	})
})

