/**
 * FICHIER : utils.js
 * Rôle    : Fonctions utilitaires réutilisables
 * 
 * Ce fichier contient des fonctions qui servent dans plusieurs pages.
 * Évite de répéter le même code partout.
 */

/**
 * Formate un prix en euros
 * @param {number} price - Prix en nombre
 * @returns {string} - Prix formaté (ex: "12.50 €")
 */
function formatPrice(price) {
    if (!price || price === 0) return 'Prix non disponible';
    return `${parseFloat(price).toFixed(2)} €`;
}

/**
 * Formate un nom de carte (met la première lettre en majuscule)
 * @param {string} name - Nom de la carte
 * @returns {string} - Nom formaté
 */
function formatCardName(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Crée un élément HTML pour afficher une carte
 * @param {Object} card - Objet carte avec toutes ses propriétés
 * @returns {HTMLElement} - Élément div représentant la carte
 */
function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.cardId = card.id || card.card_id;
    
    // Image de la carte
    const img = document.createElement('img');
    img.src = card.image_url || 'https://via.placeholder.com/200x280?text=No+Image';
    img.alt = card.name || 'Carte';
    img.loading = 'lazy'; // Charge l'image seulement quand visible
    
    // Informations de la carte
    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
        <h3>${formatCardName(card.name || 'Carte sans nom')}</h3>
        <p class="card-id">${card.id || card.card_id || 'ID inconnu'}</p>
        <p class="card-type">${card.type || 'Type inconnu'}</p>
        <p class="card-color" data-color="${card.color || 'Unknown'}">${card.color || 'Couleur inconnue'}</p>
        ${card.price ? `<p class="card-price">${formatPrice(card.price)}</p>` : ''}
    `;
    
    div.appendChild(img);
    div.appendChild(info);
    
    return div;
}

/**
 * Affiche un message de chargement dans un conteneur
 * @param {HTMLElement} container - Élément HTML où afficher le message
 */
function showLoading(container) {
    container.innerHTML = '<p class="loading">Chargement en cours...</p>';
}

/**
 * Affiche un message d'erreur
 * @param {HTMLElement} container - Élément HTML où afficher l'erreur
 * @param {string} message - Message d'erreur
 */
function showError(container, message = 'Une erreur est survenue.') {
    container.innerHTML = `<p class="error">${message}</p>`;
}

/**
 * Affiche un message quand il n'y a pas de résultats
 * @param {HTMLElement} container - Élément HTML où afficher le message
 * @param {string} message - Message personnalisé
 */
function showEmpty(container, message = 'Aucune carte trouvée.') {
    container.innerHTML = `<p class="placeholder">${message}</p>`;
}

/**
 * Débounce - Limite les appels fréquents (utile pour la recherche en temps réel)
 * @param {Function} func - Fonction à exécuter
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function} - Fonction avec debounce
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Vérifie si une carte est déjà dans la collection
 * @param {string} cardId - ID de la carte
 * @param {Array} collection - Tableau de cartes
 * @returns {boolean} - True si la carte existe déjà
 */
function isCardInCollection(cardId, collection) {
    return collection.some(card => card.id === cardId || card.card_id === cardId);
}
