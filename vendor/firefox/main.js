var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');

pageMod.PageMod({
	include: [
		"*://www.another-site.com/*",
		"*://another-site.com/*",
		"*://google.com/*"
	],


	contentScriptOptions: {
		rootUrl: data.url("")
	},

	contentScriptFile: [
		data.url("libs/jquery-2.1.4.min.js"),
		data.url("libs/base64.js"),
		data.url("js/browser.js"),
		data.url("js/main.js")
	],

	contentStyleFile: [
		data.url("css/main.css")
	],

	contentScriptWhen: 'start'
});
