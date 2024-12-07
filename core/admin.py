from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Estabelecimento, Profissional, Cliente, Servico, Agendamento
from django.db import connection

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('name', 'phone')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role')}),
        ('Vínculos', {'fields': ('estabelecimento',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'name', 'role', 'phone', 'estabelecimento'),
        }),
    )

    search_fields = ('email', 'name')
    ordering = ('email',)

    def save_model(self, request, obj, form, change):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_database(), current_schema();")
                db_info = cursor.fetchone()
                print(f"Database: {db_info[0]}, Schema: {db_info[1]}")
            
            super().save_model(request, obj, form, change)
        except Exception as e:
            print(f"Error saving user: {str(e)}")
            raise

@admin.register(Profissional)
class ProfissionalAdmin(admin.ModelAdmin):
    list_display = ('nome', 'especialidade', 'telefone', 'estabelecimento', 'is_active')
    list_filter = ('estabelecimento', 'is_active')
    search_fields = ('nome', 'especialidade', 'telefone')
    raw_id_fields = ('user', 'estabelecimento')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('estabelecimento', 'user')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Estabelecimento)
admin.site.register(Cliente)
admin.site.register(Servico)
admin.site.register(Agendamento)
