import React, { useState, useEffect } from 'react';
import { TaskType } from '../types/taskType';
import styles from '../css/taskTypeManagement.module.css';

const TaskTypeManagement: React.FC = () => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskTypeToDelete, setTaskTypeToDelete] = useState<TaskType | null>(null);
  const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#4cdb94ac',
    icone: 'fa-tasks',
    ativo: true
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const availableIcons = [
    'fa-tasks', 'fa-bug', 'fa-rocket', 'fa-code', 'fa-file-alt', 
    'fa-vial', 'fa-palette', 'fa-mobile-alt', 'fa-database', 'fa-cloud',
    'fa-shield-alt', 'fa-chart-line', 'fa-cogs', 'fa-users', 
    'fa-comments', 'fa-search', 'fa-wrench', 'fa-lightbulb',
    'fa-exclamation-triangle', 'fa-check-circle', 'fa-clock'
  ];

  const fetchTaskTypes = async () => {
    setLoading(true);
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

      setTaskTypes(normalizedData);
    } catch (error) {
      console.error('Erro ao carregar tipos de tarefa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const handleOpenModal = (taskType?: TaskType) => {
    if (taskType) {
      setEditingTaskType(taskType);
      setFormData({
        nome: taskType.nome,
        descricao: taskType.descricao,
        cor: taskType.cor,
        icone: taskType.icone,
        ativo: taskType.ativo
      });
    } else {
      setEditingTaskType(null);
      setFormData({
        nome: '',
        descricao: '',
        cor: '#4cdb94ac',
        icone: 'fa-tasks',
        ativo: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTaskType(null);
    setFormData({
      nome: '',
      descricao: '',
      cor: '#4cdb94ac',
      icone: 'fa-tasks',
      ativo: true
    });
    setFormError('');
  };

  const handleOpenDeleteModal = (taskType: TaskType) => {
    setTaskTypeToDelete(taskType);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskTypeToDelete(null);
  };

  const criarTipoTarefaAPI = async (tipoData: any) => {
    try {
      const response = await fetch('http://localhost:8000/tipos-tarefa/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar tipo de tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tipo de tarefa:', error);
      throw error;
    }
  };

  const atualizarTipoTarefaAPI = async (tipoId: number, tipoData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/tipotarefa/${tipoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar tipo de tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar tipo de tarefa:', error);
      throw error;
    }
  };

  const eliminarTipoTarefaAPI = async (tipoId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/tipotarefa/${tipoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao eliminar tipo de tarefa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao eliminar tipo de tarefa:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setFormError('Por favor, insira um nome para o tipo de tarefa.');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      const tipoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        cor: formData.cor,
        icone: formData.icone,
        ativo: formData.ativo
      };

      if (editingTaskType) {
        await atualizarTipoTarefaAPI(editingTaskType.id, tipoData);
      } else {
        await criarTipoTarefaAPI(tipoData);
      }

      await fetchTaskTypes();
      handleCloseModal();

    } catch (error) {
      console.error('Erro ao guardar tipo de tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskTypeToDelete) return;

    setActionLoading(true);

    try {
      await eliminarTipoTarefaAPI(taskTypeToDelete.id);
      
      await fetchTaskTypes();
      handleCloseDeleteModal();

    } catch (error) {
      console.error('Erro ao eliminar tipo de tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (taskType: TaskType) => {
    setActionLoading(true);

    try {
      const updatedData = {
        nome: taskType.nome,
        descricao: taskType.descricao,
        cor: taskType.cor,
        icone: taskType.icone,
        ativo: !taskType.ativo
      };

      await atualizarTipoTarefaAPI(taskType.id, updatedData);
      
      await fetchTaskTypes();
      

    } catch (error) {
      console.error('Erro ao alterar estado do tipo de tarefa:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'nome' && value && formError) {
      setFormError('');
    }
  };

  if (loading) {
    return (
      <div className={styles.taskTypeManagement}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>A carregar tipos de tarefa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.taskTypeManagement}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Gestão de Tipos de Tarefa</h1>
          <p className={styles.subtitle}>
            Crie e gerir os tipos de tarefa disponíveis no sistema
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => handleOpenModal()}
          disabled={actionLoading}
        >
          <i className="fa-solid fa-plus"></i>
          Novo Tipo de Tarefa
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{taskTypes.length}</div>
          <div className={styles.statLabel}>Total de Tipos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {taskTypes.filter(t => t.ativo).length}
          </div>
          <div className={styles.statLabel}>Ativos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {taskTypes.filter(t => !t.ativo).length}
          </div>
          <div className={styles.statLabel}>Inativos</div>
        </div>
      </div>

      {taskTypes.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fa-solid fa-tasks"></i>
          <h3>Nenhum tipo de tarefa criado</h3>
          <p>Comece por criar o primeiro tipo de tarefa para organizar o seu trabalho.</p>
        </div>
      ) : (
        <div className={styles.taskTypesGrid}>
          {taskTypes.map(taskType => (
            <div
              key={taskType.id}
              className={`${styles.taskTypeCard} ${
                !taskType.ativo ? styles.inactive : ''
              }`}
            >
              <div
                className={styles.colorBar}
                style={{ backgroundColor: taskType.cor }}
              ></div>
              
              <div className={styles.cardHeader}>
                <div 
                  className={styles.icon}
                  style={{ color: taskType.cor }}
                >
                  <i className={`fa-solid ${taskType.icone}`}></i>
                </div>
                <div className={styles.taskTypeInfo}>
                  <h3 className={styles.taskTypeName}>{taskType.nome}</h3>
                  <p className={styles.taskTypeDescription}>
                    {taskType.descricao || 'Sem descrição'}
                  </p>
                </div>
                <div className={styles.statusBadge}>
                  <span className={taskType.ativo ? styles.active : styles.inactive}>
                    {taskType.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Criado em:</span>
                  <span className={styles.creationDate}>
                    {taskType.dataCriacao.toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Cor:</span>
                  <div 
                    className={styles.colorPreview}
                    style={{ backgroundColor: taskType.cor }}
                  ></div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleOpenModal(taskType)}
                  disabled={actionLoading}
                >
                  <i className="fa-solid fa-edit"></i>
                  Editar
                </button>
                <button
                  className={styles.toggleButton}
                  onClick={() => handleToggleStatus(taskType)}
                  disabled={actionLoading}
                >
                  <i className={`fa-solid ${taskType.ativo ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  {taskType.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleOpenDeleteModal(taskType)}
                  disabled={actionLoading}
                >
                  <i className="fa-solid fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {editingTaskType ? 'Editar Tipo de Tarefa' : 'Criar Novo Tipo de Tarefa'}
              </h2>
              <button 
                className={styles.closeButton} 
                onClick={handleCloseModal}
                disabled={actionLoading}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nome do Tipo de Tarefa *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`${styles.input} ${formError ? styles.inputError : ''}`}
                  placeholder="Ex: Bug, Feature, Documentação, Teste..."
                  required
                  disabled={actionLoading}
                />
                {formError && (
                  <div className={styles.errorMessage}>
                    <i className="fa-solid fa-exclamation-circle"></i>
                    {formError}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className={styles.textarea}
                  placeholder="Descreva o propósito deste tipo de tarefa..."
                  rows={3}
                  disabled={actionLoading}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cor de Identificação</label>
                  <div className={styles.colorInputContainer}>
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => handleInputChange('cor', e.target.value)}
                      className={styles.colorInput}
                      disabled={actionLoading}
                    />
                    <span className={styles.colorValue}>{formData.cor}</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Ícone</label>
                  <div className={styles.iconGrid}>
                    {availableIcons.map(icon => (
                      <label
                        key={icon}
                        className={`${styles.iconOption} ${
                          formData.icone === icon ? styles.selected : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="icon"
                          value={icon}
                          checked={formData.icone === icon}
                          onChange={(e) => handleInputChange('icone', e.target.value)}
                          className={styles.iconRadio}
                          disabled={actionLoading}
                        />
                        <i className={`fa-solid ${icon}`}></i>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {editingTaskType && (
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => handleInputChange('ativo', e.target.checked)}
                      className={styles.checkbox}
                      disabled={actionLoading}
                    />
                    <span className={styles.checkboxText}>Tipo de tarefa ativo</span>
                  </label>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      A processar...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save"></i>
                      {editingTaskType ? 'Atualizar' : 'Criar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && taskTypeToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteModalIcon}>
                <i className="fa-solid fa-exclamation-triangle"></i>
              </div>
              <h2>Eliminar Tipo de Tarefa</h2>
            </div>

            <div className={styles.deleteModalContent}>
              <p>
                Tem a certeza que deseja eliminar o tipo de tarefa <strong>"{taskTypeToDelete.nome}"</strong>?
              </p>
              <p className={styles.deleteWarning}>
                <i className="fa-solid fa-info-circle"></i>
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className={styles.deleteModalActions}>
              <button
                className={styles.cancelDeleteButton}
                onClick={handleCloseDeleteModal}
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

export default TaskTypeManagement;