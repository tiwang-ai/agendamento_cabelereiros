from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email=None, password=None, **extra_fields):
        if not email and not extra_fields.get('phone'):
            raise ValueError('Email ou telefone é obrigatório')
        
        if email:
            email = self.normalize_email(email)
            # Verifica se já existe usuário com este email
            if self.filter(email=email).exists():
                raise ValueError('email already taken')
        
        user = self.model(
            email=email,
            **extra_fields
        )
        
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email é obrigatório para superuser')
            
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        return self.create_user(email, password, **extra_fields)

    def get_by_natural_key(self, username):
        """
        Permite autenticação por email ou telefone
        """
        try:
            # Tenta primeiro por email
            return self.get(email=username)
        except self.model.DoesNotExist:
            try:
                # Se não encontrar por email, tenta por telefone normalizado
                phone = ''.join(filter(str.isdigit, username))
                return self.get(phone=phone)
            except self.model.DoesNotExist:
                return None

class User(AbstractBaseUser, PermissionsMixin):
    ROLES = (
        ('ADMIN', 'Administrador'),
        ('OWNER', 'Dono do Salão'),
        ('PROFESSIONAL', 'Profissional'),
        ('RECEPTIONIST', 'Recepcionista')
    )
    
    email = models.EmailField(
        unique=True,
        verbose_name='E-mail'
    )
    phone = models.CharField(max_length=15, blank=True)
    name = models.CharField(
        max_length=255,
        verbose_name='Nome'
    )
    role = models.CharField(max_length=20, choices=ROLES, default='OWNER')
    estabelecimento = models.ForeignKey('Estabelecimento', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    custom_permissions = models.JSONField(default=dict, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        # Retorna o identificador mais apropriado disponível
        if self.name:
            return self.name
        if self.email:
            return self.email
        if self.phone:
            return self.phone
        return f'User {self.id}'  # Fallback seguro

    def get_username(self):
        # Retorna o identificador principal (email ou telefone)
        return self.email or self.phone or f'user_{self.id}'

    def update_activity(self, ip_address=None):
        self.last_activity = timezone.now()
        if ip_address:
            self.last_login_ip = ip_address
        self.save(update_fields=['last_activity', 'last_login_ip'])

class Estabelecimento(models.Model): 
    nome = models.CharField(max_length=200)
    endereco = models.CharField(max_length=500)
    telefone = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20)
    horario_funcionamento = models.CharField(max_length=200, null=True, blank=True)
    evolution_instance_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(
        max_length=50, 
        default='disconnected',
        choices=[
            ('disconnected', 'Desconectado'),
            ('connected', 'Conectado'),
            ('pending_connection', 'Aguardando Conexão'),
            ('error', 'Erro')
        ]
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'estabelecimento'
        verbose_name = 'Estabelecimento'
        verbose_name_plural = 'Estabelecimentos'

    def __str__(self):
        return self.nome

class Profissional(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE, related_name="profissionais")
    nome = models.CharField(max_length=100)
    especialidade = models.CharField(max_length=100)
    telefone = models.CharField(max_length=20)
    foto = models.ImageField(upload_to='profissionais/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Profissional'
        verbose_name_plural = 'Profissionais'

    def __str__(self):
        estabelecimento_nome = self.estabelecimento.nome if self.estabelecimento else 'Sem estabelecimento'
        return f"{self.nome} - {estabelecimento_nome}"

class Cliente(models.Model):
    estabelecimento = models.ForeignKey(
        'Estabelecimento', 
        on_delete=models.CASCADE,
        related_name="clientes",
        db_column='estabelecimento_id'
    )
    profissional_responsavel = models.ForeignKey(Profissional, on_delete=models.SET_NULL, null=True, blank=True, related_name="clientes")
    nome = models.CharField(max_length=100)
    whatsapp = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    observacoes = models.TextField(blank=True, null=True)
    historico_agendamentos = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['estabelecimento', 'whatsapp']

    def __str__(self):
        return f"{self.nome} - {self.estabelecimento.nome}"

class Servico(models.Model):
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE, related_name="servicos")
    nome_servico = models.CharField(max_length=100)
    duracao = models.IntegerField()  # Duração em minutos
    preco = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.nome_servico

class Agendamento(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="agendamentos")
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="agendamentos")
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name="agendamentos")
    data_agendamento = models.DateField()
    horario = models.TimeField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.cliente} - {self.data_agendamento} {self.horario}"

class Interacao(models.Model):
    salao = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE)
    data = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=50)
    descricao = models.TextField()
    tempo_resposta = models.FloatField(null=True)
    sucesso = models.BooleanField(default=True)
    intencao = models.CharField(max_length=50, null=True)
    cliente_satisfeito = models.BooleanField(null=True)

    def __str__(self):
        return f"{self.salao.nome} - {self.tipo} - {self.data}"

class Horarios_Disponiveis(models.Model):
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="horarios")
    dia_semana = models.IntegerField()  # 0-6 para domingo-sábado
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

class Calendario_Estabelecimento(models.Model):
    estabelecimento = models.OneToOneField(Estabelecimento, on_delete=models.CASCADE)
    dia_semana = models.IntegerField()
    horario_abertura = models.TimeField()
    horario_fechamento = models.TimeField()

class Transaction(models.Model):
    TYPES = (
        ('income', 'Receita'),
        ('expense', 'Despesa')
    )
    
    STATUS = (
        ('completed', 'Concluído'),
        ('pending', 'Pendente'),
        ('cancelled', 'Cancelado')
    )
    
    date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPES)
    status = models.CharField(max_length=10, choices=STATUS)
    category = models.CharField(max_length=50)
    salon = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['-date']

class SystemService(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    default_duration = models.IntegerField(help_text="Duração padrão em minutos")
    default_price = models.DecimalField(max_digits=8, decimal_places=2)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class SalonService(models.Model):
    system_service = models.ForeignKey(SystemService, on_delete=models.CASCADE)
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE)
    duration = models.IntegerField(null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['system_service', 'estabelecimento']

    def __str__(self):
        return f"{self.system_service.name} - {self.estabelecimento.nome}"

class Plan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    max_professionals = models.IntegerField()
    features = models.JSONField(default=list)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class SystemConfig(models.Model):
    support_whatsapp = models.CharField(max_length=20)
    evolution_instance_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(
        max_length=50, 
        default='disconnected',
        choices=[
            ('disconnected', 'Desconectado'),
            ('connected', 'Conectado'),
            ('pending_connection', 'Aguardando Conexão'),
            ('error', 'Erro')
        ]
    )
    
    class Meta:
        verbose_name = 'Configuração do Sistema'
        verbose_name_plural = 'Configurações do Sistema'

class BotConfig(models.Model):
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE)
    numero_cliente = models.CharField(max_length=20)
    bot_ativo = models.BooleanField(default=True)
    aceitar_nao_clientes = models.BooleanField(default=False)
    mensagem_nao_cliente = models.TextField(
        blank=True,
        default="Olá! Para melhor atendê-lo, por favor, faça seu cadastro em nosso salão."
    )
    ultima_atualizacao = models.DateTimeField(auto_now=True)
    ignorar_grupos = models.BooleanField(default=True)
    tempo_debounce = models.IntegerField(default=5)  # em segundos
    horario_atendimento_inicio = models.TimeField(default='09:00')
    horario_atendimento_fim = models.TimeField(default='18:00')
    dias_atendimento = models.JSONField(default=list)  # lista de dias da semana
    mensagem_fora_horario = models.TextField(blank=True, null=True)
    mensagem_bot_desativado = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['estabelecimento', 'numero_cliente']
