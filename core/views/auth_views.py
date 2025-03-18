import logging
from rest_framework import status, serializers, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Avg
from ..serializers import UserSerializer
from ..models import ActivityLog, Agendamento

logger = logging.getLogger(__name__)
User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            phone = attrs.get('phone')
            email = attrs.get('email')
            password = attrs.get('password')

            if not (phone or email):
                raise serializers.ValidationError({'detail': 'Informe email ou telefone'})
            
            if not password:
                raise serializers.ValidationError({'detail': 'Senha é obrigatória'})

            if phone:
                phone = ''.join(filter(str.isdigit, phone))
                if not phone.startswith('55'):
                    phone = '55' + phone
                try:
                    user = User.objects.get(phone=phone)
                    attrs['username'] = phone
                except User.DoesNotExist:
                    raise serializers.ValidationError({'detail': 'Usuário não encontrado'})
            else:
                attrs['username'] = email

            user = authenticate(
                request=self.context.get('request'),
                username=attrs['username'],
                password=password
            )

            if not user:
                raise serializers.ValidationError({'detail': 'Credenciais inválidas'})

            data = super().validate(attrs)
            data.update({
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'estabelecimento_id': str(user.estabelecimento_id) if user.estabelecimento_id else None,
            })
            return data
            
        except Exception as e:
            logger.error(f"Erro de autenticação: {str(e)}")
            raise

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return User.objects.all()
        elif user.role in ['OWNER', 'PROFESSIONAL', 'RECEPTIONIST']:
            return User.objects.filter(estabelecimento=user.estabelecimento)
        return User.objects.none()

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        try:
            user = self.get_object()
            
            if not request.user.is_staff and user.estabelecimento != request.user.estabelecimento:
                return Response({'error': 'Sem permissão'}, status=403)

            activities = ActivityLog.objects.filter(user=user).order_by('-timestamp')[:10]
            
            response_data = {
                'user': UserSerializer(user).data,
                'activities': [{
                    'action': log.action,
                    'details': log.details,
                    'timestamp': log.timestamp
                } for log in activities],
                'permissions': {
                    'manage_salons': user.has_perm('core.manage_salons'),
                    'manage_staff': user.has_perm('core.manage_staff'),
                    'view_finances': user.has_perm('core.view_finances'),
                    'manage_system': user.has_perm('core.manage_system')
                }
            }
            
            if user.role == 'PROFESSIONAL':
                response_data['professional_data'] = {
                    'total_appointments': Agendamento.objects.filter(
                        profissional__user=user
                    ).count(),
                    'rating': Agendamento.objects.filter(
                        profissional__user=user,
                        avaliacao__isnull=False
                    ).aggregate(Avg('avaliacao'))['avaliacao__avg']
                }
            
            return Response(response_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 