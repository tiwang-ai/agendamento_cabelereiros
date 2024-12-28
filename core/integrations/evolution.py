# core/integrations/evolution.py

import requests
from django.conf import settings
from typing import Dict, Optional, List

class EvolutionAPI:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.headers = {
            'apikey': f'{settings.EVOLUTION_API_KEY}',
            'Content-Type': 'application/json'
        }

    def criar_instancia(self, estabelecimento_id: str, phone: str) -> Optional[Dict]:
        """
        Cria uma nova instância do WhatsApp
        """
        url = f"{self.base_url}/instance/create"
        instance_name = f"estabelecimento_{estabelecimento_id}"
        
        webhook_url = f"{settings.BASE_URL}/api/webhooks/whatsapp/"
        if not webhook_url.startswith('http'):
            webhook_url = f"https://{webhook_url}"
        
        payload = {
            "instanceName": instance_name,
            "token": settings.EVOLUTION_API_KEY,
            "number": phone.replace("+", "").replace("-", "").replace(" ", ""),
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS",
            "reject_call": True,
            "groupsIgnore": True,
            "alwaysOnline": True,
            "readMessages": True,
            "readStatus": True,
            "syncFullHistory": False,
            "webhookUrl": webhook_url,
            "webhookByEvents": True,
            "webhookBase64": True,
            "webhookEvents": [
                "APPLICATION_STARTUP",
                "CHATS_UPSERT",
                "SEND_MESSAGE",
                "MESSAGES_UPSERT"
            ]
        }
        
        try:
            print(f"Criando instância para estabelecimento {estabelecimento_id}")
            print(f"URL: {url}")
            print(f"Payload: {payload}")
            
            response = requests.post(url, json=payload, headers=self.headers)
            print(f"Status code: {response.status_code}")
            print(f"Resposta: {response.text}")
            
            if response.status_code in [200, 201]:
                return response.json()
            
            print(f"Erro Evolution API: {response.text}")
            return None
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
        url = f"{self.base_url}/webhook/set/{instance_id}"
        
        payload = {
            "enabled": True,
            "url": f"{settings.BACKEND_URL}/api/whatsapp/webhook/",
            "webhookByEvents": True,
            "webhookBase64": False,
            "events": [
                "messages.upsert",
                "connection.update",
                "status.instance",
                "messages.status"
            ]
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            print(f"Webhook configurado: {response.text}")  # Debug
            return response.json()
        except Exception as e:
            print(f"Erro ao configurar webhook: {str(e)}")
            return {"error": str(e)}

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

    def fetch_instances(self) -> List[Dict]:
        """
        Busca todas as instâncias existentes na Evolution API
        """
        url = f"{self.base_url}/instance/fetchInstances"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao buscar instâncias: {str(e)}")
            return []

    def connect_instance(self, instance_name: str) -> Dict:
        """
        Conecta uma instância específica usando o nome da instância
        """
        url = f"{self.base_url}/instance/connect/{instance_name}"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao conectar instância: {str(e)}")
            return {"error": str(e)}

    def enviar_mensagem_whatsapp(self, numero_cliente, mensagem):
        """
        Envia uma mensagem para um número específico via WhatsApp usando a Evolution API.
        """
        try:
            payload = {
                "numero": numero_cliente,
                "mensagem": mensagem
            }
            response = requests.post(
                f"{self.base_url}/message/text",
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            return None

# Criando funções wrapper para serem importadas
def get_whatsapp_status(instance_id: str) -> Dict:
    """
    Obtém o status do WhatsApp para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)
