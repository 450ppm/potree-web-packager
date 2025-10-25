(() => {
	const $ = (id) => document.getElementById(id);

	// Charger le logo 450ppm si disponible
	window.api.getLogoPath().then((p) => {
		if (p) {
			const img = $('logo');
			img.src = p;
			img.classList.remove('d-none');
		}
	});
	$('browseLas').addEventListener('click', async () => {
		const fp = await window.api.chooseLas();
		if (fp) $('las').value = fp;
	});
	$('browseOut').addEventListener('click', async () => {
		const dir = await window.api.chooseOutDir();
		if (dir) $('out').value = dir;
	});
	$('run').addEventListener('click', async () => {
		const lasPath = $('las').value.trim();
		const outDir = $('out').value.trim();
		const title = $('title').value.trim();
		if (!lasPath) { appendLog('Veuillez choisir un fichier LAS/LAZ.'); return; }
		if (!outDir) { appendLog('Veuillez choisir un dossier de sortie.'); return; }
		appendLog('Démarrage de la conversion...');
		try {
			await window.api.runConvert({ lasPath, outDir, title });
			appendLog('Terminé. Ouvrez index.html dans le dossier de sortie pour prévisualiser.');
		} catch (e) {
			var msg = (e && e.message) ? e.message : String(e);
			appendLog('Erreur: ' + msg);
		}
	});

	function appendLog(line) {
		const el = $('log');
		el.textContent += (line + '\n');
		el.scrollTop = el.scrollHeight;
	}

	window.api.onLog((line) => appendLog(line));
})();


