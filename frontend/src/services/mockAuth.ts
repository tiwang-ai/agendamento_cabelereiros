import { User, AuthResponse, LoginCredentials, RegisterData, UserRole } from '@/types/auth';

// Usuários mockados
const MOCK_USERS: Record<string, User & { password: string }> = {
  superuser: {
    id: 1,
    email: 'superuser@example.com',
    name: 'Super Administrador',
    role: UserRole.SUPERUSER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    permissions: ['manage:all', 'manage:admins', 'manage:salons', 'manage:plans', 'manage:bot', 'view:metrics', 'manage:support'],
    password: 'superuser123'
  },
  admin: {
    id: 2,
    email: 'admin@example.com',
    name: 'Administrador',
    role: UserRole.ADMIN,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    permissions: ['manage:salons', 'manage:plans', 'view:metrics', 'manage:support'],
    password: 'admin123'
  },
  salon: {
    id: 3,
    email: 'salon@example.com',
    name: 'Dono do Salão',
    role: UserRole.SALON_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    permissions: ['manage:own_salon', 'manage:professionals', 'manage:services', 'view:own_metrics', 'manage:appointments'],
    password: 'salon123'
  },
  professional: {
    id: 4,
    email: 'professional@example.com',
    name: 'Profissional',
    role: UserRole.PROFESSIONAL,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    permissions: ['manage:own_schedule', 'view:own_appointments', 'manage:own_clients'],
    password: 'professional123'
  },
  receptionist: {
    id: 5,
    email: 'receptionist@example.com',
    name: 'Recepcionista',
    role: UserRole.RECEPTIONIST,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    permissions: ['manage:appointments', 'view:salon_schedule', 'manage:clients'],
    password: 'receptionist123'
  }
};

// Função para gerar token fake
const generateFakeToken = (user: User): string => {
  return `fake_token_${user.id}_${Date.now()}`;
};

export const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('[mockAuth] Iniciando mock login para:', credentials.email);
  // Simula um delay para parecer uma chamada real
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Verifica credenciais
  const user = Object.values(MOCK_USERS).find(u => 
    u.email === credentials.email && u.password === credentials.password
  );
  
  if (!user) {
    console.error('[mockAuth] Credenciais inválidas para:', credentials.email);
    throw new Error('Credenciais inválidas');
  }
  
  // Gera tokens
  const access = generateFakeToken(user);
  const refresh = generateFakeToken(user);
  
  // Armazena no localStorage
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('mock_user', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at
  }));
  
  console.log('[mockAuth] Login bem-sucedido para:', user.email);
  console.log('[mockAuth] Tokens armazenados. Access:', access.substring(0, 20) + '...');
  
  return {
    access,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    }
  };
};

export const mockRefreshToken = async (): Promise<string> => {
  console.log('[mockAuth] Tentativa de refresh token');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userString = localStorage.getItem('mock_user');
  if (!userString) {
    console.error('[mockAuth] Refresh falhou: Usuário não encontrado no localStorage');
    throw new Error('No user found');
  }
  
  const user = JSON.parse(userString) as User;
  const newToken = generateFakeToken(user);
  
  localStorage.setItem('access_token', newToken);
  console.log('[mockAuth] Token atualizado com sucesso:', newToken.substring(0, 20) + '...');
  
  return newToken;
};

export const mockLogout = async (): Promise<void> => {
  console.log('[mockAuth] Iniciando logout');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('mock_user');
  
  console.log('[mockAuth] Logout concluído, tokens removidos');
};

export const mockGetProfile = async (): Promise<User> => {
  console.log('[mockAuth] Obtendo perfil do usuário');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userString = localStorage.getItem('mock_user');
  if (!userString) {
    console.error('[mockAuth] Perfil não encontrado: Usuário não está no localStorage');
    throw new Error('No user found');
  }
  
  const user = JSON.parse(userString) as User;
  console.log('[mockAuth] Perfil recuperado com sucesso:', user);
  
  return user;
};

export const mockRegister = async (data: RegisterData): Promise<AuthResponse> => {
  console.log('[mockAuth] Iniciando registro para:', data.email);
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Verifica se email já existe
  if (Object.values(MOCK_USERS).some(u => u.email === data.email)) {
    console.error('[mockAuth] Registro falhou: Email já cadastrado');
    throw new Error('Email já cadastrado');
  }
  
  // Cria novo usuário (sempre como salon_owner para registro)
  const newUser: User = {
    id: `${Object.keys(MOCK_USERS).length + 1}`,
    email: data.email,
    name: data.name,
    role: UserRole.SALON_OWNER,
    created_at: new Date().toISOString()
  };
  
  // Adiciona à "base de dados" local
  MOCK_USERS[newUser.id] = {
    ...newUser,
    password: data.password
  };
  
  // Gera tokens
  const access = generateFakeToken(newUser);
  const refresh = generateFakeToken(newUser);
  
  // Armazena no localStorage
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('mock_user', JSON.stringify(newUser));
  
  console.log('[mockAuth] Registro bem-sucedido para:', newUser.email);
  
  return {
    access,
    refresh,
    user: newUser
  };
}; 