## Potree Web Packager

➡️ Télécharger et lancer l’application Windows (ZIP): [Releases](https://github.com/450ppm/potree-web-packager/releases)

Application Electron pour convertir un fichier LAS/LAZ en dossier web Potree prêt à publier (avec mention open‑source en pied de page).

### Téléchargement
- Releases (stables et pré‑release):
  - [Page Releases](https://github.com/450ppm/potree-web-packager/releases)
  - Note: la pré‑release « continuous » apparaît après la première build Actions (push sur `main`).

### Utilisation (Windows)
1. Téléchargez l’archive ZIP et décompressez‑la.
2. Lancez l’exécutable.
3. Dans l’application:
   - Choisissez un fichier `.las`/`.laz`.
   - Choisissez le dossier de sortie (où créer le site web).
   - Cliquez sur « Exécuter ».
4. Le dossier de sortie contient `index.html`, `metadata.json`, les données et `libs/`. Uploadez l’intégralité du dossier sur votre serveur web.

### Caractéristiques
- Intègre Potree et PotreeConverter; copie automatique du template web et génération d’un `index.html` prêt à l’emploi.
- Pied de page avec mention des projets open‑source.
- Interface sombre (fond noir) avec Bootstrap; logo `450ppm` affiché automatiquement si `450ppm.png/.jpg/.jpeg/.svg` est présent à la racine.

### Construction locale (optionnel)
```bash
cd potree-electron
npm install
npm start     # lancer en dev
npm run dist  # construire l’exécutable portable
```

### Intégration continue
- À chaque push sur `main`, GitHub Actions construit l’exécutable et publie:
  - un artefact téléchargeable;
  - une pré‑release « continuous » (ZIP + EXE).

### Licences
- Potree & PotreeConverter: BSD 2‑clause (voir `PotreeConverter/licenses/`).
- Cette application: MIT (voir `LICENSE`).
