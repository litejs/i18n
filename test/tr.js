
var describe = require("litejs/test").describe
, it = describe.it

describe("Transliteration", function() {
	global.i18n = require("..").i18n
	require("../tr")

	// ru
	// АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя

	var CyrillicCommon = "АAБBВVДDЕEЗZКKЛLМMНNОOПPРRСSТTФFаaбbвvдdеeзzкkлlмmнnоoпpрrсsтtфf"

	i18n.add("en", {
		"tr": {
			"ru": "[\\u0400-\\u04FFА]\nЬь\0" + CyrillicCommon +
			"ГGИIЙYУUХHЪ'ЫYЭEҐGЄEІI" +
			"гgиiйyуuхhъ'ыyэeґgєeіi\0" +
			"ЁYoЖZhЦTsЧChШShЮYuЯYaЇYi" +
			"ёyoжzhцtsчchшshюyuяyaїyi\0ЩSchщsch",
			"uk": "[\\u0400-\\u04FFА']\nЬь\0" + CyrillicCommon +
			"ГHҐGИYІIЇIЙIУU" +
			"гhґgиyіiїiйiуu\0" +
			"ЄIeЖZhХKhЦTsЧChШShЮIuЯIa" +
			"єieжzhхkhцtsчchшshюiuяia\0\0ЩShchщshch\n" +
			"\0^ЙY^йy\0^ЇYi^їyi^ЄYe^єye^ЮYu^юyu^ЯYa^яya\0ЗгZghзгzgh\n.'."
		}
	})
	i18n.use("en")

	describe("Russian", function() {
		it ("transliterates", function(assert) {
			assert
			.equal(i18n.tr("tr.ru", "Это просто некий текст"), "Eto prosto nekiy tekst")
			.equal(i18n.tr("tr.ru", "Невероятное Упущение"), "Neveroyatnoe Upuschenie")
			.equal(i18n.tr("tr.ru", "Шерстяной Заяц"), "Sherstyanoy Zayats")
			.equal(i18n.tr("tr.ru", "Это кусок строки русских букв v peremeshku s latinizey i амперсандом (pozor!) & something"),
				"Eto kusok stroki russkih bukv v peremeshku s latinizey i ampersandom (pozor!) & something")
			.end()
		})
	})

	describe("Ukrainian", function() {
		it ("transliterates official examples", function(assert) {
			// https://zakon.rada.gov.ua/laws/show/55-2010-%D0%BF
			assert
			.equal(i18n.tr("tr.uk", "Аа Алушта Андрій"), "Aa Alushta Andrii")
			.equal(i18n.tr("tr.uk", "Бб Борщагівка Борисенко"), "Bb Borshchahivka Borysenko")
			.equal(i18n.tr("tr.uk", "Вв Вінниця Володимир"), "Vv Vinnytsia Volodymyr")
			.equal(i18n.tr("tr.uk", "Гг Гадяч Богдан Згурський"), "Hh Hadiach Bohdan Zghurskyi")
			.equal(i18n.tr("tr.uk", "Ґґ Ґалаґан Ґорґани"), "Gg Galagan Gorgany")
			.equal(i18n.tr("tr.uk", "Дд Донецьк Дмитро"), "Dd Donetsk Dmytro")
			.equal(i18n.tr("tr.uk", "Ее Рівне Олег Есмань"), "Ee Rivne Oleh Esman")
			.equal(i18n.tr("tr.uk", "Єє Єнакієве Гаєвич Короп'є"), "Yeie Yenakiieve Haievych Koropie")
			.equal(i18n.tr("tr.uk", "Жж Житомир Жанна Жежелів"), "Zhzh Zhytomyr Zhanna Zhezheliv")
			.equal(i18n.tr("tr.uk", "Зз Закарпаття Казимирчук"), "Zz Zakarpattia Kazymyrchuk")
			.equal(i18n.tr("tr.uk", "Ии Медвин Михайленко"), "Yy Medvyn Mykhailenko")
			.equal(i18n.tr("tr.uk", "Іі Іванків Іващенко"), "Ii Ivankiv Ivashchenko")
			.equal(i18n.tr("tr.uk", "Її Їжакевич Кадиївка Мар'їне"), "Yii Yizhakevych Kadyivka Marine")
			.equal(i18n.tr("tr.uk", "Йй Йосипівка Стрий Олексій"), "Yi Yosypivka Stryi Oleksii")
			.equal(i18n.tr("tr.uk", "Кк Київ Коваленко"), "Kk Kyiv Kovalenko")
			.equal(i18n.tr("tr.uk", "Лл Лебедин Леонід"), "Ll Lebedyn Leonid")
			.equal(i18n.tr("tr.uk", "Мм Миколаїв Маринич"), "Mm Mykolaiv Marynych")
			.equal(i18n.tr("tr.uk", "Нн Ніжин Наталія"), "Nn Nizhyn Nataliia")
			.equal(i18n.tr("tr.uk", "Оо Одеса Онищенко"), "Oo Odesa Onyshchenko")
			.equal(i18n.tr("tr.uk", "Пп Полтава Петро"), "Pp Poltava Petro")
			.equal(i18n.tr("tr.uk", "Рр Решетилівка Рибчинський"), "Rr Reshetylivka Rybchynskyi")
			.equal(i18n.tr("tr.uk", "Сс Суми Соломія"), "Ss Sumy Solomiia")
			.equal(i18n.tr("tr.uk", "Тт Тернопіль Троць"), "Tt Ternopil Trots")
			.equal(i18n.tr("tr.uk", "Уу Ужгород Уляна"), "Uu Uzhhorod Uliana")
			.equal(i18n.tr("tr.uk", "Фф Фастів Філіпчук"), "Ff Fastiv Filipchuk")
			.equal(i18n.tr("tr.uk", "Хх Харків Христина"), "Khkh Kharkiv Khrystyna")
			.equal(i18n.tr("tr.uk", "Цц Біла Церква Стеценко"), "Tsts Bila Tserkva Stetsenko")
			.equal(i18n.tr("tr.uk", "Чч Чернівці Шевченко"), "Chch Chernivtsi Shevchenko")
			.equal(i18n.tr("tr.uk", "Шш Шостка Кишеньки"), "Shsh Shostka Kyshenky")
			.equal(i18n.tr("tr.uk", "Щщ Щербухи Гоща Гаращенко"), "Shchshch Shcherbukhy Hoshcha Harashchenko")
			.equal(i18n.tr("tr.uk", "Юю Юрій Корюківка"), "Yuiu Yurii Koriukivka")
			.equal(i18n.tr("tr.uk", "Яя Яготин Ярошенко Костянтин Знам'янка Феодосія"), "Yaia Yahotyn Yaroshenko Kostiantyn Znamianka Feodosiia")
			.end()
		})

		it ("properly transliterates strings with punctuation, digits and symbols", function(assert) {
			assert
			.equal(
				i18n.tr("tr.uk", "© Іван Кошелівець. Жанна д'Арк. Київ 1997, ISBN 5-7372-0031-0"),
				"© Ivan Koshelivets. Zhanna dArk. Kyiv 1997, ISBN 5-7372-0031-0"
			)
			.equal(
				i18n.tr("tr.uk", "ці 'треба' залишити"),
				"tsi 'treba' zalyshyty"
			)
			.end()
		})
	})
})



