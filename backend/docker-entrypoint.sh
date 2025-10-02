#!/bin/sh
echo "iniciando script pra garantir que o banco esteja pronto e as migrations também"
while ! nc -z db 5432; do sleep 2; done
echo "db laila conectado!"
sleep 3
npm run migration:run 2>/dev/null || {
  npx typeorm-ts-node-commonjs migration:generate src/database/migrations/InitialSchema -d src/database/db.ts
  npm run migration:run
}
echo "api: http://localhost:3001"
echo "_docs: http://localhost:3001/api/info"

exec node dist/server.js
