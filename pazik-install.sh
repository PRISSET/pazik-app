#!/bin/bash

# Скрипт для установки проекта Пацик
# Просто вставьте эти команды в консоль Linux

# Обновление системы
sudo apt update
sudo apt upgrade -y

# Установка Git
sudo apt install -y git

# Установка Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Клонирование репозитория
git clone https://github.com/PRISSET/pazik-app.git /home/ubuntu/pazik-app

# Копирование проекта
mkdir -p /home/ubuntu/pazik-app/pazik-app
cd /home/ubuntu/pazik-app

# Установка зависимостей
cd /home/ubuntu/pazik-app/pazik-app
npm install
npm run build

# Настройка Nginx
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

# Запуск приложения
cd /home/ubuntu/pazik-app/pazik-app
pm2 start npm --name "pazik" -- start

# Настройка автозапуска
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "Установка завершена! Приложение доступно по IP-адресу сервера"