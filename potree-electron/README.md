# Potree Web Packager

Application Electron Windows pour convertir un fichier LAS/LAZ en un dossier web autonome basé sur Potree, prêt à publier sur un serveur web.

## Pré-requis
- Windows 10+
- Node.js 18+ et npm
- En dev: garder le dossier `PotreeConverter` à côté de `potree-electron`

Arborescence attendue en dev:
```
E:\Outils\
  PotreeConverter\
    PotreeConverter.exe
    laszip.dll
    ...
  potree-electron\
    package.json
    main.js
    ...
```

## Développement
```bash
cd potree-electron
npm install
npm run start
```
- Choisissez un fichier `.las` ou `.laz`
- Choisissez le dossier de sortie
- Cliquez sur « Exécuter »
- Le dossier de sortie contiendra `index.html`, `metadata.json`, les données converties, et `libs/` (Potree et dépendances). Ouvrez `index.html` dans un navigateur pour prévisualiser.

## Construction d’un exécutable portable (Windows)
```bash
cd potree-electron
npm run dist
```
- Le binaire se trouvera dans `potree-electron/dist/`
- `PotreeConverter` (avec `laszip.dll` et licences) est embarqué dans les ressources de l’app

## Partage via GitHub
1. Initialiser le dépôt local, valider et pousser:
```bash
git init
git add .
git commit -m "Initial commit: app Electron Potree"
git branch -M main
git remote add origin https://github.com/<votre-compte>/<votre-repo>.git
git push -u origin main
```
2. GitHub Actions (déjà fourni) va construire un exécutable Windows portable à chaque push sur `main`. Récupérez l’artefact dans l’onglet "Actions".
3. Pour publier une Release avec binaire, créez un tag et une release dans GitHub; l’artefact peut être joint manuellement ou automatisé par un workflow ultérieur.

## Publication du dossier web
- Uploadez l’intégralité du dossier de sortie (y compris `libs/`) sur votre serveur web
- La page `index.html` inclut en pied de page une mention des projets open-source Potree et PotreeConverter (BSD 2-clause)

## Licences
- Potree & PotreeConverter: BSD 2-clause (voir `PotreeConverter/licenses/`)
- Cette app: MIT

