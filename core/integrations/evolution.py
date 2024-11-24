# core/integrations/evolution.py

import requests
from django.conf import settings
from typing import Dict, Optional

class EvolutionAPI:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.headers = {
            "apikey": f"{settings.EVOLUTION_API_KEY}",
            "Content-Type": "application/json"
        }

    def criar_instancia(self, salon_id: str, phone: str) -> Optional[Dict]:
        """
        Cria uma nova instância do WhatsApp para um salão
        """
        url = f"{self.base_url}/instance/create"
        payload = {
            "instanceName": f"salon_{salon_id}",
            "token": settings.EVOLUTION_API_KEY,
            "number": phone.replace("+", "").replace("-", "").replace(" ", ""),
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS",
            "reject_call": True,
            "readMessages": True,
            "readStatus": True,
            "alwaysOnline": False,
            "webhookBase64": False,
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.headers)
            if response.status_code != 201 and response.status_code != 200:
                print(f"Erro Evolution API: {response.text}")
                print(f"Headers enviados: {self.headers}")
                print(f"Payload enviado: {payload}")
                return None
            return response.json()
        except Exception as e:
            print(f"Erro detalhado ao criar instância: {str(e)}")
            return None

    def get_qr_code(self, instance_id: str) -> Optional[str]:
        """
        Obtém o QR Code para conexão do WhatsApp
        """
        url = f"{self.base_url}/instance/{instance_id}/qr"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json().get('qrcode')
        except requests.exceptions.RequestException as e:
            print(f"Erro ao obter QR code: {str(e)}")
            return None

    def check_connection_status(self, instance_id: str) -> Dict:
        """
        Verifica o status da conexão do WhatsApp
        """
        url = f"{self.base_url}/instance/{instance_id}/status"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return {"status": "error", "message": "Erro ao verificar status"}

    def disconnect_instance(self, instance_id: str) -> bool:
        """
        Desconecta uma instância do WhatsApp
        """
        url = f"{self.base_url}/instance/{instance_id}/logout"
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException:
            return False

    def send_message(self, instance_id: str, phone: str, message: str, options: dict = None) -> Dict:
        """
        Envia uma mensagem via WhatsApp com opções avançadas
        """
        url = f"{self.base_url}/message/send"
        payload = {
            "instanceId": instance_id,
            "to": phone,
            "type": "text",
            "body": message
        }
        
        if options:
            payload.update(options)
        
        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}

    def check_instance_exists(self, instance_id: str) -> bool:
        url = f"{self.base_url}/instance/fetchInstances"
        try:
            response = requests.get(url, headers=self.headers)
            instances = response.json()
            return any(inst.get('instanceName') == instance_id for inst in instances)
        except:
            return False

    def configurar_webhooks(self, instance_id: str) -> Dict:
        """
        Configura os webhooks para a instância
        """
        url = f"{self.base_url}/webhook/set"
        payload = {
            "instanceId": instance_id,
            "webhookUrl": f"{settings.BACKEND_URL}/api/whatsapp/webhook/",
            "events": [
                "connection",
                "messages",
                "status"
            ]
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}

    def delete_instance(self, instance_id: str) -> bool:
        """
        Deleta uma instância do WhatsApp
        """
        url = f"{self.base_url}/instance/delete/{instance_id}"
        try:
            response = requests.delete(url, headers=self.headers)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException:
            return False

# Criando funções wrapper para serem importadas
def get_whatsapp_status(instance_id: str) -> Dict:
    """
    Obtém o status do WhatsApp para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)

def generate_qr_code(instance_id: str) -> Optional[str]:
    """
    Gera o QR Code para uma instância específica
    """
    api = EvolutionAPI()
    return api.get_qr_code(instance_id)

def check_connection(instance_id: str) -> Dict:
    """
    Verifica o status da conexão para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)

def criar_instancia_evolution(salon_id: str, phone: str) -> Optional[Dict]:
    """
    Cria uma nova instância do WhatsApp
    """
    api = EvolutionAPI()
    return api.criar_instancia(salon_id, phone)
