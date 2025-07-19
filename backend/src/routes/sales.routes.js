// backend/src/routes/sales.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/sales.controller');
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
router.post('/items/:itemId/return', ctrl.returnItem);

module.exports = router;
