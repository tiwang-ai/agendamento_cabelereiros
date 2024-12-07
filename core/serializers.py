from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Estabelecimento,
    Profissional,
    Cliente,
    Servico,
    Agendamento,
    Transaction,
    SystemService,
    SalonService,
    BotConfig,
    Interacao
)
import json

User = get_user_model()

class EstabelecimentoSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Estabelecimento
        fields = [
            'id', 'nome', 'endereco', 'telefone', 'whatsapp',
            'horario_funcionamento', 'evolution_instance_id',
            'status', 'status_display', 'is_active'
        ]
        read_only_fields = ['evolution_instance_id', 'status']

class ProfissionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profissional
        fields = ['id', 'nome', 'especialidade', 'telefone', 'estabelecimento', 'is_active']

    def validate(self, data):
        # Garantir que estabelecimento está presente
        if not data.get('estabelecimento'):
            raise serializers.ValidationError("Estabelecimento é obrigatório")
        
        # Validar telefone
        telefone = ''.join(filter(str.isdigit, data.get('telefone', '')))
        if len(telefone) < 10:
            raise serializers.ValidationError("Telefone deve ter pelo menos 10 dígitos")
        data['telefone'] = telefone

        return data

    def create(self, validated_data):
        try:
            # Gera uma senha temporária
            temp_password = 'mudar123'
            
            # Normaliza o telefone para usar como username
            phone = ''.join(filter(str.isdigit, validated_data['telefone']))
            
            # Cria o usuário primeiro
            user = User.objects.create(
                phone=phone,  # Importante: usar o telefone normalizado
                name=validated_data['nome'],
                role='PROFESSIONAL',
                estabelecimento=validated_data['estabelecimento']
            )
            user.set_password(temp_password)
            user.save()
            
            # Cria o profissional vinculado ao usuário
            profissional = Profissional.objects.create(
                user=user,
                **validated_data
            )
            
            return profissional
        except Exception as e:
            # Se der erro, limpa o usuário criado
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(str(e))

    def update(self, instance, validated_data):
        if instance.user:
            instance.user.phone = validated_data.get('telefone', instance.user.phone)
            instance.user.name = validated_data.get('nome', instance.user.name)
            instance.user.save()
        
        return super().update(instance, validated_data)

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'whatsapp', 'email', 'data_cadastro', 
                 'observacoes', 'historico_agendamentos', 'is_active']
        read_only_fields = ['data_cadastro', 'estabelecimento']

    def validate_whatsapp(self, value):
        # Remove caracteres não numéricos
        value = ''.join(filter(str.isdigit, value))
        if not value:
            raise serializers.ValidationError("Número de WhatsApp inválido")
        return value

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = ['id', 'nome_servico', 'duracao', 'preco', 'estabelecimento']
        read_only_fields = ['estabelecimento']

    def validate_duracao(self, value):
        if value <= 0:
            raise serializers.ValidationError("A duração deve ser maior que zero")
        return value

    def validate_preco(self, value):
        if value <= 0:
            raise serializers.ValidationError("O preço deve ser maior que zero")
        return value

class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    estabelecimento = serializers.PrimaryKeyRelatedField(
        queryset=Estabelecimento.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'role', 'estabelecimento', 'is_active', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'default': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        estabelecimento = validated_data.pop('estabelecimento', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        if estabelecimento:
            user.estabelecimento = estabelecimento
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        estabelecimento = validated_data.pop('estabelecimento', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
        if estabelecimento:
            instance.estabelecimento = estabelecimento
            
        instance.save()
        return instance

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class SystemServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemService
        fields = '__all__'

class SalonServiceSerializer(serializers.ModelSerializer):
    system_service_name = serializers.CharField(source='system_service.name', read_only=True)
    
    class Meta:
        model = SalonService
        fields = ['id', 'system_service', 'system_service_name', 'duration', 'price', 'active']

class ChatConfigSerializer(serializers.ModelSerializer):
    ultima_mensagem = serializers.SerializerMethodField()
    nome_cliente = serializers.SerializerMethodField()

    class Meta:
        model = BotConfig
        fields = ['id', 'numero_cliente', 'bot_ativo', 'ultima_atualizacao', 'ultima_mensagem', 'nome_cliente']

    def get_ultima_mensagem(self, obj):
        ultima_interacao = Interacao.objects.filter(
            salao=obj.estabelecimento,
            tipo='messages',
            descricao__contains=obj.numero_cliente
        ).order_by('-data_criacao').first()
        
        if ultima_interacao:
            try:
                mensagem_data = json.loads(ultima_interacao.descricao)
                return mensagem_data.get('body', '')
            except:
                return None
        return None

    def get_nome_cliente(self, obj):
        cliente = Cliente.objects.filter(
            estabelecimento=obj.estabelecimento,
            whatsapp=obj.numero_cliente
        ).first()
        return cliente.nome if cliente else None

class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = [
            'id', 'bot_ativo', 'ignorar_grupos', 'tempo_debounce',
            'horario_atendimento_inicio', 'horario_atendimento_fim',
            'dias_atendimento', 'mensagem_fora_horario', 
            'mensagem_bot_desativado'
        ]