import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { User } from '../types/user';
import styles from '../css/kanbanBoard.module.css';

interface KanbanBoardProps {
  currentUser: User;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/tarefas');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      const data = await response.json();
      
      console.log('DEBUG - Todas as tarefas da API:', data);
      
      const normalizedData = data.map((task: any) => ({
        id: task.Id,
        idGestor: task.IdGestor,
        idProgramador: task.IdProgramador, 
        ordemExecucao: task.OrdemExecucao,
        descricao: task.Descricao || '',
        dataPrevistaInicio: new Date(task.DataPrevistaInicio),
        dataPrevistaFim: new Date(task.DataPrevistaFim),
        idTipoTarefa: task.IdTipoTarefa,
        storyPoints: task.StoryPoints,
        dataRealInicio: task.DataRealInicio ? new Date(task.DataRealInicio) : null,
        dataRealFim: task.DataRealFim ? new Date(task.DataRealFim) : null,
        dataCriacao: new Date(task.DataCriacao),
        estadoAtual: task.EstadoAtual || 'ToDo',
        title: task.Title || '',
        tipoTipoTarefa: task.TipoTipoTarefa || '',
        programadorNome: task.ProgramadorNome || '',
        gestorNome: task.GestorNome || '',
        date: task.Date ? new Date(task.Date) : null
      }));

      console.log('DEBUG - Dados normalizados:', normalizedData);

