from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_systemconfig_last_qr_code_and_more'),  # Ajuste conforme necessário
    ]

    operations = [
        migrations.CreateModel(
            name='Interacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=True, verbose_name='ID')),
                ('numero_whatsapp', models.CharField(max_length=20)),
                ('mensagem', models.TextField()),
                ('resposta', models.TextField(blank=True)),
                ('tipo', models.CharField(choices=[('support_bot', 'Bot Suporte'), ('salon_bot', 'Bot Salão')], max_length=20)),
                ('usado_llm', models.BooleanField(default=False)),
                ('tempo_resposta', models.FloatField(null=True)),
                ('resolvido', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('estabelecimento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.estabelecimento')),
            ],
        ),
    ] 