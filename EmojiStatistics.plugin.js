/**
 * @name EmojiStatistics
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EmojiStatistics
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EmojiStatistics/EmojiStatistics.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EmojiStatistics/EmojiStatistics.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EmojiStatistics",
			"author": "DevilBro",
			"version": "2.9.5",
			"description": "Add some helpful options to show you more information about emojis and emojiservers"
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
		var emojiReplicaList;
		
		return class EmojiStatistics extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						EmojiPicker: "type"
					}
				};
				
				this.css = `
					.${this.name}-table ${BDFDB.dotCN._emojistatisticsiconcell} {
						justify-content: center;
						width: 48px;
						padding: 0;
					}
					.${this.name}-table ${BDFDB.dotCN._emojistatisticsnamecell} {
						width: 300px;
					}
					.${this.name}-table ${BDFDB.dotCN._emojistatisticsamountcell} {
						width: 120px;
					}

					${BDFDB.dotCNS.emojipicker + BDFDB.dotCN.emojipickerheader} {
						grid-template-columns: auto 24px 24px;
					}
					${BDFDB.dotCNS.emojipicker + BDFDB.dotCN._emojistatisticsstatisticsbutton} {
						width: 24px;
						height: 24px;
						grid-column: 3/4;
					}
				`;
			}
			
			onStart() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processEmojiPicker (e) {
				this.loadEmojiList();
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name:"DiversitySelector"});
				if (index > -1) children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: "Emoji Statistics",
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN._emojistatisticsstatisticsbutton,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.emojipickerdiversityemojiitemimage,
							style: {
								backgroundImage: "url(/assets/0477c6a43026315dd623bc6367e18acb.svg)"
							}
						})
					}),
					onClick: _ => {
						this.showEmojiInformationModal();
						e.instance.props.closePopout();
					}
				}));
			}

			loadEmojiList () {
				emojiReplicaList = {};
				let guilds = BDFDB.LibraryModules.GuildStore.getGuilds();
				for (let id in guilds) for (let emoji of BDFDB.LibraryModules.GuildEmojiStore.getGuildEmoji(id)) {
					if (emoji.managed) emojiReplicaList[emoji.name] = emojiReplicaList[emoji.name] != undefined;
				}
			}
			
			showEmojiInformationModal () {
				BDFDB.ModalUtils.open(this, {
					size: "LARGE",
					header: this.labels.modal_header_text,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Table, {
						className: `${this.name}-table`,
						stickyHeader: true,
						sortData: false,
						columns: [{key:"icon", sortkey:"index", cell:"icon"}, {key:"name", cell:"name"}, {key:"total", cell:"amount", reverse:true}, {key:"global", cell:"amount", reverse:true}, {key:"local", cell:"amount", reverse:true}, {key:"copies", cell:"amount", reverse:true}].map(data => {return {
							key: data.sortkey || data.key,
							sort: true,
							reverse: data.reverse,
							cellClassName: BDFDB.disCN[`_emojistatistics${data.cell}cell`],
							renderHeader: _ => {
								return this.labels[`modal_titles${data.key}_text`]
							},
							render: guilddata => {
								if (data.key == "icon") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
									guild: guilddata[data.key],
									menu: false,
									tooltip: false
								});
								else if (data.key == "name") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: guilddata[data.key]
								});
								else return guilddata[data.key]
							}
						}}),
						data: BDFDB.GuildUtils.getAll().map((info, i) => {
							let data = {
								index: i,
								icon: info,
								name: info.name,
								global: 0,
								local: 0,
								copies: 0
							}
							for (let emoji of BDFDB.LibraryModules.GuildEmojiStore.getGuildEmoji(info.id)) {
								if (emoji.managed) {
									data.global++;
									if (emojiReplicaList[emoji.name]) data.copies++;
								}
								else data.local++;
							}
							data.total = data.global + data.local;
							return data;
						})
					})
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							modal_header_text:						"Statistike o emojima",
							modal_titlesicon_text:					"Ikona",
							modal_titlesname_text:					"Naziv poslu??itelja",
							modal_titlestotal_text:					"Cjelokupni",
							modal_titlesglobal_text:				"Globalno",
							modal_titleslocal_text:					"Kokalne",
							modal_titlescopies_text:				"Kopije"
						};
					case "da":		//danish
						return {
							modal_header_text:						"Statistikker af emojis",
							modal_titlesicon_text:					"Icon",
							modal_titlesname_text:					"Servernavn",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Lokal",
							modal_titlescopies_text:				"Copies"
						};
					case "de":		//german
						return {
							modal_header_text:						"Statistiken ??ber Emojis",
							modal_titlesicon_text:					"Icon",
							modal_titlesname_text:					"Servername",
							modal_titlestotal_text:					"Gesamt",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Lokal",
							modal_titlescopies_text:				"Kopien"
						};
					case "es":		//spanish
						return {
							modal_header_text:						"Estad??sticas de emojis",
							modal_titlesicon_text:					"Icono",
							modal_titlesname_text:					"Nombre del servidor",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Local",
							modal_titlescopies_text:				"Copias"
						};
					case "fr":		//french
						return {
							modal_header_text:						"Statistiques des emojis",
							modal_titlesicon_text:					"Ic??ne",
							modal_titlesname_text:					"Nom du serveur",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Local",
							modal_titlescopies_text:				"Copies"
						};
					case "it":		//italian
						return {
							modal_header_text:						"Statistiche di emojis",
							modal_titlesicon_text:					"Icona",
							modal_titlesname_text:					"Nome del server",
							modal_titlestotal_text:					"Totale",
							modal_titlesglobal_text:				"Globale",
							modal_titleslocal_text:					"Locale",
							modal_titlescopies_text:				"Copie"
						};
					case "nl":		//dutch
						return {
							modal_header_text:						"Statistieken van emojis",
							modal_titlesicon_text:					"Icoon",
							modal_titlesname_text:					"Servernaam",
							modal_titlestotal_text:					"Totaal",
							modal_titlesglobal_text:				"Globaal",
							modal_titleslocal_text:					"Lokaal",
							modal_titlescopies_text:				"Kopie??n"
						};
					case "no":		//norwegian
						return {
							modal_header_text:						"Statistikk av emojis",
							modal_titlesicon_text:					"Ikon",
							modal_titlesname_text:					"Servernavn",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Lokal",
							modal_titlescopies_text:				"Kopier"
						};
					case "pl":		//polish
						return {
							modal_header_text:						"Statystyki emoji",
							modal_titlesicon_text:					"Ikona",
							modal_titlesname_text:					"Nazwa",
							modal_titlestotal_text:					"Ca??kowity",
							modal_titlesglobal_text:				"??wiatowy",
							modal_titleslocal_text:					"Lokalny",
							modal_titlescopies_text:				"Kopie"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							modal_header_text:						"Estat??sticas de emojis",
							modal_titlesicon_text:					"??cone",
							modal_titlesname_text:					"Nome do servidor",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Local",
							modal_titlescopies_text:				"C??pias"
						};
					case "fi":		//finnish
						return {
							modal_header_text:						"Tilastot emojista",
							modal_titlesicon_text:					"Ikoni",
							modal_titlesname_text:					"Palvelimen nimi",
							modal_titlestotal_text:					"Koko",
							modal_titlesglobal_text:				"Globaali",
							modal_titleslocal_text:					"Paikallinen",
							modal_titlescopies_text:				"Kopiot"
						};
					case "sv":		//swedish
						return {
							modal_header_text:						"Statistik f??r emojis",
							modal_titlesicon_text:					"Ikon",
							modal_titlesname_text:					"Servernamn",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Lokal",
							modal_titlescopies_text:				"Kopior"
						};
					case "tr":		//turkish
						return {
							modal_header_text:						"Emojis istatistikleri",
							modal_titlesicon_text:					"Icon",
							modal_titlesname_text:					"Sunucuad??",
							modal_titlestotal_text:					"Toplam",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Yerel",
							modal_titlescopies_text:				"Kopya"
						};
					case "cs":		//czech
						return {
							modal_header_text:						"Statistiky emojis",
							modal_titlesicon_text:					"Ikona",
							modal_titlesname_text:					"N??zev serveru",
							modal_titlestotal_text:					"Celkov??",
							modal_titlesglobal_text:				"Glob??ln??",
							modal_titleslocal_text:					"M??stn??",
							modal_titlescopies_text:				"Kopie"
						};
					case "bg":		//bulgarian
						return {
							modal_header_text:						"???????????????????? ???? ????????????",
							modal_titlesicon_text:					"??????????",
							modal_titlesname_text:					"?????? ???? ??????????????",
							modal_titlestotal_text:					"O??????",
							modal_titlesglobal_text:				"C??????????????",
							modal_titleslocal_text:					"M??????????",
							modal_titlescopies_text:				"??????????"
						};
					case "ru":		//russian
						return {
							modal_header_text:						"???????????????????? emojis",
							modal_titlesicon_text:					"????????????",
							modal_titlesname_text:					"?????? ??????????????",
							modal_titlestotal_text:					"??????????",
							modal_titlesglobal_text:				"M????????????",
							modal_titleslocal_text:					"??????????????",
							modal_titlescopies_text:				"??????????"
						};
					case "uk":		//ukrainian
						return {
							modal_header_text:						"???????????????????? ????????????",
							modal_titlesicon_text:					"??????????",
							modal_titlesname_text:					"????'?? ??????????????",
							modal_titlestotal_text:					"????????????",
							modal_titlesglobal_text:				"C??????????????",
							modal_titleslocal_text:					"????????????????",
							modal_titlescopies_text:				"??????????"
						};
					case "ja":		//japanese
						return {
							modal_header_text:						"?????????????????????",
							modal_titlesicon_text:					"????????????",
							modal_titlesname_text:					"?????????????????????",
							modal_titlestotal_text:					"??????",
							modal_titlesglobal_text:				"???????????????",
							modal_titleslocal_text:					"??????",
							modal_titlescopies_text:				"?????????"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							modal_header_text:						"????????????",
							modal_titlesicon_text:					"??????",
							modal_titlesname_text:					"???????????????",
							modal_titlestotal_text:					"???",
							modal_titlesglobal_text:				"??????",
							modal_titleslocal_text:					"??????",
							modal_titlescopies_text:				"??????"
						};
					case "ko":		//korean
						return {
							modal_header_text:						"?????? ??????????????? ??????",
							modal_titlesicon_text:					"???",
							modal_titlesname_text:					"?????? ??????",
							modal_titlestotal_text:					"??????",
							modal_titlesglobal_text:				"?????????",
							modal_titleslocal_text:					"?????????",
							modal_titlescopies_text:				"??????"
						};
					default:		//default: english
						return {
							modal_header_text:						"Statistics of emojis",
							modal_titlesicon_text:					"Icon",
							modal_titlesname_text:					"Servername",
							modal_titlestotal_text:					"Total",
							modal_titlesglobal_text:				"Global",
							modal_titleslocal_text:					"Local",
							modal_titlescopies_text:				"Copies"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();