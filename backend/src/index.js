// backend/src/index.js
require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./auth/auth.routes');



const app = express();
app.use(morgan('combined')); 
app.use(cors());
app.use(express.json());

// Inicializar Passport
require('./auth/passport')(passport);
app.use(passport.initialize());

// Rutas públicas
app.use('/api/auth', authRoutes);

app.use('/api/zones', require('./routes/zones.routes'));

app.use('/api/sellers', require('./routes/sellers.routes'));

app.use('/api/clients', require('./routes/clients.routes'));

app.use('/api/products', require('./routes/products.routes'));
// Rutas de Ventas
app.use('/api/sales', require('./routes/sales.routes'));

app.use('/api/deliverers', require('./routes/deliverers.routes'));

app.use('/api/batches', require('./routes/deliveryBatches.routes'));

app.use('/api/closures', require('./routes/cashClosure.routes'));

app.use('/api/reports', require('./routes/reports.routes'));

// Ejemplo de ruta protegida para admins
app.use(
  '/api/admin',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    // verifica que el usuario tenga rol 'admin'
    const roles = req.user.modelHasRoles.map(m => m.role.name);
    if (!roles.includes('admin')) return res.status(403).json({ error: 'No autorizado' });
    next();
  },
  require('./routes/admin.routes') // crea este router luego
);

app.get('/', (req, res) => res.json({ message: 'API Don Darío OK' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
app.use((err, req, res, next) => {
  console.error(err.stack);                // sale en pm2 logs
  res.status(500).json({                    // responde JSON con mensaje y stack (en dev)
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});