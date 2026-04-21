import React, { useState, useEffect } from 'react';
import Menu from '../components/menu';
import UserManagement from '../components/UserManagement';
import Profile from '../components/Profile';
import TeamView from '../components/TeamView';
import { User } from '../types/user';
import styles from '../css/home.module.css';
import UserProfileModal from '../components/UserProfileModal';
import TaskTypeManagement from '../components/TaskTypeManagement';
import TaskDetails from '../components/TaskDetails';
import KanbanBoard from '../components/KanbanBoard';

const Home: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('tasks'); 
  const [isMenuCollapsed, setIsMenuCollapsed] = useState<boolean>(false);
  const [pedidosAlteracao, setPedidosAlteracao] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          window.location.href = '/login';
          return;
        }

        const parsedUser = JSON.parse(userData);
        const userId = parsedUser.id;

        const response = await fetch(`http://localhost:8000/utilizadores/${userId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do utilizador');
        }

        const data = await response.json();


        const user: User = {
          id: data.id,
          nome: data.nome,
          username: data.username,
          email: data.email,
          telefone: data.telefone,
          tipo: data.tipo,
          password: '',
          dados_gestor: data.dados_gestor || null,
          dados_programador: data.dados_programador || null,
          nivelExperiencia: data.dados_programador?.nivel_experiencia || null,
          departamento: data.dados_gestor?.departamento || null,
          gestorAssociado: data.dados_programador?.id_gestor 
            ? `Gestor #${data.dados_programador.id_gestor}` 
            : null
        };

        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleViewChange = (view: string): void => {
    setActiveView(view);
    setSelectedUser(null);
  };

  const handleToggleMenu = (): void => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  const handlePedidoAlteracao = (pedido: any) => {
    setPedidosAlteracao(prev => [...prev, pedido]);
    console.log('Novo pedido de alteração:', pedido);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleEditProfileFromModal = () => {
    setIsProfileModalOpen(false);
    setActiveView('profile');
  };

  useEffect(() => {
    console.log('🔄 activeView MUDOU:', activeView);
    console.log('🔄 isProfileModalOpen:', isProfileModalOpen);
  }, [activeView, isProfileModalOpen]);

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  const renderViewContent = () => {
    if (!currentUser) return null;

    switch (activeView) {
      case 'tasks':
        return <TaskDetails currentUser={currentUser} userRole={currentUser.tipo.toLowerCase() as any} />;
      case 'kanban':
        return currentUser.tipo === 'Programador' ? <KanbanBoard currentUser={currentUser} /> : null;
      case 'team':
        return <TeamView currentUser={currentUser} onUserClick={handleUserClick} />;
      case 'userManagement':
        return currentUser.tipo === 'Gestor' ? <UserManagement /> : null;
      case 'taskTypes':
        return currentUser.tipo === 'Gestor' ? <TaskTypeManagement /> : null;
      case 'profile':
        return <Profile currentUser={currentUser} onPedidoAlteracao={handlePedidoAlteracao} />;
      default:
        return (
          <div className={styles.viewContent}>
            <h2>Bem-vindo ao iTasks</h2>
            <p>Selecione uma opção do menu para começar</p>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      tasks: currentUser?.tipo === 'Gestor' ? 'Gerir Tarefas' : 'Minhas Tarefas',
      kanban: 'Quadro Kanban',
      team: 'Equipa',
      userManagement: 'Gestão de Utilizadores',
      taskTypes: 'Gestão de Tipos de Tarefa',
      profile: 'Meu Perfil'
    };
    return titles[activeView] || 'iTasks';
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>A carregar...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.errorScreen}>
        <i className="fa-solid fa-exclamation-triangle"></i>
        <h3>Erro ao carregar utilizador</h3>
        <p>Por favor, faça login novamente.</p>
        <button 
          className={styles.loginButton}
          onClick={() => window.location.href = '/login'}
        >
          Ir para Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <Menu 
        activeView={activeView}
        onViewChange={handleViewChange}
        isCollapsed={isMenuCollapsed}
        onToggleCollapse={handleToggleMenu}
        userRole={currentUser.tipo as 'Programador' | 'Gestor'}
      />
      
      <main className={`${styles.mainContent} ${isMenuCollapsed ? styles.collapsed : ''}`}>
        <header className={styles.mainHeader}>
          <div className={styles.headerContent}>
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Bem-vindo, {currentUser.nome}!</h1>
              <p className={styles.pageSubtitle}>{getPageTitle()}</p>
            </div>
            
          </div>
        </header>
        
        <div className={styles.contentArea}>
          {renderViewContent()}
        </div>
      </main>

      <UserProfileModal 
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        currentUser={currentUser}
        onEditProfile={handleEditProfileFromModal} 
      />
    </div>
  );
};

export default Home;