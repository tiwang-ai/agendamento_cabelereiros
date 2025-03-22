import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading } = useAuth();
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (user) {
      console.log('Login: Usuário já autenticado:', user);
      
      // Atraso intencional para garantir que todos os estados sejam atualizados antes do redirecionamento
      setTimeout(() => {
        redirectBasedOnRole(user.role);
      }, 100);
    }
  }, [user, navigate]);

  const redirectBasedOnRole = (role: string) => {
    console.log('Login: Redirecionando com base no papel:', role);
    try {
      if (role === UserRole.SUPERUSER || role === UserRole.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === UserRole.SALON_OWNER) {
        navigate('/salon/dashboard', { replace: true });
      } else if (role === UserRole.PROFESSIONAL) {
        navigate('/professional/dashboard', { replace: true });
      } else if (role === UserRole.RECEPTIONIST) {
        navigate('/receptionist/dashboard', { replace: true });
      } else {
        console.error('Papel desconhecido:', role);
        navigate('/login', { replace: true });
      }
    } catch (e) {
      console.error('Erro durante redirecionamento:', e);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoginError('');
    setIsLoading(true);
    
    try {
      console.log('Login: Tentando login com:', data.email);
      const user = await login(data.email, data.password);
      console.log('Login: Login bem-sucedido, usuário:', user);
      
      // Não redirecionar aqui - o useEffect acima irá cuidar disso
      // quando o estado do usuário for atualizado
    } catch (error) {
      console.error('Login: Erro no login:', error);
      setLoginError('Email ou senha incorretos');
      setIsLoading(false);
    }
  };

  // Se o usuário estiver autenticado, mostrar uma mensagem de redirecionamento
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Redirecionando...</h2>
          <p className="text-gray-600">Você já está autenticado. Redirecionando para sua área.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            crie uma nova conta
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {loginError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                {...register('password', { required: 'Senha é obrigatória' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {(isLoading || loading) ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}