#!/bin/bash

# Instalar ngrok se não estiver instalado
if ! command -v ngrok &> /dev/null; then
    echo "Instalando ngrok..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ngrok
    else
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    fi
fi

# Iniciar ngrok
ngrok http 8000 