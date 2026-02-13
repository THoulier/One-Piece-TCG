/**
 * FICHIER : index.js
 * Rôle    : Logique JavaScript pour la page index.html
 *
 * Ce fichier gère :
 * - La récupération des données des cartes
 * - La recherche de cartes
 * - L'affichage des résultats
 */

// ============================================
// 1. DONNÉES DE TEST (Temporaires)
// ============================================
// En attendant une vraie source de données, on utilise ces cartes fictives
const mockCards = [
    {
        id: 1,
        name: "Monkey D. Luffy",
        type: "Leader",
        color: "Red",
        image: "https://via.placeholder.com/200x280/FF6B6B/FFFFFF?text=Luffy"
    },
    {
        id: 2,
        name: "Roronoa Zoro",
        type: "Character",
        color: "Green",
        image: "https://via.placeholder.com/200x280/4ECDC4/FFFFFF?text=Zoro"
    },
    {
        id: 3,
        name: "Nami",
        type: "Character",
        color: "Blue",
        image: "https://via.placeholder.com/200x280/45B7D1/FFFFFF?text=Nami"
    },
    {
        id: 4,
        name: "Sanji",
        type: "Character",
        color: "Black",
        image: "https://via.placeholder.com/200x280/2C3E50/FFFFFF?text=Sanji"
    },
    {
        id: 5,
        name: "Shanks",
        type: "Leader",
        color: "Red",
        image: "https://via.placeholder.com/200x280/E74C3C/FFFFFF?text=Shanks"
    }
];

// ============================================
// 2. SÉLECTION DES ÉLÉMENTS HTML
// ============================================
// On "attrape" les éléments dont on a besoin pour interagir avec eux
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const cardsContainer = document.getElementById('cards-container');

// ============================================
// 3. FONCTIONS
// ============================================

/**
 * Affiche les cartes dans le conteneur
 * @param {Array} cards - Tableau de cartes à afficher
 */
function displayCards(cards) {
    // Vide le conteneur avant d'afficher de nouvelles cartes
    cardsContainer.innerHTML = '';

    // Si aucune carte ne correspond
    if (cards.length === 0) {
        cardsContainer.innerHTML = '<p class="placeholder">Aucune carte trouvée...</p>';
        return;
    }

    // Crée et ajoute chaque carte au conteneur
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsContainer.appendChild(cardElement);
    });
}

/**
 * Crée l'élément HTML pour une carte
 * @param {Object} card - Objet carte avec name, type, color, image
 * @returns {HTMLElement} - Élément div représentant la carte
 */
function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <img src="${card.image}" alt="${card.name}">
        <h3>${card.name}</h3>
        <p>Type: ${card.type}</p>
        <p>Couleur: ${card.color}</p>
    `;
    return div;
}

/**
 * Filtre les cartes selon le terme de recherche
 * @param {string} searchTerm - Terme recherché
 * @returns {Array} - Cartes filtrées
 */
function searchCards(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    // Si le champ est vide, affiche toutes les cartes
    if (term === '') {
        return mockCards;
    }

    // Filtre les cartes qui contiennent le terme recherché
    return mockCards.filter(card =>
        card.name.toLowerCase().includes(term) ||
        card.type.toLowerCase().includes(term) ||
        card.color.toLowerCase().includes(term)
    );
}

/**
 * Gère l'action de recherche
 */
function handleSearch() {
    const searchTerm = searchInput.value;
    const results = searchCards(searchTerm);
    displayCards(results);
}

// ============================================
// 4. ÉVÉNEMENTS (Interactions utilisateur)
// ============================================

// Quand on clique sur le bouton "Rechercher"
searchButton.addEventListener('click', handleSearch);

// Quand on appuie sur "Entrée" dans le champ de recherche
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// ============================================
// 5. INITIALISATION
// ============================================
// Affiche toutes les cartes au chargement de la page
displayCards(mockCards);

console.log('One Piece TCG - Application initialisée !');
