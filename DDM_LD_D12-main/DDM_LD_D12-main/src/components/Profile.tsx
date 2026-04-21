import React, { useState } from 'react';
import styles from '../css/profile.module.css';
import { User } from '../types/user';
import { useEffect } from "react";

interface ProfileProps {
  currentUser: User;
  onPedidoAlteracao: (pedido: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ onPedidoAlteracao }) => {
  const [showSolicitacao, setShowSolicitacao] = useState(false);
  const [solicitacaoData, setSolicitacaoData] = useState<Partial<User>>({});
  const [justificativa, setJustificativa] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).id : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:8000/utilizadores/${userId}`);
        if (!response.ok) {
          console.error("Erro ao buscar dados do utilizador");
          return;
        }

        const data = await response.json();

        const formatted: User = {
          id: data.id,
          nome: data.nome,
          username: data.username,
          email: data.email,
          telefone: data.telefone,
          tipo: data.tipo,
          nivelExperiencia: data.dados_programador?.nivel_experiencia || null,
          departamento: data.dados_gestor?.departamento || null,
          gestorAssociado: data.dados_programador
            ? `Gestor #${data.dados_programador.id_gestor}`
            : null
        };

        setCurrentUser(formatted);
      } catch (err) {
        console.error("Erro ao carregar utilizador:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSolicitacaoChange = (field: keyof User, value: string) => {
    setSolicitacaoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const criarPedidoAPI = async (pedidoData: any) => {
    try {
      const response = await fetch('http://localhost:8000/pedidos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pedido na API:', error);
      throw error;
    }
  };

  const handleEnviarSolicitacao = async () => {
    if (!currentUser) return;
    
    if (Object.keys(solicitacaoData).length === 0) {
      alert('Por favor, selecione pelo menos um campo para alterar.');
      return;
    }

    if (!justificativa.trim()) {
      alert('Por favor, forneça uma justificativa para as alterações solicitadas.');
      return;
    }

    setEnviando(true);

    try {
      const pedidoData = {
        UserId: currentUser.id,
        UserName: currentUser.nome,
        Tipo: 'alteracao_perfil',
        DadosAtuais: JSON.stringify({ ...currentUser }),
        DadosSolicitados: JSON.stringify({ ...solicitacaoData }),
        DataPedido: new Date().toISOString(),
        Status: 'pendente',
        Justificativa: justificativa,
        DataProcessamento: null,
        ProcessadoPor: null
      };

      const pedidoCriado = await criarPedidoAPI(pedidoData);

      const pedidoUI = {
        id: pedidoCriado.Id || Date.now(),
        userId: currentUser.id,
        userName: currentUser.nome,
        tipo: 'alteracao_perfil' as const,
        dadosAtuais: { ...currentUser },
        dadosSolicitados: { ...solicitacaoData },
        dataPedido: new Date(),
        status: 'pendente' as const,
        justificativa
      };

      onPedidoAlteracao(pedidoUI);
      
      setShowSolicitacao(false);
      setSolicitacaoData({});
      setJustificativa('');
      
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>A carregar perfil...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          <p>Erro ao carregar perfil. Por favor, tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
        <button 
          className={styles.solicitarButton}
          onClick={() => setShowSolicitacao(true)}
        >
          <i className="fa-solid fa-edit"></i>
          Solicitar Alteração
        </button>
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <i className="fa-solid fa-user"></i>
            </div>
            <div className={styles.userBasicInfo}>
              <h2 className={styles.userName}>{currentUser.nome}</h2>
              <p className={styles.userRole}>
                <span className={`${styles.roleBadge} ${styles[currentUser.tipo.toLowerCase()]}`}>
                  {currentUser.tipo}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Informação Pessoal</h3>
              <div className={styles.infoGroup}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Nome Completo</label>
                  <span className={styles.infoValue}>{currentUser.nome}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Username</label>
                  <span className={styles.infoValue}>{currentUser.username}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Email</label>
                  <span className={styles.infoValue}>{currentUser.email || 'Não definido'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Telefone</label>
                  <span className={styles.infoValue}>{currentUser.telefone || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Informação Profissional</h3>
              <div className={styles.infoGroup}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Tipo de Utilizador</label>
                  <span className={styles.infoValue}>{currentUser.tipo}</span>
                </div>
                {currentUser.nivelExperiencia && (
                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>Nível de Experiência</label>
                    <span className={`${styles.infoValue} ${styles[currentUser.nivelExperiencia.toLowerCase()]}`}>
                      {currentUser.nivelExperiencia}
                    </span>
                  </div>
                )}
                {currentUser.departamento && (
                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>Departamento</label>
                    <span className={styles.infoValue}>{currentUser.departamento}</span>
                  </div>
                )}
                {currentUser.gestorAssociado && (
                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>Gestor Associado</label>
                    <span className={styles.infoValue}>{currentUser.gestorAssociado}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSolicitacao && (
        <div className={styles.modalOverlay} onClick={() => setShowSolicitacao(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Solicitar Alteração de Perfil</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowSolicitacao(false)}
                disabled={enviando}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.modalDescription}>
                Selecione os campos que deseja alterar. O gestor irá analisar o seu pedido.
              </p>

              <div className={styles.solicitacaoForm}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSolicitacaoChange('nome', e.target.checked ? '[Novo nome]' : '')}
                      disabled={enviando}
                    />
                    <span className={styles.checkboxText}>Alterar Nome</span>
                  </label>
                  {solicitacaoData.nome && (
                    <input
                      type="text"
                      placeholder="Novo nome"
                      className={styles.input}
                      onChange={(e) => handleSolicitacaoChange('nome', e.target.value)}
                      disabled={enviando}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSolicitacaoChange('email', e.target.checked ? '[Novo email]' : '')}
                      disabled={enviando}
                    />
                    <span className={styles.checkboxText}>Alterar Email</span>
                  </label>
                  {solicitacaoData.email && (
                    <input
                      type="email"
                      placeholder="Novo email"
                      className={styles.input}
                      onChange={(e) => handleSolicitacaoChange('email', e.target.value)}
                      disabled={enviando}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSolicitacaoChange('telefone', e.target.checked ? '[Novo telefone]' : '')}
                      disabled={enviando}
                    />
                    <span className={styles.checkboxText}>Alterar Telefone</span>
                  </label>
                  {solicitacaoData.telefone && (
                    <input
                      type="tel"
                      placeholder="Novo telefone"
                      className={styles.input}
                      onChange={(e) => handleSolicitacaoChange('telefone', e.target.value)}
                      disabled={enviando}
                    />
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Justificativa para as alterações</label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    className={styles.textarea}
                    placeholder="Explique o motivo das alterações solicitadas..."
                    rows={4}
                    disabled={enviando}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowSolicitacao(false)}
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleEnviarSolicitacao}
                  disabled={enviando || Object.keys(solicitacaoData).length === 0 || !justificativa.trim()}
                >
                  {enviando ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      A enviar...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;