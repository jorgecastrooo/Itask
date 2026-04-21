import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import styles from '../css/team.module.css';
import UserProfileModal from './UserProfileModal';

interface TeamViewProps {
  currentUser: User;
  onUserClick: (user: User) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ currentUser, onUserClick }) => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [filteredTeam, setFilteredTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getGestorId = () => {
    if (currentUser.tipo === 'Gestor') {
      if (currentUser.dados_gestor) {
        return currentUser.dados_gestor.id_gestor;
      }
      return currentUser.id;
    }
    return null;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/utilizadores/completo');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar utilizadores');
        }

        const data = await response.json();
        
        console.log('DEBUG TeamView - Todos os utilizadores:', data);
        
        const normalizedUsers = data.map((user: any) => ({
          id: user.id,
          nome: user.nome,
          username: user.username,
          password: '********',
          tipo: user.tipo,
          email: user.email || '',
          telefone: user.telefone || '',
          ...(user.tipo === 'Gestor' && {
            departamento: user.dados_gestor?.departamento || '',
            dados_gestor: user.dados_gestor
          }),
          ...(user.tipo === 'Programador' && {
            nivelExperiencia: user.dados_programador?.nivel_experiencia || 'Júnior',
            departamento: user.dados_programador?.departamento || '',
            gestorAssociado: user.dados_programador?.id_gestor || null,
            dados_programador: user.dados_programador
          }),
          tarefasAtivas: 0,
          tarefasConcluidas: 0
        }));

        setTeamMembers(normalizedUsers);
        
      } catch (error) {
        console.error('Erro ao carregar equipa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (teamMembers.length === 0 || !currentUser) return;

    let teamToShow: User[] = [];
    const currentUserId = currentUser.id;

    console.log('DEBUG TeamView - Current User:', currentUser);
    console.log('DEBUG TeamView - Gestor ID do currentUser:', getGestorId());

    if (currentUser.tipo === 'Gestor') {
      const gestorId = getGestorId();
      console.log('DEBUG TeamView - Gestor ID para filtrar:', gestorId);
      
      if (gestorId) {
        const gestor = teamMembers.find(u => u.id === currentUserId);
        
        const programadoresDoGestor = teamMembers.filter(u => 
          u.tipo === 'Programador' && 
          u.dados_programador?.id_gestor === gestorId
        );

        console.log('DEBUG TeamView - Programadores do gestor:', programadoresDoGestor);
        
        teamToShow = gestor ? [gestor, ...programadoresDoGestor] : programadoresDoGestor;
      } else {
        teamToShow = teamMembers.filter(u => u.id === currentUserId);
      }
    } 
    else if (currentUser.tipo === 'Programador') {
      const currentProgramador = teamMembers.find(u => u.id === currentUserId);
      const idGestorAtual = currentProgramador?.dados_programador?.id_gestor;
      
      console.log('DEBUG TeamView - ID Gestor do programador:', idGestorAtual);
      
      if (idGestorAtual) {
        const gestor = teamMembers.find(u => 
          u.tipo === 'Gestor' && u.dados_gestor?.id_gestor === idGestorAtual
        );
        
        const programadoresDoGestor = teamMembers.filter(u => 
          u.tipo === 'Programador' && 
          u.dados_programador?.id_gestor === idGestorAtual
        );

        console.log('DEBUG TeamView - Gestor encontrado:', gestor);
        console.log('DEBUG TeamView - Programadores do mesmo gestor:', programadoresDoGestor);

        teamToShow = gestor ? [gestor, ...programadoresDoGestor] : programadoresDoGestor;
      } else {
        teamToShow = teamMembers.filter(u => u.id === currentUserId);
      }
    }

    console.log('DEBUG TeamView - Equipa filtrada:', teamToShow);

    const sortedTeam = teamToShow.sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      
      if (a.tipo === 'Gestor' && b.tipo === 'Programador') return -1;
      if (a.tipo === 'Programador' && b.tipo === 'Gestor') return 1;
      
      return a.nome.localeCompare(b.nome);
    });

    setFilteredTeam(sortedTeam);
  }, [teamMembers, currentUser]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    if (onUserClick) {
      onUserClick(user);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditProfile = () => {
    console.log('Editar perfil do utilizador:', selectedUser);
  };

  const getExperienceColor = (nivel: string) => {
    switch (nivel) {
      case 'Sénior': return '#00ff99';
      case 'Júnior': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getDepartmentColor = (departamento: string) => {
    switch (departamento) {
      case 'IT': return '#00ff99';
      case 'Marketing': return '#8b5cf6';
      case 'Administração': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (tarefasAtivas: number) => {
    if (tarefasAtivas === 0) return '#6b7280';
    if (tarefasAtivas <= 2) return '#10b981';
    if (tarefasAtivas <= 4) return '#f59e0b';
    return '#ef4444';
  };

  const getGestorName = (idGestor: number | null): string => {
    if (!idGestor) return 'Sem gestor';
    
    const gestor = teamMembers.find(u => 
      u.tipo === 'Gestor' && u.dados_gestor?.id_gestor === idGestor
    );
    
    return gestor ? gestor.nome : `Gestor #${idGestor}`;
  };

  const countUserTasks = async (userId: number) => {
    return { ativas: 0, concluidas: 0 };
  };

  if (loading) {
    return (
      <div className={styles.teamView}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>A carregar equipa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.teamView}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {currentUser.tipo === 'Gestor' ? 'Minha Equipa' : 'Minha Equipa'}
        </h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{filteredTeam.length}</span>
            <span className={styles.statLabel}>Membros</span>
          </div>
          {currentUser.tipo === 'Gestor' && (
            <>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {filteredTeam.filter(m => m.tipo === 'Gestor').length}
                </span>
                <span className={styles.statLabel}>Gestor</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {filteredTeam.filter(m => m.tipo === 'Programador').length}
                </span>
                <span className={styles.statLabel}>Programadores</span>
              </div>
            </>
          )}
        </div>
      </div>

      {filteredTeam.length === 0 ? (
        <div className={styles.emptyTeam}>
          <i className="fa-solid fa-users-slash"></i>
          <h3>Equipa Vazia</h3>
          <p>
            {currentUser.tipo === 'Gestor' 
              ? 'Não tem programadores na sua equipa. Adicione programadores através da Gestão de Utilizadores.'
              : 'Ainda não está associado a uma equipa. Contacte o seu gestor.'
            }
          </p>
        </div>
      ) : (
        <div className={styles.teamGrid}>
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className={`${styles.memberCard} ${
                member.id === currentUser.id ? styles.currentUser : ''
              } ${member.tipo === 'Gestor' ? styles.gestorCard : ''}`}
              onClick={() => handleUserClick(member)} 
            >
              {member.id === currentUser.id && (
                <div className={styles.currentUserBadge}>
                  <i className="fa-solid fa-star"></i>
                  Eu
                </div>
              )}

              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <i className={`fa-solid ${member.tipo === 'Gestor' ? 'fa-user-tie' : 'fa-user'}`}></i>
                </div>
                <div className={styles.userBasicInfo}>
                  <h3 className={styles.userName}>{member.nome}</h3>
                  <div className={styles.userMeta}>
                    <span className={`${styles.userType} ${styles[member.tipo.toLowerCase()]}`}>
                      {member.tipo}
                    </span>
                    {member.nivelExperiencia && (
                      <span 
                        className={styles.experienceLevel}
                        style={{ color: getExperienceColor(member.nivelExperiencia) }}
                      >
                        {member.nivelExperiencia}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <i className="fa-solid fa-envelope"></i>
                  <span>{member.email || 'Sem email'}</span>
                </div>
                <div className={styles.contactItem}>
                  <i className="fa-solid fa-phone"></i>
                  <span>{member.telefone || 'Sem telefone'}</span>
                </div>
              </div>

              {member.departamento && (
                <div className={styles.departmentSection}>
                  <span 
                    className={styles.departmentBadge}
                    style={{ 
                      backgroundColor: getDepartmentColor(member.departamento),
                      color: member.departamento === 'IT' ? '#000' : '#fff'
                    }}
                  >
                    {member.departamento}
                  </span>
                </div>
              )}

              {member.tipo === 'Programador' && member.dados_programador?.id_gestor && (
                <div className={styles.managerInfo}>
                  <i className="fa-solid fa-user-tie"></i>
                  <span>Gestor: {getGestorName(member.dados_programador.id_gestor)}</span>
                </div>
              )}

              <div className={styles.statsSection}>
                <div className={styles.taskStats}>
                  <div className={styles.taskStat}>
                    <span className={styles.taskStatNumber}>
                      {member.tarefasAtivas || 0}
                    </span>
                    <span className={styles.taskStatLabel}>Ativas</span>
                  </div>
                  <div className={styles.taskStat}>
                    <span className={styles.taskStatNumber}>
                      {member.tarefasConcluidas || 0}
                    </span>
                    <span className={styles.taskStatLabel}>Concluídas</span>
                  </div>
                </div>
                
                <div 
                  className={styles.statusIndicator}
                  style={{ 
                    backgroundColor: getStatusColor(member.tarefasAtivas || 0)
                  }}
                  title={`${member.tarefasAtivas || 0} tarefas ativas`}
                ></div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={styles.viewProfileButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(member); 
                  }}
                >
                  <i className="fa-solid fa-eye"></i>
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUser={currentUser}
        onEditProfile={handleEditProfile}
      />
    </div>
  );
};

export default TeamView;