import fs from 'fs';
import path from 'path';
import { Plugin, Notice, TFolder, WorkspaceLeaf } from 'obsidian'

import CastView from  './castView'
import { t } from './locales/helpers';

export default class MyPlugin extends Plugin {
	async onload() {
		this.registerView('asciicasts', (leaf: WorkspaceLeaf) => {
			return new CastView(leaf)
		})
		this.registerExtensions(['cast'], 'asciicasts')

		const vaultRoot = this.app.vault.getRoot()
		const vaultBase = (vaultRoot.vault.adapter as any).basePath
		const pluginPath = path.resolve(vaultBase, this.app.vault.configDir, 'plugins', 'obsidian-asciinema-player')
		const playerJSPath = path.resolve(pluginPath, 'lib', 'asciinema-player.js')
		const playerCSSPath = path.resolve(pluginPath, 'lib', 'asciinema-player.css')
		
		// check
		new Notice('检查数据...')
		let playerJSContent = ''
		let playerCSSContent = ''
		try {
			fs.statSync(playerJSPath)
			playerJSContent = fs.readFileSync(playerJSPath).toString('utf-8')
			fs.statSync(playerCSSPath)
			playerCSSContent = fs.readFileSync(playerCSSPath).toString('utf-8')
		} catch(err) {
			new Notice('asciinema file corrupted', err)
			console.error(err)
		}

		this.registerMarkdownPostProcessor((el: HTMLElement) => {
            el.querySelectorAll("img").forEach((img) => {
				const matched = img.src.match(/asciinema:(?<filepath>.*\.cast)/)
				if (matched) {
					// css
					const head = document.querySelectorAll('head')
					if (head[0]) {
						const css = document.createElement('link')
						css.rel = 'stylesheet'
						css.type = 'text/css'
						css.innerHTML = playerCSSContent
						css.id = 'asciinema-player-css'
						head[0].appendChild(css)
					}
					// body
					const body = document.querySelectorAll('body')
					if (body[0] && (document.createElement('asciinema-player').constructor === HTMLUnknownElement || document.createElement('asciinema-player').constructor === HTMLElement)) {
						const script = document.createElement('script')
						script.innerHTML = playerJSContent
						script.id = 'asciinema-player-js'
						body[0].appendChild(script)
					}

					const allKnownFiles = this.app.vault.getFiles()
					const allKnownFilePaths = allKnownFiles.map((file) => file.path)
					const currentActiveFile = this.app.workspace.getActiveFile()

					const castPath = matched.groups?.filepath
					const allParents = getParent(currentActiveFile.parent)
					const searchingPaths = allParents.reverse().map(item => {
						return path.join(item, castPath)
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
						? `<asciinema-player src="app://local${path.resolve(vaultBase, foundCastPath)}"></asciinema-player>`
						: '<div class="asciinema-player-file-not-found"><span>asciinema-player: ' + castPath +  ' ' + t('FileNotFound') + '</span></div>'
				}
            });
        });
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
