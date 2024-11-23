from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager

class Estabelecimento(models.Model): 
    nome = models.CharField(max_length=200)
    endereco = models.CharField(max_length=500)
    telefone = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20)
    horario_funcionamento = models.CharField(max_length=200, null=True, blank=True)
    evolution_instance_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50, default='disconnected')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'estabelecimento'

    def __str__(self):
        return self.nome

class Profissional(models.Model):
    estabelecimento = models.ForeignKey(Estabelecimento, on_delete=models.CASCADE, related_name="profissionais")
    nome = models.CharField(max_length=100)
    especialidade = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    whatsapp = models.CharField(max_length=15)
    historico_agendamentos = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

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
    tipo = models.CharField(max_length=50)  # ex: 'agendamento', 'consulta', etc
    descricao = models.TextField()

    def __str__(self):
        return f"{self.salao.nome} - {self.tipo} - {self.data}"

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLES = (
        ('ADMIN', 'Administrador'),
        ('OWNER', 'Dono do Salão'),
        ('PROFESSIONAL', 'Profissional'),
        ('RECEPTIONIST', 'Recepcionista')
    )
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLES, default='OWNER')
    estabelecimento = models.ForeignKey('Estabelecimento', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

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
