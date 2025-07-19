// backend/src/routes/clients.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/clients.controller');
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
