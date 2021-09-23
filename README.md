[1]: https://badgen.net/coveralls/c/github/litejs/crypto-lite
[2]: https://coveralls.io/r/litejs/crypto-lite
[3]: https://packagephobia.now.sh/badge?p=@litejs/i18n
[4]: https://packagephobia.now.sh/result?p=@litejs/i18n
[5]: https://badgen.net/badge/icon/Buy%20Me%20A%20Tea/orange?icon=kofi&label
[6]: https://www.buymeacoffee.com/lauriro
[wiki]: https://github.com/litejs/i18n/wiki


@litejs/i18n &ndash; [![Coverage][1]][2] [![size][3]][4] [![Buy Me A Tea][5]][6]
============

Translation, pluralization, date and number formating.

```javascript
i18n.def({"en": "In English"})
i18n.add("en", {
	// Numbers extension namespace
	"#": {
		".05": "# ###.05",     // Number rounded to .05
		"gas": "#/8",          // Fractions
		"money": " $# ###,05 ;n\a;($# ###,05);zero"
	},
	// Pluralization extension namespace
	"*": {
		"message": "one message;# messages"
	},
	// Selection extension namespace
	"?": {
		"friend": "friend;male=boyfriend;female=girlfriend"
	},
	// Date and time extension namespace
	"@": {
		"LT": "h:mm a",        // Local Time
		"LD": "MM/DD/y"        // Local Date
	},
	"welcome": "Hello, {user.name}!",
	"inbox": "You have {count;*message} from your {friend.sex;?friend}!"
})
var data = { user: {name: "Bob"}, count: 15, friend: { sex: "female" } })
i18n("welcome", data)
// Hello, Bob!
i18n("inbox", data)
// You have 15 messages from your girlfriend!
```

See [wiki][] for more.

## Licence

Copyright (c) 2021 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt) |
[Source code](https://github.com/litejs/i18n)

