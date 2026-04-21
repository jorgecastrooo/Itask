import React, { useState } from 'react';
import styles from '../css/userManagement.module.css';
import { User, PedidoAlteracao } from '../types/user';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pedidosAlteracao, setPedidosAlteracao] = useState<PedidoAlteracao[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'utilizadores' | 'pedidos'>('utilizadores');
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    nome: '',
    username: '',
    password: '',
    tipo: 'Programador',
    nivelExperiencia: 'Júnior',
    departamento: 'IT',
    gestorAssociado: '',
    email: '',
    telefone: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/utilizadores/completo");

      if (!response.ok) {
        throw new Error("Erro ao obter utilizadores");
      }

      const data = await response.json();

      const normalized = data.map((u: any, index: number) => ({
        ...u,
        id: u.id ?? `user-${index}`,
        tipo: u.tipo ?? "",
        dados_gestor: u.dados_gestor ?? null,
        dados_programador: u.dados_programador ?? null,
        nome: u.nome ?? "",
        username: u.username ?? "",
        email: u.email ?? "",
        telefone: u.telefone ?? ""
      }));

      setUsers(normalized);

    } catch (err) {
      console.error("Erro ao carregar utilizadores:", err);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchPedidosAlteracao = async () => {
    setLoadingPedidos(true);
    try {
      const response = await fetch("http://localhost:8000/pedidos/");
      
      if (!response.ok) {
        throw new Error("Erro ao obter pedidos de alteração");
      }

      const data = await response.json();
      
      const pedidosNormalizados = data.map((pedido: any) => ({
        id: pedido.Id,
        userId: pedido.UserId,
        userName: pedido.UserName,
        tipo: pedido.Tipo,
        dadosAtuais: JSON.parse(pedido.DadosAtuais),
        dadosSolicitados: JSON.parse(pedido.DadosSolicitados),
        dataPedido: new Date(pedido.DataPedido),
        status: pedido.Status,
        justificativa: pedido.Justificativa,
        dataProcessamento: pedido.DataProcessamento ? new Date(pedido.DataProcessamento) : null,
        processadoPor: pedido.ProcessadoPor
      }));

      setPedidosAlteracao(pedidosNormalizados);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'pedidos') {
      fetchPedidosAlteracao();
    }
  }, [activeTab]);

  const getGestorIdByName = (nome: string): number | null => {
    const gestor = users.find(u => u.nome === nome && u.tipo === "Gestor");
    
    if (!gestor) return null;
    
    return gestor.dados_gestor?.id_gestor || null;
  };

  // FUNÇÃO CORRIGIDA: Obter o departamento do gestor do programador
  const getDepartamentoDoGestorPorId = (idGestor?: number | null): string => {
    if (!idGestor && idGestor !== 0) return "-";
    
    // Buscar o gestor pelo id_gestor (não pelo id do utilizador)
    const gestor = users.find(u => 
      u.tipo === "Gestor" && 
      u.dados_gestor?.id_gestor === idGestor
    );
    
    return gestor?.dados_gestor?.departamento ?? gestor?.departamento ?? "-";
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      username: '',
      password: '',
      tipo: 'Programador',
      nivelExperiencia: 'Júnior',
      departamento: 'IT',
      gestorAssociado: '',
      email: '',
      telefone: ''
    });
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      username: user.username,
      password: '', 
      tipo: user.tipo,
      nivelExperiencia: user.nivelExperiencia || 'Júnior',
      departamento: user.departamento || 'IT',
      gestorAssociado: user.gestorAssociado || '',
      email: user.email || '',
      telefone: user.telefone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (!window.confirm("Tem a certeza que deseja eliminar este utilizador?")) return;

    try {
      let url = "";
      let method = "DELETE";

      if (user.tipo === "Gestor") {
        const idGestor = user.dados_gestor?.id_gestor;
        if (!idGestor) {
          alert("Erro: Gestor sem ID Gestor associado!");
          return;
        }

        url = `http://localhost:8000/gestores/${idGestor}`;
      }

      if (user.tipo === "Programador") {
        const idProgramador = user.dados_programador?.id_programador;
        const idGestor = user.dados_programador?.id_gestor;

        if (!idProgramador) {
          alert("Erro: Programador sem ID Programador!");
          return;
        }

        if (!idGestor) {
          alert("Erro: Programador sem gestor associado!");
          return;
        }

        url = `http://localhost:8000/programadores/${idProgramador}/gestor/${idGestor}`;
      }

      const response = await fetch(url, { method });

      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || "Erro ao eliminar utilizador");
        return;
      }

      setUsers(prev => prev.filter(u => u.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameExists = users.some(
      user => user.username === formData.username && user.id !== editingUser?.id
    );

    if (usernameExists) {
      alert("Username já existe. Por favor escolha outro.");
      return;
    }

    try {
      let response;
      let newUserData;

      if (editingUser) {
        let url = "";
        let method = "PUT";

        if (editingUser.tipo === "Programador") {
          const idGestor = editingUser.dados_programador?.id_gestor;
          const idProgramador = editingUser.dados_programador?.id_programador;

          if (!idGestor || !idProgramador) {
            alert("Programador sem dados completos!");
            return;
          }

          url = `http://localhost:8000/programadores/${idProgramador}/gestor/${idGestor}`;
        } else if (editingUser.tipo === "Gestor") {
          const idGestor = editingUser.dados_gestor?.id_gestor;
          if (!idGestor) {
            alert("Gestor sem ID associado!");
            return;
          }
          url = `http://localhost:8000/gestores/${idGestor}`;
        }

        const payload: any = {
          nome: formData.nome,
          username: formData.username,
          email: formData.email,
          telefone: formData.telefone
        };

        if (editingUser.tipo === "Gestor") {
          payload.departamento = formData.departamento;
        }

        if (editingUser.tipo === "Programador") {
          payload.nivel_experiencia = formData.nivelExperiencia;
        }

        response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const err = await response.json();
          alert(err.detail || "Erro ao atualizar");
          return;
        }

        newUserData = await response.json();

        setUsers(prev =>
          prev.map(u => u.id === editingUser.id ? { ...u, ...newUserData } : u)
        );

        setShowForm(false);
        setEditingUser(null);
        return;
      }

      if (formData.tipo === "Gestor") {
        response = await fetch("http://localhost:8000/gestores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formData.nome,
            username: formData.username,
            password: formData.password,
            departamento: formData.departamento,
            email: formData.email,
            telefone: formData.telefone,
            tipo: "gestor"
          })
        });
      } else if (formData.tipo === "Programador") {
        const gestorId = getGestorIdByName(formData.gestorAssociado);

        if (!gestorId) {
          alert("Gestor associado inválido.");
          return;
        }

        response = await fetch(`http://localhost:8000/programadores/${gestorId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: formData.nome,
            username: formData.username,
            password: formData.password,
            nivel_experiencia: formData.nivelExperiencia,
            email: formData.email,
            telefone: formData.telefone,
            tipo: "programador"
          })
        });
      }

      if (!response?.ok) {
        const error = await response?.json();
        alert(error?.detail || "Erro ao criar utilizador");
        return;
      }

      newUserData = await response?.json();

      await fetchUsers();

      setShowForm(false);
      setEditingUser(null);

    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const atualizarUtilizadorAPI = async (userId: number, dadosSolicitados: any) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    try {
      if (user.tipo === "Programador") {
        const idProgramador = user.dados_programador?.id_programador;
        const idGestor = user.dados_programador?.id_gestor;

        if (!idProgramador || !idGestor) {
          throw new Error("Dados do programador incompletos");
        }

        const payload: any = {};
        
        if (dadosSolicitados.nome) payload.nome = dadosSolicitados.nome;
        if (dadosSolicitados.email) payload.email = dadosSolicitados.email;
        if (dadosSolicitados.telefone) payload.telefone = dadosSolicitados.telefone;
        if (dadosSolicitados.username) payload.username = dadosSolicitados.username;

        const response = await fetch(`http://localhost:8000/programadores/${idProgramador}/gestor/${idGestor}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Erro ao atualizar programador");
        }

        return await response.json();
      } else if (user.tipo === "Gestor") {
        const idGestor = user.dados_gestor?.id_gestor;
        if (!idGestor) {
          throw new Error("Gestor sem ID associado");
        }

        const payload: any = {};
        
        if (dadosSolicitados.nome) payload.nome = dadosSolicitados.nome;
        if (dadosSolicitados.email) payload.email = dadosSolicitados.email;
        if (dadosSolicitados.telefone) payload.telefone = dadosSolicitados.telefone;
        if (dadosSolicitados.username) payload.username = dadosSolicitados.username;

        const response = await fetch(`http://localhost:8000/gestores/${idGestor}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Erro ao atualizar gestor");
        }

        return await response.json();
      }
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      throw error;
    }
  };

  const eliminarPedidoAPI = async (pedidoId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/pedidos/${pedidoId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erro ao eliminar pedido");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao eliminar pedido:", error);
      throw error;
    }
  };

  const processarPedido = async (pedidoId: number, aprovado: boolean) => {
    try {
      const pedido = pedidosAlteracao.find(p => p.id === pedidoId);
      if (!pedido) return;

      if (aprovado) {
        await atualizarUtilizadorAPI(pedido.userId, pedido.dadosSolicitados);
        
        await fetchUsers();
        
      }

      await eliminarPedidoAPI(pedidoId);
      
      setPedidosAlteracao(prev => prev.filter(p => p.id !== pedidoId));
      
      if (!aprovado) {
        alert("Pedido recusado e eliminado.");
      }

    } catch (error) {
      console.error("Erro ao processar pedido:", error);
    }
  };

  const gestores = users.filter(user => user.tipo === 'Gestor');
  const pedidosPendentes = pedidosAlteracao.filter(p => p.status === 'pendente');
  const pedidosProcessados = pedidosAlteracao.filter(p => p.status !== 'pendente');

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestão de Utilizadores</h1>
        <button 
          className={styles.createButton}
          onClick={handleCreate}
        >
          <i className="fa-solid fa-plus"></i>
          Novo Utilizador
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'utilizadores' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('utilizadores')}
        >
          <i className="fa-solid fa-users"></i>
          Utilizadores ({users.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'pedidos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pedidos')}
        >
          <i className="fa-solid fa-inbox"></i>
          Pedidos de Alteração 
          {pedidosPendentes.length > 0 && (
            <span className={styles.pedidosBadge}>{pedidosPendentes.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'utilizadores' && (
        <div className={styles.usersList}>
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Username</th>
                  <th>Tipo</th>
                  <th>Nível Exp.</th>
                  <th>Departamento</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.username}>{user.nome}</div>
                        {user.gestorAssociado && (
                          <div className={styles.gestorInfo}>
                            Gestor: {user.gestorAssociado}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`${styles.userType} ${styles[(user.tipo ?? "").toLowerCase()]}`}>
                        {user.tipo ?? "—"} 
                      </span>
                    </td>
                    <td>
                      {user.dados_programador?.nivel_experiencia ?? '-'}
                    </td>
                    <td>
                      {user.tipo === "Gestor"
                        ? (user.dados_gestor?.departamento ?? user.departamento ?? "-")
                        : getDepartamentoDoGestorPorId(user.dados_programador?.id_gestor ?? null)
                      }
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>{user.telefone || '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(user)}
                          title="Editar utilizador"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(user.id)}
                          title="Eliminar utilizador"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className={styles.pedidosSection}>
          {loadingPedidos ? (
            <div className={styles.loading}>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>A carregar pedidos...</p>
            </div>
          ) : (
            <>
              {pedidosPendentes.length > 0 && (
                <div className={styles.pedidosGroup}>
                  <h3 className={styles.pedidosTitle}>
                    <i className="fa-solid fa-clock"></i>
                    Pedidos Pendentes ({pedidosPendentes.length})
                  </h3>
                  <div className={styles.pedidosList}>
                    {pedidosPendentes.map(pedido => (
                      <div key={pedido.id} className={styles.pedidoCard}>
                        <div className={styles.pedidoHeader}>
                          <div className={styles.pedidoUserInfo}>
                            <span className={styles.pedidoUser}>{pedido.userName}</span>
                            <span className={styles.pedidoDate}>
                              {new Date(pedido.dataPedido).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                          <span className={styles.pedidoStatusPending}>Pendente</span>
                        </div>
                        <div className={styles.pedidoContent}>
                          <div className={styles.alteracoes}>
                            <h4>Alterações Solicitadas:</h4>
                            <div className={styles.alteracoesGrid}>
                              {Object.entries(pedido.dadosSolicitados).map(([campo, valor]) => (
                                <div key={campo} className={styles.alteracaoItem}>
                                  <div className={styles.campoInfo}>
                                    <span className={styles.campoNome}>{campo}:</span>
                                    <span className={styles.campoValorAtual}>
                                      {pedido.dadosAtuais[campo as keyof User] || 'Não definido'}
                                    </span>
                                    <i className="fa-solid fa-arrow-right"></i>
                                    <span className={styles.campoValorNovo}>{valor}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {pedido.justificativa && (
                            <div className={styles.justificativa}>
                              <strong>Justificativa:</strong> 
                              <p>{pedido.justificativa}</p>
                            </div>
                          )}
                        </div>
                        <div className={styles.pedidoActions}>
                          <button
                            className={styles.recusarButton}
                            onClick={() => processarPedido(pedido.id, false)}
                          >
                            <i className="fa-solid fa-times"></i>
                            Recusar
                          </button>
                          <button
                            className={styles.aprovarButton}
                            onClick={() => processarPedido(pedido.id, true)}
                          >
                            <i className="fa-solid fa-check"></i>
                            Aprovar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pedidosAlteracao.length === 0 && !loadingPedidos && (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-inbox"></i>
                  <h3>Sem pedidos de alteração</h3>
                  <p>Nenhum utilizador solicitou alterações no perfil.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                {!editingUser && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={styles.input}
                      required={!editingUser}
                      placeholder={editingUser ? "Deixe em branco para manter atual" : "Digite a password"}
                    />
                    {editingUser && (
                      <small className={styles.passwordHint}>
                        Deixe em branco para manter a password atual
                      </small>
                    )}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className={styles.select}
                    disabled={!!editingUser} 
                  >
                    <option value="Programador">Programador</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                  {editingUser && (
                    <small className={styles.typeHint}>
                      Não é possível alterar o tipo de utilizador
                    </small>
                  )}
                </div>

                {formData.tipo === 'Programador' && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nível Experiência *</label>
                      <select
                        name="nivelExperiencia"
                        value={formData.nivelExperiencia}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="Júnior">Júnior</option>
                        <option value="Sénior">Sénior</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Gestor Associado *</label>
                      <select
                        name="gestorAssociado"
                        value={formData.gestorAssociado}
                        onChange={handleInputChange}
                        className={styles.select}
                        disabled={!!editingUser} 
                      >
                        <option value="">Selecionar Gestor</option>
                        {gestores.map(gestor => (
                          <option key={gestor.id} value={gestor.nome}>
                            {gestor.nome} ({gestor.dados_gestor?.departamento || 'Sem departamento'})
                          </option>
                        ))}
                      </select>
                      {editingUser && (
                        <small className={styles.typeHint}>
                          Não é possível alterar o gestor associado
                        </small>
                      )}
                    </div>
                  </>
                )}

                {formData.tipo === 'Gestor' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Departamento *</label>
                    <select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="IT">IT</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Administração">Administração</option>
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  {editingUser ? 'Atualizar' : 'Criar'} Utilizador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;