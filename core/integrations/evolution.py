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
            instance_name = "support_bot" if is_support else f"salon_{estabelecimento_id}"
            
            # Verifica se já existe uma instância
            instances = self.fetch_instances()
            if any(inst.get('instance', {}).get('instanceName') == instance_name for inst in instances):
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
            instance_data = response.json()
            
            # Configura o webhook imediatamente após a criação
            if instance_data.get('instance', {}).get('instanceName'):
                self.configurar_webhooks(instance_name)
            
            return instance_data
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao criar instância: {e}")
            return {"error": str(e)}

    def check_connection_status(self, instance_name: str) -> Dict:
        """Verifica o status de conexão de uma instância"""
        try:
            url = self._validate_url(f'instance/connectionState/{instance_name}')
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            # Processa a resposta conforme o formato da Evolution API
            return {
                'exists': True,
                'status': data.get('instance', {}).get('state', 'disconnected'),
                'instance_name': data.get('instance', {}).get('instanceName'),
                'instance_id': data.get('instance', {}).get('instanceId')
            }
        except Exception as e:
            print(f"Erro ao verificar status: {str(e)}")
            return {
                'exists': False,
                'status': 'disconnected',
                'instance_name': None,
                'instance_id': None
            }

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

    def check_instance_exists(self, instance_name: str) -> Dict:
        """Verifica se uma instância específica existe e seu status"""
        try:
            # Usa o connectionState para verificar a instância
            status = self.check_connection_status(instance_name)
            
            return {
                'exists': status['exists'],
                'instance_id': status['instance_id'],
                'status': status['status']
            }
            
        except Exception as e:
            print(f"Erro ao verificar instância: {str(e)}")
            return {
                'exists': False,
                'instance_id': None,
                'status': None
            }

    def configurar_webhooks(self, instance_name: str) -> Dict:
        """
        Configura os webhooks para a instância
        """
        try:
            if not settings.NGROK_URL:
                raise ValueError("NGROK_URL não configurada")
            
            webhook_url = f"{settings.NGROK_URL}/api/webhooks/support/"
            
            # Payload com eventos corretos conforme documentação
            payload = {
                "webhook": {
                    "enabled": True,
                    "url": webhook_url,
                    "webhookByEvents": True,
                    "webhookBase64": False,  # Mudando para false para facilitar debug
                    "events": [
                        "MESSAGES_UPSERT",
                        "MESSAGES_UPDATE",
                        "QRCODE_UPDATED"
                    ]
                }
            }
            
            url = f"{self.base_url}/webhook/set/{instance_name}"
            
            print("\nConfigurando Webhook:")
            print(f"Payload: {payload}")
            
            # Garantindo que o Content-Type está correto
            headers = {
                'apikey': settings.EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers)
            print(f"Resposta: {response.json()}\n")
            
            return response.json()
            
        except Exception as e:
            print(f"Erro webhook: {str(e)}")
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

    def get_qr_code(self, instance_name: str) -> Dict:
        """Gera QR Code para uma instância"""
        try:
            # Primeiro tenta conectar a instância
            connect_url = self._validate_url(f'instance/connect/{instance_name}')
            connect_response = requests.get(connect_url, headers=self.headers)
            connect_response.raise_for_status()
            
            data = connect_response.json()
            return {
                'code': data.get('qrcode', data.get('code')),
                'pairingCode': data.get('pairingCode'),
                'count': data.get('count', 0)
            }
            
        except Exception as e:
            print(f"Erro ao gerar QR code: {str(e)}")
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
            url = self._validate_url('instance/fetchInstances')
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            # Formata a resposta para um formato mais amigável
            instances = [item['instance'] for item in data if 'instance' in item]
            return instances
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar instâncias: {e}")
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

    def send_text_message(self, instance_name: str, number: str, text: str, delay: int = 0) -> Dict:
        """
        Envia mensagem de texto usando o novo endpoint da Evolution API
        """
        try:
            print("\n=== ENVIANDO MENSAGEM ===")
            url = self._validate_url(f'message/sendText/{instance_name}')
            
            print(f"URL: {url}")
            print(f"Número: {number}")
            print(f"Texto: {text}")
            
            payload = {
                "number": number,
                "text": text,
                "delay": delay
            }
            
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            
            print(f"Resposta: {response.json()}")
            print("=== FIM ENVIO ===\n")
            
            return response.json()
            
        except Exception as e:
            print(f"ERRO ao enviar mensagem: {str(e)}")
            return {"error": str(e)}

# Criando funções wrapper para serem importadas
def get_whatsapp_status(instance_id: str) -> Dict:
    """
    Obtém o status do WhatsApp para uma instância específica
    """
    api = EvolutionAPI()
    return api.check_connection_status(instance_id)
