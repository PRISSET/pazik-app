#!/bin/bash

# Скрипт для деплоя на сервер Ubuntu

# IP-адрес сервера
SERVER_IP="3.124.193.36"

# Путь к приватному ключу
KEY_PATH="~/key.pem"

# Сначала собираем проект
npm install
npm run build

# Копируем файлы на сервер
scp -i $KEY_PATH -r ./* ubuntu@$SERVER_IP:/home/ubuntu/pazik-app/

# Запускаем установку на сервере
ssh -i $KEY_PATH ubuntu@$SERVER_IP "cd /home/ubuntu/pazik-app && chmod +x install-server.sh && ./install-server.sh"

echo "Деплой завершен! Приложение доступно по адресу: http://$SERVER_IP"
