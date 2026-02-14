/**
 * FICHIER : index.js
 * Rôle    : Logique de la page d'accueil
 * 
 * Fonctionnalités :
 * - Affichage des cartes favorites (featured)
 * - Affichage d'un aperçu de la collection (10 dernières cartes)
 * - Liens rapides vers les autres pages
 */

// Éléments DOM
const featuredContainer = document.getElementById('featured-container');
const previewContainer = document.getElementById('preview-container');

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page d\'accueil initialisée');
    
    loadFeaturedCards();
    loadCollectionPreview();
});

// ============================================
// CARTES FAVORITES (FEATURED)
// ============================================

/**
 * Charge et affiche les cartes favorites
 */
function loadFeaturedCards() {
    const favorites = getFavoriteCards();
    const limit = CONFIG.DISPLAY.FEATURED_COUNT;
    
    // Prend les 10 premières cartes favorites (ou moins si pas assez)
    const featuredCards = favorites.slice(0, limit);
    
    featuredContainer.innerHTML = '';
    
    if (featuredCards.length === 0) {
        showEmpty(featuredContainer, 'Aucune carte favorite. Ajoutez des cartes à vos favoris depuis votre collection !');
        return;
    }
    
    featuredCards.forEach(card => {
        const cardElement = createFeaturedCardElement(card);
        featuredContainer.appendChild(cardElement);
    });
}

/**
 * Crée un élément carte pour la section featured
 */
function createFeaturedCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.position = 'relative';
    
    // Badge favori
    const badge = document.createElement('div');
    badge.className = 'favorite-badge';
    badge.innerHTML = '★';
    badge.title = 'Carte favorite';
    
    // Image
    const img = document.createElement('img');
    img.src = card.image_url || 'https://via.placeholder.com/200x280?text=No+Image';
    img.alt = card.name || 'Carte';
    img.loading = 'lazy';
    
    // Informations
    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
        <h3>${formatCardName(card.name || 'Carte sans nom')}</h3>
        <p class="card-id">${card.id || card.card_id || 'ID inconnu'}</p>
        <span class="card-type">${card.type || 'Type inconnu'}</span>
        ${card.price ? `<p class="card-price">${formatPrice(card.price)}</p>` : ''}
    `;
    
    div.appendChild(badge);
    div.appendChild(img);
    div.appendChild(info);
    
    return div;
}

// ============================================
// APERÇU DE LA COLLECTION
// ============================================

/**
 * Charge et affiche un aperçu de la collection (10 dernières cartes)
 */
function loadCollectionPreview() {
    const collection = getCollection();
    const limit = CONFIG.DISPLAY.FEATURED_COUNT;
    
    // Prend les 10 dernières cartes ajoutées
    const recentCards = collection
        .sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0))
        .slice(0, limit);
    
    previewContainer.innerHTML = '';
    
    if (recentCards.length === 0) {
        showEmpty(previewContainer, 'Votre collection est vide. Commencez à ajouter des cartes !');
        return;
    }
    
    recentCards.forEach(card => {
        const cardElement = createPreviewCardElement(card);
        previewContainer.appendChild(cardElement);
    });
}

/**
 * Crée un élément carte pour l'aperçu de la collection
 */
function createPreviewCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    
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
        <p class="card-id">${card.card_set_id}</p>
        <span class="card-type">${card.card_type || 'Type inconnu'}</span>
        <span class="card-color" data-color="${card.card_color || 'Unknown'}">${card.card_color || '?'}</span>
        ${card.market_price ? `<p class="card-price">${formatPrice(card.market_price)}</p>` : ''}
    `;
    
    div.appendChild(img);
    div.appendChild(info);
    
    return div;
}
