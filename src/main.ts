import { Plugin, Notice, TFolder, WorkspaceLeaf } from 'obsidian'

import CastView from  './castView'
import { t } from './locales/helpers';

export default class AsciinemaPlayerPlugin extends Plugin {
	async onload() {
		try {
			this.registerView('asciicasts', (leaf: WorkspaceLeaf) => new CastView(leaf))
			this.registerExtensions(['cast'], 'asciicasts')

			const pluginPath = this.app.vault.configDir + '/plugins' + '/obsidian-asciinema-player'
			const playerJSPath = pluginPath + '/lib' + '/asciinema-player.js'
			const playerCSSPath = pluginPath + '/lib' + '/asciinema-player.css'
			
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

			// css
			const head = document.querySelectorAll('head')
			if (head[0] && !document.getElementById('asciinema-player-css')) {
				const css = document.createElement('style')
				css.innerHTML = playerCSSContent
				css.id = 'asciinema-player-css'
				head[0].appendChild(css)
			}
			// body
			const body = document.querySelectorAll('body')
			if (body[0] && !document.getElementById('asciinema-player-js') && (document.createElement('asciinema-player').constructor === HTMLUnknownElement || document.createElement('asciinema-player').constructor === HTMLElement)) {
				const script = document.createElement('script')
				script.innerHTML = playerJSContent
				script.id = 'asciinema-player-js'
				body[0].appendChild(script)
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
