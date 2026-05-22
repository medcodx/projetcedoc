# Application Web d'attestation (HTML/CSS/JavaScript)

Application **100% navigateur** (sans serveur obligatoire) pour:
- Charger un fichier Excel de doctorants.
- Rechercher par `nom + prenom` ou `code_apogee`.
- Afficher les informations automatiquement (incluant CIN et CNE).
- Déduire le niveau selon la promotion, avec option de modification manuelle.
- Imprimer l'attestation avec date du jour et zone de signature directeur CEDoc.

## Fichiers
- `index.html`
- `styles.css`
- `app.js`

## Format Excel attendu
Colonnes obligatoires:
- `nom`
- `prenom`
- `code_apogee`
- `cin`
- `cne`

Colonnes optionnelles:
- `promotion` (ex: 2025)
- `filiere`

Variantes acceptées automatiquement: `prénom`, `code apogee`, `apogee`, `filière`, `code_cin`, `carte_identite`, `carte identité`, `code_cne`.

## Utilisation
Ouvrir simplement `index.html` dans un navigateur moderne (Chrome/Edge/Firefox).

Option recommandée en local (évite certaines restrictions navigateur):
```bash
python3 -m http.server 8080
```
Puis ouvrir `http://localhost:8080`.


## En-tête attestation
Le document affiche un logo d'en-tête via `assets/logo-um5-fmpr.svg` avec le texte institutionnel demandé.
Vous pouvez remplacer ce fichier par le logo officiel fourni, en gardant le même nom.
