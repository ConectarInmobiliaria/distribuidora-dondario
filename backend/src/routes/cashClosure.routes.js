// backend/src/routes/cashClosure.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/cashClosure.controller');
const router = express.Router();

router.use(passport.authenticate('jwt',{ session:false }));

router.post('/', ctrl.create);  // genera cierre
router.get('/', ctrl.list);     // lista cierres

module.exports = router;
