const express = require('express');
const path = require('path');
const app = express();

// ... otros middlewares y rutas ...

// Servir el favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// ... resto del código ... 