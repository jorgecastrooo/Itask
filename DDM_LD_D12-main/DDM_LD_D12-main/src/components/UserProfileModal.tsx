import React from 'react';
import { User } from '../types/user';
import styles from '../css/userProfileModal.module.css';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onEditProfile?: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  currentUser,
  onEditProfile
}) => {
  if (!isOpen || !user) return null;

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

  const isCurrentUser = user.id === currentUser.id;

const handleEditProfileClick = () => {
  console.log('🖱️ 1. Botão clicado - handleEditProfileClick');
  console.log('🖱️ 2. onEditProfile existe?', !!onEditProfile);
  if (onEditProfile) {
    console.log('🖱️ 3. Chamando onEditProfile...');
    onEditProfile();
  } else {
    console.log('❌ ERRO: onEditProfile não está definido');
  }
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Perfil de {user.nome}</h2>
          {isCurrentUser && (
            <div className={styles.currentUserIndicator}>
              <i className="fa-solid fa-star"></i>
              Meu Perfil
            </div>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              <i className={`fa-solid ${user.tipo === 'Gestor' ? 'fa-user-tie' : 'fa-user'}`}></i>
            </div>
            <div className={styles.basicInfo}>
              <h3 className={styles.userName}>{user.nome}</h3>
              <div className={styles.userMeta}>
                <span className={`${styles.userType} ${styles[user.tipo.toLowerCase()]}`}>
                  {user.tipo}
                </span>
                {user.nivelExperiencia && (
                  <span 
                    className={styles.experienceLevel}
                    style={{ color: getExperienceColor(user.nivelExperiencia) }}
                  >
                    {user.nivelExperiencia}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <i className="fa-solid fa-address-card"></i>
              Informação de Contacto
            </h4>
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <i className="fa-solid fa-user"></i>
                <div>
                  <label>Username</label>
                  <span>{user.username}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <label>Email</label>
                  <span>{user.email || 'Não definido'}</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <i className="fa-solid fa-phone"></i>
                <div>
                  <label>Telefone</label>
                  <span>{user.telefone || 'Não definido'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <i className="fa-solid fa-briefcase"></i>
              Informação Profissional
            </h4>
            <div className={styles.infoGrid}>
              {user.departamento && (
                <div className={styles.infoItem}>
                  <label>Departamento</label>
                  <span 
                    className={styles.departmentBadge}
                    style={{ 
                      backgroundColor: getDepartmentColor(user.departamento),
                      color: user.departamento === 'IT' ? '#000' : '#fff'
                    }}
                  >
                    {user.departamento}
                  </span>
                </div>
              )}
              {user.gestorAssociado && (
                <div className={styles.infoItem}>
                  <label>Gestor Associado</label>
                  <span>{user.gestorAssociado}</span>
                </div>
              )}
            </div>
          </div>

          {(user.tarefasAtivas !== undefined || user.tarefasConcluidas !== undefined) && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <i className="fa-solid fa-chart-bar"></i>
                Estatísticas
              </h4>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{user.tarefasAtivas || 0}</div>
                  <div className={styles.statLabel}>Tarefas Ativas</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{user.tarefasConcluidas || 0}</div>
                  <div className={styles.statLabel}>Tarefas Concluídas</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {(user.tarefasConcluidas || 0) + (user.tarefasAtivas || 0)}
                  </div>
                  <div className={styles.statLabel}>Total de Tarefas</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            Fechar
          </button>
          {isCurrentUser && (
            <button className={styles.editProfileBtn} 
             onClick={handleEditProfileClick}>
              <i className="fa-solid fa-edit"></i>
                Editar Meu Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;