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

# Создаем рабочий каталог
INSTALL_DIR="$HOME/pazik-app"
echo "Создаем рабочий каталог $INSTALL_DIR..."
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Клонирование репозитория с GitHub
echo "Клонируем репозиторий с GitHub..."
git clone https://github.com/PRISSET/pazik-app.git .

# Создание .env файла
echo "Создаем файл конфигурации .env..."
cat > .env.local << EOF
DATABASE_URL="file:./db/pazik.db"
JWT_SECRET="secret-pazik-app-key-for-auth-token-very-secure"
EOF

# Установка зависимостей
echo "Устанавливаем зависимости..."
npm install

# Сборка проекта
echo "Собираем проект..."
npm run build

# Настройка Nginx
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

# Запуск приложения
echo "Запускаем приложение..."
pm2 start npm --name "pazik" -- start

# Настройка автозапуска
echo "Настраиваем автозапуск..."
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "Установка завершена! Приложение доступно по IP-адресу сервера"