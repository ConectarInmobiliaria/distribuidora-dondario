#!/bin/bash
# fix-products.sh
# Script para actualizar el archivo products.controller.js en el servidor VPN

# Configuración
SSH_USER="root"
SSH_PORT="5488"
SSH_HOST="149.50.149.142"
PROJECT_PATH="/root/dondario/backend/src/controllers"
LOCAL_FILE="/home/milton/proyectos/dondario/backend/src/controllers/products.controller.js"

echo "📦 Subiendo archivo $LOCAL_FILE a $SSH_HOST..."
scp -P $SSH_PORT "$LOCAL_FILE" "$SSH_USER@$SSH_HOST:$PROJECT_PATH/"

echo "✅ Archivo actualizado en el servidor."

echo "🔄 Reiniciando backend en el servidor..."
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "pm2 restart backend"

echo "🚀 Listo. El backend está corriendo con el archivo actualizado."

