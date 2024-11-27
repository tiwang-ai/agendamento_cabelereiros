# core/integrations/evolution.py

import requests
from django.conf import settings
from typing import Dict, Optional

class EvolutionAPI:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.headers = {
            'Authorization': f'Bearer {settings.EVOLUTION_API_TOKEN}',
            'Content-Type': 'application/json'
        }

    def criar_instancia(self, estabelecimento_id: str, phone: str) -> Optional[Dict]:
        """
        Cria uma nova instância do WhatsApp para um estabelecimento
        """
        url = f"{self.base_url}/instance/create"
        instance_name = f"estabelecimento_{estabelecimento_id}"
        
        payload = {
            "instanceName": instance_name,
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
            if response.status_code not in [200, 201]:
                print(f"Erro Evolution API: {response.text}")
                return None
            return response.json()
        except Exception as e:
            print(f"Erro ao criar instância: {str(e)}")
            return None

    def check_connection_status(self, instance_id: str) -> dict:
        """
        Verifica o status da conexão de uma instância
        """
        url = f"{self.base_url}/instance/connectionState/{instance_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}

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

    def get_qr_code(self, instance_id: str) -> Dict:
        """
        Obtém o QR Code para uma instância específica
        Retorna um dicionário com:
        - pairingCode: código de pareamento
        - code: string do QR code
        - count: contador
        """
        url = f"{self.base_url}/instance/connect/{instance_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao obter QR code: {str(e)}")
            return {"error": str(e)}

    def get_instance_logs(self, instance_id: str) -> dict:
        """
        Obtém logs de eventos da instância
        """
        url = f"{self.base_url}/instance/logs/{instance_id}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}

# Criando funções wrapper para serem importadas
def get_whatsapp_status(instance_id: str) -> Dict:
    """
    Obtém o status do WhatsApp para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)

def check_connection(instance_id: str) -> Dict:
    """
    Verifica o status da conexão para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)

def criar_instancia_evolution(estabelecimento_id: str, phone: str) -> Optional[Dict]:
    """
    Cria uma nova instância do WhatsApp
    """
    api = EvolutionAPI()
    return api.criar_instancia(estabelecimento_id, phone)
