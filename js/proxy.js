
/**
 * FICHIER : proxy.js
 * Rôle    : Serveur proxy pour contourner CORS
 * 
 * Lance ce serveur avec : node proxy.js
 * Il fera les appels API pour toi et les renverra à ton navigateur
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware CORS
app.use(cors());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('.'));

// Proxy vers l'API OPTCG
const optcgProxy = createProxyMiddleware({
    target: 'https://optcgapi.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api', // Garde le chemin /api
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.url} → https://optcgapi.com${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY] Réponse ${proxyRes.statusCode} pour ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error(`[PROXY] Erreur:`, err.message);
        res.status(500).json({ error: 'Erreur de proxy', details: err.message });
    }
});

// Route de proxy pour l'API OPTCG
app.use('/api', optcgProxy);

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'Proxy OPTCG API actif',
        usage: 'Utilisez /api/sets/OP01/ au lieu de https://optcgapi.com/api/sets/OP01/',
        example: 'http://localhost:3000/api/sets/OP01/',
        website: 'Accès au site: http://localhost:3000/html/'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur complet démarré sur http://localhost:${PORT}`);
    console.log(`🌐 Site web: http://localhost:${PORT}/html/`);
    console.log(`� Proxy API: http://localhost:${PORT}/api/sets/OP01/`);
    console.log(`\n✅ Un seul terminal suffit !\n`);
});

module.exports = app;
