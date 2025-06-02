#!/bin/bash

# Скрипт для установки и настройки проекта Пацик на сервере Ubuntu

# Обновление системы
echo "Обновляем систему..."
sudo apt update
sudo apt upgrade -y

# Установка Git
echo "Устанавливаем Git..."
sudo apt install -y git

# Установка Node.js и npm
echo "Устанавливаем Node.js и npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
echo "Проверяем версии..."
node -v
npm -v

# Установка PM2 для управления процессом
echo "Устанавливаем PM2..."
sudo npm install -g pm2

# Установка Nginx
echo "Устанавливаем Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Клонирование репозитория
echo "Клонируем репозиторий с GitHub..."
git clone https://github.com/PRISSET/pazik-app.git /home/ubuntu/pazik-app
cd /home/ubuntu/pazik-app

# Установка зависимостей и сборка проекта
echo "Устанавливаем зависимости и собираем проект..."
npm install
npm run build

# Настройка Nginx для проксирования запросов к Next.js
echo "Настраиваем Nginx..."
sudo tee /etc/nginx/sites-available/pazik << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активация конфигурации Nginx
sudo ln -sf /etc/nginx/sites-available/pazik /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Запуск приложения с PM2
echo "Запускаем приложение..."
pm2 start npm --name "pazik" -- start

# Настройка автозапуска PM2
echo "Настраиваем автозапуск..."
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "Установка завершена! Приложение доступно по IP-адресу сервера."