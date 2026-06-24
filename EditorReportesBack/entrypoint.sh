#!/bin/sh
set -e

echo "🔄 Sincronizando esquema de base de datos..."
npx typeorm schema:sync -d dist/config/typeorm.config.js 2>&1

echo "🚀 Iniciando servidor..."
exec node dist/index.js
