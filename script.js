const personalStorageKey = "btpPersonalJobsites";
const deletedStorageKey = "btpDeletedSiteJobsites";
const appConfig = window.APP_CONFIG || {};

let siteJobsites = Array.isArray(window.SITE_JOBSITES) ? window.SITE_JOBSITES : [];
let personalJobsites = loadFromStorage(personalStorageKey, []);
let deletedSiteJobsites = loadFromStorage(deletedStorageKey, []);
let jobsites = [];

const openTruckFormButton = document.querySelector("#openTruckForm");
const truckForm = document.querySelector("#truckForm");
const jobsiteForm = document.querySelector("#jobsiteForm");
const jobsiteList = document.querySelector("#jobsiteList");
const jobsiteCount = document.querySelector("#jobsiteCount");
const tabButtons = document.querySelectorAll(".tab-button");
const appPages = document.querySelectorAll(".app-page");

const fields = {
  siteName: document.querySelector("#siteName"),
  siteAddress: document.querySelector("#siteAddress"),
  requestedDate: document.querySelector("#requestedDate"),
  requestedTime: document.querySelector("#requestedTime"),
  truckType: document.querySelector("#truckType"),
  rackCount: document.querySelector("#rackCount"),
  siteContact: document.querySelector("#siteContact"),
  notes: document.querySelector("#notes"),
  newJobsiteName: document.querySelector("#newJobsiteName"),
  newJobsiteAddress: document.querySelector("#newJobsiteAddress")
};

initializeApp();

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

openTruckFormButton.addEventListener("click", () => {
  truckForm.hidden = !truckForm.hidden;

  if (!truckForm.hidden) {
    fields.siteName.focus();
  }
});

fields.siteName.addEventListener("change", () => {
  const selectedJobsite = jobsites.find((jobsite) => jobsite.name === fields.siteName.value);
  fields.siteAddress.value = selectedJobsite ? selectedJobsite.address : "";
});

jobsiteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!jobsiteForm.reportValidity()) {
    return;
  }

  const newJobsite = {
    name: fields.newJobsiteName.value.trim(),
    address: fields.newJobsiteAddress.value.trim()
  };

  setJobsiteStatus("Ajout en cours...");

  if (appConfig.googleAppsScriptUrl) {
    await sendJobsiteToGoogleSheet(newJobsite);
    siteJobsites = await loadPublishedJobsites();
  } else {
    savePersonalJobsite(newJobsite);
  }

  jobsites = buildJobsites();
  renderJobsites();
  fillJobsiteSelect();
  jobsiteForm.reset();
  fields.newJobsiteName.focus();
});

jobsiteList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-jobsite]");

  if (!deleteButton) {
    return;
  }

  const jobsiteName = deleteButton.dataset.deleteJobsite;

  personalJobsites = personalJobsites.filter((jobsite) => jobsite.name !== jobsiteName);

  if (siteJobsites.some((jobsite) => jobsite.name === jobsiteName)) {
    deletedSiteJobsites.push(jobsiteName);
  }

  saveToStorage(personalStorageKey, personalJobsites);
  saveToStorage(deletedStorageKey, [...new Set(deletedSiteJobsites)]);
  jobsites = buildJobsites();
  renderJobsites();
  fillJobsiteSelect();
});

truckForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!truckForm.reportValidity()) {
    return;
  }

  const subject = `Demande de camion - ${fields.siteName.value.trim()}`;
  const body = buildEmailBody();
  // Le lien mailto ouvre Outlook ou le logiciel mail par defaut de l'utilisateur.
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
});

async function initializeApp() {
  setJobsiteStatus("Chargement des chantiers...");
  siteJobsites = await loadPublishedJobsites();
  jobsites = buildJobsites();
  renderJobsites();
  fillJobsiteSelect();
  setJobsiteStatus(getDataSourceMessage());
}

async function loadPublishedJobsites() {
  if (!appConfig.googleSheetCsvUrl) {
    return siteJobsites;
  }

  try {
    const response = await fetch(`${appConfig.googleSheetCsvUrl}&cacheBust=${Date.now()}`);

    if (!response.ok) {
      throw new Error("Impossible de charger la Google Sheet.");
    }

    const csvText = await response.text();
    return parseJobsitesCsv(csvText);
  } catch {
    setJobsiteStatus("Google Sheets indisponible : la liste de secours est affichee.");
    return siteJobsites;
  }
}

async function sendJobsiteToGoogleSheet(jobsite) {
  try {
    await fetch(appConfig.googleAppsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(jobsite)
    });

    savePersonalJobsite(jobsite);
    setJobsiteStatus("Chantier envoye a Google Sheets. Il apparaitra partout apres actualisation.");
  } catch {
    savePersonalJobsite(jobsite);
    setJobsiteStatus("Envoi Google Sheets impossible : chantier garde sur cet appareil.");
  }
}

