﻿//META{"name":"ImageZoom","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageZoom","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageZoom/ImageZoom.plugin.js"}*//

class ImageZoom {
	getName () {return "ImageZoom";}

	getVersion () {return "1.0.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to zoom in opened Images by holding left clicking on them in the Image Modal.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"ImageModal":["componentDidMount","componentWillUnmount"],
			"Icon":["componentDidMount","componentWillUnmount"],
		};
	}

	initConstructor () {
		this.css = `
			.imagezoom-lense {
				border: 2px solid rgb(114, 137, 218);
			}
			.imagezoom-backdrop {
				position: absolute !important;
				top: 0 !important;
				right: 0 !important;
				bottom: 0 !important;
				left: 0 !important;
				z-index: 8000 !important;
			}`;

		this.defaults = {
			settings: {
				zoomlevel:		{value:2,	digits:1,	min:1,	max:10,		unit:"x",	name:"Zoom Level"},
				lensesize:		{value:200,	digits:0,	min:50,	max:1000,	unit:"px",	name:"Lense Size"}
			}
		};
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			for (let img of document.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (img.ImageZoomMouseDownListener) {
				img.removeEventListener("mousedown", img.ImageZoomMouseDownListener);
				delete img.ImageZoomMouseDownListener;
				img.removeAttribute("draggable");
			}

			BDFDB.removeEles(".imagezoom-contextmenu", ".imagezoom-separator", ".imagezoom-settings", ".imagezoom-lense", ".imagezoom-backdrop");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processImageModal (instance, wrapper, returnvalue, methodnames) {
		if (methodnames.includes("componentDidMount")) {
			let modal = BDFDB.getParentEle(BDFDB.dotCN.modal, wrapper);
			if (!modal) return;
			let inner = modal.querySelector(BDFDB.dotCN.modalinner);
			if (!inner) return;
			let start = performance.now();
			let waitForImg = setInterval(() => {
				let img = modal.querySelector(BDFDB.dotCNS.imagewrapper + "img," + BDFDB.dotCNS.imagewrapper + "video");
				if (img && img.src && !BDFDB.containsClass(img, BDFDB.disCN.imageplaceholder)) {
					clearInterval(waitForImg);
					img.setAttribute("draggable", "false");
					inner.firstElementChild.appendChild(BDFDB.htmlToElement(`<span class="${BDFDB.disCN.downloadlink} imagezoom-separator" style="margin: 0px 5px;"> | </div>`));
					let settingslink = BDFDB.htmlToElement(`<span class="${BDFDB.disCN.downloadlink} imagezoom-settings">Zoom ${BDFDB.LanguageStrings.SETTINGS}</div>`);
					inner.firstElementChild.appendChild(settingslink);
					let openContext = e => {
						let settings = BDFDB.getAllData(this, "settings");
						let items = [];
						for (let type in settings) items.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSliderItem, {
							label: this.defaults.settings[type].name + ": " + settings[type] + this.defaults.settings[type].unit,
							className: `BDFDB-contextMenuSliderItem ${this.name}-contextMenuSliderItem ${this.name}-${type}-contextMenuSliderItem`,
							type,
							defaultValue: BDFDB.mapRange([this.defaults.settings[type].min, this.defaults.settings[type].max], [0, 100], settings[type]),
							onValueChange: value => {
								BDFDB.saveData(type, Math.round(BDFDB.mapRange([0, 100], [this.defaults.settings[type].min, this.defaults.settings[type].max], value)), this, "settings");
							},
							onValueRender: value => {
								setImmediate(() => {for (let slider of document.querySelectorAll(BDFDB.dotCN.contextmenuitemslider)) if (BDFDB.getReactValue(slider, "return.memoizedProps.type") == type) {
									value = Math.round(BDFDB.mapRange([0, 100], [this.defaults.settings[type].min, this.defaults.settings[type].max], value));
									let label = slider.querySelector(BDFDB.dotCN.contextmenulabel);
									if (label) label.innerText = this.defaults.settings[type].name + ": " + value + this.defaults.settings[type].unit;
									let bubble = slider.querySelector(BDFDB.dotCN.sliderbubble);
									if (bubble) bubble.innerText = value + this.defaults.settings[type].unit;
									break;
								}});
							}
						}));
						const itemGroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
							children: items
						});
						BDFDB.openContextMenu(this, e, itemGroup);
					};
					settingslink.addEventListener("click", openContext);
					settingslink.addEventListener("contextmenu", openContext);
					img.ImageZoomMouseDownListener = e => {
						BDFDB.stopEvent(e);
						BDFDB.appendLocalStyle("ImageZoomCrossHair", "* {cursor: crosshair !important;}");

						let imgrects = BDFDB.getRects(img);
						let settings = BDFDB.getAllData(this, "settings");

						let lense = BDFDB.htmlToElement(`<div class="imagezoom-lense" style="clip-path: circle(${(settings.lensesize/2) + 2}px at center) !important; border-radius: 50% !important; pointer-events: none !important; z-index: 10000 !important; width: ${settings.lensesize}px !important; height: ${settings.lensesize}px !important; position: fixed !important;"><div class="imagezoom-lense-inner" style="position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; clip-path: circle(${settings.lensesize/2}px at center) !important;"><${img.tagName} class="imagezoom-pane" src="${img.src}" style="width: ${imgrects.width * settings.zoomlevel}px; height: ${imgrects.height * settings.zoomlevel}px; position: fixed !important;"${img.tagName == "VIDEO" ? " loop autoplay" : ""}></${img.tagName}></div></div>`);
						let pane = lense.querySelector(".imagezoom-pane");
						let backdrop = BDFDB.htmlToElement(`<div class="imagezoom-backdrop" style="background: rgba(0,0,0,0.2) !important;"></div>`);
						document.querySelector(BDFDB.dotCN.appmount).appendChild(lense);
						document.querySelector(BDFDB.dotCN.appmount).appendChild(backdrop);

						let lenserects = BDFDB.getRects(lense), panerects = BDFDB.getRects(pane);
						let halfW = lenserects.width / 2, halfH = lenserects.height / 2;
						let minX = imgrects.left, maxX = minX + imgrects.width;
						let minY = imgrects.top, maxY = minY + imgrects.height;
						lense.style.setProperty("left", e.clientX - halfW + "px", "important");
						lense.style.setProperty("top", e.clientY - halfH + "px", "important");
						pane.style.setProperty("left", imgrects.left + ((settings.zoomlevel - 1) * (imgrects.left - e.clientX)) + "px", "important");
						pane.style.setProperty("top", imgrects.top + ((settings.zoomlevel - 1) * (imgrects.top - e.clientY)) + "px", "important");

						let dragging = e2 => {
							let x = e2.clientX > maxX ? maxX - halfW : e2.clientX < minX ? minX - halfW : e2.clientX - halfW;
							let y = e2.clientY > maxY ? maxY - halfH : e2.clientY < minY ? minY - halfH : e2.clientY - halfH;
							lense.style.setProperty("left", x + "px", "important");
							lense.style.setProperty("top", y + "px", "important");
							pane.style.setProperty("left", imgrects.left + ((settings.zoomlevel - 1) * (imgrects.left - x - halfW)) + "px", "important");
							pane.style.setProperty("top", imgrects.top + ((settings.zoomlevel - 1) * (imgrects.top - y - halfH)) + "px", "important");
						};
						let releasing = e2 => {
							BDFDB.removeLocalStyle('ImageZoomCrossHair');
							document.removeEventListener("mousemove", dragging);
							document.removeEventListener("mouseup", releasing);
							BDFDB.removeEles(lense, backdrop);
						};
						document.addEventListener("mousemove", dragging);
						document.addEventListener("mouseup", releasing);
					};
					img.addEventListener("mousedown", img.ImageZoomMouseDownListener);
				}
				else if (performance.now() - start > 10000) {
					clearInterval(waitForImg);
				}
			}, 100);
		}
		else if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(".imagezoom-contextmenu", ".imagezoom-separator", ".imagezoom-settings", ".imagezoom-lense", ".imagezoom-backdrop");
		}
	}
}
