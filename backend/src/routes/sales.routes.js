// backend/src/routes/sales.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/sales.controller');

const router = express.Router();

// todas protegidas
router.use(passport.authenticate('jwt', { session: false }));

// Listar ventas
router.get('/', ctrl.list);

// Obtener venta por id
router.get('/:id', ctrl.get);

// Crear nueva venta
router.post('/', ctrl.create);

// Eliminar venta
router.delete('/:id', ctrl.remove);

// Registrar devolución de un ítem de venta
router.post('/items/:itemId/return', ctrl.returnItem);

module.exports = router;
