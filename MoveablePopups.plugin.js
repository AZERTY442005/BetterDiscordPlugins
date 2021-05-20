//META{"name":"MoveablePopups","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MoveablePopups","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/MoveablePopups/MoveablePopups.plugin.js"}*//

class MoveablePopups {
	getName () {return "MoveablePopups";}

	getVersion () {return "1.1.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds the feature to move all popups and modals around like on a normal desktop. Ctrl + drag with your left mousebutton to drag element.";}

	constructor () {
		this.changelog = {
			"fixed":[["Moved Modal Container","Fixed selector for new modal container"]]
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
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && BDFDB.containsClass(node, BDFDB.disCN.popout)) {
									this.makeMoveable(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"popoutObserver",instance:observer}, {childList: true});

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && BDFDB.containsClass(node, BDFDB.disCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.makeMoveable(node.querySelector(BDFDB.dotCN.modalinner));
								}
								else if (node.tagName && node.querySelector(BDFDB.dotCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.makeMoveable(node.querySelector(BDFDB.dotCN.modalinner));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:document.querySelector(BDFDB.dotCN.app), name:"Modals"})), {name:"modalObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	makeMoveable (div) {
		div.removeEventListener("click", div.clickMovablePopups);
		div.removeEventListener("mousedown", div.mousedownMovablePopups);
		div.clickMovablePopups = e => {if (this.dragging) BDFDB.stopEvent(e);};
		div.mousedownMovablePopups = e => {
			if (!e.ctrlKey) return;
			div.style.setProperty("position", "fixed", "important");
			this.dragging = true;
			var rects = BDFDB.getRects(div);
			var transform = getComputedStyle(div,null).getPropertyValue("transform").replace(/[^0-9,-]/g,"").split(",");
			var left = rects.left - (transform.length > 4 ? parseFloat(transform[4]) : 0);
			var top = rects.top - (transform.length > 4 ? parseFloat(transform[5]) : 0);
			var oldX = e.pageX;
			var oldY = e.pageY;
			var mouseup = e2 => {
				BDFDB.removeLocalStyle("disableTextSelection");
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
				setTimeout(() => {this.dragging = false},1);
			};
			var mousemove = e2 => {
				left = left - (oldX - e2.pageX);
				top = top - (oldY - e2.pageY);
				oldX = e2.pageX;
				oldY = e2.pageY;
				div.style.setProperty("left", left + "px", "important");
				div.style.setProperty("top", top + "px", "important");

			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		};
		div.addEventListener("click", div.clickMovablePopups);
		div.addEventListener("mousedown", div.mousedownMovablePopups);
	}
}