const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 640,
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js')
		}
	});

	mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

function resolveConverterExe() {
	// En dev: PotreeConverter dans le repo parent. En prod: dans resources.
	const devPath = path.resolve(__dirname, '..', 'PotreeConverter', 'PotreeConverter.exe');
	const prodPath = path.resolve(process.resourcesPath || '', 'PotreeConverter', 'PotreeConverter.exe');
	if (fs.existsSync(devPath)) return devPath;
	if (fs.existsSync(prodPath)) return prodPath;
	return null;
}

function copyWebTemplate(toDir) {
	const base = fs.existsSync(path.resolve(__dirname, '..', 'PotreeConverter'))
		? path.resolve(__dirname, '..', 'PotreeConverter')
		: path.resolve(process.resourcesPath || '', 'PotreeConverter');
	const templateDir = path.join(base, 'resources', 'page_template');
	const destLibs = path.join(toDir, 'libs');
	if (!fs.existsSync(destLibs)) fs.mkdirSync(destLibs, { recursive: true });

	// copie récursive simple
	function copyRecursive(src, dst) {
		if (!fs.existsSync(src)) return;
		const stat = fs.statSync(src);
		if (stat.isDirectory()) {
			if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
			for (const entry of fs.readdirSync(src)) {
				copyRecursive(path.join(src, entry), path.join(dst, entry));
			}
		} else {
			fs.copyFileSync(src, dst);
		}
	}

	copyRecursive(path.join(templateDir, 'libs'), destLibs);
}

function writeIndexHtml(outDir, title, footerHtml) {
	var html = '';
	html += '<!DOCTYPE html>\n';
	html += '<html lang="fr">\n';
	html += '<head>\n';
	html += '\t<meta charset="utf-8">\n';
	html += '\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
	html += '\t<title>' + (title || 'Potree Viewer') + '</title>\n';
	html += '\t<link rel="stylesheet" type="text/css" href="./libs/potree/potree.css">\n';
	html += '\t<link rel="stylesheet" type="text/css" href="./libs/jquery-ui/jquery-ui.min.css">\n';
	html += '\t<link rel="stylesheet" type="text/css" href="./libs/openlayers3/ol.css">\n';
	html += '\t<link rel="stylesheet" type="text/css" href="./libs/spectrum/spectrum.css">\n';
	html += '\t<link rel="stylesheet" type="text/css" href="./libs/jstree/themes/mixed/style.css">\n';
	html += '\t<style>body,html{height:100%;margin:0}.footer{position:fixed;left:0;right:0;bottom:0;padding:6px 10px;background:rgba(0,0,0,.5);color:#fff;font:12px/1.4 sans-serif} .footer a{color:#9ad}</style>\n';
	html += '</head>\n';
	html += '<body>\n';
	html += '\t<div class="potree_container" style="position:absolute;width:100%;height:100%;left:0;top:0">\n';
	html += '\t\t<div id="potree_render_area" style="height:100%"></div>\n';
	html += '\t\t<div id="potree_sidebar_container"></div>\n';
	html += '\t</div>\n';
	html += '\t<div class="footer">' + footerHtml + '</div>\n';
	html += '\t<script src="./libs/jquery/jquery-3.1.1.min.js"></script>\n';
	html += '\t<script src="./libs/spectrum/spectrum.js"></script>\n';
	html += '\t<script src="./libs/jquery-ui/jquery-ui.min.js"></script>\n';
	html += '\t<script src="./libs/other/BinaryHeap.js"></script>\n';
	html += '\t<script src="./libs/tween/tween.min.js"></script>\n';
	html += '\t<script src="./libs/d3/d3.js"></script>\n';
	html += '\t<script src="./libs/proj4/proj4.js"></script>\n';
	html += '\t<script src="./libs/openlayers3/ol.js"></script>\n';
	html += '\t<script src="./libs/i18next/i18next.js"></script>\n';
	html += '\t<script src="./libs/jstree/jstree.js"></script>\n';
	html += '\t<script src="./libs/potree/potree.js"></script>\n';
	html += '\t<script src="./libs/plasio/js/laslaz.js"></script>\n';
	html += '\t<script>\n';
	html += '\t\tvar viewer = new Potree.Viewer(document.getElementById(\'potree_render_area\'));\n';
	html += '\t\tviewer.setEDLEnabled(true);\n';
	html += '\t\tviewer.setFOV(60);\n';
	html += '\t\tviewer.setPointBudget(2000000);\n';
	html += '\t\tviewer.loadGUI(function () {\n';
	html += '\t\t\tviewer.setLanguage(\'fr\');\n';
	html += '\t\t});\n';
	html += '\t\tPotree.loadPointCloud(\'./metadata.json\').then(function (e) {\n';
	html += '\t\t\tviewer.scene.addPointCloud(e.pointcloud);\n';
	html += '\t\t\tviewer.fitToScreen();\n';
	html += '\t\t});\n';
	html += '\t</script>\n';
	html += '</body>\n';
	html += '</html>';
	fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

ipcMain.handle('choose-las', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		title: 'Choisir un fichier .las',
		filters: [{ name: 'LAS', extensions: ['las', 'laz'] }],
		properties: ['openFile']
	});
	if (result.canceled || result.filePaths.length === 0) return null;
	return result.filePaths[0];
});

ipcMain.handle('choose-outdir', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		title: 'Choisir le dossier de sortie',
		properties: ['openDirectory', 'createDirectory']
	});
	if (result.canceled || result.filePaths.length === 0) return null;
	return result.filePaths[0];
});

ipcMain.handle('run-convert', async (event, { lasPath, outDir, title }) => {
	const exe = resolveConverterExe();
	if (!exe) {
		throw new Error('PotreeConverter.exe introuvable');
	}

	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

	copyWebTemplate(outDir);

	const footer = 'Construit avec <a href="https://github.com/potree/potree" target="_blank" rel="noreferrer">Potree</a> et <a href="https://github.com/potree/PotreeConverter" target="_blank" rel="noreferrer">PotreeConverter</a>.';
	writeIndexHtml(outDir, title, footer);

	return new Promise((resolve, reject) => {
		const args = [lasPath, '-o', outDir];
		const child = spawn(exe, args, { windowsHide: true });

		child.stdout.on('data', data => {
			mainWindow.webContents.send('log', data.toString());
		});
		child.stderr.on('data', data => {
			mainWindow.webContents.send('log', data.toString());
		});
		child.on('error', err => reject(err));
		child.on('close', code => {
			if (code === 0) resolve({ ok: true });
			else reject(new Error('Conversion échouée, code ' + code));
		});
	});
});

ipcMain.handle('get-logo', async () => {
	// Recherche d'un logo 450ppm.* dans différents emplacements probables
	try {
		const searchRoots = [
			path.resolve(__dirname, '..'),
			process.cwd(),
			'E:\\Outils'
		];
		const candidates = ['450ppm.png', '450ppm.jpg', '450ppm.jpeg', '450ppm.svg'];
		for (const root of searchRoots) {
			for (const name of candidates) {
				const full = path.join(root, name);
				if (fs.existsSync(full)) {
					return pathToFileURL(full).toString();
				}
			}
		}
		return null;
	} catch (e) {
		return null;
	}
});


