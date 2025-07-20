module.exports = {
  apps: [{
    name: 'dondario-backend',
    script: 'src/index.js',
    cwd: '/var/www/dondario/backend',
    env: { NODE_ENV: 'production' },
    watch: true,         // en producción mantenlo en false
  }]
};
