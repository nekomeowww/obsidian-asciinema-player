import { App, Plugin, Notice, TFolder, WorkspaceLeaf, Setting, PluginSettingTab, Vault } from 'obsidian'

import CastView from  './castView'
import { t } from './locales/helpers';

const onlineAsciinemaPlayerScriptURL = 'https://cdnjs.cloudflare.com/ajax/libs/asciinema-player/2.6.1/asciinema-player.min.js'
const onlineAsciinemaPlayerStyleURL = 'https://cdnjs.cloudflare.com/ajax/libs/asciinema-player/2.6.1/asciinema-player.min.css'

const offlineAsciinemaPlayerScriptName = 'asciinema-player.js'
const offlineAsciinemaPlayerStyleName = 'asciinema-player.css'

const fetchAndWrite = async (uri: string, filepath: string, vault: Vault): Promise<void> => {
	try {
		const res = await fetch(uri)
		const fetchedContent = await res.text()
		const exist = await vault.adapter.exists(filepath)
		if (exist) await vault.adapter.write(filepath, fetchedContent)
		else await vault.create(filepath, fetchedContent)
	} catch (err) {
		throw err
	}
}

const createJSAndCSSFiles = async (pluginPath: string, playerJSPath: string, playerCSSPath: string, vault: Vault) => {
	const dirExist = await vault.adapter.exists(pluginPath + '/lib')
	if (!dirExist) await vault.adapter.mkdir(pluginPath + '/lib')

	try {
		await fetchAndWrite('https://cdnjs.cloudflare.com/ajax/libs/asciinema-player/2.6.1/asciinema-player.css', playerCSSPath, vault)
		await fetchAndWrite('https://cdnjs.cloudflare.com/ajax/libs/asciinema-player/2.6.1/asciinema-player.js', playerJSPath, vault)
	} catch(err) {
		new Notice(t('InitializationFailedNotice').replace('%s', t('EnableOfflineSupport')))
		console.error(err)
	} 
}

interface AsciinemaPlayerSettings {
	enableOfflineSupport: boolean;
	firstRun: boolean;
}

const DEFAULT_SETTINGS: AsciinemaPlayerSettings = {
	enableOfflineSupport: false,
	firstRun: false
}

export default class AsciinemaPlayerPlugin extends Plugin {
	settings: AsciinemaPlayerSettings;

