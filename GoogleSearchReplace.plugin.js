/**
 * @name GoogleSearchReplace
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "GoogleSearchReplace",
			"author": "DevilBro",
			"version": "1.2.8",
			"description": "Replace the default Google Text Search with a selection menu of several search engines"
		}
	};
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		const textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";
		var settings = {}, engines = {}, enabledEngines = {};
	
		return class GoogleSearchReplace extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						useChromium: 		{value:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
					},
					engines: {
						_all: 				{value:true, 	name:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url:null},
						Ask: 				{value:true, 	name:"Ask", 				url:"https://ask.com/web?q=" + textUrlReplaceString},
						Bing: 				{value:true, 	name:"Bing", 				url:"https://www.bing.com/search?q=" + textUrlReplaceString},
						DogPile:			{value:true, 	name:"DogPile", 			url:"http://www.dogpile.com/search/web?q=" + textUrlReplaceString},
						DuckDuckGo:			{value:true, 	name:"DuckDuckGo", 			url:"https://duckduckgo.com/?q=" + textUrlReplaceString},
						Google: 			{value:true, 	name:"Google", 				url:"https://www.google.com/search?q=" + textUrlReplaceString},
						GoogleScholar: 		{value:true, 	name:"Google Scholar", 		url:"https://scholar.google.com/scholar?q=" + textUrlReplaceString},
						Quora: 				{value:true, 	name:"Quora", 				url:"https://www.quora.com/search?q=" + textUrlReplaceString},
						Qwant: 				{value:true, 	name:"Qwant", 				url:"https://www.qwant.com/?t=all&q=" + textUrlReplaceString},
						UrbanDictionary: 	{value:true, 	name:"Urban Dictionary", 	url:"https://www.urbandictionary.com/define.php?term=" + textUrlReplaceString},
						Searx: 				{value:true, 	name:"Searx", 				url:"https://searx.info/?q=" + textUrlReplaceString},
						WolframAlpha:		{value:true, 	name:"Wolfram Alpha", 		url:"https://www.wolframalpha.com/input/?i=" + textUrlReplaceString},
						Yandex: 			{value:true, 	name:"Yandex", 				url:"https://yandex.com/search/?text=" + textUrlReplaceString},
						Yahoo: 				{value:true, 	name:"Yahoo", 				url:"https://search.yahoo.com/search?p=" + textUrlReplaceString},
						YouTube: 			{value:true, 	name:"YouTube", 			url:"https://www.youtube.com/results?q=" + textUrlReplaceString}
					}
				};
			}
			
			onStart() {
				this.forceUpdateAll();
			}
			
			onStop() {}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
					title: "Search Engines:",
					first: settingsItems.length == 0,
					last: true,
					children: Object.keys(engines).filter(n => n && n != "_all").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["engines", key],
						label: this.defaults.engines[key].name,
						value: engines[key]
					}))
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
			
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				engines = BDFDB.DataUtils.get(this, "engines");
				enabledEngines = BDFDB.ObjectUtils.filter(engines, n => n);
			}

			onMessageContextMenu (e) {
				this.injectItem(e);
			}

			onNativeContextMenu (e) {
				this.injectItem(e);
			}
			
			injectItem (e) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "search-google"});
				if (index > -1) {
					let text = document.getSelection().toString();
					let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
					let engineKeys = Object.keys(enginesWithoutAll);
					if (engineKeys.length == 1) {
						children.splice(index, 1, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_googlesearchreplace_text.replace("...", this.defaults.engines[engineKeys[0]].name),
							id: children[index].props.id,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(textUrlReplaceString, encodeURIComponent(text)), !settings.useChromium, event.shiftKey);
							}
						}));
					}
					else {
						let items = [];
						for (let key in enabledEngines) items.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.defaults.engines[key].name,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
							color: key == "_all" ? BDFDB.LibraryComponents.MenuItems.Colors.DANGER : BDFDB.LibraryComponents.MenuItems.Colors.DEFAULT,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								if (key == "_all") {
									for (let key2 in enginesWithoutAll) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(textUrlReplaceString, encodeURIComponent(text)), settings.useChromium, event.shiftKey);
								}
								else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(textUrlReplaceString, encodeURIComponent(text)), settings.useChromium, event.shiftKey);
							}
						}));
						if (!items.length) items.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.submenu_disabled_text,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "disabled"),
							disabled: true
						}));
						children.splice(index, 1, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_googlesearchreplace_text,
							id: children[index].props.id,
							children: items
						}));
					}
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							context_googlesearchreplace_text:	"Pretra??ujte s ...",
							submenu_disabled_text:				"Svi su onemogu??eni"
						};
					case "da":		//danish
						return {
							context_googlesearchreplace_text:	"S??g med ...",
							submenu_disabled_text:				"Alle deaktiveret"
						};
					case "de":		//german
						return {
							context_googlesearchreplace_text:	"Suche mit ...",
							submenu_disabled_text:				"Alle deaktiviert"
						};
					case "es":		//spanish
						return {
							context_googlesearchreplace_text:	"Buscar con ...",
							submenu_disabled_text:				"Todo desactivado"
						};
					case "fr":		//french
						return {
							context_googlesearchreplace_text:	"Rechercher avec ...",
							submenu_disabled_text:				"Tous d??sactiv??s"
						};
					case "it":		//italian
						return {
							context_googlesearchreplace_text:	"Cerca con ...",
							submenu_disabled_text:				"Tutto disattivato"
						};
					case "nl":		//dutch
						return {
							context_googlesearchreplace_text:	"Zoeken met ...",
							submenu_disabled_text:				"Alles gedeactiveerd"
						};
					case "no":		//norwegian
						return {
							context_googlesearchreplace_text:	"S??k med ...",
							submenu_disabled_text:				"Alle deaktivert"
						};
					case "pl":		//polish
						return {
							context_googlesearchreplace_text:	"Szukaj za pomoc?? ...",
							submenu_disabled_text:				"Wszystkie wy????czone"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							context_googlesearchreplace_text:	"Pesquisar com ...",
							submenu_disabled_text:				"Todos desativados"
						};
					case "fi":		//finnish
						return {
							context_googlesearchreplace_text:	"Etsi ...",
							submenu_disabled_text:				"Kaikki on poistettu k??yt??st??"
						};
					case "sv":		//swedish
						return {
							context_googlesearchreplace_text:	"S??k med ...",
							submenu_disabled_text:				"Alla avaktiverade"
						};
					case "tr":		//turkish
						return {
							context_googlesearchreplace_text:	"Ile ara ...",
							submenu_disabled_text:				"Hepsi deaktive"
						};
					case "cs":		//czech
						return {
							context_googlesearchreplace_text:	"Hledat s ...",
							submenu_disabled_text:				"V??echny deaktivovan??"
						};
					case "bg":		//bulgarian
						return {
							context_googlesearchreplace_text:	"?????????????? ?? ...",
							submenu_disabled_text:				"???????????? ???? ????????????????????????"
						};
					case "ru":		//russian
						return {
							context_googlesearchreplace_text:	"?????????? ?? ...",
							submenu_disabled_text:				"?????? ????????????????????????????????"
						};
					case "uk":		//ukrainian
						return {
							context_googlesearchreplace_text:	"?????????? ?? ...",
							submenu_disabled_text:				"?????? ????????????????"
						};
					case "ja":		//japanese
						return {
							context_googlesearchreplace_text:	"??????????????? ...",
							submenu_disabled_text:				"??????????????????????????????"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							context_googlesearchreplace_text:	"?????? ...",
							submenu_disabled_text:				"????????????"
						};
					case "ko":		//korean
						return {
							context_googlesearchreplace_text:	"???????????? ?????? ...",
							submenu_disabled_text:				"?????? ???????????? ???"
						};
					default:		//default: english
						return {
							context_googlesearchreplace_text:	"Search with ...",
							submenu_disabled_text:				"All disabled"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
