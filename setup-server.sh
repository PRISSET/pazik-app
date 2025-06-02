#!/bin/bash

# Обновление системы
echo "Обновляем систему..."
sudo apt update
sudo apt upgrade -y

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

# Создание директории для приложения
echo "Создаем директорию для приложения..."
mkdir -p ~/pazik-app

echo "Настройка сервера завершена! Теперь вы можете загрузить файлы вашего приложения."
echo "После загрузки файлов, выполните следующие команды:"
echo "cd ~/pazik-app"
echo "npm install"
echo "npm run build"
echo "pm2 start npm --name 'pazik' -- start" 