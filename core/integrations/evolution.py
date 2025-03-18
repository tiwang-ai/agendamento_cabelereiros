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

    def _get_instance_name(self, estabelecimento_id: str, is_support: bool = False) -> str:
        """Padroniza a nomenclatura das instâncias"""
        return "support_bot" if is_support else f"salon_{estabelecimento_id}"

    def _get_webhook_url(self, estabelecimento_id: str, is_support: bool = False) -> str:
        """Retorna a URL do webhook baseado no tipo de bot"""
        base_url = settings.NGROK_URL.rstrip('/')
        if not base_url.startswith(('http://', 'https://')):
            base_url = f"https://{base_url}"

        if is_support:
            return f"{base_url}/api/admin/bot/webhook/"
        return f"{base_url}/api/salon/{estabelecimento_id}/webhook/"

    # Funções específicas para Bot 1 (Suporte)
    def criar_instancia_suporte(self, phone: str) -> Dict:
        """Cria uma instância para o bot de suporte"""
        instance_name = self._get_instance_name('', is_support=True)
        webhook_url = self._get_webhook_url('', is_support=True)
        
        payload = {
            "instanceName": instance_name,
            "number": phone.replace("+", "").replace("-", "").replace(" ", ""),
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS",
            "reject_call": True,
            "groupsIgnore": True,
            "alwaysOnline": True,
            "readMessages": True,
            "webhookUrl": webhook_url,
            "webhookByEvents": True,
            "webhookBase64": True,
            "webhookEvents": ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "STATUS_INSTANCE"]
        }
        
        return self._criar_instancia(payload)

    # Funções específicas para Bot 2 (Salões)
    def criar_instancia_salao(self, estabelecimento_id: str, phone: str) -> Dict:
        """Cria uma instância para o bot do salão"""
        instance_name = self._get_instance_name(estabelecimento_id)
        webhook_url = self._get_webhook_url(estabelecimento_id)
        
        payload = {
            "instanceName": instance_name,
            "number": phone.replace("+", "").replace("-", "").replace(" ", ""),
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS",
            "reject_call": True,
            "groupsIgnore": True,
            "alwaysOnline": False,  # Diferente do bot de suporte
            "readMessages": True,
            "webhookUrl": webhook_url,
            "webhookByEvents": True,
            "webhookBase64": True,
            "webhookEvents": ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
        }
        
        return self._criar_instancia(payload)

    def _criar_instancia(self, payload: Dict) -> Dict:
        """Função interna para criar instância"""
        try:
            print(f"Payload da requisição para criar instância: {payload}")
            
            response = requests.post(
                self._validate_url('instance/create'),
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            instance_data = response.json()
            
            if instance_data.get('instance', {}).get('instanceName'):
                self.configurar_webhooks(instance_data['instance']['instanceName'])
            
            return instance_data
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao criar instância: {e}")
            return {"error": str(e)}

    def check_connection_status(self, instance_name: str, is_support: bool = False) -> Dict:
        """
        Verifica o estado de conexão de uma instância
        """
        try:
            print(f"\n=== VERIFICANDO STATUS {instance_name} ===")
            
            url = self._validate_url(f'instance/connectionState/{instance_name}')
            print(f"URL: {url}")
            print(f"Headers: {self.headers}")
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            
            print(f"Resposta: {result}")
            print("=== FIM VERIFICAÇÃO STATUS ===\n")
            
            return result
        except Exception as e:
            print(f"Erro ao verificar status: {str(e)}")
            return {"error": str(e)}

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

    def check_instance_exists(self, instance_id: str, is_support: bool = False) -> Dict:
        """
        Verifica se uma instância existe
        """
        try:
            instance_name = f"salon_{instance_id}"
            print(f"\n=== VERIFICANDO INSTÂNCIA {instance_name} ===")
            
            instances = self.fetch_instances()
            exists = any(
                inst.get('instance', {}).get('instanceName') == instance_name 
                for inst in instances
            )
            
            result = {
                "exists": exists,
                "status": "success"
            }
            print(f"Resultado: {result}")
            print("=== FIM VERIFICAÇÃO ===\n")
            
            return result
        except Exception as e:
            print(f"Erro ao verificar instância: {str(e)}")
            return {"error": str(e)}

    def configurar_webhooks(self, instance_name: str, enabled: bool = True) -> Dict:
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
                    "enabled": enabled,
                    "url": webhook_url,  # URL sempre presente
                    "webhookByEvents": True,
                    "webhookBase64": False,
                    "events": [
                        "MESSAGES_UPSERT",
                        "MESSAGES_UPDATE",
                        "QRCODE_UPDATED"
                    ] if enabled else []  # Apenas eventos são removidos quando desabilitado
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
            
            response = requests.post(url, json=payload, headers=self.headers)
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
        """
        Gera QR Code para uma instância
        """
        print(f"\n=== GERANDO QR CODE PARA {instance_name} ===")
        try:
            url = self._validate_url(f'instance/connect/{instance_name}')
            print(f"URL: {url}")
            print(f"Headers: {self.headers}")
            
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            
            print(f"Resposta: {result}")
            print("=== FIM GERAÇÃO QR CODE ===\n")
            
            return {
                'code': result.get('qrcode', result.get('code')),
                'pairingCode': result.get('pairingCode'),
                'count': result.get('count', 0)
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