function savePersonalJobsite(newJobsite) {
  const existingIndex = personalJobsites.findIndex(
    (jobsite) => jobsite.name.toLowerCase() === newJobsite.name.toLowerCase()
  );

  if (existingIndex >= 0) {
    personalJobsites[existingIndex] = newJobsite;
  } else {
    personalJobsites.push(newJobsite);
  }

  saveToStorage(personalStorageKey, personalJobsites);
  deletedSiteJobsites = deletedSiteJobsites.filter((name) => name !== newJobsite.name);
  saveToStorage(deletedStorageKey, deletedSiteJobsites);

  if (!appConfig.googleAppsScriptUrl) {
    setJobsiteStatus("Chantier ajoute sur cet appareil. Configure Apps Script pour l'ajouter partout.");
  }
}

function showPage(pageId) {
  appPages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });
}

function loadFromStorage(key, fallbackValue) {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(savedValue);
  } catch {
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function buildJobsites() {
  const visibleSiteJobsites = siteJobsites.filter(
    (jobsite) => !deletedSiteJobsites.includes(jobsite.name)
  );
  const mergedJobsites = [...visibleSiteJobsites];

  personalJobsites.forEach((personalJobsite) => {
    const existingIndex = mergedJobsites.findIndex(
      (jobsite) => jobsite.name.toLowerCase() === personalJobsite.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      mergedJobsites[existingIndex] = personalJobsite;
    } else {
      mergedJobsites.push(personalJobsite);
    }
  });

  return mergedJobsites;
}

function fillJobsiteSelect() {
  const selectedValue = fields.siteName.value;
  fields.siteName.innerHTML = '<option value="" selected disabled>Choisir un chantier</option>';

  jobsites.forEach((jobsite) => {
    const option = document.createElement("option");
    option.value = jobsite.name;
    option.textContent = jobsite.name;
    fields.siteName.appendChild(option);
  });

  fields.siteName.value = selectedValue;
}

function renderJobsites() {
  jobsiteList.innerHTML = "";
  jobsiteCount.textContent = `${jobsites.length} chantier${jobsites.length > 1 ? "s" : ""}`;

  if (jobsites.length === 0) {
    jobsiteList.innerHTML = '<p class="empty-state">Aucun chantier enregistre pour le moment.</p>';
    return;
  }

  jobsites.forEach((jobsite) => {
    const item = document.createElement("article");
    item.className = "jobsite-item";

    item.innerHTML = `
      <div>
        <strong>${escapeHtml(jobsite.name)}</strong>
        <address>${escapeHtml(jobsite.address)}</address>
      </div>
      <button class="delete-button" type="button" data-delete-jobsite="${escapeHtml(jobsite.name)}" aria-label="Masquer ${escapeHtml(jobsite.name)}">
        🗑️
      </button>
    `;

    jobsiteList.appendChild(item);
  });
}

function parseJobsitesCsv(csvText) {
  const rows = parseCsvRows(csvText);
  const [, ...dataRows] = rows;

  return dataRows
    .map((row) => ({
      name: (row[0] || "").trim(),
      address: (row[1] || "").trim()
    }))
    .filter((jobsite) => jobsite.name && jobsite.address);
}

function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function setJobsiteStatus(message) {
  const status = document.querySelector("#jobsiteStatus");

  if (status) {
    status.textContent = message;
  }
}

function getDataSourceMessage() {
  if (appConfig.googleSheetCsvUrl && appConfig.googleAppsScriptUrl) {
    return "Chantiers synchronises avec Google Sheets.";
  }

  if (appConfig.googleSheetCsvUrl) {
    return "Chantiers lus depuis Google Sheets. L'ajout direct necessite Apps Script.";
  }

  return "Mode local : ajoute l'URL Google Sheets dans data.js pour partager la liste.";
}

function buildEmailBody() {
  return [
    "Bonjour,",
    "",
    "Merci de prevoir un camion pour le chantier :",
    "",
    `Chantier : ${fields.siteName.value.trim()}`,
    `Adresse : ${fields.siteAddress.value.trim()}`,
    `Date : ${formatFrenchDate(fields.requestedDate.value)}`,
    `Heure : ${fields.requestedTime.value}`,
    `Type de camion : ${fields.truckType.value}`,
    `Nombre de racks : ${fields.rackCount.value.trim()}`,
    `Contact chantier : ${fields.siteContact.value.trim()}`,
    `Remarques : ${fields.notes.value.trim()}`,
    "",
    "Merci."
  ].join("\n");
}

function formatFrenchDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
