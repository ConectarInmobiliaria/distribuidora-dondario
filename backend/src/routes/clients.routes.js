// backend/src/routes/clients.routes.js
const express = require('express');
const passport = require('passport');
const ctrl = require('../controllers/clients.controller');
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/',          (req, res, next) => Promise.resolve(ctrl.list(req, res, next)).catch(next));
router.get('/:id',       (req, res, next) => Promise.resolve(ctrl.get(req, res, next)).catch(next));
router.post('/',         (req, res, next) => Promise.resolve(ctrl.create(req, res, next)).catch(next));
router.put('/:id',       (req, res, next) => Promise.resolve(ctrl.update(req, res, next)).catch(next));
router.delete('/:id',    (req, res, next) => Promise.resolve(ctrl.remove(req, res, next)).catch(next));

module.exports = router;

