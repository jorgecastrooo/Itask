import { useEffect, useState } from "react";
import React from "react";
import styles from "../css/menu.module.css";

interface MenuProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: 'Programador' | 'Gestor';
}

const Menu: React.FC<MenuProps> = ({
  activeView,
  onViewChange,
  isCollapsed = false,
  onToggleCollapse,
  userRole = 'Programador'
}) => {
  const baseMenuItems = [
    { 
      id: "tasks", 
      label: userRole === 'Gestor' ? "Gerir Tarefas" : "Minhas Tarefas", 
      icon: userRole === 'Gestor' ? "fa-solid fa-tasks" : "fa-solid fa-list-check" 
    },
  ];

  if (userRole === 'Programador') {
    baseMenuItems.push({
      id: "kanban", 
      label: "Meu Kanban", 
      icon: "fa-solid fa-table-columns" 
    });
  }

  baseMenuItems.push({ id: "team", label: "Equipa", icon: "fa-solid fa-users" });

  if (userRole === 'Gestor') {
    baseMenuItems.push({ 
      id: "userManagement", 
      label: "Gestão de Utilizadores", 
      icon: "fa-solid fa-user-gear" 
    });
    
    baseMenuItems.push({ 
      id: "taskTypes", 
      label: "Gestão de Tipos de Tarefa", 
      icon: "fa-solid fa-tags" 
    });
  }


  const [userName, setUserName] = useState<string>("");
  const [userRoleName, setUserRoleName] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/login";
      return;
    }

    const userId = JSON.parse(userData).id;

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/utilizadores/${userId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do utilizador');
        }
        
        const data = await response.json();
        setUserName(data.nome);
        setUserRoleName(data.tipo);
      } catch (err) {
        console.error("Erro ao carregar utilizador no menu:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleUserClick = () => {
    onViewChange("profile");
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {!isCollapsed && (
            <>
              <h2>iTasks</h2>
              <p>Gestão de Tarefas</p>
            </>
          )}
        </div>

        <button
          className={styles.toggleButton}
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <i
            className={`fa-solid ${
              isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            }`}
          ></i>
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {baseMenuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${
                  activeView === item.id ? styles.active : ""
                }`}
                onClick={() => onViewChange(item.id)}
                title={item.label}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                {!isCollapsed && (
                  <span className={styles.menuLabel}>{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.userSection}>
        <div 
          className={styles.userInfo} 
          onClick={handleUserClick}
          title="Meu Perfil"
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.userAvatar}>
            <i className="fa-solid fa-user"></i>
          </div>
          {!isCollapsed && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {userName || "Utilizador"}
              </span>
              <span className={`${styles.userRole} ${
                userRoleName === 'Gestor' ? styles.gestorRole : styles.programadorRole
              }`}>
                {userRoleName || "Função"}
              </span>
            </div>
          )}
        </div>

        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          title="Terminar Sessão"
        >
          <i className={`fa-solid fa-right-from-bracket ${styles.logoutIcon}`}></i>
          {!isCollapsed && (
            <span className={styles.logoutLabel}>Terminar Sessão</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Menu;