	async onload() {
		try {
			await this.loadSettings();
			this.addSettingTab(new AsciinemaPlayerSettingTab(this.app, this));
			this.registerView('asciicasts', (leaf: WorkspaceLeaf) => new CastView(leaf))
			this.registerExtensions(['cast'], 'asciicasts')

			const pluginPath = this.app.vault.configDir + '/plugins' + '/obsidian-asciinema-player'
			const playerJSPath = pluginPath + '/lib/' + offlineAsciinemaPlayerScriptName
			const playerCSSPath = pluginPath  + '/lib/'+ offlineAsciinemaPlayerStyleName

			if (!this.settings.firstRun) {
				await createJSAndCSSFiles(pluginPath, playerJSPath, playerCSSPath, this.app.vault)
				this.settings.firstRun = true
				await this.saveSettings()
			}

			let cssElement: any
			let jsElement: HTMLScriptElement
			if (this.settings.enableOfflineSupport) {				
				// check
				let playerJSContent = ''
				let playerCSSContent = ''

				try {
					this.app.vault.adapter.stat(playerJSPath)
					playerJSContent = await this.app.vault.adapter.read(playerJSPath)
					this.app.vault.adapter.stat(playerCSSPath)
					playerCSSContent = await this.app.vault.adapter.read(playerCSSPath)
				} catch(err) {
					new Notice('files of obsidian-asciinema-player is corrupted, please reinstall plugin to fix it', err)
					console.error(err)
				}

				if (playerJSContent === '' || playerCSSContent === '') {
					new Notice('files of obsidian-asciinema-player is corrupted, please reinstall plugin to fix it')
					return
				}

				cssElement = document.createElement('style')
				cssElement.innerHTML = playerCSSContent
				cssElement.id = 'asciinema-player-css'

				jsElement = document.createElement('script')
				jsElement.innerHTML = playerJSContent
				jsElement.id = 'asciinema-player-js'
			} else {
				cssElement = document.createElement('link')
				cssElement = (cssElement as HTMLLinkElement)
				cssElement.href = onlineAsciinemaPlayerStyleURL
				cssElement.rel = 'stylesheet'
				cssElement.id = 'asciinema-player-css'

				jsElement = document.createElement('script')
				jsElement.src = onlineAsciinemaPlayerScriptURL
				jsElement.id = 'asciinema-player-js'
			}

			// css
			const head = document.querySelectorAll('head')
			if (head[0] && !document.getElementById('asciinema-player-css')) {
				head[0].appendChild(cssElement)
			}
			// body
			const body = document.querySelectorAll('body')
			if (body[0] && !document.getElementById('asciinema-player-js') && (document.createElement('asciinema-player').constructor === HTMLUnknownElement || document.createElement('asciinema-player').constructor === HTMLElement)) {
				body[0].appendChild(jsElement)
			}

			this.registerMarkdownPostProcessor((el: HTMLElement) => {
				el.querySelectorAll("img").forEach((img) => {
					const matched = img.src.match(/asciinema:(?<filepath>.*\.cast)/)
					if (matched) {
						const allKnownFiles = this.app.vault.getFiles()
						const allKnownFilePaths = allKnownFiles.map((file) => file.path)
						const currentActiveFile = this.app.workspace.getActiveFile()

						const castPath = matched.groups?.filepath
						const allParents = getParent(currentActiveFile.parent)
						const searchingPaths = allParents.reverse().map(item => {
							return item + '/' + castPath
						})
						let foundCastPath = ''
						searchingPaths.forEach(item => {
							const index = allKnownFilePaths.indexOf(item)
							if (index !== -1) {
								foundCastPath = allKnownFilePaths[index]
							}
						})

						// create player
						img.src = ''
						img.innerHTML = ''
						img.outerHTML = foundCastPath !== '' 
							? `<asciinema-player src="${this.app.vault.adapter.getResourcePath(foundCastPath)}"></asciinema-player>`
							: '<div class="asciinema-player-file-not-found"><span>asciinema-player: ' + castPath +  ' ' + t('FileNotFound') + '</span></div>'
						if (foundCastPath !== '') {
							console.log(`asciinema-player ${this.app.vault.adapter.getResourcePath(foundCastPath)} created...`)
						}
					}
				});
			});
		} catch(err) {
			new Notice('asciinema-player ' + t('EncounteredAnUnkownError') +  '', err)
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

const getParent = (parent: TFolder) : Array<string> => {
	if ((parent.path === '/' || parent.path === '\\') || !parent.parent) {
		return []
	} else {
		var parents = getParent(parent.parent)
		parents.push(parent.path)
		return parents
	}
}

class AsciinemaPlayerSettingTab extends PluginSettingTab {
	plugin: AsciinemaPlayerPlugin;

	constructor(app: App, plugin: AsciinemaPlayerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: t('PluginSettings')});

		new Setting(containerEl)
			.setName(t('EnableOfflineSupport'))
			.setDesc(t('OfflineSupportOptionDesp'))
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.enableOfflineSupport)
				toggle.onChange(async value => {
					this.plugin.settings.enableOfflineSupport = value;

					if (value) {
						const pluginPath = this.app.vault.configDir + '/plugins' + '/obsidian-asciinema-player'
						const playerJSPath = pluginPath + '/lib/' + offlineAsciinemaPlayerScriptName
						const playerCSSPath = pluginPath  + '/lib/'+ offlineAsciinemaPlayerStyleName
						try {
							await createJSAndCSSFiles(pluginPath, playerJSPath, playerCSSPath, this.app.vault)
						} catch(err) {
							new Notice(t('AssetsDownloadFailedNotice'))
							console.error(err)
						}
					}
					
					await this.plugin.saveSettings();
				})
			})
	}
}
