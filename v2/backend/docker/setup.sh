#!/usr/bin/env bash
set -e

echo "==> Copiando .env.docker para .env..."
cp .env.docker .env

echo "==> Subindo containers..."
docker compose up -d --build

echo "==> Aguardando PostgreSQL ficar pronto..."
until docker compose exec postgres pg_isready -U trabalhoamigo > /dev/null 2>&1; do
  sleep 1
done

echo "==> Rodando migrations..."
docker compose exec app php artisan migrate --force

echo "==> Rodando seeders..."
docker compose exec app php artisan db:seed --force

echo ""
echo "✓ Backend rodando em http://localhost:8000"
echo "✓ PostgreSQL disponível em localhost:5432"
