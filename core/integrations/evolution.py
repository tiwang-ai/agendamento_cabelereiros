# core/integrations/evolution.py

import requests
from django.conf import settings
from typing import Dict, Optional, List

class EvolutionAPI:
    def __init__(self):
        """
        Inicializa a conexão com a Evolution API
        """
        self.base_url = settings.EVOLUTION_API_URL.rstrip('/')
        if not self.base_url.startswith(('http://', 'https://')):
            self.base_url = f"https://{self.base_url}"
        
        self.headers = {
            'apikey': settings.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
        }

    def _validate_url(self, endpoint: str) -> str:
        """
        Valida e formata a URL para requisições
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        print(f"URL formatada: {url}")  # Debug temporário
        return url

    def criar_instancia(self, estabelecimento_id: str, phone: str, is_support: bool = False) -> Optional[Dict]:
        """
        Cria uma instância do WhatsApp na Evolution API
        Args:
            estabelecimento_id: ID do estabelecimento ou 'support' para bot de suporte
            phone: Número do WhatsApp
            is_support: Flag para identificar se é instância de suporte
        """
        try:
            instance_name = f"support_bot" if is_support else f"salon_{estabelecimento_id}"
            
            # Verifica se já existe uma instância
            instances = self.fetch_instances()
            if any(inst.get('instanceName') == instance_name for inst in instances):
                return {"error": "Instância já existe"}
            
            # Garante que a URL do webhook está formatada corretamente
            webhook_url = (
                f"{settings.BASE_URL.rstrip('/')}/api/webhooks/support/"
                if is_support
                else f"{settings.BASE_URL.rstrip('/')}/api/webhooks/salon/{estabelecimento_id}/"
            )
            
            if not webhook_url.startswith(('http://', 'https://')):
                webhook_url = f"https://{webhook_url}"
            
            payload = {
                "instanceName": instance_name,
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
                "webhookEvents": ["MESSAGES_UPSERT", "SEND_MESSAGE"]
            }
            
            response = requests.post(
                self._validate_url('instance/create'),
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Erro ao criar instância: {str(e)}")
            return {"error": str(e)}

    def check_connection_status(self, instance_id: str) -> Dict:
        """
        Verifica o status de uma instância específica
        """
        try:
            url = self._validate_url(f'instance/connectionState/{instance_id}')
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
        try:
            url = f"{self.base_url}/instance/fetchInstances"
            print(f"Fazendo requisição para: {url}")  # Debug
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

    def test_connection(self) -> bool:
        """
        Testa a conexão com a Evolution API
        """
        try:
            response = requests.get(self.base_url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return data.get('status') == 200
        except Exception as e:
            print(f"Erro ao testar conexão: {str(e)}")
            return False

# Criando funções wrapper para serem importadas
def get_whatsapp_status(instance_id: str) -> Dict:
    """
    Obtém o status do WhatsApp para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)
