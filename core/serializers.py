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
    SalonService
)

User = get_user_model()

class EstabelecimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estabelecimento
        fields = '__all__'

class ProfissionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profissional
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    profissional_responsavel = ProfissionalSerializer(read_only=True)
    profissional_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Cliente
        fields = '__all__'

    def create(self, validated_data):
        profissional_id = validated_data.pop('profissional_id', None)
        cliente = Cliente.objects.create(**validated_data)
        if profissional_id:
            profissional = Profissional.objects.get(id=profissional_id)
            cliente.profissional_responsavel = profissional
            cliente.save()
        return cliente

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = '__all__'

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
