/**
 * @name EditUsers
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditUsers",
			"author": "DevilBro",
			"version": "4.0.2",
			"description": "Allow you to change the icon, name, tag and color of users"
		},
		"changeLog": {
			"fixed": {
				"Direct Message Icons": "Gets changed again"
			}
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
		var changedUsers = {}, settings = {};
	
		return class EditUsers extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						changeInContextMenu:	{value:true, 	inner:true,		description:"User ContextMenu"},
						changeInChatTextarea:	{value:true, 	inner:true,		description:"Chat Textarea"},
						changeInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
						changeInReactions:		{value:true, 	inner:true,		description:"Reactions"},
						changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
						changeInVoiceChat:		{value:true, 	inner:true,		description:"Voice Channels"},
						changeInMemberList:		{value:true, 	inner:true,		description:"Member List"},
						changeInRecentDms:		{value:true, 	inner:true,		description:"Direct Message Notifications"},
						changeInDmsList:		{value:true, 	inner:true,		description:"Direct Message List"},
						changeInDmHeader:		{value:true, 	inner:true,		description:"Direct Message Header"},
						changeInDmCalls:		{value:true, 	inner:true,		description:"Calls/ScreenShares"},
						changeInTyping:			{value:true, 	inner:true,		description:"Typing List"},
						changeInFriendList:		{value:true, 	inner:true,		description:"Friend List"},
						changeInInviteList:		{value:true, 	inner:true,		description:"Invite List"},
						changeInActivity:		{value:true, 	inner:true,		description:"Activity Page"},
						changeInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
						changeInUserProfile:	{value:true, 	inner:true,		description:"User Profile Modal"},
						changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"},
						changeInAuditLog:		{value:true, 	inner:true,		description:"Audit Log"},
						changeInEmojiLog:		{value:true, 	inner:true,		description:"Emoji Upload Log"},
						changeInMemberLog:		{value:true, 	inner:true,		description:"Member Log"},
						changeInQuickSwitcher:	{value:true, 	inner:true,		description:"Quick Switcher"},
						changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"},
						changeInUserAccount:	{value:true, 	inner:true,		description:"Your Account Information"},
						changeInAppTitle:		{value:true, 	inner:true,		description:"Discord App Title (DMs)"}
					}
				};
			
				this.patchedModules = {
					before: {
						HeaderBarContainer: "render",
						ChannelEditorContainer: "render",
						ChannelAutoComplete: "render",
						AutocompleteUserResult: "render",
						UserPopout: "render",
						UserProfile: "render",
						UserInfo: "default",
						NowPlayingHeader: "Header",
						VoiceUser: "render",
						Account: "render",
						Message: "default",
						MessageContent: "type",
						ReactorsComponent: "render",
						ChannelReply: "default",
						MemberListItem: "render",
						AuditLog: "render",
						GuildSettingsEmoji: "render",
						MemberCard: "render",
						SettingsInvites: "render",
						GuildSettingsBans: "render",
						InvitationCard: "render",
						PrivateChannel: "render",
						PrivateChannelRecipientsInvitePopout: "render",
						QuickSwitchUserResult: "render",
						SearchPopoutComponent: "render",
						PrivateChannelCallParticipants: "render",
						ChannelCall: "render",
						PictureInPictureVideo: "default",
						UserSummaryItem: "render"
					},
					after: {
						ChannelCallHeader: "default",
						AutocompleteUserResult: "render",
						DiscordTag: "default",
						NameTag: "default",
						UserPopout: "render",
						NowPlayingHeader: "Header",
						VoiceUser: "render",
						Account: "render",
						PrivateChannelEmptyMessage: "default",
						MessageHeader: "default",
						MessageUsername: "default",
						MessageContent: "type",
						Reaction: "render",
						Mention: "default",
						ChannelReply: "default",
						MemberListItem: "render",
						UserHook: "render",
						InvitationCard: "render",
						InviteModalUserRow: "default",
						TypingUsers: "render",
						DirectMessage: "render",
						RTCConnection: "render",
						PrivateChannel: "render",
						QuickSwitchUserResult: "render",
						IncomingCallModal: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCNS.chat + BDFDB.dotCN.messageusername}:hover > span[style*="color"],
					${BDFDB.dotCN.voicedetailschannel}:hover > span[style*="color"] {
						text-decoration: underline;
					}
					${BDFDB.dotCNS.userpopoutheadernamewrapper + BDFDB.dotCN.bottag} {
						position: relative;
						bottom: 1px;
					}
					${BDFDB.dotCNS.dmchannel + BDFDB.dotCN.bottag} {
						margin-left: 4px;
					}
					${BDFDB.dotCNS.userinfo + BDFDB.dotCN.userinfodiscriminator} {
						display: none;
					}
					${BDFDB.dotCNS.userinfohovered + BDFDB.dotCN.userinfodiscriminator} {
						display: block;
					}
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] code.inline,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] blockquote,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] ${BDFDB.dotCN.spoilertext} {
						color: var(--text-normal);
					}
				`;
			}
			
			onStart() {
				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name:"appTitleObserver", instance:observer}, {childList:true});
				
				let searchGroupData = BDFDB.ObjectUtils.get(BDFDB.ModuleUtils.findByName("SearchPopoutComponent", false), "exports.GroupData");
				if (BDFDB.ObjectUtils.is(searchGroupData)) {
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_FROM, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							}
						}
					}});
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_MENTIONS, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							}
						}
					}});
				}
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.MENTIONS, "queryResults", {after: e => {
					let userArray = [];
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						if (user && (e.methodArguments[0].recipients.includes(id) || (e.methodArguments[0].guild_id && BDFDB.LibraryModules.MemberStore.getMember(e.methodArguments[0].guild_id, id)))) userArray.push(Object.assign({
							lowerCaseName: changedUsers[id].name.toLowerCase(),
							user
						}, changedUsers[id]));
					}
					userArray = BDFDB.ArrayUtils.keySort(userArray.filter(n => e.returnValue.users.every(comp => comp.user.id != n.user.id) && n.lowerCaseName.indexOf(e.methodArguments[1]) != -1), "lowerCaseName");
					e.returnValue.users = [].concat(e.returnValue.users, userArray.map(n => {return {user: n.user};})).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
				}});
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) if (!this.defaults.settings[key].inner) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
					title: "Change Users in:",
					first: settingsItems.length == 0,
					children: Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					}))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Reset all Users",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all users?", _ => {
							BDFDB.DataUtils.remove(this, "users");
							this.forceUpdateAll();
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.RESET
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
				changedUsers = BDFDB.DataUtils.load(this, "users");
				settings = BDFDB.DataUtils.get(this, "settings");
					
				this.changeAppTitle();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
		
			onUserContextMenu (e) {
				if (e.instance.props.user) {
					let userName = this.getUserData(e.instance.props.user.id).username;
					if (userName != e.instance.props.user.username && settings.changeInContextMenu) {
						let [kickChilden, kickIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "kick"});
						if (kickIndex > -1) kickChilden[kickIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("KICK_USER", userName);
						let [banChilden, banIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "ban"});
						if (banIndex > -1) banChilden[banIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("BAN_USER", userName);
						let [muteChilden, muteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mute-channel"});
						if (muteIndex > -1) muteChilden[muteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("MUTE_CHANNEL", `@${userName}`);
						let [unmuteChilden, unmuteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "unmute-channel"});
						if (unmuteIndex > -1) unmuteChilden[unmuteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("UNMUTE_CHANNEL", `@${userName}`);
					}
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: [
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.context_localusersettings_text,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
								children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
									children: [
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.submenu_usersettings_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
											action: _ => {
												this.openUserSettingsModal(e.instance.props.user);
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.submenu_resetsettings_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
											disabled: !changedUsers[e.instance.props.user.id],
											action: _ => {
												BDFDB.DataUtils.remove(this, "users", e.instance.props.user.id);
												this.forceUpdateAll();
											}
										})
									]
								})
							})
						]
					}));
				}
			}
			
			processChannelEditorContainer (e) {
				if (!e.instance.props.disabled && e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && settings.changeInChatTextarea) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channel.recipients[0]);
					if (user) e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `@${changedUsers[user.id] && changedUsers[user.id].name || user.username}`);
				}
			}

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && settings.changeInAutoComplete) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) e.instance.props.nick = data.name;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.marginleft8]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id);
					}
				}
			}

			processHeaderBarContainer (e) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
				if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInDmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.instance, {name: "Title"});
					if (userName) {
						let recipientId = channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}

			processChannelCallHeader (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInDmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Title"});
					if (userName) {
						let recipientId = e.instance.props.channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processDiscordTag (e) {
				this.processNameTag(e);
			}
			
			processNameTag (e) {
				if (e.instance.props.user && (e.instance.props.className || e.instance.props.usernameClass)) {
					let change = false, guildId = null;
					let changeBackground = false;
					let tagClass = "";
					switch (e.instance.props.className) {
						case BDFDB.disCN.userpopoutheadertagnonickname:
							change = settings.changeInUserPopout;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.userprofilenametag:
							change = settings.changeInUserProfile;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.guildsettingsinviteusername:
							change = settings.changeInMemberLog;
							break;
						case BDFDB.disCN.userinfodiscordtag:
							change = settings.changeInFriendList;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
					}
					switch (e.instance.props.usernameClass) {
						case BDFDB.disCN.messagereactionsmodalusername:
							change = settings.changeInReactions && !BDFDB.LibraryModules.MemberStore.getNick(BDFDB.LibraryModules.LastGuildStore.getGuildId(), e.instance.props.user.id);
							break;
					}
					if (change) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.username]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {
							changeBackground: changeBackground
						});
						if (tagClass) this.injectBadge(e.returnvalue.props.children, e.instance.props.user.id, guildId, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}

			processUserPopout (e) {
				if (e.instance.props.user && settings.changeInUserPopout) {
					let data = changedUsers[e.instance.props.user.id];
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id, true, true);
						if (data) {
							if (data.name) {
								e.instance.props.nickname = data.name;
								if (e.instance.props.guildMember) e.instance.props.guildMember = Object.assign({}, e.instance.props.guildMember, {nick: data.name});
							}
							if (data.removeStatus || data.status || data.statusEmoji) e.instance.props.customStatusActivity = this.createCustomStatus(data);
						}
					}
					else {
						if (data && (data.color1 || data.color2 || data.tag)) {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
							if (index > -1) {
								this.changeUserColor(children[index], e.instance.props.user.id, {changeBackground:true});
								this.injectBadge(children, e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
									tagClass: BDFDB.disCN.bottagnametag,
									inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
								});
							}
						}
					}
				}
			}

			processUserProfile (e) {
				if (e.instance.props.user && settings.changeInUserProfile) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = changedUsers[e.instance.props.user.id];
					if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
				}
			}

			processUserInfo (e) {
				if (e.instance.props.user && settings.changeInFriendList) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					if (BDFDB.ReactUtils.isValidElement(e.instance.props.subText)) {
						let data = changedUsers[e.instance.props.user.id];
						if (data && (data.removeStatus || data.status || data.statusEmoji)) {
							e.instance.props.subText.props.activities = [].concat(e.instance.props.subText.props.activities).filter(n => n && n.type != 4);
							let activity = this.createCustomStatus(data);
							if (activity) e.instance.props.subText.props.activities.unshift(activity);
						}
					}
				}
			}

			processNowPlayingHeader (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.priorityUser) && e.instance.props.priorityUser.user && settings.changeInFriendList) {
					if (!e.returnvalue) {
						let titleIsName = e.instance.props.priorityUser.user.username == e.instance.props.title;
						e.instance.props.priorityUser.user = this.getUserData(e.instance.props.priorityUser.user.id);
						if (titleIsName) e.instance.props.title = e.instance.props.priorityUser.user.username;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Header"});
						if (userName) this.changeUserColor(userName, e.instance.props.priorityUser.user.id);
					}
				}
			}

			processVoiceUser (e) {
				if (e.instance.props.user && settings.changeInVoiceChat) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) e.instance.props.nick = data.name;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.voicename]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {modify: e.instance.props});
					}
				}
			}

			processAccount (e) {
				if (e.instance.props.currentUser && settings.changeInUserAccount) {
					let data = changedUsers[e.instance.props.currentUser.id];
					if (!e.returnvalue) {
						e.instance.props.currentUser = this.getUserData(e.instance.props.currentUser.id);
						if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
					}
					else {
						if (data && (data.color1 || data.color2)) {
							let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Tooltip"});
							if (tooltip && typeof tooltip.props.children == "function") {
								let renderChildren = tooltip.props.children;
								tooltip.props.children = (...args) => {
									let renderedChildren = renderChildren(...args);
									let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelTitle"});
									if (userName) this.changeUserColor(userName, e.instance.props.currentUser.id);
									return renderedChildren;
								}
							}
						}
					}
				}
			}

			processPrivateChannelEmptyMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInChatWindow) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let name = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {props: "src"});
					if (avatar) avatar.props.src = this.getUserAvatar(recipientId);
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "h1"});
					if (userName) {
						userName.props.children = BDFDB.ReactUtils.createElement("span", {children: name});
						this.changeUserColor(userName.props.children, recipientId);
					}
					userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "strong"});
					if (userName) {
						userName.props.children = "@" + name;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processMessage (e) {
				if (settings.changeInChatWindow) {
					let header = e.instance.props.childrenHeader;
					if (header && header.props && header.props.message) {
						let data = changedUsers[header.props.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(header.props.message.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {author: this.getUserData(header.props.message.author.id)}));
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							header.props.message = message;
						}
					}
					let content = e.instance.props.childrenMessageContent;
					if (content && content.type && content.type.type) {
						let data = changedUsers[content.props.message.author.id];
						if (data) {
							let messageColor = data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(content.props.message.channel_id) || {}).guild_id, content.props.message.author.id) || {}).colorString || data.color1));
							if (messageColor) {
								let message = new BDFDB.DiscordObjects.Message(Object.assign({}, content.props.message, {author: this.getUserData(content.props.message.author.id)}));
								if (data.name) message.nick = data.name;
								message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(messageColor) ? messageColor[0] : messageColor, "HEX");
								content.props.message = message;
							}
						}
					}
					let repliedMessage = e.instance.props.childrenRepliedMessage;
					if (repliedMessage && repliedMessage.props && repliedMessage.props.children && repliedMessage.props.children.props && repliedMessage.props.children.props.referencedMessage && repliedMessage.props.children.props.referencedMessage.message) {
						let referenceMessage = repliedMessage.props.children.props.referencedMessage.message;
						let data = changedUsers[referenceMessage.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(referenceMessage.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, referenceMessage, {author: this.getUserData(referenceMessage.author.id)}));
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							repliedMessage.props.children.props.referencedMessage = Object.assign({}, repliedMessage.props.children.props.referencedMessage, {message: message});
						}
					}
				}
			}
			
			processMessageUsername (e) {
				if (e.instance.props.message && settings.changeInChatWindow && e.returnvalue.props.children) {
					let messageUsername = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
					if (messageUsername) {
						let data = changedUsers[e.instance.props.message.author.id];
						if (data && (data.color1 || data.color2)) {
							if (messageUsername.props && typeof messageUsername.props.children == "function") {
								let renderChildren = messageUsername.props.children;
								messageUsername.props.children = (...args) => {
									let renderedChildren = renderChildren(...args);
									this.changeUserColor(renderedChildren, e.instance.props.message.author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
									return renderedChildren;
								}
							}
							else this.changeUserColor(messageUsername, e.instance.props.message.author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
						}
					}
					this.injectBadge(e.returnvalue.props.children, e.instance.props.message.author.id, (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, 2, {
						tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
						useRem: true
					});
				}
			}
			
			processMessageContent (e) {
				if (e.instance.props.message && settings.changeInChatWindow) {
					if (!e.returnvalue) {
						if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT) {
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id)}));
							let data = changedUsers[e.instance.props.message.author.id];
							if (data) {
								let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1;
								if (data.name) message.nick = data.name;
								if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							}
							e.instance.props.message = message;
							if (e.instance.props.children) e.instance.props.children.props.message = e.instance.props.message;
						}
					}
					else {
						let data = changedUsers[e.instance.props.message.author.id];
						let messageColor = data && (data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1)));
						if (messageColor) {
							if (BDFDB.ObjectUtils.is(messageColor)) e.returnvalue.props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(messageColor),
								children: e.returnvalue.props.children
							});
							else e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {color: BDFDB.ColorUtils.convert(messageColor, "RGBA")});
						}
					}
				}
			}
			
			processReaction (e) {
				if (e.instance.props.reactions) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id);
					let guildId = null == channel || channel.isPrivate() ? null : channel.getGuildId();
					let users = e.instance.props.reactions.filter(user => !BDFDB.LibraryModules.FriendUtils.isBlocked(user.id)).slice(0, 3).map(user => changedUsers[user.id] && changedUsers[user.id].name || guildId && BDFDB.LibraryModules.MemberStore.getNick(guildId, user.id) || user.username).filter(user => user);
					if (users.length) {
						let reaction = e.instance.props.message.getReaction(e.instance.props.emoji);
						let others = Math.max(0, (reaction && reaction.count || 0) - users.length);
						let emojiName = BDFDB.LibraryModules.ReactionEmojiUtils.getReactionEmojiName(e.instance.props.emoji);
						e.returnvalue.props.text = 
							users.length == 1 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1_N", users[0], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1", users[0], emojiName) :
							users.length == 2 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2_N", users[0], users[1], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2", users[0], users[1], emojiName) :
							users.length == 3 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3_N", users[0], users[1], users[2], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3", users[0], users[1], users[2], emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_N", others, emojiName);
					}
				}
				else BDFDB.LibraryModules.ReactionUtils.getReactions(e.instance.props.message.channel_id, e.instance.props.message.id, e.instance.props.emoji).then(reactions => {
					e.instance.props.reactions = reactions;
					BDFDB.ReactUtils.forceUpdate(e.instance);
				});
			}
			
			processReactorsComponent (e) {
				if (settings.changeInReactions && BDFDB.ArrayUtils.is(e.instance.props.reactors)) {
					for (let i in e.instance.props.reactors) e.instance.props.reactors[i] = this.getUserData(e.instance.props.reactors[i].id, true, false, e.instance.props.reactors[i]);
				}
			}
			
			processMention (e) {
				if (e.instance.props.userId && settings.changeInMentions) {
					let data = changedUsers[e.instance.props.userId];
					if (data) {
						if (data.name) e.returnvalue.props.children[0] = "@" + data.name;
						if (data.color1) {
							let color1_0 = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "RGBA");
							let color0_1 = e.instance.props.mentioned ? "transparent" : BDFDB.ColorUtils.setAlpha(color1_0, 0.1, "RGBA");
							let color0_7 = e.instance.props.mentioned ? "transparent" : BDFDB.ColorUtils.setAlpha(color1_0, 0.7, "RGBA");
							let white = e.instance.props.mentioned ? color1_0 : "#FFFFFF";
							e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {
								background: color0_1,
								color: color1_0
							});
							let onMouseEnter = e.returnvalue.props.onMouseEnter || ( _ => {});
							e.returnvalue.props.onMouseEnter = event => {
								onMouseEnter(event);
								event.target.style.setProperty("background", color0_7, "important");
								event.target.style.setProperty("color", white, "important");
							};
							let onMouseLeave = e.returnvalue.props.onMouseLeave || ( _ => {});
							e.returnvalue.props.onMouseLeave = event => {
								onMouseLeave(event);
								event.target.style.setProperty("background", color0_1, "important");
								event.target.style.setProperty("color", color1_0, "important");
							};
						}
					}
				}
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && settings.changeInChatWindow) {
					if (!e.returnvalue) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {author: this.getUserData(e.instance.props.reply.message.author.id)}));
						let data = changedUsers[e.instance.props.reply.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.reply.message.channel_id) || {}).guild_id, e.instance.props.reply.message.author.id) || {}).colorString || data.color1;
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
						e.instance.props.reply = Object.assign({}, e.instance.props.reply, {message: message});
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.messagereplyname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.reply.message.author.id);
					}
				}
			}
			
			processMemberListItem (e) {
				if (e.instance.props.user && settings.changeInMemberList) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data) {
							if (data.name) e.instance.props.nick = data.name;
							if (data.removeStatus || data.status || data.statusEmoji) {
								e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != 4);
								let activity = this.createCustomStatus(data);
								if (activity) e.instance.props.activities.unshift(activity);
							}
						}
					}
					else {
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true, guildId:e.instance.props.channel.guild_id});
						this.injectBadge(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
							tagClass: BDFDB.disCN.bottagmember
						});
					}
				}
			}

			processAuditLog (e) {
				if (e.instance.props.log && settings.changeInAuditLog) {
					if (e.instance.props.log.user) e.instance.props.log.user = this.getUserData(e.instance.props.log.user.id);
					if (e.instance.props.log.target && e.instance.props.log.targetType == "USER") e.instance.props.log.target = this.getUserData(e.instance.props.log.target.id);
				}
			}

			processUserHook (e) {
				if (e.instance.props.user && settings.changeInAuditLog) {
					this.changeUserColor(e.returnvalue.props.children[0], e.instance.props.user.id);
				}
			}

			processGuildSettingsEmoji (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.emojis) && settings.changeInEmojiLog) {
					e.instance.props.emojis = [].concat(e.instance.props.emojis);
					for (let i in e.instance.props.emojis) e.instance.props.emojis[i] = Object.assign({}, e.instance.props.emojis[i], {user: this.getUserData(e.instance.props.emojis[i].user.id)});
				}
			}

			processMemberCard (e) {
				if (e.instance.props.user && settings.changeInMemberLog) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processSettingsInvites (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.invites) && settings.changeInMemberLog) {
					e.instance.props.invites = Object.assign({}, e.instance.props.invites);
					for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {inviter: this.getUserData(e.instance.props.invites[id].inviter.id)}));
				}
			}

			processGuildSettingsBans (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.bans) && settings.changeInMemberLog) {
					e.instance.props.bans = Object.assign({}, e.instance.props.bans);
					for (let id in e.instance.props.bans) e.instance.props.bans[id] = Object.assign({}, e.instance.props.bans[id], {user: this.getUserData(e.instance.props.bans[id].user.id)});
				}
			}

			processInvitationCard (e) {
				if (e.instance.props.user && settings.changeInInviteList) {
					if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.invitemodalinviterowname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id);
					}
				}
			}

			processPrivateChannelRecipientsInvitePopout (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.results) && settings.changeInInviteList) {
					for (let result of e.instance.props.results) result.user = this.getUserData(result.user.id);
				}
			}

			processInviteModalUserRow (e) {
				if (e.instance.props.user && settings.changeInInviteList) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutddmaddnickname]]});
					if (userName) this.changeUserColor(userName, e.instance.props.user.id);
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && settings.changeInTyping) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.FriendUtils.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
						let typingText = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
						if (typingText && BDFDB.ArrayUtils.is(typingText.props.children)) for (let child of typingText.props.children) if (child.type == "strong") {
							let userId = (users.shift() || {}).id;
							if (userId) {
								let data = changedUsers[userId];
								if (data && data.name) child.props.children = data.name;
								this.changeUserColor(child, userId);
							}
						}
					}
				}
			}

			processDirectMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInRecentDms) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
					if (tooltip) tooltip.props.text = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && !isNaN(parseInt(c.props.id))});
					if (avatar && typeof avatar.props.children == "function") {
						let childrenRender = avatar.props.children;
						avatar.props.children = (...args) => {
							let renderedChildren = childrenRender(...args);
							if (renderedChildren && renderedChildren.props) renderedChildren.props.icon = this.getUserAvatar(recipientId);
							return renderedChildren;
						};
					}
				}
			}

			processPrivateChannel (e) {
				if (e.instance.props.user && settings.changeInDmsList) {
					if (!e.returnvalue) {
						let data = changedUsers[e.instance.props.user.id];
						if (data && (data.removeStatus || data.status || data.statusEmoji)) {
							e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != 4);
							let activity = this.createCustomStatus(data);
							if (activity) e.instance.props.activities.unshift(activity);
						}
					}
					else {
						e.returnvalue.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getUserData(e.instance.props.user.id).username});
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true, modify: BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "hovered", "selected", "hasUnreadMessages", "muted")});
						e.returnvalue.props.name = [e.returnvalue.props.name];
						e.returnvalue.props.avatar.props.src = this.getUserAvatar(e.instance.props.user.id);
						this.injectBadge(e.returnvalue.props.name, e.instance.props.user.id, null, 1);
					}
				}
			}

			processQuickSwitchUserResult (e) {
				if (e.instance.props.user && settings.changeInQuickSwitcher) {
					if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.quickswitchresultmatch]]});
						if (userName) {
							let data = changedUsers[e.instance.props.user.id];
							if (data && data.name) userName.props.children = data.name;
							this.changeUserColor(userName, e.instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions")});
						}
					}
				}
			}

			processSearchPopoutComponent (e) {
				if (BDFDB.ArrayUtils.is(BDFDB.ObjectUtils.get(e, "instance.props.resultsState.autocompletes")) && settings.changeInSearchPopout) {
					for (let autocomplete of e.instance.props.resultsState.autocompletes) if (autocomplete && BDFDB.ArrayUtils.is(autocomplete.results)) for (let result of autocomplete.results) if (result.user) result.user = this.getUserData(result.user.id);
				}
			}

			processSearchPopoutUserResult (e) {
				if (e.instance.props.result && e.instance.props.result.user && settings.changeInSearchPopout) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.searchpopoutdisplayednick]]});
					if (userName) {
						let data = changedUsers[e.instance.props.result.user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, e.instance.props.result.user.id);
					}
				}
			}
			
			processIncomingCallModal (e) {
				if (e.instance.props.channelId && settings.changeInDmCalls) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channelId);
					if (!user) {
						let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
						if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM) user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					}
					if (user) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.callincomingtitle]]});
						if (userName) {
							let data = changedUsers[user.id];
							if (data && data.name) userName.props.children = data.name;
							this.changeUserColor(userName, user.id);
						}
						let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.callincomingicon]]});
						if (avatar) avatar.props.src = this.getUserAvatar(user.id);
					}
				}
			}
			
			processRTCConnection (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInRecentDms && typeof e.returnvalue.props.children == "function") {
					let recipientId = e.instance.props.channel.getRecipientId();
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let renderedChildren = renderChildren(...args);
						let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelSubtext"});
						if (userName) {
							userName.props.children = "@" + this.getUserData(recipientId).username;
							this.changeUserColor(userName, recipientId);
						}
						return renderedChildren;
					};
				}
			}

			processPrivateChannelCallParticipants (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && settings.changeInDmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id, true, true);
				}
			}
			
			processChannelCall (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && settings.changeInDmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id);
				}
			}
			
			processPictureInPictureVideo (e) {
				if (e.instance.props.backgroundKey) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.backgroundKey);
					if (user) {
						e.instance.props.title = this.getUserData(user.id).username;
						let videoBackground = BDFDB.ReactUtils.findChild(e.instance.props.children, {name: "VideoBackground"});
						if (videoBackground && videoBackground.props.src) videoBackground.props.src = this.getUserAvatar(user.id);
					}
				}
			}

			processUserSummaryItem (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.users)) {
					for (let i in e.instance.props.users) if (e.instance.props.users[i]) e.instance.props.users[i] = this.getUserData(e.instance.props.users[i].id);
				}
			}

			changeAppTitle () {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let title = document.head.querySelector("title");
				if (title && channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM) {
					let user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					if (user) BDFDB.DOMUtils.setText(title, "@" + this.getUserData(user.id, settings.changeInAppTitle).username);
				}
			}
			
			changeUserColor (child, userId, options = {}) {
				if (BDFDB.ReactUtils.isValidElement(child)) {
					let data = changedUsers[userId] || {};
					if (data.color1 || (data.color2 && options.changeBackground)) {
						let childProp = child.props.children ? "children" : "text";
						let color1 = data.color1 && data.useRoleColor && options.guildId && (BDFDB.LibraryModules.MemberStore.getMember(options.guildId, userId) || {}).colorString || data.color1;
						let fontColor = options.modify && !(data.useRoleColor && options.guildId) ? this.chooseColor(color1, options.modify) : color1;
						let backgroundColor = options.changeBackground && data.color2;
						let fontGradient = BDFDB.ObjectUtils.is(fontColor);
						if (BDFDB.ObjectUtils.is(child.props.style)) {
							delete child.props.style.color;
							delete child.props.style.backgroundColor;
						}
						child.props[childProp] = BDFDB.ReactUtils.createElement("span", {
							style: {
								background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
								color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
							},
							children: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(fontColor),
								children: child.props[childProp]
							}) : child.props[childProp]
						});
					}
				}
			}

			chooseColor (color, config = {}) {
				if (color) {
					if (BDFDB.ObjectUtils.is(config)) {
						if (config.mentions || config.focused || config.hovered || config.selected || config.unread || config.hasUnreadMessages || config.speaking) color = BDFDB.ColorUtils.change(color, 0.5);
						else if (config.muted || config.locked) color = BDFDB.ColorUtils.change(color, -0.5);
					}
					return color;
				}
				return null;
			}
			
			getUserData (userId, change = true, keepName = false, fallbackData) {
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
				if (!user && BDFDB.ObjectUtils.is(fallbackData)) user = fallbackData;
				if (!user) return new BDFDB.DiscordObjects.User({});
				let data = change && changedUsers[user.id];
				if (data) {
					let newUserObject = {}, nativeObject = new BDFDB.DiscordObjects.User(user);
					for (let key in nativeObject) newUserObject[key] = nativeObject[key];
					newUserObject.tag = nativeObject.tag;
					newUserObject.createdAt = nativeObject.createdAt;
					newUserObject.username = !keepName && data.name || nativeObject.username;
					newUserObject.usernameNormalized = !keepName && data.name && data.name.toLowerCase() || nativeObject.usernameNormalized;
					if (data.removeIcon) {
						newUserObject.avatar = null;
						newUserObject.avatarURL = null;
						newUserObject.getAvatarURL = _ => {return null;};
					}
					else if (data.url) {
						newUserObject.avatar = data.url;
						newUserObject.avatarURL = data.url;
						newUserObject.getAvatarURL = _ => {return data.url;};
					}
					return newUserObject;
				}
				return new BDFDB.DiscordObjects.User(user);
			}
			
			getUserAvatar (userId, change = true) {
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
				if (!user) return "";
				let data = change && changedUsers[user.id];
				if (data) {
					if (data.removeIcon) return "";
					else if (data.url) return data.url;
				}
				return BDFDB.LibraryModules.IconUtils.getUserAvatarURL(user);
			}
			
			injectBadge (children, userId, guildId, insertIndex, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !userId) return;
				let data = changedUsers[userId];
				if (data && data.tag) {
					let memberColor = data.ignoreTagColor && (BDFDB.LibraryModules.MemberStore.getMember(guildId, userId) || {}).colorString;
					let fontColor = !config.inverted ? data.color4 : (memberColor || data.color3);
					let backgroundColor = !config.inverted ? (memberColor || data.color3) : data.color4;
					let fontGradient = BDFDB.ObjectUtils.is(fontColor);
					children.splice(insertIndex, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: config.tagClass,
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
							color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
						},
						tag: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(fontColor),
							children: data.tag
						}) : data.tag
					}));
				}
			}
			
			createCustomStatus (data) {
				return !BDFDB.ObjectUtils.is(data) || data.removeStatus ? null : {
					created_at: (new Date()).getTime().toString(),
					emoji: data.statusEmoji,
					id: "custom",
					name: "Custom Status",
					state: data.status,
					type: 4
				}
			}

			openUserSettingsModal (user) {
				let data = changedUsers[user.id] || {};
				let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
				let activity = BDFDB.LibraryModules.StatusMetaUtils.getApplicationActivity(user.id);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header_text,
					subheader: member.nick || user.username,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1_text,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_username_text,
									className: BDFDB.disCN.marginbottom20 + " input-username",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.name,
										placeholder: member.nick || user.username,
										autoFocus: true
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_usertag_text,
									className: BDFDB.disCN.marginbottom20 + " input-usertag",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.tag
									})
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_useravatar_text
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removeicon",
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeIcon,
													onChange: (value, instance) => {
														let avatarInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "USERAVATAR"});
														if (avatarInputIns) {
															delete avatarInputIns.props.success;
															delete avatarInputIns.props.errorMessage;
															avatarInputIns.props.disabled = value;
															BDFDB.ReactUtils.forceUpdate(avatarInputIns);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											className: "input-useravatar",
											key: "USERAVATAR",
											success: !data.removeIcon && data.url,
											maxLength: 100000000000000000000,
											value: data.url,
											placeholder: BDFDB.UserUtils.getAvatar(user.id),
											disabled: data.removeIcon,
											onChange: (value, instance) => {
												this.checkUrl(value, instance);
											}
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removestatus",
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeStatus,
													onChange: (value, instance) => {
														let statusInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "USERSTATUS"});
														let statusEmojiInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "USERSTATUSEMOJI"});
														if (statusInputIns && statusEmojiInputIns) {
															delete statusInputIns.props.success;
															delete statusInputIns.props.errorMessage;
															statusInputIns.props.disabled = value;
															delete statusEmojiInputIns.props.emoji;
															BDFDB.ReactUtils.forceUpdate(statusInputIns, statusEmojiInputIns);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.emojiinputcontainer,
											children: [
												BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.emojiinputbuttoncontainer,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.EmojiPickerButton, {
														className: "input-useremojistatus",
														key: "USERSTATUSEMOJI",
														emoji: data.statusEmoji,
														allowManagedEmojis: true
													})
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-userstatus",
													inputClassName: BDFDB.disCN.emojiinput,
													key: "USERSTATUS",
													maxLength: 100000000000000000000,
													value: data.status,
													placeholder: activity && activity.type == 4 && activity.state || "",
													disabled: data.removeStatus
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
													size: BDFDB.LibraryComponents.Button.Sizes.NONE,
													look: BDFDB.LibraryComponents.Button.Looks.BLANK,
													className: BDFDB.disCN.emojiinputclearbutton,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														className: BDFDB.disCN.emojiinputclearicon,
														name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE_CIRCLE
													}),
													onClick: (e, instance) => {
														let statusInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "USERSTATUS"});
														let statusEmojiInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "USERSTATUSEMOJI"});
														if (statusInputIns && statusEmojiInputIns) {
															statusInputIns.props.value = "";
															delete statusEmojiInputIns.props.emoji;
															BDFDB.ReactUtils.forceUpdate(statusInputIns, statusEmojiInputIns);
														}
													}
												})
											]
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader2_text,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker1_text,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color1,
										number: 1
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2_text,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color2,
										number: 2
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: "input-userolecolor",
									margin: 20,
									label: this.labels.modal_userolecolor_text,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.useRoleColor
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3_text,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3_text,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color3,
										number: 3,
										disabled: data.ignoreTagColor
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4_text,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color4,
										number: 4,
										disabled: data.ignoreTagColor
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: "input-ignoretagcolor",
									margin: 20,
									label: this.labels.modal_ignoretagcolor_text,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.ignoreTagColor,
									onChange: (value, instance) => {
										let colorpicker3ins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["number",3]]});
										let colorpicker4ins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["number",4]]});
										if (colorpicker3ins) colorpicker3ins.setState({disabled: value});
										if (colorpicker4ins) colorpicker4ins.setState({disabled: value});
									}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader4_text,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker5_text,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color5,
										number: 5
									})
								})
							]
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						click: modal => {
							let oldData = Object.assign({}, data);
							
							let userNameInput = modal.querySelector(".input-username " + BDFDB.dotCN.input);
							let userTagInput = modal.querySelector(".input-usertag " + BDFDB.dotCN.input);
							let userAvatarInput = modal.querySelector(".input-useravatar " + BDFDB.dotCN.input);
							let removeIconInput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
							let userStatusInput = modal.querySelector(".input-userstatus " + BDFDB.dotCN.input);
							let userStatusEmojiPicker = modal.querySelector(".input-useremojistatus " + BDFDB.dotCN.emojiold);
							let removeStatusInput = modal.querySelector(".input-removestatus " + BDFDB.dotCN.switchinner);
							let useRoleColorInput = modal.querySelector(".input-userolecolor " + BDFDB.dotCN.switchinner);
							let ignoreTagColorInput = modal.querySelector(".input-ignoretagcolor " + BDFDB.dotCN.switchinner);
							
							data.name = userNameInput.value.trim() || null;
							data.tag = userTagInput.value.trim() || null;
							data.url = (!data.removeIcon && BDFDB.DOMUtils.containsClass(userAvatarInput, BDFDB.disCN.inputsuccess) ? userAvatarInput.value.trim() : null) || null;
							data.removeIcon = removeIconInput.checked;
							data.status = !data.removeStatus && userStatusInput.value.trim() || null;
							data.statusEmoji = !data.removeStatus && BDFDB.ReactUtils.findValue(userStatusEmojiPicker, "emoji", {up: true}) || null;
							data.removeStatus = removeStatusInput.checked;
							data.useRoleColor = useRoleColorInput.checked;
							data.ignoreTagColor = ignoreTagColorInput.checked;

							data.color1 = BDFDB.ColorUtils.getSwatchColor(modal, 1);
							data.color2 = BDFDB.ColorUtils.getSwatchColor(modal, 2);
							data.color3 = BDFDB.ColorUtils.getSwatchColor(modal, 3);
							data.color4 = BDFDB.ColorUtils.getSwatchColor(modal, 4);
							data.color5 = BDFDB.ColorUtils.getSwatchColor(modal, 5);

							let changed = false;
							if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.DataUtils.remove(this, "users", user.id);
							else if (!BDFDB.equals(oldData, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "users", user.id);
							if (changed) this.forceUpdateAll();
						}
					}]
				});
			}
			
			checkUrl (url, instance) {
				BDFDB.TimeUtils.clear(instance.checkTimeout);
				if (url == null || !url.trim()) {
					delete instance.props.success;
					delete instance.props.errorMessage;
					instance.forceUpdate();
				}
				else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
					BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
						if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
							instance.props.success = true;
							delete instance.props.errorMessage;
						}
						else {
							delete instance.props.success;
							instance.props.errorMessage = this.labels.modal_invalidurl_text;
						}
						delete instance.checkTimeout;
						instance.forceUpdate();
					});
				}, 1000);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							context_localusersettings_text:		"Lokalne korisni??ke postavke",
							submenu_usersettings_text:			"Promijeni postavke",
							submenu_resetsettings_text:			"Poni??ti korisnika",
							modal_header_text:					"Lokalne korisni??ke postavke",
							modal_username_text:				"Lokalno korisni??ko ime",
							modal_usertag_text:					"Oznaka",
							modal_useravatar_text:				"Ikona",
							modal_tabheader1_text:				"Korisnik",
							modal_tabheader2_text:				"Boja naziva",
							modal_tabheader3_text:				"Boja oznaka",
							modal_tabheader4_text:				"Boja poruke",
							modal_colorpicker1_text:			"Boja naziva",
							modal_colorpicker2_text:			"Boja pozadine",
							modal_colorpicker3_text:			"Boja oznaka",
							modal_colorpicker4_text:			"Boja fonta",
							modal_colorpicker5_text:			"Boja fonta",
							modal_userolecolor_text:			"Nemojte prepisivati boju uloge",
							modal_ignoretagcolor_text:			"Upotrijebite boju uloga",
							modal_invalidurl_text:				"Neva??e??i URL"
						};
					case "da":		//danish
						return {
							context_localusersettings_text:		"Lokal brugerindstillinger",
							submenu_usersettings_text:			"Skift indstillinger",
							submenu_resetsettings_text:			"Nulstil bruger",
							modal_header_text:					"Lokal brugerindstillinger",
							modal_username_text:				"Lokalt brugernavn",
							modal_usertag_text:					"Initialer",
							modal_useravatar_text:				"Ikon",
							modal_tabheader1_text:				"Bruger",
							modal_tabheader2_text:				"Navnefarve",
							modal_tabheader3_text:				"Etiketfarve",
							modal_tabheader4_text:				"Meddelelsesfarve",
							modal_colorpicker1_text:			"Navnefarve",
							modal_colorpicker2_text:			"Baggrundsfarve",
							modal_colorpicker3_text:			"Etiketfarve",
							modal_colorpicker4_text:			"Skriftfarve",
							modal_colorpicker5_text:			"Skriftfarve",
							modal_userolecolor_text:			"Overskriv ikke rollefarven",
							modal_ignoretagcolor_text:			"Brug rollefarve",
							modal_invalidurl_text:				"Ugyldig URL"
						};
					case "de":		//german
						return {
							context_localusersettings_text:		"Lokale Benutzereinstellungen",
							submenu_usersettings_text:			"Einstellungen ??ndern",
							submenu_resetsettings_text:			"Benutzer zur??cksetzen",
							modal_header_text:					"Lokale Benutzereinstellungen",
							modal_username_text:				"Lokaler Benutzername",
							modal_usertag_text:					"Etikett",
							modal_useravatar_text:				"Icon",
							modal_tabheader1_text:				"Benutzer",
							modal_tabheader2_text:				"Namensfarbe",
							modal_tabheader3_text:				"Etikettfarbe",
							modal_tabheader4_text:				"Nachrichtenfarbe",
							modal_colorpicker1_text:			"Namensfarbe",
							modal_colorpicker2_text:			"Hintergrundfarbe",
							modal_colorpicker3_text:			"Etikettfarbe",
							modal_colorpicker4_text:			"Schriftfarbe",
							modal_colorpicker5_text:			"Schriftfarbe",
							modal_userolecolor_text:			"??berschreibe nicht die Rollenfarbe",
							modal_ignoretagcolor_text:			"Benutze Rollenfarbe",
							modal_invalidurl_text:				"Ung??ltige URL"
						};
					case "es":		//spanish
						return {
							context_localusersettings_text:		"Ajustes local de usuario",
							submenu_usersettings_text:			"Cambiar ajustes",
							submenu_resetsettings_text:			"Restablecer usuario",
							modal_header_text:					"Ajustes local de usuario",
							modal_username_text:				"Nombre local de usuario",
							modal_usertag_text:					"Etiqueta",
							modal_useravatar_text:				"Icono",
							modal_tabheader1_text:				"Usuario",
							modal_tabheader2_text:				"Color del nombre",
							modal_tabheader3_text:				"Color de la etiqueta",
							modal_tabheader4_text:				"Color del mensaje",
							modal_colorpicker1_text:			"Color del nombre",
							modal_colorpicker2_text:			"Color de fondo",
							modal_colorpicker3_text:			"Color de la etiqueta",
							modal_colorpicker4_text:			"Color de fuente",
							modal_colorpicker5_text:			"Color de fuente",
							modal_userolecolor_text:			"No sobrescriba el color del rol",
							modal_ignoretagcolor_text:			"Usar color de rol",
							modal_invalidurl_text:				"URL inv??lida"
						};
					case "fr":		//french
						return {
							context_localusersettings_text:		"Param??tres locale d'utilisateur",
							submenu_usersettings_text:			"Modifier les param??tres",
							submenu_resetsettings_text:			"R??initialiser l'utilisateur",
							modal_header_text:					"Param??tres locale d'utilisateur",
							modal_username_text:				"Nom local d'utilisateur",
							modal_usertag_text:					"??tiquette",
							modal_useravatar_text:				"Ic??ne",
							modal_tabheader1_text:				"Serveur",
							modal_tabheader2_text:				"Couleur du nom",
							modal_tabheader3_text:				"Couleur de l'??tiquette",
							modal_tabheader4_text:				"Couleur du message",
							modal_colorpicker1_text:			"Couleur du nom",
							modal_colorpicker2_text:			"Couleur de fond",
							modal_colorpicker3_text:			"Couleur de l'??tiquette",
							modal_colorpicker4_text:			"Couleur de la police",
							modal_colorpicker5_text:			"Couleur de la police",
							modal_userolecolor_text:			"Ne pas ??craser la couleur du r??le",
							modal_ignoretagcolor_text:			"Utiliser la couleur de r??le",
							modal_invalidurl_text:				"URL invalide"
						};
					case "it":		//italian
						return {
							context_localusersettings_text:		"Impostazioni locale utente",
							submenu_usersettings_text:			"Cambia impostazioni",
							submenu_resetsettings_text:			"Ripristina utente",
							modal_header_text:					"Impostazioni locale utente",
							modal_username_text:				"Nome locale utente",
							modal_usertag_text:					"Etichetta",
							modal_useravatar_text:				"Icona",
							modal_tabheader1_text:				"Utente",
							modal_tabheader2_text:				"Colore del nome",
							modal_tabheader3_text:				"Colore della etichetta",
							modal_tabheader4_text:				"Colore del messaggio",
							modal_colorpicker1_text:			"Colore del nome",
							modal_colorpicker2_text:			"Colore di sfondo",
							modal_colorpicker3_text:			"Colore della etichetta",
							modal_colorpicker4_text:			"Colore del carattere",
							modal_colorpicker5_text:			"Colore del carattere",
							modal_userolecolor_text:			"Non sovrascrivere il colore del ruolo",
							modal_ignoretagcolor_text:			"Usa il colore del ruolo",
							modal_invalidurl_text:				"URL non valido"
						};
					case "nl":		//dutch
						return {
							context_localusersettings_text:		"Lokale gebruikerinstellingen",
							submenu_usersettings_text:			"Verandere instellingen",
							submenu_resetsettings_text:			"Reset gebruiker",
							modal_header_text:					"Lokale gebruikerinstellingen",
							modal_username_text:				"Lokale gebruikernaam",
							modal_usertag_text:					"Etiket",
							modal_useravatar_text:				"Icoon",
							modal_tabheader1_text:				"Gebruiker",
							modal_tabheader2_text:				"Naamkleur",
							modal_tabheader3_text:				"Etiketkleur",
							modal_tabheader4_text:				"Berichtkleur",
							modal_colorpicker1_text:			"Naamkleur",
							modal_colorpicker2_text:			"Achtergrondkleur",
							modal_colorpicker3_text:			"Etiketkleur",
							modal_colorpicker4_text:			"Doopvontkleur",
							modal_colorpicker5_text:			"Doopvontkleur",
							modal_userolecolor_text:			"Overschrijf de rolkleur niet",
							modal_ignoretagcolor_text:			"Gebruik rolkleur",
							modal_invalidurl_text:				"Ongeldige URL"
						};
					case "no":		//norwegian
						return {
							context_localusersettings_text:		"Lokal brukerinnstillinger",
							submenu_usersettings_text:			"Endre innstillinger",
							submenu_resetsettings_text:			"Tilbakestill bruker",
							modal_header_text:					"Lokal brukerinnstillinger",
							modal_username_text:				"Lokalt gebruikernavn",
							modal_usertag_text:					"Stikkord",
							modal_useravatar_text:				"Ikon",
							modal_tabheader1_text:				"Bruker",
							modal_tabheader2_text:				"Navnfarge",
							modal_tabheader3_text:				"Stikkordfarge",
							modal_tabheader4_text:				"Meldingsfarge",
							modal_colorpicker1_text:			"Navnfarge",
							modal_colorpicker2_text:			"Bakgrunnfarge",
							modal_colorpicker3_text:			"Stikkordfarge",
							modal_colorpicker4_text:			"Skriftfarge",
							modal_colorpicker5_text:			"Skriftfarge",
							modal_userolecolor_text:			"Ikke overskriv rollefarge",
							modal_ignoretagcolor_text:			"Bruk rollefarge",
							modal_invalidurl_text:				"Ugyldig URL"
						};
					case "pl":		//polish
						return {
							context_localusersettings_text:		"Lokalne ustawienia u??ytkownika",
							submenu_usersettings_text:			"Zmie?? ustawienia",
							submenu_resetsettings_text:			"Resetuj ustawienia",
							modal_header_text:					"Lokalne ustawienia u??ytkownika",
							modal_username_text:				"Lokalna nazwa u??ytkownika",
							modal_usertag_text:					"Etykieta",
							modal_useravatar_text:				"Ikona",
							modal_tabheader1_text:				"U??ytkownik",
							modal_tabheader2_text:				"Kolor nazwy",
							modal_tabheader3_text:				"Kolor etykiety",
							modal_tabheader4_text:				"Kolor wiadomo??ci",
							modal_colorpicker1_text:			"Kolor nazwy",
							modal_colorpicker2_text:			"Kolor t??a",
							modal_colorpicker3_text:			"Kolor etykiety",
							modal_colorpicker4_text:			"Kolor czcionki",
							modal_colorpicker5_text:			"Kolor czcionki",
							modal_userolecolor_text:			"Nie nadpisuj kolor roli",
							modal_ignoretagcolor_text:			"U??yj kolor roli",
							modal_invalidurl_text:				"Nieprawid??owe URL"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							context_localusersettings_text:		"Configura????es local do utilizador",
							submenu_usersettings_text:			"Mudar configura????es",
							submenu_resetsettings_text:			"Redefinir utilizador",
							modal_header_text:					"Configura????es local do utilizador",
							modal_username_text:				"Nome local do utilizador",
							modal_usertag_text:					"Etiqueta",
							modal_useravatar_text:				"Icone",
							modal_tabheader1_text:				"Utilizador",
							modal_tabheader2_text:				"Cor do nome",
							modal_tabheader3_text:				"Cor da etiqueta",
							modal_tabheader4_text:				"Cor da mensagem",
							modal_colorpicker1_text:			"Cor do nome",
							modal_colorpicker2_text:			"Cor do fundo",
							modal_colorpicker3_text:			"Cor da etiqueta",
							modal_colorpicker4_text:			"Cor da fonte",
							modal_colorpicker5_text:			"Cor da fonte",
							modal_userolecolor_text:			"N??o sobrescrever a cor da papel",
							modal_ignoretagcolor_text:			"Use a cor do papel",
							modal_invalidurl_text:				"URL inv??lida"
						};
					case "fi":		//finnish
						return {
							context_localusersettings_text:		"Paikallinen k??ytt??j?? asetukset",
							submenu_usersettings_text:			"Vaihda asetuksia",
							submenu_resetsettings_text:			"Nollaa k??ytt??j??",
							modal_header_text:					"Paikallinen k??ytt??j?? asetukset",
							modal_username_text:				"Paikallinen k??ytt??j??tunnus",
							modal_usertag_text:					"Merkki",
							modal_useravatar_text:				"Ikonin",
							modal_tabheader1_text:				"K??ytt??j??",
							modal_tabheader2_text:				"Nimiv??ri",
							modal_tabheader3_text:				"Merkkiv??ri",
							modal_tabheader4_text:				"Viestinv??ri",
							modal_colorpicker1_text:			"Nimiv??ri",
							modal_colorpicker2_text:			"Taustav??ri",
							modal_colorpicker3_text:			"Merkkiv??ri",
							modal_colorpicker4_text:			"Fontinv??ri",
							modal_colorpicker5_text:			"Fontinv??ri",
							modal_userolecolor_text:			"??l?? korvaa rooliv??ri??",
							modal_ignoretagcolor_text:			"K??yt?? rooliv??ri??",
							modal_invalidurl_text:				"Virheellinen URL"
						};
					case "sv":		//swedish
						return {
							context_localusersettings_text:		"Lokal anv??ndareinst??llningar",
							submenu_usersettings_text:			"??ndra inst??llningar",
							submenu_resetsettings_text:			"??terst??ll anv??ndare",
							modal_header_text:					"Lokal anv??ndareinst??llningar",
							modal_username_text:				"Lokalt anv??ndarenamn",
							modal_usertag_text:					"M??rka",
							modal_useravatar_text:				"Ikon",
							modal_tabheader1_text:				"Anv??ndare",
							modal_tabheader2_text:				"Namnf??rg",
							modal_tabheader3_text:				"M??rkaf??rg",
							modal_tabheader4_text:				"Meddelandef??rg",
							modal_colorpicker1_text:			"Namnf??rg",
							modal_colorpicker2_text:			"Bakgrundf??rg",
							modal_colorpicker3_text:			"M??rkaf??rg",
							modal_colorpicker4_text:			"Fontf??rg",
							modal_colorpicker5_text:			"Fontf??rg",
							modal_userolecolor_text:			"Skriv inte ??ver rollf??rg",
							modal_ignoretagcolor_text:			"Anv??nd rollf??rg",
							modal_invalidurl_text:				"Ogiltig URL"
						};
					case "tr":		//turkish
						return {
							context_localusersettings_text:		"Yerel Kullan??c?? Ayarlar??",
							submenu_usersettings_text:			"Ayarlar?? De??i??tir",
							submenu_resetsettings_text:			"Kullan??c?? S??f??rla",
							modal_header_text:					"Yerel Kullan??c?? Ayarlar??",
							modal_username_text:				"Yerel Kullan??c?? Isim",
							modal_usertag_text:					"Etiket",
							modal_useravatar_text:				"Simge",
							modal_tabheader1_text:				"Kullan??c??",
							modal_tabheader2_text:				"Simge rengi",
							modal_tabheader3_text:				"Isim rengi",
							modal_tabheader4_text:				"Mesaj rengi",
							modal_colorpicker1_text:			"Simge rengi",
							modal_colorpicker2_text:			"Arka fon rengi",
							modal_colorpicker3_text:			"Etiket rengi",
							modal_colorpicker4_text:			"Yaz?? rengi",
							modal_colorpicker5_text:			"Yaz?? rengi",
							modal_userolecolor_text:			"Rol rengini ??zerine yazmay??n",
							modal_ignoretagcolor_text:			"Rol rengini kullan",
							modal_invalidurl_text:				"Ge??ersiz URL"
						};
					case "cs":		//czech
						return {
							context_localusersettings_text:		"M??stn?? nastaven?? u??ivatel",
							submenu_usersettings_text:			"Zm??nit nastaven??",
							submenu_resetsettings_text:			"Obnovit u??ivatel",
							modal_header_text:					"M??stn?? nastaven?? u??ivatel",
							modal_username_text:				"M??stn?? n??zev u??ivatel",
							modal_usertag_text:					"??t??tek",
							modal_useravatar_text:				"Ikony",
							modal_tabheader1_text:				"U??ivatel",
							modal_tabheader2_text:				"Barva n??zev",
							modal_tabheader3_text:				"Barva ??t??tek",
							modal_tabheader4_text:				"Barva zpr??vy",
							modal_colorpicker1_text:			"Barva n??zev",
							modal_colorpicker2_text:			"Barva pozad??",
							modal_colorpicker3_text:			"Barva ??t??tek",
							modal_colorpicker4_text:			"Barva fontu",
							modal_colorpicker5_text:			"Barva fontu",
							modal_userolecolor_text:			"Nep??episujte barva role",
							modal_ignoretagcolor_text:			"Pou??ijte barva role",
							modal_invalidurl_text:				"Neplatn?? URL"
						};
					case "bg":		//bulgarian
						return {
							context_localusersettings_text:		"?????????????????? ???? ?????????????? ????????????????????",
							submenu_usersettings_text:			"?????????????? ???? ??????????????????????",
							submenu_resetsettings_text:			"???????????????????????????? ???? ????????????????????",
							modal_header_text:					"?????????????????? ???? ?????????????? ????????????????????",
							modal_username_text:				"?????????????? ?????? ???? ????????????????????",
							modal_usertag_text:					"C?????????????? ????????",
							modal_useravatar_text:				"??????????",
							modal_tabheader1_text:				"????????????????????",
							modal_tabheader2_text:				"???????? ???? ??????",
							modal_tabheader3_text:				"???????? ???? ???????????????? ????????",
							modal_tabheader4_text:				"???????? ???? ??????????????????????",
							modal_colorpicker1_text:			"???????? ???? ??????",
							modal_colorpicker2_text:			"???????? ???? ?????????? ????????",
							modal_colorpicker3_text:			"???????? ???? ???????????????? ????????",
							modal_colorpicker4_text:			"???????? ???? ????????????",
							modal_colorpicker5_text:			"???????? ???? ????????????",
							modal_userolecolor_text:			"???? ?????????????????????????? ???????? ???? ????????????",
							modal_ignoretagcolor_text:			"?????????????????????? ???????? ???? ????????????",
							modal_invalidurl_text:				"?????????????????? URL"
						};
					case "ru":		//russian
						return {
							context_localusersettings_text:		"?????????????????? ???????????????????? ????????????????????????",
							submenu_usersettings_text:			"???????????????? ??????????????????",
							submenu_resetsettings_text:			"???????????????? ????????????????????????",
							modal_header_text:					"?????????????????? ???????????????????? ????????????????????????",
							modal_username_text:				"?????? ???????????????????? ????????????????????????",
							modal_usertag_text:					"T????",
							modal_useravatar_text:				"????????????",
							modal_tabheader1_text:				"????????????????????????",
							modal_tabheader2_text:				"???????? ??????",
							modal_tabheader3_text:				"???????? ??????",
							modal_tabheader4_text:				"???????? ??????????????????",
							modal_colorpicker1_text:			"???????? ??????",
							modal_colorpicker2_text:			"???????? ???????????? ????????",
							modal_colorpicker3_text:			"???????? ??????",
							modal_colorpicker4_text:			"???????? ????????????",
							modal_colorpicker5_text:			"???????? ????????????",
							modal_userolecolor_text:			"???? ???????????????????????????? ???????? ????????",
							modal_ignoretagcolor_text:			"???????????????????????? ???????? ??????????",
							modal_invalidurl_text:				"???????????????? URL"
						};
					case "uk":		//ukrainian
						return {
							context_localusersettings_text:		"???????????????????????? ???????????????????? ????????????????????",
							submenu_usersettings_text:			"?????????????? ????????????????????????",
							submenu_resetsettings_text:			"???????????????? ????????????????????",
							modal_header_text:					"???????????????????????? ???????????????????? ????????????????????",
							modal_username_text:				"???????????????? ????'?? ????????????????????",
							modal_usertag_text:					"T????",
							modal_useravatar_text:				"????????????",
							modal_tabheader1_text:				"????????????????????",
							modal_tabheader2_text:				"?????????? ????'??",
							modal_tabheader3_text:				"?????????? ??????",
							modal_tabheader4_text:				"?????????? ????????????????????????",
							modal_colorpicker1_text:			"?????????? ????'??",
							modal_colorpicker2_text:			"?????????? ??????",
							modal_colorpicker3_text:			"?????????? ??????",
							modal_colorpicker4_text:			"?????????? ????????????",
							modal_colorpicker5_text:			"?????????? ????????????",
							modal_userolecolor_text:			"???? ?????????????????????? ?????????? ????????",
							modal_ignoretagcolor_text:			"???????????????????????????? ???????????????? ??????????",
							modal_invalidurl_text:				"???????????????? URL"
						};
					case "ja":		//japanese
						return {
							context_localusersettings_text:		"?????????????????????????????????",
							submenu_usersettings_text:			"?????????????????????",
							submenu_resetsettings_text:			"????????????????????????????????????",
							modal_header_text:					"?????????????????????????????????",
							modal_username_text:				"??????????????????????????????",
							modal_usertag_text:					"??????",
							modal_useravatar_text:				"????????????",
							modal_tabheader1_text:				"????????????",
							modal_tabheader2_text:				"?????????",
							modal_tabheader3_text:				"????????????",
							modal_tabheader4_text:				"?????????????????????",
							modal_colorpicker1_text:			"?????????",
							modal_colorpicker2_text:			"??????????????????????????????",
							modal_colorpicker3_text:			"????????????",
							modal_colorpicker4_text:			"??????????????????",
							modal_colorpicker5_text:			"??????????????????",
							modal_userolecolor_text:			"????????????????????????????????????????????????",
							modal_ignoretagcolor_text:			"?????????????????????????????????",
							modal_invalidurl_text:				"????????? URL"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							context_localusersettings_text:		"??????????????????",
							submenu_usersettings_text:			"????????????",
							submenu_resetsettings_text:			"????????????",
							modal_header_text:					"??????????????????",
							modal_username_text:				"????????????",
							modal_usertag_text:					"??????",
							modal_useravatar_text:				"??????",
							modal_tabheader1_text:				"??????",
							modal_tabheader2_text:				"????????????",
							modal_tabheader3_text:				"????????????",
							modal_tabheader4_text:				"????????????",
							modal_colorpicker1_text:			"????????????",
							modal_colorpicker2_text:			"????????????",
							modal_colorpicker3_text:			"????????????",
							modal_colorpicker4_text:			"????????????",
							modal_colorpicker5_text:			"????????????",
							modal_userolecolor_text:			"????????????????????????",
							modal_ignoretagcolor_text:			"????????????",
							modal_invalidurl_text:				"????????? URL"
						};
					case "ko":		//korean
						return {
							context_localusersettings_text:		"?????? ????????? ??????",
							submenu_usersettings_text:			"?????? ??????",
							submenu_resetsettings_text:			"????????? ?????????",
							modal_header_text:					"?????? ????????? ??????",
							modal_username_text:				"?????? ????????? ??????",
							modal_usertag_text:					"?????????",
							modal_useravatar_text:				"???",
							modal_tabheader1_text:				"?????????",
							modal_tabheader2_text:				"?????? ??????",
							modal_tabheader3_text:				"????????? ??????",
							modal_tabheader4_text:				"????????? ??????",
							modal_colorpicker1_text:			"?????? ??????",
							modal_colorpicker2_text:			"?????? ??????",
							modal_colorpicker3_text:			"????????? ??????",
							modal_colorpicker4_text:			"?????? ??????",
							modal_colorpicker5_text:			"?????? ??????",
							modal_userolecolor_text:			"?????? ????????? ?????? ?????? ????????????",
							modal_ignoretagcolor_text:			"?????? ?????? ??????",
							modal_invalidurl_text:				"????????? URL"
						};
					default:	//default: english
						return {
							context_localusersettings_text:		"Local Usersettings",
							submenu_usersettings_text:			"Change Settings",
							submenu_resetsettings_text:			"Reset User",
							modal_header_text:					"Local Usersettings",
							modal_username_text:				"Local Username",
							modal_usertag_text:					"Tag",
							modal_useravatar_text:				"Icon",
							modal_tabheader1_text:				"User",
							modal_tabheader2_text:				"Namecolor",
							modal_tabheader3_text:				"Tagcolor",
							modal_tabheader4_text:				"Messagecolor",
							modal_colorpicker1_text:			"Namecolor",
							modal_colorpicker2_text:			"Backgroundcolor",
							modal_colorpicker3_text:			"Tagcolor",
							modal_colorpicker4_text:			"Fontcolor",
							modal_colorpicker5_text:			"Fontcolor",
							modal_userolecolor_text:			"Do not overwrite rolecolor",
							modal_ignoretagcolor_text:			"Use rolecolor",
							modal_invalidurl_text:				"Invalid URL"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();