//META{"name":"PinPluginsAndThemes","source":"https://gitlab.com/_Lighty_/bdstuff/blob/master/PinPluginsAndThemes.plugin.js","website":"https://_lighty_.gitlab.io/bdstuff/?plugin=PinPluginsAndThemes"}*//
/*@cc_on
@if (@_jscript)

	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject('WScript.Shell');
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
	} else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec('explorer ' + pathPlugins);
		shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
	}
	WScript.Quit();

@else@*/

var PinPluginsAndThemes = (() => {
  /* Setup */
  const config = {
    main: 'index.js',
    info: { name: 'PinPluginsAndThemes', authors: [{ name: 'Lighty', discord_id: '239513071272329217', github_username: 'LightyPon', twitter_username: '' }], version: '1.0.3', description: 'Right click on a plugins header or click the button to pin it to the top! Works with RepoControls by Devilbro. to change the color, use custom css:\n:root {\n      --PPAT-color: rgb(142, 112, 216);\n    }', github: 'https://gitlab.com/_Lighty_', github_raw: 'https://_lighty_.gitlab.io/bdstuff/plugins/PinPluginsAndThemes.plugin.js' },
    changelog: [
      {
        title: 'why do I even bother with this awful plugin',
        type: 'fixed',
        items: ['Fixed breaking plugins and themes section due to missing icons']
      }
    ]
  };

  /* Build */
  const buildPlugin = ([Plugin, Api]) => {
    const { Utilities, WebpackModules, DiscordModules, ReactTools, Patcher, PluginUtilities, Logger, Toasts } = Api;
    const { React, ContextMenuItemsGroup, ContextMenuActions, ContextMenuItem } = DiscordModules;
    const joinClassNames = WebpackModules.getModule(e => e.default && e.default.default);
    const Tooltip = WebpackModules.getByDisplayName('Tooltip');
    const Icon = WebpackModules.getByDisplayName('Icon');

    const GetClass = arg => {
      const args = arg.split(' ');
      return WebpackModules.getByProps(...args)[args[args.length - 1]];
    };

    const iconWrapper = GetClass('divider iconWrapper');
    const clickable = GetClass('divider clickable');
    const iconClass = GetClass('toolbar icon');
    const iconSelected = GetClass('iconWrapper selected');

    class PinContextMenu extends React.PureComponent {
      render() {
        return React.createElement(
          'div',
          {
            type: 'PLUGIN_HEADER',
            className: PinContextMenu.ConstClasses.ContextMenu
          },
          React.createElement(
            ContextMenuItemsGroup,
            {},
            React.createElement(ContextMenuItem, {
              label: this.props.pinned ? 'Unpin' : 'Pin',
              action: () => {
                ContextMenuActions.closeContextMenu();
                this.props.pinToggle();
              }
            })
          )
        );
      }
    }

    PinContextMenu.displayName = 'PPATContextMenu';
    PinContextMenu.ConstClasses = {
      ContextMenu: GetClass('contextMenu')
    };

    return class PinPluginsAndThemes extends Plugin {
      constructor() {
        super();
        this.patchTarget = this.patchTarget.bind(this);
      }
      onStart() {
        this.data = PluginUtilities.loadData(this.name, 'data', {
          pinned: []
        });

        PluginUtilities.addStyle(
          this.short,
          `
          :root {
            --PPAT-color: rgb(142, 112, 216);
          }

          .bda-slist > li.PPAT-pinned {
            border: 1px solid var(--PPAT-color) !important;
          }

          .PPAT-border {
            background: var(--PPAT-color);
            display: block;
            width: 100%;
            height: 10px;
            margin-bottom: 20px;
          }
          `
        );
        /* setttimeout because repocontrols is a disabled plugin, or maybe devilbros library is idk */
        this.timeout = setTimeout(() => {
          this.patchAll();
          this.updateLists();
        }, 1000);
      }
      onStop() {
        clearTimeout(this.timeout);
        PluginUtilities.removeStyle(this.short);
        Patcher.unpatchAll();
        this.updateLists();
      }

      updateLists() {
        const owner = ReactTools.getOwnerInstance(document.querySelector('.bda-slist'));
        if (owner) {
          const old = document.querySelector('.content-region-scroller').scrollTop;
          owner.forceUpdate();
          /* restore scroll */
          setImmediate(() => (document.querySelector('.content-region-scroller').scrollTop = old));
        }
        const items = document.querySelectorAll('.bda-slist > .ui-switch-item');
        items.forEach(e => {
          const own = ReactTools.getOwnerInstance(e);
          own.forceUpdate();
        });
      }

      togglePin(name) {
        if (this.data.pinned.indexOf(name) !== -1) {
          this.data.pinned.splice(this.data.pinned.indexOf(name), 1);
          Toasts.success('Unpinned!');
        } else {
          this.data.pinned.push(name);
          Toasts.success('Pinned!');
        }
        this.updateLists();
        PluginUtilities.saveData(this.name, 'data', this.data);
      }

      /* patches */

      patchAll() {
        this.patchV2C_List();
        this.patchCards();
      }

      patchV2C_List() {
        Patcher.after(V2C_List.prototype, 'render', (_this, args, ret) => {
          const arrays = [[], []];
          ret.props.children.forEach(e => (this.data.pinned.indexOf(e.key) !== -1 && arrays[0].push(e)) || arrays[1].push(e));
          ret.props.children = [
            ...arrays[0],
            arrays[0].length && arrays[1].length
              ? React.createElement('div', {
                  className: 'PPAT-border'
                })
              : false,
            ...arrays[1]
          ];
        });
      }

      patchCards() {
        /* can't use after because it causes bugs in other plugins */
        Patcher.after(V2C_PluginCard.prototype, 'render', this.patchTarget);
        Patcher.after(V2C_ThemeCard.prototype, 'render', this.patchTarget);
      }

      patchTarget(_, __, ret) {
        const controlsProps = Utilities.getNestedProp(ret, 'props.children.0.props.children.1.props');
        const headerProps = Utilities.getNestedProp(ret, 'props.children.0.props');
        if (!controlsProps || !headerProps) return ret;
        const name = ret.props['data-name'];
        if (this.data.pinned.indexOf(name) !== -1) ret.props.className += ' PPAT-pinned';
        headerProps.onContextMenu = e =>
          ContextMenuActions.openContextMenu(e, e => {
            return React.createElement(PinContextMenu, {
              onHeightUpdate: () => {}, // don't cause errors in ExtendedContextMenu plugin, also why it's a class
              pinToggle: () => this.togglePin(name),
              pinned: this.data.pinned.indexOf(name) !== -1
            });
          });
        controlsProps.children.unshift(this.createPinIcon(name));
        return ret;
      }

      createPinIcon(name) {
        return React.createElement(
          Tooltip,
          {
            text: 'Pin',
            position: 'bottom',
            hideOnClick: true
          },
          t =>
            React.createElement(
              'div',
              {
                ...t,
                className: joinClassNames(iconWrapper, clickable, this.data.pinned.indexOf(name) !== -1 ? iconSelected : ''),
                role: 'button',
                onClick: e => this.togglePin(name),
                style: {
                  marginLeft: 0,
                  marginRight: 5
                }
              },
              React.createElement(
                'svg',
                {
                  width: 24,
                  height: 24,
                  viewBox: '0 0 24 24',
                  className: iconClass
                },
                React.createElement('path', { d: 'M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096 9.87801V9.88001L5.73596 8.46501L4.32196 9.88001L8.56496 14.122L2.90796 19.778L4.32196 21.192L9.97896 15.536L14.222 19.778L15.636 18.364L14.222 16.95L19.171 12H19.172L20.586 13.414L22 12Z', fill: 'currentColor' })
              )
            )
        );
      }

      /* patches end */

      showChangelog(footer) {
        XenoLib.showChangelog(`${this.name} has been updated!`, this.version, this._config.changelog);
      }
      get [Symbol.toStringTag]() {
        return 'Plugin';
      }
      get name() {
        return config.info.name;
      }
      get short() {
        let string = '';

        for (let i = 0, len = config.info.name.length; i < len; i++) {
          const char = config.info.name[i];
          if (char === char.toUpperCase()) string += char;
        }

        return string;
      }
      get author() {
        return config.info.authors.map(author => author.name).join(', ');
      }
      get version() {
        return config.info.version;
      }
      get description() {
        return config.info.description;
      }
    };
  };

  /* Finalize */

  let ZeresPluginLibraryOutdated = false;
  let XenoLibOutdated = false;
  try {
    if (global.BdApi && 'function' == typeof BdApi.getPlugin) {
      const i = (i, n) => ((i = i.split('.').map(i => parseInt(i))), (n = n.split('.').map(i => parseInt(i))), !!(n[0] > i[0]) || !!(n[0] == i[0] && n[1] > i[1]) || !!(n[0] == i[0] && n[1] == i[1] && n[2] > i[2])),
        n = (n, e) => n && n._config && n._config.info && n._config.info.version && i(n._config.info.version, e),
        e = BdApi.getPlugin('ZeresPluginLibrary'),
        o = BdApi.getPlugin('XenoLib');
      n(e, '1.2.10') && (ZeresPluginLibraryOutdated = !0), n(o, '1.3.11') && (XenoLibOutdated = !0);
    }
  } catch (i) {
    console.error('Error checking if libraries are out of date', i);
  }

  return !global.ZeresPluginLibrary || !global.XenoLib || ZeresPluginLibraryOutdated || XenoLibOutdated
    ? class {
        getName() {
          return this.name.replace(/\s+/g, '');
        }
        getAuthor() {
          return this.author;
        }
        getVersion() {
          return this.version;
        }
        getDescription() {
          return this.description;
        }
        stop() {}
        load() {
          const a = !global.XenoLib,
            b = !global.ZeresPluginLibrary,
            c = (a && b) || ((a || b) && (XenoLibOutdated || ZeresPluginLibraryOutdated)) || XenoLibOutdated || ZeresPluginLibraryOutdated,
            d = (() => {
              let d = '';
              return a || b ? (d += `Missing${XenoLibOutdated || ZeresPluginLibraryOutdated ? ' and outdated' : ''} `) : (XenoLibOutdated || ZeresPluginLibraryOutdated) && (d += `Outdated `), (d += `${c ? 'Libraries' : 'Library'} `), d;
            })(),
            e = (() => {
              let d = `The ${c ? 'libraries' : 'library'} `;
              return a || XenoLibOutdated ? ((d += 'XenoLib '), (b || ZeresPluginLibraryOutdated) && (d += 'and ZeresPluginLibrary ')) : (b || ZeresPluginLibraryOutdated) && (d += 'ZeresPluginLibrary '), (d += `required for ${this.name} ${c ? 'are' : 'is'} ${a || b ? 'missing' : ''}${XenoLibOutdated || ZeresPluginLibraryOutdated ? (a || b ? ' and/or outdated' : 'outdated') : ''}.`), d;
            })(),
            f = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey'),
            g = BdApi.findModuleByProps('Sizes', 'Weights'),
            h = BdApi.findModule(a => a.defaultProps && a.key && 'confirm-modal' === a.key()),
            i = () => BdApi.getCore().alert(d, `${e}<br/>Due to a slight mishap however, you'll have to download the libraries yourself. After opening the links, do CTRL + S to download the library.<br/>${b || ZeresPluginLibraryOutdated ? '<br/><a href="http://betterdiscord.net/ghdl/?url=https://github.com/rauenzi/BDPluginLibrary/blob/master/release/0PluginLibrary.plugin.js"target="_blank">Click here to download ZeresPluginLibrary</a>' : ''}${a || XenoLibOutdated ? '<br/><a href="http://betterdiscord.net/ghdl/?url=https://github.com/1Lighty/BetterDiscordPlugins/blob/master/Plugins/1XenoLib.plugin.js"target="_blank">Click here to download XenoLib</a>' : ''}`);
          if (!f || !h || !g) return i();
          let j;
          const k = (() => {
            if (!global.pluginModule || !global.BDEvents) return;
            if (a || XenoLibOutdated) {
              const a = () => {
                BDEvents.off('xenolib-loaded', a), f.popWithKey(j), pluginModule.reloadPlugin(this.name);
              };
              return BDEvents.on('xenolib-loaded', a), () => BDEvents.off('xenolib-loaded', a);
            }
            const b = a => {
              'ZeresPluginLibrary' !== a || (BDEvents.off('plugin-loaded', b), BDEvents.off('plugin-reloaded', b), f.popWithKey(j), pluginModule.reloadPlugin(this.name));
            };
            return BDEvents.on('plugin-loaded', b), BDEvents.on('plugin-reloaded', b), () => (BDEvents.off('plugin-loaded', b), BDEvents.off('plugin-reloaded', b));
          })();
          class l extends BdApi.React.PureComponent {
            constructor(a) {
              super(a), (this.state = { hasError: !1 });
            }
            componentDidCatch(a, b) {
              console.error(`Error in ${this.props.label}, screenshot or copy paste the error above to Lighty for help.`), this.setState({ hasError: !0 }), 'function' == typeof this.props.onError && this.props.onError(a);
            }
            render() {
              return this.state.hasError ? null : this.props.children;
            }
          }
          j = f.push(a =>
            BdApi.React.createElement(
              l,
              {
                label: 'missing dependency modal',
                onError: () => {
                  f.popWithKey(j), i();
                }
              },
              BdApi.React.createElement(
                h,
                Object.assign(
                  {
                    header: d,
                    children: [BdApi.React.createElement(g, { color: g.Colors.PRIMARY, children: [`${e} Please click Download Now to download ${c ? 'them' : 'it'}.`] })],
                    red: !1,
                    confirmText: 'Download Now',
                    cancelText: 'Cancel',
                    onConfirm: () => {
                      k();
                      const a = require('request'),
                        b = require('fs'),
                        c = require('path'),
                        d = a => {
                          if (!global.BDEvents) return a();
                          const b = c => {
                            'ZeresPluginLibrary' !== c || (BDEvents.off('plugin-loaded', b), BDEvents.off('plugin-reloaded', b), a());
                          };
                          BDEvents.on('plugin-loaded', b), BDEvents.on('plugin-reloaded', b);
                        },
                        e = () => {
                          if (!global.pluginModule || (!global.BDEvents && !global.XenoLib)) return;
                          if ((global.XenoLib && !XenoLibOutdated) || !global.BDEvents) return pluginModule.reloadPlugin(this.name);
                          const a = () => {
                            BDEvents.off('xenolib-loaded', a), pluginModule.reloadPlugin(this.name);
                          };
                          BDEvents.on('xenolib-loaded', a);
                        },
                        f = () => (global.XenoLib && !XenoLibOutdated ? e() : void a('https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js', (a, d, f) => (a ? i() : void (e(), b.writeFile(c.join(window.ContentManager.pluginsFolder, '1XenoLib.plugin.js'), f, () => {})))));
                      !global.ZeresPluginLibrary || ZeresPluginLibraryOutdated ? a('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (a, e, g) => (a ? i() : void (d(f), b.writeFile(c.join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), g, () => {})))) : f();
                    }
                  },
                  a
                )
              )
            )
          );
        }

        start() {}
        get [Symbol.toStringTag]() {
          return 'Plugin';
        }
        get name() {
          return config.info.name;
        }
        get short() {
          let string = '';
          for (let i = 0, len = config.info.name.length; i < len; i++) {
            const char = config.info.name[i];
            if (char === char.toUpperCase()) string += char;
          }
          return string;
        }
        get author() {
          return config.info.authors.map(author => author.name).join(', ');
        }
        get version() {
          return config.info.version;
        }
        get description() {
          return config.info.description;
        }
      }
    : buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
})();

/*@end@*/
