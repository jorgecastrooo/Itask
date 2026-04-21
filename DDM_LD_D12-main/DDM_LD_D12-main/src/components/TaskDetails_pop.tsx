import React from 'react';
import { Task } from '../types/task';
import styles from '../css/calendar.module.css';

interface TaskDetailsPopupProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  userRole: string;
}

const TaskDetails_pop: React.FC<TaskDetailsPopupProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  userRole
}) => {
  if (!isOpen || !task) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'todo': return styles.statusTodo;
      case 'doing': return styles.statusDoing;
      case 'done': return styles.statusDone;
      default: return '';
    }
  };

  const getTaskTypeClass = (type: string = 'default') => {
    switch (type) {
      case 'meeting': return styles.taskTypeMeeting;
      case 'development': return styles.taskTypeDevelopment;
      case 'review': return styles.taskTypeReview;
      default: return '';
    }
  };

  const handleEditClick = () => {
    onEdit(task);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent}>
        <div className={styles.popupHeader}>
          <h2 className={styles.popupTitle}>{task.title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className={styles.taskDetails}>
          <div className={`${styles.detailRow} ${getTaskTypeClass(task.type)}`}>
            <span className={styles.detailLabel}>Descrição</span>
            <span className={styles.detailValue}>{task.descricao}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tipo & Estado</span>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <span className={styles.detailValue}>
                <strong>Tipo:</strong> {task.tipoTipoTarefa}
              </span>
              <span className={`${styles.detailValue} ${getStatusClass(task.estadoAtual)}`}>
                <strong>Estado:</strong> {task.estadoAtual}
              </span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Equipa</span>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <span className={styles.detailValue}>
                <strong>Programador:</strong> {task.programadorNome}
              </span>
              <span className={styles.detailValue}>
                <strong>Gestor:</strong> {task.gestorNome}
              </span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Detalhes</span>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <span className={styles.detailValue}>
                <strong>Story Points:</strong> {task.storyPoints}
              </span>
              <span className={styles.detailValue}>
                <strong>Ordem Execução:</strong> {task.ordemExecucao}
              </span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Datas Previstas</span>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <span className={styles.detailValue}>
                <strong>Início:</strong> {formatDate(task.dataPrevistaInicio)}
              </span>
              <span className={styles.detailValue}>
                <strong>Fim:</strong> {formatDate(task.dataPrevistaFim)}
              </span>
            </div>
          </div>

          {task.dataRealInicio && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Data Real de Início</span>
              <span className={styles.detailValue}>
                {formatDate(task.dataRealInicio)}
              </span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Data de Criação</span>
            <span className={styles.detailValue}>
              {formatDate(task.dataCriacao)}
            </span>
          </div>
        </div>

        <div className={styles.popupActions}>
          {userRole === 'gestor' && (
            <button className={styles.editButton} onClick={handleEditClick}>
              ✏️ Editar Tarefa
            </button>
          )}
          <button className={styles.closeActionButton} onClick={onClose}>
            🗙 Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails_pop;