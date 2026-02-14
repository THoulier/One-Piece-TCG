/**
 * FICHIER : collection.js
 * Rôle    : Logique de la page de collection
 * 
 * Fonctionnalités :
 * - Affichage de toutes les cartes de la collection
 * - Statistiques (nombre, valeur, sets)
 * - Recherche et tri dans la collection
 * - Suppression de cartes
 * - Export de la collection
 */

// Variables globales
let collection = [];      // Collection complète
let displayedCards = [];  // Cartes affichées (après filtre/tri)
let sortField = 'date'; // Champ de tri actuel
let sortAsc = false;    // Ordre croissant/décroissant

// Éléments DOM
const totalCardsEl = document.getElementById('total-cards');
const totalValueEl = document.getElementById('total-value');
const setsCountEl = document.getElementById('sets-count');
const collectionContainer = document.getElementById('collection-container');
const searchInput = document.getElementById('collection-search');
const sortSelect = document.getElementById('sort-by');
const sortOrderBtn = document.getElementById('sort-order');
const filterSetSelect = document.getElementById('filter-collection-set');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page de collection initialisée');
    
    loadCollection();
    setupEventListeners();
    populateSetFilter();
});

/**
 * Charge la collection depuis le stockage
 */
function loadCollection() {
    collection = getCollection();
    displayedCards = [...collection];
    
    updateStats();
    displayCollection();
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Recherche dans la collection
    searchInput.addEventListener('input', debounce(filterCollection, 300));
    
    // Tri
    sortSelect.addEventListener('change', (e) => {
        sortField = e.target.value;
        sortAndDisplay();
    });
    
    // Ordre de tri
    sortOrderBtn.addEventListener('click', () => {
        sortAsc = !sortAsc;
        sortOrderBtn.textContent = sortAsc ? '↓' : '↑';
        sortAndDisplay();
    });
    
    // Filtre par set
    filterSetSelect.addEventListener('change', filterCollection);
    
    // Export
    exportBtn.addEventListener('click', exportCollectionData);
    
    // Vider la collection
    clearBtn.addEventListener('click', clearAllCollection);
}

// ============================================
// AFFICHAGE ET STATISTIQUES
// ============================================

/**
 * Met à jour les statistiques affichées
 */
function updateStats() {
    // Nombre total de cartes
    totalCardsEl.textContent = collection.length;
    
    // Valeur totale estimée
    const totalValue = collection.reduce((sum, card) => {
        return sum + (parseFloat(card.price) || 0);
    }, 0);
    totalValueEl.textContent = formatPrice(totalValue);
    
    // Nombre de sets différents
    const uniqueSets = new Set(collection.map(card => card.set));
    setsCountEl.textContent = uniqueSets.size;
}

/**
 * Affiche les cartes de la collection
 */
function displayCollection() {
    collectionContainer.innerHTML = '';
    
    if (displayedCards.length === 0) {
        const message = collection.length === 0 
            ? 'Votre collection est vide. Allez dans la page "Recherche" pour ajouter des cartes !'
            : 'Aucune carte ne correspond à votre recherche.';
        showEmpty(collectionContainer, message);
        return;
    }
    
    displayedCards.forEach(card => {
        const cardElement = createCollectionCardElement(card);
        collectionContainer.appendChild(cardElement);
    });
}

/**
 * Crée un élément carte pour la collection
 */
