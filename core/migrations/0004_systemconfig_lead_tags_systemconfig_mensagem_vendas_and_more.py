# Generated by Django 5.0.1 on 2025-01-07 00:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_systemconfig_bot_ativo_systemconfig_dias_atendimento_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemconfig',
            name='lead_tags',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='systemconfig',
            name='mensagem_vendas',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='systemconfig',
            name='vendas_ativas',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='Lead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=20)),
                ('name', models.CharField(blank=True, max_length=100)),
                ('source', models.CharField(choices=[('BOT1', 'Bot de Suporte'), ('BOT2', 'Bot do Salão'), ('SITE', 'Website')], max_length=10)),
                ('status', models.CharField(choices=[('NEW', 'Novo'), ('CONTACTED', 'Contatado'), ('CONVERTED', 'Convertido'), ('LOST', 'Perdido')], default='NEW', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_contact', models.DateTimeField(auto_now=True)),
                ('notes', models.TextField(blank=True)),
                ('salon', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.estabelecimento')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]