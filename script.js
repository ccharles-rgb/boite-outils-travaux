const openTruckFormButton = document.querySelector("#openTruckForm");
const truckForm = document.querySelector("#truckForm");

const fields = {
  siteName: document.querySelector("#siteName"),
  siteAddress: document.querySelector("#siteAddress"),
  requestedDate: document.querySelector("#requestedDate"),
  requestedTime: document.querySelector("#requestedTime"),
  truckType: document.querySelector("#truckType"),
  rackCount: document.querySelector("#rackCount"),
  siteContact: document.querySelector("#siteContact"),
  notes: document.querySelector("#notes")
};

openTruckFormButton.addEventListener("click", () => {
  truckForm.hidden = !truckForm.hidden;

  if (!truckForm.hidden) {
    fields.siteName.focus();
  }
});

truckForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!truckForm.reportValidity()) {
    return;
  }

  const subject = `Demande de camion - ${fields.siteName.value.trim()}`;
  const body = buildEmailBody();
  // Le lien mailto ouvre Outlook ou le logiciel mail par défaut de l'utilisateur.
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
});

function buildEmailBody() {
  return [
    "Bonjour,",
    "",
    "Merci de prévoir un camion pour le chantier :",
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
