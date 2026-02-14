/**
 * FICHIER : api.js
 * Rôle    : Tous les appels à l'API OPTCG
 * 
 * Ce fichier centralise toute la communication avec l'API externe.
 * Si l'API change, on modifie seulement ce fichier.
 */

/**
 * Récupère toutes les cartes de tous les sets
 * @returns {Promise<Array>} - Toutes les cartes
 */
async function getAllCards() {
    // En mode développement, utilise les données mock
    if (CONFIG.DEV_MODE) {
        return await mockGetAllCards();
    }
    
    try {
        // Utilise le proxy si activé, sinon l'API directe
        const baseUrl = CONFIG.USE_PROXY ? CONFIG.PROXY_URL : CONFIG.API.BASE_URL;
        let url = `${baseUrl}/api/allSetCards/`;
        console.log(`Appel API: ${url}`);
        
        const response = await fetch(url);
        console.log(`Réponse API allSetCards:`, response.status);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Total: ${data.length} cartes chargées`);
        return data || [];
    } catch (error) {
        console.error(`Erreur lors de la récupération de toutes les cartes:`, error);
        throw error;
    }
}

/**
 * Récupère les détails d'une carte spécifique
 * @param {string} cardId - ID complet de la carte (ex: 'OP01-001')
 * @returns {Promise<Object>} - Détails de la carte
 */
async function getCardById(cardId) {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/api/sets/card/${cardId}/`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération de la carte:', error);
        throw error;
    }
}

/**
 * Récupère la liste de tous les sets disponibles
 * @returns {Promise<Array>} - Tableau des sets
 */
async function getAllSets() {
    // Les sets connus d'OPTCG (à compléter si besoin)
    const knownSets = [
        'OP01', 'OP02', 'OP03', 'OP04', 'OP05', 
        'OP06', 'OP07', 'OP08', 'OP09', 'OP10',
        'OP11', 'OP12', 'OP13', 'OP14'
    ];
    return knownSets;
}

/**
 * Recherche des cartes par nom (across tous les sets)
 * Note: L'API ne supporte pas la recherche directe, donc on fait une recherche côté client
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Array>} - Cartes correspondantes
 */
async function searchCards(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return [];
    }
    
    const term = searchTerm.toLowerCase().trim();
    const allCards = await getAllCards();
    
    return allCards.filter(card => {
        const name = (card.card_name || '').toLowerCase();
        const cardId = (card.card_id || '').toLowerCase();
        const type = (card.type || '').toLowerCase();
        const color = (card.color || '').toLowerCase();
        
        return name.includes(term) || 
               cardId.includes(term) || 
               type.includes(term) || 
               color.includes(term);
    });
}

/**
 * Récupère les cartes les plus récentes (dernier set)
 * @param {number} limit - Nombre de cartes à récupérer
 * @returns {Promise<Array>} - Cartes récentes
 */
async function getRecentCards(limit = 10) {
    try {
        // Récupère toutes les cartes et filtre par le set le plus récent
        const allCards = await getAllCards();
        
        // Trouve le set le plus récent (OP-XX le plus grand)
        const sets = [...new Set(allCards.map(card => card.set_id))];
        const latestSet = sets.sort().pop(); // Le plus grand (ex: OP-03 > OP-01)
        
        // Filtre les cartes du set le plus récent
        const recentCards = allCards.filter(card => card.set_id === latestSet);
        
        // Limite le nombre de résultats
        return recentCards.slice(0, limit);
    } catch (error) {
        console.error('Erreur lors de la récupération des cartes récentes:', error);
        return [];
    }
}
