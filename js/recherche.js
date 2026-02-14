/**
 * FICHIER : recherche.js
 * Rôle    : Logique de la page de recherche
 * 
 * Fonctionnalités :
 * - Recherche de cartes via l'API
 * - Filtres par set, couleur, type
 * - Ajout de cartes à la collection
 */

// Variables globales pour la page
let allCards = [];      // Toutes les cartes chargées
let filteredCards = []; // Cartes après filtrage
let currentSearch = ''; // Terme de recherche actuel

// Éléments DOM
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const cardsContainer = document.getElementById('cards-container');
const resultsCount = document.getElementById('results-count');

// Filtres
const filterSet = document.getElementById('filter-set');
const filterColor = document.getElementById('filter-color');
const filterType = document.getElementById('filter-type');

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page de recherche initialisée');
    
    // Configure les événements
    setupEventListeners();
    
    // Charge toutes les cartes en arrière-plan
    await loadAllCards();
});

/**
 * Configure tous les écouteurs d'événements
 */
function setupEventListeners() {
    // Recherche au clic sur le bouton
    searchButton.addEventListener('click', performSearch);
    
    // Recherche en appuyant sur Entrée
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Recherche en temps réel (avec debounce)
    searchInput.addEventListener('input', debounce(() => {
        if (searchInput.value.length >= 2) {
            performSearch();
        }
    }, 500));
    
    // Filtres
    filterSet.addEventListener('change', applyFilters);
    filterColor.addEventListener('change', applyFilters);
    filterType.addEventListener('change', applyFilters);
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

/**
 * Charge toutes les cartes de tous les sets
 */
async function loadAllCards() {
    showLoading(cardsContainer);
    
    try {
        allCards = await getAllCards();
        console.log(`${allCards.length} cartes chargées`);
        
        // Affiche un message si aucune carte n'est chargée
        if (allCards.length === 0) {
            showEmpty(cardsContainer, 'Aucune carte disponible. Vérifiez votre connexion internet.');
        } else {
            showEmpty(cardsContainer, 'Utilisez la barre de recherche pour trouver des cartes...');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des cartes:', error);
        showError(cardsContainer, 'Impossible de charger les cartes. Vérifiez votre connexion internet.');
    }
}

// ============================================
// RECHERCHE ET FILTRES
// ============================================

/**
 * Effectue la recherche de cartes
 */
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    currentSearch = searchTerm;
    
    // Si moins de 2 caractères et pas de filtres actifs, ne fait rien
    if (searchTerm.length < 2 && !hasActiveFilters()) {
        showEmpty(cardsContainer, 'Tapez au moins 2 caractères pour rechercher...');
        resultsCount.textContent = '';
        return;
    }
    
    // Filtre les cartes
    applyFilters();
}

/**
 * Vérifie si des filtres sont actifs
 */
function hasActiveFilters() {
    return filterSet.value || filterColor.value || filterType.value;
}

/**
 * Applique les filtres sur les cartes
 */
function applyFilters() {
    const setFilter = filterSet.value;
    
    // Filtre les cartes
    filteredCards = allCards.filter(card => {
        // Filtre par terme de recherche
        if (currentSearch.length >= 2) {
            const searchFields = [
                card.card_name,
                card.card_set_id,
                card.card_type,
                card.card_color,
                card.set_name,
                card.rarity
            ].map(field => (field || '').toLowerCase());
            
            const matchesSearch = searchFields.some(field => field.includes(currentSearch));
            if (!matchesSearch) return false;
        }
        
        // Filtre par set
        if (setFilter && card.set_id !== setFilter && card.set_id !== setFilter.replace('OP', 'OP-')) return false;
        
        return true;
    });
    
    // Affiche les résultats
    displayResults();
}

/**
 * Affiche les cartes filtrées
 */
function displayResults() {
    // Met à jour le compteur
    const count = filteredCards.length;
    resultsCount.textContent = count > 0 ? `${count} carte(s) trouvée(s)` : '';
    
    // Vide le conteneur
    cardsContainer.innerHTML = '';
    
    // Affiche un message si aucun résultat
    if (count === 0) {
        showEmpty(cardsContainer, 'Aucune carte ne correspond à votre recherche.');
        return;
    }
    
    // Récupère la collection pour marquer les cartes déjà présentes
    const collection = getCollection();
    
    // Crée et affiche chaque carte
    filteredCards.forEach(card => {
        const cardElement = createSearchCardElement(card, collection);
        cardsContainer.appendChild(cardElement);
    });
}

/**
 * Crée un élément carte avec bouton d'ajout
 */
function createSearchCardElement(card, collection) {
    const cardId = card.card_set_id;
    const isInCollection = isCardInCollection(cardId, collection);
    
    const div = document.createElement('div');
    div.className = `card ${isInCollection ? 'in-collection' : ''}`;
    div.dataset.cardId = cardId;
    
    // Image
    const img = document.createElement('img');
    img.src = card.card_image || 'https://via.placeholder.com/200x280?text=No+Image';
    img.alt = card.card_name || 'Carte';
    img.loading = 'lazy';
    
    // Informations
    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
        <h3>${formatCardName(card.card_name || 'Carte sans nom')}</h3>
        <p class="card-id">${cardId}</p>
        <span class="card-type">${card.card_type || 'Type inconnu'}</span>
        <span class="card-color" data-color="${card.card_color || 'Unknown'}">${card.card_color || '?'}</span>
        <span class="card-rarity">${card.rarity || '?'}</span>
        ${card.market_price ? `<p class="card-price">${formatPrice(card.market_price)}</p>` : ''}
    `;
    
    // Bouton d'ajout (seulement si pas déjà dans la collection)
    if (!isInCollection) {
        const addButton = document.createElement('button');
        addButton.className = 'add-to-collection';
        addButton.innerHTML = '+';
        addButton.title = 'Ajouter à ma collection';
        addButton.addEventListener('click', () => addCard(card));
        div.appendChild(addButton);
    }
    
    div.appendChild(img);
    div.appendChild(info);
    
    return div;
}

// ============================================
// GESTION DE LA COLLECTION
// ============================================

/**
 * Ajoute une carte à la collection
 */
function addCard(card) {
    const cardToAdd = {
        id: card.card_set_id,
        name: card.card_name,
        type: card.card_type,
        color: card.card_color,
        rarity: card.rarity,
        set: card.set_id,
        setName: card.set_name,
        image: card.card_image,
        price: card.market_price,
        dateAdded: new Date().toISOString()
    };
    
    const success = addCardToCollection(cardToAdd);
    
    if (success) {
        // Met à jour l'affichage de la carte
        const cardElement = document.querySelector(`[data-card-id="${card.card_set_id}"]`);
        if (cardElement) {
            cardElement.classList.add('in-collection');
            const addButton = cardElement.querySelector('.add-to-collection');
            if (addButton) {
                addButton.remove();
            }
        }
        
        // Message de confirmation (optionnel, peut être remplacé par un toast)
        console.log(`Carte ${card.card_name} ajoutée à la collection`);
    } else {
        console.log('Carte déjà dans la collection');
    }
}
