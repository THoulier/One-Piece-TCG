/**
 * FICHIER : storage.js
 * Rôle    : Gestion du stockage local (localStorage)
 * 
 * Ce fichier gère la persistance des données :
 * - Collection de cartes de l'utilisateur
 * - Favoris
 * 
 * Le localStorage permet de conserver les données même après fermeture du navigateur.
 */

/**
 * Récupère la collection de cartes depuis le localStorage
 * @returns {Array} - Tableau de cartes dans la collection
 */
function getCollection() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE.COLLECTION_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Erreur lors de la lecture de la collection:', error);
        return [];
    }
}

/**
 * Sauvegarde la collection dans le localStorage
 * @param {Array} collection - Tableau de cartes à sauvegarder
 */
function saveCollection(collection) {
    try {
        localStorage.setItem(CONFIG.STORAGE.COLLECTION_KEY, JSON.stringify(collection));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la collection:', error);
    }
}

/**
 * Ajoute une carte à la collection
 * @param {Object} card - Carte à ajouter
 * @returns {boolean} - True si ajouté, False si déjà présent
 */
function addCardToCollection(card) {
    const collection = getCollection();
    const cardId = card.id || card.card_id;
    
    // Vérifie si la carte est déjà dans la collection
    if (isCardInCollection(cardId, collection)) {
        return false;
    }
    
    // Ajoute la carte avec la date d'ajout
    const cardWithDate = {
        ...card,
        dateAdded: new Date().toISOString()
    };
    
    collection.push(cardWithDate);
    saveCollection(collection);
    return true;
}

/**
 * Supprime une carte de la collection
 * @param {string} cardId - ID de la carte à supprimer
 * @returns {boolean} - True si supprimé, False sinon
 */
function removeCardFromCollection(cardId) {
    const collection = getCollection();
    const initialLength = collection.length;
    
    const newCollection = collection.filter(card => 
        (card.id || card.card_id) !== cardId
    );
    
    if (newCollection.length < initialLength) {
        saveCollection(newCollection);
        return true;
    }
    return false;
}

/**
 * Récupère les cartes favorites
 * @returns {Array} - Tableau des IDs de cartes favorites
 */
function getFavorites() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE.FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Erreur lors de la lecture des favoris:', error);
        return [];
    }
}

/**
 * Ajoute ou retire une carte des favoris
 * @param {string} cardId - ID de la carte
 * @returns {boolean} - True si maintenant favori, False sinon
 */
function toggleFavorite(cardId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(cardId);
    
    if (index === -1) {
        // Ajoute aux favoris
        favorites.push(cardId);
        localStorage.setItem(CONFIG.STORAGE.FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    } else {
        // Retire des favoris
        favorites.splice(index, 1);
        localStorage.setItem(CONFIG.STORAGE.FAVORITES_KEY, JSON.stringify(favorites));
        return false;
    }
}

/**
 * Vérifie si une carte est dans les favoris
 * @param {string} cardId - ID de la carte
 * @returns {boolean} - True si favori
 */
function isFavorite(cardId) {
    const favorites = getFavorites();
    return favorites.includes(cardId);
}

/**
 * Récupère les cartes favorites avec leurs détails complets
 * @returns {Array} - Cartes favorites avec toutes leurs données
 */
function getFavoriteCards() {
    const collection = getCollection();
    const favoriteIds = getFavorites();
    
    return collection.filter(card => 
        favoriteIds.includes(card.id || card.card_id)
    );
}

/**
 * Exporte la collection en JSON (pour backup)
 * @returns {string} - Collection au format JSON
 */
function exportCollection() {
    const collection = getCollection();
    return JSON.stringify(collection, null, 2);
}

/**
 * Importe une collection depuis JSON
 * @param {string} jsonString - Collection au format JSON
 * @returns {boolean} - True si import réussi
 */
function importCollection(jsonString) {
    try {
        const collection = JSON.parse(jsonString);
        if (Array.isArray(collection)) {
            saveCollection(collection);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erreur lors de l\'import de la collection:', error);
        return false;
    }
}

/**
 * Efface toute la collection (⚠️ Attention !)
 */
function clearCollection() {
    localStorage.removeItem(CONFIG.STORAGE.COLLECTION_KEY);
    localStorage.removeItem(CONFIG.STORAGE.FAVORITES_KEY);
}

/**
 * Compte le nombre de cartes dans la collection
 * @returns {number} - Nombre de cartes
 */
function getCollectionCount() {
    return getCollection().length;
}
