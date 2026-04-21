import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { TaskType } from '../types/taskType';
import { User } from '../types/user';
import styles from '../css/taskDetails.module.css';

interface TaskDetailsProps {
  currentUser: User;
  userRole: 'programador' | 'gestor';
}

interface Programador {
  idUtilizador: number; 
  idProgramador: number; 
  nome: string;
  username: string;
  nivelExperiencia: string;
  idGestor: number;
  departamento: string;
  email: string;
  telefone: string;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ currentUser, userRole }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [teamMembers, setTeamMembers] = useState<Programador[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'todas' | 'ToDo' | 'Doing' | 'Done'>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(false);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    descricao: '',
    idTipoTarefa: '',
    storyPoints: 5,
    dataPrevistaInicio: '',
    dataPrevistaFim: '',
    idProgramador: '',
    ordemExecucao: 1,
    estadoAtual: 'ToDo'
  });

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
    if (currentUser && currentUser.id) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchTaskTypes = async () => {
    setLoadingTaskTypes(true);
    try {
      const response = await fetch('http://localhost:8000/tipos-tarefa/');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar tipos de tarefa');
      }

      const data = await response.json();
      
      const normalizedData = data.map((tipo: any) => ({
        id: tipo.Id,
        nome: tipo.Nome,
        descricao: tipo.Descricao || '',
        cor: tipo.Cor || '#4cdb94ac',
        icone: tipo.Icone || 'fa-tasks',
        ativo: tipo.Ativo,
        dataCriacao: new Date(tipo.DataCriacao)
      }));

      setTaskTypes(normalizedData.filter((type: TaskType) => type.ativo));
    } catch (error) {
      console.error('Erro ao carregar tipos de tarefa:', error);
    } finally {
      setLoadingTaskTypes(false);
    }
  };

  const fetchTeamMembers = async () => {
    setLoadingTeamMembers(true);
    try {
      const response = await fetch('http://localhost:8000/utilizadores/completo');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar utilizadores');
      }

      const data = await response.json();
      
      const allProgramadores: Programador[] = data
        .filter((user: any) => user.tipo === 'Programador' && user.dados_programador)
        .map((user: any) => ({
          idUtilizador: user.id,
          idProgramador: user.dados_programador.id_programador,
          nome: user.nome,
          username: user.username,
          nivelExperiencia: user.dados_programador?.nivel_experiencia || 'Júnior',
          idGestor: user.dados_programador?.id_gestor || null,
          departamento: user.dados_programador?.departamento || '',
          email: user.email || '',
          telefone: user.telefone || ''
        }));

      if (userRole === 'gestor') {
        const gestorId = getGestorId();
        console.log('DEBUG - Gestor ID:', gestorId);
        console.log('DEBUG - Todos programadores:', allProgramadores);
        
        const myProgramadores = allProgramadores.filter(
          prog => prog.idGestor === gestorId
        );
        
        console.log('DEBUG - Programadores do gestor:', myProgramadores);
        setTeamMembers(myProgramadores);
      } else {
        setTeamMembers(allProgramadores);
      }
    } catch (error) {
      console.error('Erro ao carregar programadores:', error);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/tarefas');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();
      
      const normalizedTasks = data.map((task: any) => ({
        id: task.Id,
        idGestor: task.IdGestor,
        idProgramador: task.IdProgramador,
        ordemExecucao: task.OrdemExecucao,
        descricao: task.Descricao || '',
        dataPrevistaInicio: new Date(task.DataPrevistaInicio),
        dataPrevistaFim: new Date(task.DataPrevistaFim),
        idTipoTarefa: task.IdTipoTarefa,
        storyPoints: task.StoryPoints,
        dataRealInicio: task.DataRealInicio ? new Date(task.DataRealInicio) : undefined,
        dataRealFim: task.DataRealFim ? new Date(task.DataRealFim) : undefined,
        dataCriacao: new Date(task.DataCriacao),
        estadoAtual: task.EstadoAtual,
        tipoTipoTarefa: task.TipoTipoTarefa || '',
        programadorNome: task.ProgramadorNome || '',
        gestorNome: task.GestorNome || '',
        title: task.Title || '',
        date: task.Date ? new Date(task.Date) : new Date(task.DataCriacao)
      }));

      console.log('DEBUG - Todas as tarefas:', normalizedTasks);
      
      setTasks(normalizedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      fetchTasks(),
      fetchTaskTypes(),
      fetchTeamMembers()
    ]);
  };

  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    if (!currentUser || !currentUser.id) {
      return [];
    }

    if (userRole === 'programador') {
      const currentProgramador = teamMembers.find(
        member => member.idUtilizador === currentUser.id
      );
      
      if (currentProgramador) {
        filteredTasks = filteredTasks.filter(task => 
          task.idProgramador === currentProgramador.idProgramador
        );
        console.log('DEBUG - Tarefas do programador:', filteredTasks);
      } else {
        return [];
      }
    }
    else if (userRole === 'gestor') {
      const gestorId = getGestorId();
      if (gestorId) {
        filteredTasks = filteredTasks.filter(task => 
          task.idGestor === gestorId
        );
        console.log('DEBUG - Tarefas do gestor (ID:', gestorId, '):', filteredTasks);
      } else {
        console.log('DEBUG - Gestor ID não encontrado');
        return [];
      }
    }

    if (filter !== 'todas') {
      filteredTasks = filteredTasks.filter(task => task.estadoAtual === filter);
    }

    return filteredTasks.sort((a, b) => a.ordemExecucao - b.ordemExecucao);
  };

  const handleOpenTaskModal = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setTaskForm({
        title: task.title || '',
        descricao: task.descricao,
        idTipoTarefa: task.idTipoTarefa.toString(),
        storyPoints: task.storyPoints,
        dataPrevistaInicio: task.dataPrevistaInicio ? new Date(task.dataPrevistaInicio).toISOString().split('T')[0] : '',
        dataPrevistaFim: task.dataPrevistaFim ? new Date(task.dataPrevistaFim).toISOString().split('T')[0] : '',
        idProgramador: task.idProgramador.toString(),
        ordemExecucao: task.ordemExecucao,
        estadoAtual: task.estadoAtual
      });
    } else {
      const firstProgramador = teamMembers.length > 0 ? teamMembers[0] : null;
      
      setSelectedTask(null);
      setTaskForm({
        title: '',
        descricao: '',
        idTipoTarefa: '',
        storyPoints: 5,
        dataPrevistaInicio: '',
        dataPrevistaFim: '',
        idProgramador: firstProgramador ? firstProgramador.idProgramador.toString() : '',
        ordemExecucao: tasks.length > 0 ? Math.max(...tasks.map(t => t.ordemExecucao)) + 1 : 1,
        estadoAtual: 'ToDo'
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const criarTarefaAPI = async (tarefaData: any) => {
    try {
      const gestorId = getGestorId();
      if (!gestorId) {
        throw new Error('Gestor não identificado');
      }

      const selectedProgramador = teamMembers.find(
        m => m.idProgramador === parseInt(tarefaData.idProgramador)
      );
      
      if (!selectedProgramador) {
        throw new Error('Programador selecionado não pertence à sua equipa');
      }

      if (selectedProgramador.idGestor !== gestorId) {
        throw new Error('O programador selecionado não pertence à sua equipa');
      }

      const tipoTarefa = taskTypes.find(t => t.id === parseInt(tarefaData.idTipoTarefa));

      if (!selectedProgramador || !tipoTarefa) {
        throw new Error('Dados incompletos para criar tarefa');
      }

      const payload = {
        id_gestor: gestorId, 
        id_programador: parseInt(tarefaData.idProgramador),
        ordem_execucao: tarefaData.ordemExecucao,
        descricao: tarefaData.descricao,
        data_prevista_inicio: new Date(tarefaData.dataPrevistaInicio).toISOString(),
        data_prevista_fim: new Date(tarefaData.dataPrevistaFim).toISOString(),
        id_tipo_tarefa: parseInt(tarefaData.idTipoTarefa),
        story_points: tarefaData.storyPoints,
        data_real_inicio: null,
        data_real_fim: null,
        estado_atual: 'ToDo',
        title: tarefaData.title,
        tipo_tipo_tarefa: tipoTarefa.nome,
        programador_nome: selectedProgramador.nome,
        gestor_nome: currentUser.nome,
        date: new Date().toISOString()
      };

      console.log('DEBUG - Payload para criar tarefa:', payload);

      const response = await fetch('http://localhost:8000/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const atualizarTarefaAPI = async (tarefaId: number, tarefaData: any) => {
    try {
      const gestorId = getGestorId();
      if (!gestorId) {
        throw new Error('Gestor não identificado');
      }

      const selectedProgramador = teamMembers.find(
        m => m.idProgramador === parseInt(tarefaData.idProgramador)
      );
      
      if (!selectedProgramador || selectedProgramador.idGestor !== gestorId) {
        throw new Error('Programador selecionado não pertence à sua equipa');
      }

      const tipoTarefa = taskTypes.find(t => t.id === parseInt(tarefaData.idTipoTarefa));

      if (!selectedProgramador || !tipoTarefa) {
        throw new Error('Dados incompletos para atualizar tarefa');
      }

      const originalTask = tasks.find(t => t.id === tarefaId);
      if (!originalTask) {
        throw new Error('Tarefa não encontrada');
      }

      if (originalTask.idGestor !== gestorId) {
        throw new Error('Não tem permissão para editar esta tarefa');
      }

      const payload = {
        id_gestor: gestorId,
        id_programador: parseInt(tarefaData.idProgramador),
        ordem_execucao: tarefaData.ordemExecucao,
        descricao: tarefaData.descricao,
        data_prevista_inicio: new Date(tarefaData.dataPrevistaInicio).toISOString(),
        data_prevista_fim: new Date(tarefaData.dataPrevistaFim).toISOString(),
        id_tipo_tarefa: parseInt(tarefaData.idTipoTarefa),
        story_points: tarefaData.storyPoints,
        data_real_inicio: originalTask.dataRealInicio?.toISOString() || null,
        data_real_fim: originalTask.dataRealFim?.toISOString() || null,
        estado_atual: tarefaData.estadoAtual || originalTask.estadoAtual,
        title: tarefaData.title,
        tipo_tipo_tarefa: tipoTarefa.nome,
        programador_nome: selectedProgramador.nome,
        gestor_nome: currentUser.nome,
        date: originalTask.date.toISOString()
      };

      const response = await fetch(`http://localhost:8000/tarefas/${tarefaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const eliminarTarefaAPI = async (tarefaId: number) => {
    try {
      const tarefa = tasks.find(t => t.id === tarefaId);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }

      const gestorId = getGestorId();
      if (tarefa.idGestor !== gestorId) {
        throw new Error('Não tem permissão para eliminar esta tarefa');
      }

      const response = await fetch(`http://localhost:8000/tarefas/${tarefaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao eliminar tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao eliminar tarefa:', error);
      throw error;
    }
  };

  const atualizarEstadoTarefaAPI = async (tarefaId: number, novoEstado: string) => {
    try {
      const tarefa = tasks.find(t => t.id === tarefaId);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }

      if (userRole === 'programador') {
        const currentProgramador = teamMembers.find(
          member => member.idUtilizador === currentUser.id
        );
        
        if (!currentProgramador || tarefa.idProgramador !== currentProgramador.idProgramador) {
          throw new Error('Não tem permissão para alterar esta tarefa');
        }
      }

      const tipoTarefa = taskTypes.find(t => t.id === tarefa.idTipoTarefa);
      const programador = teamMembers.find(m => m.idProgramador === tarefa.idProgramador);

      const payload = {
        id_gestor: tarefa.idGestor,
        id_programador: tarefa.idProgramador,
        ordem_execucao: tarefa.ordemExecucao,
        descricao: tarefa.descricao,
        data_prevista_inicio: tarefa.dataPrevistaInicio.toISOString(),
        data_prevista_fim: tarefa.dataPrevistaFim.toISOString(),
        id_tipo_tarefa: tarefa.idTipoTarefa,
        story_points: tarefa.storyPoints,
        data_real_inicio: novoEstado === 'Doing' && !tarefa.dataRealInicio 
          ? new Date().toISOString() 
          : tarefa.dataRealInicio?.toISOString() || null,
        data_real_fim: novoEstado === 'Done' 
          ? new Date().toISOString() 
          : tarefa.dataRealFim?.toISOString() || null,
        estado_atual: novoEstado,
        title: tarefa.title,
        tipo_tipo_tarefa: tipoTarefa?.nome || tarefa.tipoTipoTarefa,
        programador_nome: programador?.nome || tarefa.programadorNome,
        gestor_nome: tarefa.gestorNome,
        date: tarefa.date.toISOString()
      };

      const response = await fetch(`http://localhost:8000/tarefas/${tarefaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar estado da tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar estado da tarefa:', error);
      throw error;
    }
  };

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title.trim() || !taskForm.descricao.trim() || !taskForm.idTipoTarefa || !taskForm.idProgramador) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!taskForm.dataPrevistaInicio || !taskForm.dataPrevistaFim) {
      alert('Por favor, selecione as datas previstas.');
      return;
    }

    const inicioDate = new Date(taskForm.dataPrevistaInicio);
    const fimDate = new Date(taskForm.dataPrevistaFim);
    
    if (fimDate < inicioDate) {
      alert('A data de fim não pode ser anterior à data de início.');
      return;
    }

    setActionLoading(true);

    try {
      if (selectedTask) {
        await atualizarTarefaAPI(selectedTask.id, taskForm);
      } else {
        await criarTarefaAPI(taskForm);
      }

      await fetchTasks();
      handleCloseTaskModal();

    } catch (error) {
      console.error('Erro ao guardar tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setActionLoading(true);

    try {
      await eliminarTarefaAPI(taskToDelete.id);
      
      await fetchTasks();
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);

    } catch (error) {
      console.error('Erro ao eliminar tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaskState = async (taskId: number, newState: Task['estadoAtual']) => {
    setActionLoading(true);

    try {
      await atualizarEstadoTarefaAPI(taskId, newState);
      
      await fetchTasks();
      

    } catch (error) {
      console.error('Erro ao alterar estado da tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getEstadoLabel = (estado: string) => {
    const estados = {
      'ToDo': 'Por Fazer',
      'Doing': 'Em Progresso',
      'Done': 'Concluída'
    };
    return estados[estado as keyof typeof estados] || estado;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ToDo': return '#f59e0b';
      case 'Doing': return '#3b82f6';
      case 'Done': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStoryPointsColor = (points: number) => {
    if (points <= 3) return '#10b981';
    if (points <= 5) return '#f59e0b';
    return '#ef4444';
  };

  if (isLoading || loadingTaskTypes || loadingTeamMembers) {
    return (
      <div className={styles.taskDetails}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>A carregar tarefas...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div className={styles.taskDetails}>
        <div className={styles.error}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          <h3>Erro: Utilizador não encontrado</h3>
          <p>Não foi possível carregar as informações do utilizador.</p>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className={styles.taskDetails}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            {userRole === 'gestor' ? 'Gestão de Tarefas' : 'Minhas Tarefas'}
          </h1>
          <p className={styles.subtitle}>
            {userRole === 'gestor' 
              ? `Gerir tarefas da sua equipa (${teamMembers.length} programadores)` 
              : 'Acompanhe as suas tarefas atribuídas'
            }
          </p>
        </div>
        
        {userRole === 'gestor' && (
          <button
            className={styles.addButton}
            onClick={() => handleOpenTaskModal()}
            disabled={actionLoading || loadingTaskTypes || loadingTeamMembers || teamMembers.length === 0}
            title={teamMembers.length === 0 ? 'Não há programadores na sua equipa' : 'Criar nova tarefa'}
          >
            <i className="fa-solid fa-plus"></i>
            Nova Tarefa
            {teamMembers.length === 0 && (
              <span className={styles.warningIcon}>
                <i className="fa-solid fa-exclamation-triangle"></i>
              </span>
            )}
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'todas' ? styles.active : ''}`}
          onClick={() => setFilter('todas')}
          disabled={actionLoading}
        >
          Todas
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'ToDo' ? styles.active : ''}`}
          onClick={() => setFilter('ToDo')}
          disabled={actionLoading}
        >
          Por Fazer
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'Doing' ? styles.active : ''}`}
          onClick={() => setFilter('Doing')}
          disabled={actionLoading}
        >
          Em Progresso
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'Done' ? styles.active : ''}`}
          onClick={() => setFilter('Done')}
          disabled={actionLoading}
        >
          Concluídas
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{filteredTasks.length}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {filteredTasks.filter(t => t.estadoAtual === 'ToDo').length}
          </div>
          <div className={styles.statLabel}>Por Fazer</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {filteredTasks.filter(t => t.estadoAtual === 'Doing').length}
          </div>
          <div className={styles.statLabel}>Em Progresso</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {filteredTasks.filter(t => t.estadoAtual === 'Done').length}
          </div>
          <div className={styles.statLabel}>Concluídas</div>
        </div>
      </div>

      {userRole === 'gestor' && teamMembers.length === 0 && (
        <div className={styles.alertWarning}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          <div>
            <h4>Atenção</h4>
            <p>Não tem programadores na sua equipa. Para criar tarefas, primeiro precisa de adicionar programadores à sua equipa através da Gestão de Utilizadores.</p>
          </div>
        </div>
      )}

      <div className={styles.tasksGrid}>
        {filteredTasks.map(task => (
          <div key={task.id} className={styles.taskCard}>
            <div className={styles.taskHeader}>
              <div className={styles.taskInfo}>
                <span className={styles.order}>#{task.ordemExecucao}</span>
                <span className={styles.taskType}>{task.tipoTipoTarefa}</span>
              </div>
              <div className={styles.taskActions}>
                {userRole === 'gestor' && (
                  <>
                    <button
                      className={styles.editButton}
                      onClick={() => handleOpenTaskModal(task)}
                      disabled={actionLoading}
                      title="Editar tarefa"
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteTask(task)}
                      disabled={actionLoading}
                      title="Eliminar tarefa"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            <h3 className={styles.taskTitle}>{task.title}</h3>
            <p className={styles.taskDescription}>{task.descricao}</p>

            <div className={styles.taskMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Estado:</span>
                <span
                  className={styles.stateBadge}
                  style={{ 
                    backgroundColor: getEstadoColor(task.estadoAtual),
                    color: '#fff'
                  }}
                >
                  {getEstadoLabel(task.estadoAtual)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Story Points:</span>
                <span
                  className={styles.storyPoints}
                  style={{ color: getStoryPointsColor(task.storyPoints) }}
                >
                  {task.storyPoints} SP
                </span>
              </div>
            </div>

            <div className={styles.taskDates}>
              <div className={styles.dateItem}>
                <i className="fa-solid fa-calendar-plus"></i>
                <span>Início Previsto: {new Date(task.dataPrevistaInicio).toLocaleDateString('pt-PT')}</span>
              </div>
              <div className={styles.dateItem}>
                <i className="fa-solid fa-calendar-day"></i>
                <span>Fim Previsto: {new Date(task.dataPrevistaFim).toLocaleDateString('pt-PT')}</span>
              </div>
              {task.dataRealInicio && (
                <div className={styles.dateItem}>
                  <i className="fa-solid fa-play"></i>
                  <span>Início Real: {new Date(task.dataRealInicio).toLocaleDateString('pt-PT')}</span>
                </div>
              )}
              {task.dataRealFim && (
                <div className={styles.dateItem}>
                  <i className="fa-solid fa-flag-checkered"></i>
                  <span>Concluída: {new Date(task.dataRealFim).toLocaleDateString('pt-PT')}</span>
                </div>
              )}
            </div>

            {(userRole === 'gestor' || userRole === 'programador') && task.programadorNome && (
              <div className={styles.assignedTo}>
                <i className="fa-solid fa-user"></i>
                <span>Atribuído a: {task.programadorNome}</span>
              </div>
            )}

            {userRole === 'programador' && task.estadoAtual !== 'Done' && (
              <div className={styles.stateActions}>
                {task.estadoAtual === 'ToDo' && (
                  <button
                    className={styles.startButton}
                    onClick={() => handleUpdateTaskState(task.id, 'Doing')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-play"></i>
                    )}
                    Iniciar Tarefa
                  </button>
                )}
                {task.estadoAtual === 'Doing' && (
                  <button
                    className={styles.completeButton}
                    onClick={() => handleUpdateTaskState(task.id, 'Done')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-check"></i>
                    )}
                    Concluir Tarefa
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className={styles.emptyState}>
          <i className="fa-solid fa-tasks"></i>
          <h3>Nenhuma tarefa encontrada</h3>
          <p>
            {userRole === 'gestor' 
              ? teamMembers.length === 0 
                ? 'Adicione programadores à sua equipa para começar a criar tarefas.' 
                : 'Comece por criar a primeira tarefa para a equipa.'
              : 'Ainda não tem tarefas atribuídas.'
            }
          </p>
        </div>
      )}

      {isTaskModalOpen && userRole === 'gestor' && (
        <div className={styles.modalOverlay} onClick={handleCloseTaskModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {selectedTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </h2>
              <button 
                className={styles.closeButton} 
                onClick={handleCloseTaskModal}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateTask} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título da Tarefa *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={styles.input}
                  placeholder="Ex: Corrigir bug no login..."
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Descrição *</label>
                <textarea
                  value={taskForm.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className={styles.textarea}
                  placeholder="Descreva os detalhes da tarefa..."
                  rows={4}
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Tarefa *</label>
                  <select
                    value={taskForm.idTipoTarefa}
                    onChange={(e) => handleInputChange('idTipoTarefa', e.target.value)}
                    className={styles.select}
                    required
                    disabled={actionLoading || taskTypes.length === 0}
                  >
                    <option value="">Selecione um tipo</option>
                    {taskTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nome}
                      </option>
                    ))}
                  </select>
                  {taskTypes.length === 0 && (
                    <div className={styles.errorMessage}>
                      <i className="fa-solid fa-exclamation-circle"></i>
                      Não há tipos de tarefa disponíveis
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Story Points *</label>
                  <select
                    value={taskForm.storyPoints}
                    onChange={(e) => handleInputChange('storyPoints', parseInt(e.target.value))}
                    className={styles.select}
                    required
                    disabled={actionLoading}
                  >
                    <option value={1}>1 SP</option>
                    <option value={2}>2 SP</option>
                    <option value={3}>3 SP</option>
                    <option value={5}>5 SP</option>
                    <option value={8}>8 SP</option>
                    <option value={13}>13 SP</option>
                    <option value={21}>21 SP</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Atribuir a *</label>
                  <select
                    value={taskForm.idProgramador}
                    onChange={(e) => handleInputChange('idProgramador', e.target.value)}
                    className={styles.select}
                    required
                    disabled={actionLoading || teamMembers.length === 0}
                  >
                    <option value="">Selecione um programador</option>
                    {teamMembers.map(member => (
                      <option key={member.idProgramador} value={member.idProgramador}>
                        {member.nome} ({member.nivelExperiencia})
                      </option>
                    ))}
                  </select>
                  {teamMembers.length === 0 && (
                    <div className={styles.errorMessage}>
                      <i className="fa-solid fa-exclamation-circle"></i>
                      Não há programadores na sua equipa
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Ordem de Execução</label>
                  <input
                    type="number"
                    value={taskForm.ordemExecucao}
                    onChange={(e) => handleInputChange('ordemExecucao', parseInt(e.target.value))}
                    className={styles.input}
                    min="1"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Data Prevista Início *</label>
                  <input
                    type="date"
                    value={taskForm.dataPrevistaInicio}
                    onChange={(e) => handleInputChange('dataPrevistaInicio', e.target.value)}
                    className={styles.input}
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Data Prevista Fim *</label>
                  <input
                    type="date"
                    value={taskForm.dataPrevistaFim}
                    onChange={(e) => handleInputChange('dataPrevistaFim', e.target.value)}
                    className={styles.input}
                    required
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseTaskModal}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={actionLoading || taskTypes.length === 0 || teamMembers.length === 0}
                >
                  {actionLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      A processar...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save"></i>
                      {selectedTask ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && taskToDelete && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteModalIcon}>
                <i className="fa-solid fa-exclamation-triangle"></i>
              </div>
              <h2>Eliminar Tarefa</h2>
            </div>

            <div className={styles.deleteModalContent}>
              <p>
                Tem a certeza que deseja eliminar a tarefa <strong>"{taskToDelete.title}"</strong>?
              </p>
              <p className={styles.deleteWarning}>
                <i className="fa-solid fa-info-circle"></i>
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className={styles.deleteModalActions}>
              <button
                className={styles.cancelDeleteButton}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-times"></i>
                Cancelar
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    A eliminar...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i>
                    Sim, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;