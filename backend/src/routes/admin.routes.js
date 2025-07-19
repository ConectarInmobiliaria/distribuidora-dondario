// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();

// Ruta de prueba para admin
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta admin test OK', user: req.user });
});

module.exports = router;

