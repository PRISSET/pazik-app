#!/bin/bash

# Скрипт для установки проекта Пацик на сервере с ограниченными ресурсами (1 ГБ RAM)
# Просто вставьте эти команды в консоль Linux

# Обновление системы
echo "Обновляем систему..."
sudo apt update
sudo apt upgrade -y

# Создание файла подкачки для расширения памяти
echo "Создаем файл подкачки для расширения памяти..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Установка Git
echo "Устанавливаем Git..."
sudo apt install -y git

# Установка Node.js и npm
echo "Устанавливаем Node.js и npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2
echo "Устанавливаем PM2..."
sudo npm install -g pm2

# Установка Nginx
echo "Устанавливаем Nginx..."
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

# Оптимизированная установка зависимостей для систем с малым объемом RAM
echo "Устанавливаем зависимости (оптимизировано для систем с малым объемом RAM)..."
export NODE_OPTIONS="--max-old-space-size=512"
npm install --no-fund --no-audit --prefer-offline --no-optional --production

# Сборка проекта с ограничением по памяти
echo "Собираем проект (с ограничением по памяти)..."
NODE_OPTIONS="--max-old-space-size=512" npm run build

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

# Запуск приложения с ограничением по памяти
echo "Запускаем приложение..."
pm2 start npm --name "pazik" -- start --node-args="--max-old-space-size=512"

# Настройка автозапуска
echo "Настраиваем автозапуск..."
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "Установка завершена! Приложение доступно по IP-адресу сервера"