      if (currentUser.tipo === 'Programador') {
        try {
          const userResponse = await fetch(`http://localhost:8000/utilizadores/${currentUser.id}`);
          const userData = await userResponse.json();
          
          console.log('DEBUG - Dados completos do usuário da API:', userData);
          
          if (userData.dados_programador) {
            const programadorId = userData.dados_programador.id_programador;
            console.log('DEBUG - ID do programador encontrado:', programadorId);
            
            const userTasks = normalizedData.filter(task => {
              console.log(`DEBUG - Comparando: task.idProgramador=${task.idProgramador} (tipo: ${typeof task.idProgramador}) com programadorId=${programadorId} (tipo: ${typeof programadorId})`);
              return task.idProgramador === programadorId;
            });
            
            console.log('DEBUG - Tarefas filtradas:', userTasks);
            setTasks(userTasks);
          } else {
            console.log('DEBUG - Usuário não tem dados_programador na API');
            setTasks([]);
          }
        } catch (userError) {
          console.error('Erro ao carregar dados do usuário:', userError);
          setTasks([]);
        }
      } else {
        setTasks([]);
      }

    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarTarefaAPI = async (tarefaId: number, tarefaData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/tarefas/${tarefaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefaData),
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

  useEffect(() => {
    console.log('DEBUG - currentUser recebido:', currentUser);
    console.log('DEBUG - Tipo do usuário:', currentUser?.tipo);
    console.log('DEBUG - ID do usuário:', currentUser?.id);
    
    if (currentUser && currentUser.id) {
      if (currentUser.tipo === 'Programador') {
        fetchTasks();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);


  const getTasksByEstado = (estado: 'ToDo' | 'Doing' | 'Done') => {
    return tasks
      .filter(task => task.estadoAtual === estado)
      .sort((a, b) => a.ordemExecucao - b.ordemExecucao);
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleStartTask = async (task: Task) => {
    setActionLoading(true);
    
    try {
      const tarefaData = {
        id_gestor: task.idGestor,
        id_programador: task.idProgramador,
        ordem_execucao: task.ordemExecucao,
        descricao: task.descricao,
        data_prevista_inicio: task.dataPrevistaInicio.toISOString(),
        data_prevista_fim: task.dataPrevistaFim.toISOString(),
        id_tipo_tarefa: task.idTipoTarefa,
        story_points: task.storyPoints,
        data_real_inicio: new Date().toISOString(),
        data_real_fim: task.dataRealFim ? task.dataRealFim.toISOString() : null,
        estado_atual: 'Doing',
        title: task.title,
        tipo_tipo_tarefa: task.tipoTipoTarefa,
        programador_nome: task.programadorNome,
        gestor_nome: task.gestorNome,
        date: task.date ? task.date.toISOString() : null
      };

      await atualizarTarefaAPI(task.id, tarefaData);
      
      await fetchTasks();
      
      
    } catch (error) {
      console.error('Erro ao iniciar tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    setActionLoading(true);
    
    try {
      const tarefaData = {
        id_gestor: task.idGestor,
        id_programador: task.idProgramador,
        ordem_execucao: task.ordemExecucao,
        descricao: task.descricao,
        data_prevista_inicio: task.dataPrevistaInicio.toISOString(),
        data_prevista_fim: task.dataPrevistaFim.toISOString(),
        id_tipo_tarefa: task.idTipoTarefa,
        story_points: task.storyPoints,
        data_real_inicio: task.dataRealInicio ? task.dataRealInicio.toISOString() : new Date().toISOString(),
        data_real_fim: new Date().toISOString(), 
        estado_atual: 'Done',
        title: task.title,
        tipo_tipo_tarefa: task.tipoTipoTarefa,
        programador_nome: task.programadorNome,
        gestor_nome: task.gestorNome,
        date: task.date ? task.date.toISOString() : null
      };

      await atualizarTarefaAPI(task.id, tarefaData);
      
      await fetchTasks();
      
      
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
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

  if (isLoading) {
    return (
      <div className={styles.kanbanBoard}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>A carregar quadro Kanban...</p>
        </div>
      </div>
    );
  }

  if (currentUser.tipo !== 'Programador') {
    return (
      <div className={styles.kanbanBoard}>
        <div className={styles.error}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          <h3>Acesso Restrito</h3>
          <p>Esta funcionalidade está disponível apenas para programadores.</p>
          <p>O seu tipo de utilizador é: <strong>{currentUser.tipo}</strong></p>
        </div>
      </div>
    );
  }

  const todoTasks = getTasksByEstado('ToDo');
  const doingTasks = getTasksByEstado('Doing');
  const doneTasks = getTasksByEstado('Done');

  return (
    <div className={styles.kanbanBoard}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quadro Kanban - Minhas Tarefas</h1>
          <p className={styles.subtitle}>
            Acompanhe o progresso das suas tarefas
          </p>
        </div>
      </div>

      <div className={styles.kanbanContainer}>
        <div className={styles.column}>
          <div className={styles.columnHeader} style={{ borderColor: '#f59e0b' }}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnStatus} style={{ backgroundColor: '#f59e0b' }}></span>
              Por Fazer
              <span className={styles.taskCount}>({todoTasks.length})</span>
            </h3>
          </div>
          <div className={styles.columnContent}>
            {todoTasks.map(task => (
              <div
                key={task.id}
                className={styles.taskCard}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskInfo}>
                    <span className={styles.order}>#{task.ordemExecucao}</span>
                    <span className={styles.taskType}>{task.tipoTipoTarefa}</span>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewTaskDetails(task)}
                      title="Ver detalhes"
                      disabled={actionLoading}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>

                <h4 className={styles.taskTitle}>{task.title}</h4>
                <p className={styles.taskDescription}>{task.descricao}</p>

                <div className={styles.taskMeta}>
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
                    <i className="fa-solid fa-calendar-day"></i>
                    <span>Vencimento: {task.dataPrevistaFim.toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>

                <div className={styles.stateActions}>
                  <button
                    className={styles.startButton}
                    onClick={() => handleStartTask(task)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-play"></i>
                    )}
                    Iniciar
                  </button>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && (
              <div className={styles.emptyColumn}>
                <i className="fa-solid fa-inbox"></i>
                <p>Nenhuma tarefa por fazer</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader} style={{ borderColor: '#3b82f6' }}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnStatus} style={{ backgroundColor: '#3b82f6' }}></span>
              Em Progresso
              <span className={styles.taskCount}>({doingTasks.length})</span>
            </h3>
          </div>
          <div className={styles.columnContent}>
            {doingTasks.map(task => (
              <div
                key={task.id}
                className={styles.taskCard}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskInfo}>
                    <span className={styles.order}>#{task.ordemExecucao}</span>
                    <span className={styles.taskType}>{task.tipoTipoTarefa}</span>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewTaskDetails(task)}
                      title="Ver detalhes"
                      disabled={actionLoading}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>

                <h4 className={styles.taskTitle}>{task.title}</h4>
                <p className={styles.taskDescription}>{task.descricao}</p>

                <div className={styles.taskMeta}>
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
                    <i className="fa-solid fa-play"></i>
                    <span>Iniciada: {task.dataRealInicio ? task.dataRealInicio.toLocaleDateString('pt-PT') : 'Hoje'}</span>
                  </div>
                </div>

                <div className={styles.stateActions}>
                  <button
                    className={styles.completeButton}
                    onClick={() => handleCompleteTask(task)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-check"></i>
                    )}
                    Concluir
                  </button>
                </div>
              </div>
            ))}
            {doingTasks.length === 0 && (
              <div className={styles.emptyColumn}>
                <i className="fa-solid fa-cogs"></i>
                <p>Nenhuma tarefa em progresso</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.columnHeader} style={{ borderColor: '#10b981' }}>
            <h3 className={styles.columnTitle}>
              <span className={styles.columnStatus} style={{ backgroundColor: '#10b981' }}></span>
              Concluída
              <span className={styles.taskCount}>({doneTasks.length})</span>
            </h3>
          </div>
          <div className={styles.columnContent}>
            {doneTasks.map(task => (
              <div
                key={task.id}
                className={styles.taskCard}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskInfo}>
                    <span className={styles.order}>#{task.ordemExecucao}</span>
                    <span className={styles.taskType}>{task.tipoTipoTarefa}</span>
                  </div>
                  <div className={styles.taskActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewTaskDetails(task)}
                      title="Ver detalhes"
                      disabled={actionLoading}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>

                <h4 className={styles.taskTitle}>{task.title}</h4>
                <p className={styles.taskDescription}>{task.descricao}</p>

                <div className={styles.taskMeta}>
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
                    <i className="fa-solid fa-flag-checkered"></i>
                    <span>Concluída: {task.dataRealFim ? task.dataRealFim.toLocaleDateString('pt-PT') : 'Hoje'}</span>
                  </div>
                </div>

                <div className={styles.completedInfo}>
                  <i className="fa-solid fa-check-circle"></i>
                  <span>Tarefa concluída</span>
                </div>
              </div>
            ))}
            {doneTasks.length === 0 && (
              <div className={styles.emptyColumn}>
                <i className="fa-solid fa-check-circle"></i>
                <p>Nenhuma tarefa concluída</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDetailModalOpen && selectedTask && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes da Tarefa</h2>
              <button 
                className={styles.closeButton} 
                onClick={handleCloseDetailModal}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h3 className={styles.detailTitle}>{selectedTask.title}</h3>
                <p className={styles.detailDescription}>{selectedTask.descricao}</p>
                
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estado:</span>
                    <span className={styles.detailValue}>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getEstadoColor(selectedTask.estadoAtual) }}
                      >
                        {getEstadoLabel(selectedTask.estadoAtual)}
                      </span>
                    </span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Tipo:</span>
                    <span className={styles.detailValue}>{selectedTask.tipoTipoTarefa}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Story Points:</span>
                    <span className={styles.detailValue} style={{ color: getStoryPointsColor(selectedTask.storyPoints) }}>
                      {selectedTask.storyPoints} SP
                    </span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Ordem de Execução:</span>
                    <span className={styles.detailValue}>#{selectedTask.ordemExecucao}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data Prevista Início:</span>
                    <span className={styles.detailValue}>
                      {selectedTask.dataPrevistaInicio.toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data Prevista Fim:</span>
                    <span className={styles.detailValue}>
                      {selectedTask.dataPrevistaFim.toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  
                  {selectedTask.dataRealInicio && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Data Real Início:</span>
                      <span className={styles.detailValue}>
                        {selectedTask.dataRealInicio.toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  )}
                  
                  {selectedTask.dataRealFim && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Data Real Fim:</span>
                      <span className={styles.detailValue}>
                        {selectedTask.dataRealFim.toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  )}
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Gestor:</span>
                    <span className={styles.detailValue}>{selectedTask.gestorNome}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data de Criação:</span>
                    <span className={styles.detailValue}>
                      {selectedTask.dataCriacao.toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;