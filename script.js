const URL_FORM_SORTIE = "https://app.notion.com/p/39335c74b4be8089bd7fd56004d1f356?pvs=106";
const URL_FORM_RETOUR = "https://app.notion.com/p/39335c74b4be8015afe2db619438e3c2?pvs=106";
const URL_FORM_PROBLEME = "https://app.notion.com/p/39335c74b4be806286abc0346dbf6650?pvs=106";
const URL_NOTION_MATERIEL = "https://app.notion.com/p/Mat-riel-39335c74b4be80f5ac3dd50b5de707cd?source=copy_link";
const URL_NOTION_MOUVEMENTS = "https://app.notion.com/p/39335c74b4be80d4b4f3ce150c01cea3?v=39335c74b4be80cabff2000c2272c794&source=copy_link";

const materiels = [
  { nom: "Visseuse Hilti", statut: "Disponible au d\u00e9p\u00f4t" },
  { nom: "Boulonneuse", statut: "Sortie chantier B" },
  { nom: "Perforateur SDS", statut: "SAV \u00e0 contr\u00f4ler" },
  { nom: "Laser rotatif", statut: "Disponible au d\u00e9p\u00f4t" }
];

const liens = {
  sortie: URL_FORM_SORTIE,
  retour: URL_FORM_RETOUR,
  probleme: URL_FORM_PROBLEME,
  materiel: URL_NOTION_MATERIEL,
  mouvements: URL_NOTION_MOUVEMENTS
};

const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
const equipmentList = document.querySelector("#equipmentList");
const closeSearch = document.querySelector("#closeSearch");

function ouvrirLien(cle) {
  const url = liens[cle];

  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function afficherRecherche() {
  searchPanel.hidden = false;
  afficherMateriels("");
  searchInput.focus();
  searchPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function afficherMateriels(terme) {
  const recherche = terme.trim().toLowerCase();
  const resultats = materiels.filter((materiel) =>
    materiel.nom.toLowerCase().includes(recherche)
  );

  equipmentList.innerHTML = "";

  if (resultats.length === 0) {
    const item = document.createElement("li");
    item.innerHTML = "<strong>Aucun r\u00e9sultat</strong><span>Essayez un autre mot-cl\u00e9.</span>";
    equipmentList.appendChild(item);
    return;
  }

  resultats.forEach((materiel) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${materiel.nom}</strong><span>${materiel.statut}</span>`;
    equipmentList.appendChild(item);
  });
}

document.querySelectorAll("[data-link]").forEach((button) => {
  button.addEventListener("click", () => ouvrirLien(button.dataset.link));
});

document.querySelector("[data-action='search']").addEventListener("click", afficherRecherche);

closeSearch.addEventListener("click", () => {
  searchPanel.hidden = true;
  searchInput.value = "";
});

searchInput.addEventListener("input", (event) => {
  afficherMateriels(event.target.value);
});
