#!/bin/bash

# ������ ��� ������ �� ������ Ubuntu

# IP-����� �������
SERVER_IP="3.124.193.36"

# ���� � ���������� �����
KEY_PATH="~/key.pem"

# ������� �������� ������
npm install
npm run build

# �������� ����� �� ������
scp -i $KEY_PATH -r ./* ubuntu@$SERVER_IP:/home/ubuntu/pazik-app/

# ��������� ��������� �� �������
ssh -i $KEY_PATH ubuntu@$SERVER_IP "cd /home/ubuntu/pazik-app && chmod +x install-server.sh && ./install-server.sh"

echo "������ ��������! ���������� �������� �� ������: http://$SERVER_IP"
