@echo off
title Gerenciador de Ambiente - DB Constru
echo [1/2] Iniciando Back-end em nova janela...
:: Abre o backend em uma nova janela para você ver os logs de erro separadamente
start cmd /k "cd /d C:\dbconstru\backend && npm run dev"

echo [2/2] Iniciando Front-end nesta janela...
:: Roda o frontend na janela atual
cd /d C:\dbconstru\frontend
npm run dev

pause