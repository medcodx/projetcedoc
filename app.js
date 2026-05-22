const state = {
  rows: [],
};

const REQUIRED_COLUMNS = ["nom", "prenom", "code_apogee", "cin", "cne"];

function normalizeHeader(value) {
  const raw = String(value || "").trim().toLowerCase();
  const map = {
    prénom: "prenom",
    "code apogee": "code_apogee",
    apogee: "code_apogee",
    filière: "filiere",
    code_cin: "cin",
    carte_identite: "cin",
    "carte identité": "cin",
    code_cne: "cne",
  };
  return map[raw] || raw;
}

function normalizeRow(row) {
  const normalized = {};
  Object.keys(row).forEach((k) => {
    normalized[normalizeHeader(k)] = row[k];
  });
  return normalized;
}

function inferNiveau(promotion) {
  if (!promotion) return "1ère année";

  const currentYear = new Date().getFullYear();
  const p = Number(promotion);
  if (Number.isNaN(p)) return "1ère année";

  const delta = currentYear - p;
  if (delta <= 0) return "1ère année";
  if (delta === 1) return "2ème année";
  if (delta === 2) return "3ème année";
  return "4ème année ou plus";
}

function setMessage(text, kind = "info") {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.className = `message ${kind}`;
}

function clean(value) {
  return String(value ?? "").trim();
}

function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const first = workbook.SheetNames[0];
        const sheet = workbook.Sheets[first];
        const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const rows = jsonRows.map(normalizeRow);
        resolve(rows);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function validateColumns(rows) {
  if (!rows.length) return "Le fichier est vide.";
  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length) {
    return `Colonnes manquantes: ${missing.join(", ")}`;
  }
  return null;
}

function renderAttestation(row, niveau) {
  const section = document.getElementById("attestation");
  const infos = document.getElementById("infos");

  infos.innerHTML = "";
  const items = [
    ["Nom", clean(row.nom)],
    ["Prénom", clean(row.prenom)],
    ["Code Apogée", clean(row.code_apogee)],
    ["CIN", clean(row.cin) || "Non renseigné"],
    ["CNE", clean(row.cne) || "Non renseigné"],
    ["Promotion", clean(row.promotion) || "Non renseignée"],
    ["Filière", clean(row.filiere) || "Non renseignée"],
    ["Niveau", niveau],
  ];

  items.forEach(([label, value]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${label}:</strong> ${value}`;
    infos.appendChild(li);
  });

  const today = new Date();
  const dateText = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
  document.getElementById("attestationDate").textContent = `Fait à Rabat le ${dateText}`;

  section.classList.remove("hidden");
}

document.getElementById("excelFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const rows = await readExcel(file);
    const error = validateColumns(rows);
    if (error) {
      state.rows = [];
      setMessage(error, "error");
      return;
    }

    state.rows = rows;
    setMessage(`Fichier chargé avec succès (${rows.length} lignes).`, "success");
  } catch {
    setMessage("Impossible de lire ce fichier Excel.", "error");
  }
});

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!state.rows.length) {
    setMessage("Chargez d'abord un fichier Excel.", "error");
    return;
  }

  const nom = clean(document.getElementById("nom").value).toLowerCase();
  const prenom = clean(document.getElementById("prenom").value).toLowerCase();
  const code = clean(document.getElementById("codeApogee").value).toLowerCase();
  const niveauChoisi = document.getElementById("niveau").value;

  let result = [];
  if (code) {
    result = state.rows.filter((r) => clean(r.code_apogee).toLowerCase() === code);
  } else {
    result = state.rows.filter((r) => {
      const okNom = nom ? clean(r.nom).toLowerCase() === nom : true;
      const okPrenom = prenom ? clean(r.prenom).toLowerCase() === prenom : true;
      return okNom && okPrenom;
    });
  }

  if (!result.length) {
    setMessage("Aucun doctorant trouvé.", "error");
    document.getElementById("attestation").classList.add("hidden");
    return;
  }

  const doctorant = result[0];
  const niveauFinal = niveauChoisi || inferNiveau(doctorant.promotion);
  renderAttestation(doctorant, niveauFinal);
  setMessage("Doctorant trouvé. Vous pouvez imprimer l'attestation.", "success");
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});
