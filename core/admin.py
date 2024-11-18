from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Estabelecimento, Profissional, Cliente, Servico, Agendamento

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

admin.site.register(User, CustomUserAdmin)
admin.site.register(Estabelecimento)
admin.site.register(Profissional)
admin.site.register(Cliente)
admin.site.register(Servico)
admin.site.register(Agendamento)
