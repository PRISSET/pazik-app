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

# Установка приложения
echo "Устанавливаем приложение..."
cd pazik-app
npm install
npm run build

# Запуск приложения с PM2
echo "Запускаем приложение..."
pm2 start npm --name "pazik" -- start

# Настройка автозапуска PM2
echo "Настраиваем автозапуск..."
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "Установка завершена! Приложение доступно по IP-адресу сервера." 