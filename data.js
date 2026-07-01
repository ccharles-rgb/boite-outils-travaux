// Configuration des chantiers.
// Mode simple :
// 1. Cree une Google Sheet avec deux colonnes : Chantier | Adresse
// 2. Fais Fichier > Partager > Publier sur le web
// 3. Choisis la feuille, format "Valeurs separees par des virgules (.csv)"
// 4. Colle l'URL CSV ci-dessous.
window.APP_CONFIG = {
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRnt2PGTJziSCKJp8FWKikOr8wmcVdWrd03hjrAnmNvmeZvKyuc38NxrVbNKO16D7GC5ceksgRS5BY/pub?gid=0&single=true&output=csv",

  // Option avancee : URL d'une application Google Apps Script pour ajouter
  // un chantier directement depuis le site dans Google Sheets.
  googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbwitP7BrCfryzmIrb4k9remL8XnPI6pZWDeifTn8gSzcIvA4rWj907rP7Rlzwsch1sM7Q/exec"
};

// Liste de secours utilisee si aucune Google Sheet n'est configuree.
window.SITE_JOBSITES = [
  {
    name: "Chantier Centre-ville",
    address: "12 rue des Ateliers, 69000 Lyon"
  },
  {
    name: "Residence Les Jardins",
    address: "8 avenue des Platanes, 69000 Lyon"
  },
  {
    name: "Depot principal",
    address: "24 chemin de la Zone, 69000 Lyon"
  }
];
