// backend/src/routes/reports.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/reports.controller');
const router = express.Router();

router.use(passport.authenticate('jwt',{ session:false }));

// sólo admin puede ver todos; sellers sólo sus ventas/comisiones
router.get('/sales', ctrl.salesByPeriod);
router.get('/products', ctrl.topProducts);
router.get('/commissions', ctrl.commissions);

module.exports = router;
