/**
 * FICHIER : config.js
 * Rôle    : Configuration globale de l'application
 * 
 * Ce fichier centralise toutes les constantes et URLs.
 * Facile à modifier si l'API change ou si on veut ajouter des options.
 */

const CONFIG = {
    // Mode de développement (utilise les données mock pour éviter CORS)
    DEV_MODE: false,
    
    // Mode proxy (utilise un serveur local pour contourner CORS)
    USE_PROXY: true,
    PROXY_URL: 'http://localhost:3000',
    
    // API OPTCG - Configuration
    API: {
        BASE_URL: 'https://optcgapi.com',
        ENDPOINTS: {
            SETS: '/sets',
            CARDS: '/cards',
            CARD_DETAIL: (cardId) => `/sets/card/${cardId}/`
        }
    },
    
    // Stockage local
    STORAGE: {
        COLLECTION_KEY: 'optcg_collection',
        FAVORITES_KEY: 'optcg_favorites'
    },
    
    // Paramètres d'affichage
    DISPLAY: {
        CARDS_PER_PAGE: 20,
        FEATURED_COUNT: 10  // Nombre de cartes affichées sur la page d'accueil
    }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
