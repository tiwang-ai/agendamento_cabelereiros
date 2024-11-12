from django.db import models

class Estabelecimento(models.Model):
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=200)
    horario_funcionamento = models.CharField(max_length=100)
    telefone = models.CharField(max_length=15)

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
