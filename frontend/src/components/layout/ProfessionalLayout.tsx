import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    {
      key: '/professional/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/professional/calendar',
      icon: <CalendarOutlined />,
      label: 'Agenda',
    },
    {
      key: '/professional/appointments',
      icon: <ScheduleOutlined />,
      label: 'Agendamentos',
    },
    {
      key: '/professional/clients',
      icon: <TeamOutlined />,
      label: 'Clientes',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      // Implementar navegação para perfil
      navigate('/professional/profile');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div style={{ float: 'right', marginRight: 24 }}>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Button type="text">
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user?.name}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfessionalLayout; 