function createCollectionCardElement(card) {
    const cardId = card.id || card.card_id;
    const isFav = isFavorite(cardId);
    
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.cardId = cardId;
    
    // Image
    const img = document.createElement('img');
    img.src = card.image_url || 'https://via.placeholder.com/200x280?text=No+Image';
    img.alt = card.name || 'Carte';
    
    // Actions (favori + suppression)
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    
    // Bouton favori
    const favBtn = document.createElement('button');
    favBtn.className = `card-action-btn btn-favorite ${isFav ? 'active' : ''}`;
    favBtn.innerHTML = isFav ? '★' : '☆';
    favBtn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
    favBtn.addEventListener('click', () => toggleCardFavorite(card));
    
    // Bouton suppression
    const removeBtn = document.createElement('button');
    removeBtn.className = 'card-action-btn btn-remove';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Supprimer de la collection';
    removeBtn.addEventListener('click', () => removeCard(card));
    
    actions.appendChild(favBtn);
    actions.appendChild(removeBtn);
    
    // Informations
    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
        <h3>${formatCardName(card.name || 'Carte sans nom')}</h3>
        <p class="card-id">${card.id}</p>
        <span class="card-type">${card.type || 'Type inconnu'}</span>
        <span class="card-color" data-color="${card.color || 'Unknown'}">${card.color || '?'}</span>
        <span class="card-rarity">${card.rarity || '?'}</span>
        <span class="card-set">${card.setName || card.set || 'Set inconnu'}</span>
        ${card.price ? `<p class="card-price">${formatPrice(card.price)}</p>` : ''}
        <p class="card-date-added">Ajoutée le ${formatDate(card.dateAdded)}</p>
    `;
    
    div.appendChild(actions);
    div.appendChild(img);
    div.appendChild(info);
    
    return div;
}

// ============================================
// FILTRAGE ET TRI
// ============================================

/**
 * Filtre la collection selon la recherche et le set sélectionné
 */
function filterCollection() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedSet = filterSetSelect.value;
    
    displayedCards = collection.filter(card => {
        // Filtre par recherche
        if (searchTerm) {
            const searchFields = [
                card.name,
                card.id || card.card_id,
                card.type,
                card.color
            ].map(field => (field || '').toLowerCase());
            
            const matchesSearch = searchFields.some(field => field.includes(searchTerm));
            if (!matchesSearch) return false;
        }
        
        // Filtre par set
        if (selectedSet && card.set !== selectedSet) return false;
        
        return true;
    });
    
    sortAndDisplay();
}

/**
 * Trie et affiche les cartes
 */
function sortAndDisplay() {
    displayedCards.sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
            case 'name':
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
            case 'set':
                comparison = (a.set || '').localeCompare(b.set || '');
                break;
            case 'price':
                comparison = (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                break;
            case 'date':
            default:
                const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
                const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
                comparison = dateA - dateB;
                break;
        }
        
        return sortAsc ? comparison : -comparison;
    });
    
    displayCollection();
}

/**
 * Remplit le filtre des sets avec les sets présents dans la collection
 */
function populateSetFilter() {
    const uniqueSets = [...new Set(collection.map(card => card.set))].sort();
    
    // Garde seulement l'option "Tous les sets"
    filterSetSelect.innerHTML = '<option value="">Tous les sets</option>';
    
    // Ajoute les sets présents dans la collection
    uniqueSets.forEach(set => {
        const option = document.createElement('option');
        option.value = set;
        option.textContent = set;
        filterSetSelect.appendChild(option);
    });
}

// ============================================
// ACTIONS SUR LES CARTES
// ============================================

/**
 * Toggle favori sur une carte
 */
function toggleCardFavorite(card) {
    const cardId = card.id || card.card_id;
    const isFav = toggleFavorite(cardId);
    
    // Met à jour l'affichage
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardElement) {
        const favBtn = cardElement.querySelector('.btn-favorite');
        favBtn.innerHTML = isFav ? '★' : '☆';
        favBtn.classList.toggle('active', isFav);
        favBtn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }
}

/**
 * Supprime une carte de la collection
 */
function removeCard(card) {
    if (confirm(`Voulez-vous vraiment supprimer "${card.name}" de votre collection ?`)) {
        const cardId = card.id || card.card_id;
        const removed = removeCardFromCollection(cardId);
        
        if (removed) {
            loadCollection(); // Recharge l'affichage
            populateSetFilter(); // Met à jour les filtres
        }
    }
}

// ============================================
// ACTIONS GLOBALES
// ============================================

/**
 * Exporte la collection en JSON
 */
function exportCollectionData() {
    if (collection.length === 0) {
        alert('Votre collection est vide, rien à exporter.');
        return;
    }
    
    const data = exportCollection();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ma-collection-onepiece-tcg-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

/**
 * Vide toute la collection
 */
function clearAllCollection() {
    if (collection.length === 0) {
        alert('Votre collection est déjà vide.');
        return;
    }
    
    if (confirm('ATTENTION ! Cette action supprimera TOUTES les cartes de votre collection. Êtes-vous sûr ?')) {
        clearCollection();
        loadCollection();
        populateSetFilter();
        alert('Votre collection a été vidée.');
    }
}
