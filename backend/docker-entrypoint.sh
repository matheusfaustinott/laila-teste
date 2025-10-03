#!/bin/sh
echo "iniciando script pra garantir que o banco esteja pronto e as migrations também"
while ! nc -z db 5432; do sleep 2; done
echo "db laila conectado!"
sleep 3

echo "Executando migrações..."
node -e "
const { AppDataSource } = require('./dist/database/db');

AppDataSource.initialize().then(async () => {
  console.log('Conectado ao banco!');

  // Executar migrações
  const migrations = await AppDataSource.runMigrations();
  console.log('Migrações executadas:', migrations.length);

  await AppDataSource.destroy();
  console.log('sucesso!');
}).catch(error => {
  console.error('Erro nas migrações:', error);
  process.exit(1);
});
"

echo "api: http://localhost:3001"
echo "_docs: http://localhost:3001/api/info"

exec node dist/server.js
