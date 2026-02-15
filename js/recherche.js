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
let suggestions = [];   // Suggestions d'autocomplétion
let selectedSuggestionIndex = -1; // Index de la suggestion sélectionnée
let searchActive = false; // État de la recherche (pour afficher le bouton reset)

// Éléments DOM
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resetButton = document.getElementById('reset-button');
const cardsContainer = document.getElementById('cards-container');
const resultsCount = document.getElementById('results-count');
const suggestionsContainer = document.getElementById('search-suggestions');

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
    searchButton.addEventListener('click', () => {
        searchActive = true;
        performSearch();
    });
    
    // Réinitialisation de la recherche
    resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clic sur bouton reset détecté');
        resetSearch();
    });
    
    // Recherche en appuyant sur Entrée
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Entrée détectée - lancement recherche');
            searchActive = true;
            performSearch();
        }
    });
    
    // Perte du focus du champ (corrigé pour ne pas cacher le bouton reset)
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            // Ne cache le bouton que si aucune recherche n'est active
            if (!searchActive && !hasActiveFilters()) {
                updateResetButtonVisibility();
            }
        }, 150);
    });
    
    // Événements pour l'autocomplétion
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleKeyNavigation);
    
    // Cliquer sur une suggestion (approche simplifiée)
    suggestionsContainer.addEventListener('mousedown', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            e.preventDefault();
            console.log('Clic sur suggestion détecté');
            selectSuggestion(item);
        }
    });
    
    // Filtres
    filterSet.addEventListener('change', () => {
        searchActive = true;
        updateResetButtonVisibility();
    });
    filterColor.addEventListener('change', () => {
        searchActive = true;
        updateResetButtonVisibility();
    });
    filterType.addEventListener('change', () => {
        searchActive = true;
        updateResetButtonVisibility();
    });
}

// ============================================
// AUTOCOMPLÉTION
// ============================================

/**
 * Gère l'entrée de recherche et affiche les suggestions
 */
function handleSearchInput() {
    const value = searchInput.value.trim();
    
    if (value.length < 2) {
        hideSuggestions();
        return;
    }
    
    // Génère les suggestions
    suggestions = generateSuggestions(value);
    
    if (suggestions.length > 0) {
        showSuggestions();
    } else {
        hideSuggestions();
    }
}

/**
 * Génère les suggestions de cartes
 */
function generateSuggestions(searchTerm) {
    const term = searchTerm.toLowerCase();
    const maxSuggestions = 8;
    
    return allCards
        .filter(card => {
            const name = (card.card_name || '').toLowerCase();
            const cardId = (card.card_set_id || '').toLowerCase();
            
            return name.includes(term) || cardId.includes(term);
        })
        .sort((a, b) => {
            // Priorité aux noms qui commencent par le terme
            const aName = (a.card_name || '').toLowerCase();
            const bName = (b.card_name || '').toLowerCase();
            
            const aStarts = aName.startsWith(term);
            const bStarts = bName.startsWith(term);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            return aName.localeCompare(bName);
        })
        .slice(0, maxSuggestions);
}

/**
 * Affiche les suggestions
 */
function showSuggestions() {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.add('active');
    
    suggestions.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.dataset.index = index;
        
        div.innerHTML = `
            <span class="suggestion-name">${card.card_name}</span>
            <span class="suggestion-details">${card.card_set_id} • ${card.set_name}</span>
        `;
        
        suggestionsContainer.appendChild(div);
    });
    
    selectedSuggestionIndex = -1;
}

/**
 * Cache les suggestions
 */
function hideSuggestions() {
    suggestionsContainer.classList.remove('active');
    suggestionsContainer.innerHTML = '';
    selectedSuggestionIndex = -1;
}

/**
 * Gère la navigation au clavier dans les suggestions
 */
function handleKeyNavigation(e) {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');
    
    if (items.length === 0) return;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
            updateSelectedSuggestion(items);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSelectedSuggestion(items);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                selectSuggestion(items[selectedSuggestionIndex]);
            } else {
                performSearch();
            }
            break;
            
        case 'Escape':
            hideSuggestions();
            break;
    }
}

/**
 * Met à jour la suggestion sélectionnée
 */
function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

/**
 * Sélectionne une suggestion
 */
function selectSuggestion(item) {
    console.log('Sélection de suggestion cliquée:', item);
    
    const index = parseInt(item.dataset.index);
    const card = suggestions[index];
    
    if (!card) {
        console.error('Carte non trouvée pour index:', index);
        return;
    }
    
    console.log('Carte sélectionnée:', card.card_name);
    
    // Met à jour le champ de recherche
    searchInput.value = card.card_name;
    currentSearch = card.card_name.toLowerCase();
    
    // Marque la recherche comme active (pour afficher le bouton reset)
    searchActive = true;
    updateResetButtonVisibility();
    
    // Cache les suggestions
    hideSuggestions();
    
    // Force la recherche avec un petit délai
    setTimeout(() => {
        applyFilters();
    }, 50);
}

/**
 * Réinitialise la recherche
 */
function resetSearch() {
    console.log('Réinitialisation de la recherche');
    console.log('searchInput:', searchInput);
    console.log('resetButton:', resetButton);
    console.log('cardsContainer:', cardsContainer);
    
    // Vide le champ de recherche
    if (searchInput) {
        searchInput.value = '';
        console.log('Champ de recherche vidé');
    }
    
    currentSearch = '';
    
    // Réinitialise l'état de recherche
    searchActive = false;
    
    // Cache les suggestions
    hideSuggestions();
    
    // Cache le bouton de réinitialisation
    if (resetButton) {
        resetButton.classList.remove('visible');
        console.log('Bouton reset caché');
    }
    
    // Réinitialise les filtres
    if (filterSet) filterSet.value = '';
    if (filterColor) filterColor.value = '';
    if (filterType) filterType.value = '';
    
    // Vide les résultats
    filteredCards = [];
    
    // Affiche le message par défaut
    if (cardsContainer) {
        showEmpty(cardsContainer, 'Utilisez la barre de recherche pour trouver des cartes...');
        console.log('Message par défaut affiché');
    }
    
    if (resultsCount) {
        resultsCount.textContent = '';
    }
    
    console.log('Réinitialisation terminée');
}

/**
 * Met à jour la visibilité du bouton de réinitialisation
 */
function updateResetButtonVisibility() {
    if (searchActive || hasActiveFilters()) {
        resetButton.classList.add('visible');
    } else {
        resetButton.classList.remove('visible');
    }
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
    
    // Met à jour la visibilité du bouton de réinitialisation
    updateResetButtonVisibility();
    
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
