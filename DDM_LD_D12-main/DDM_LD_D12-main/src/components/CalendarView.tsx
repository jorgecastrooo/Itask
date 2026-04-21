import React, { useState } from 'react';
import TaskDetails_pop from './TaskDetails_pop';
import { Task } from '../types/task';
import styles from '../css/calendar.module.css';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState<boolean>(false);
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const sampleTasks: Task[] = [
    { 
      id: 1, 
      idGestor: 1,
      idProgramador: 2,
      ordemExecucao: 1,
      descricao: 'Reunião diária com a equipa para sincronização de tarefas e identificação de bloqueios.',
      dataPrevistaInicio: new Date(),
      dataPrevistaFim: new Date(Date.now() + 3600000),
      idTipoTarefa: 1,
      storyPoints: 1,
      dataCriacao: new Date(Date.now() - 86400000),
      estadoAtual: 'Doing',
      tipoTipoTarefa: 'Reunião',
      programadorNome: 'João Developer',
      gestorNome: 'Maria Gestora',
      title: 'Reunião Daily',
      type: 'meeting',
      date: new Date()
    },
    { 
      id: 2, 
      idGestor: 1,
      idProgramador: 2,
      ordemExecucao: 2,
      descricao: 'Desenvolvimento da nova feature de autenticação com dois fatores.',
      dataPrevistaInicio: new Date(Date.now() + 86400000),
      dataPrevistaFim: new Date(Date.now() + 259200000),
      idTipoTarefa: 2,
      storyPoints: 5,
      dataCriacao: new Date(Date.now() - 172800000),
      estadoAtual: 'ToDo',
      tipoTipoTarefa: 'Desenvolvimento',
      programadorNome: 'João Developer',
      gestorNome: 'Maria Gestora',
      title: 'Desenvolvimento Feature X',
      type: 'development',
      date: new Date(Date.now() + 86400000)
    },
    { 
      id: 3, 
      idGestor: 1,
      idProgramador: 2,
      ordemExecucao: 3,
      descricao: 'Revisão de código do módulo de pagamentos implementado pela equipa B.',
      dataPrevistaInicio: new Date(Date.now() + 172800000),
      dataPrevistaFim: new Date(Date.now() + 259200000),
      idTipoTarefa: 3,
      storyPoints: 3,
      dataRealInicio: new Date(Date.now() + 172800000),
      dataCriacao: new Date(Date.now() - 259200000),
      estadoAtual: 'Doing',
      tipoTipoTarefa: 'Review',
      programadorNome: 'João Developer',
      gestorNome: 'Maria Gestora',
      title: 'Code Review',
      type: 'review',
      date: new Date(Date.now() + 172800000)
    }
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(year, selectedMonth);
    const firstDay = getFirstDayOfMonth(year, selectedMonth);
    
    const days: Array<{ date: Date; tasks: Task[] } | null> = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, selectedMonth, day);
      const dayTasks = sampleTasks.filter(task => 
        task.date.getDate() === day && 
        task.date.getMonth() === selectedMonth && 
        task.date.getFullYear() === year
      );
      days.push({ date, tasks: dayTasks });
    }
    
    return days;
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDaysData: Array<{ date: Date; tasks: Task[] }> = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayTasks = sampleTasks.filter(task => 
        task.date.getDate() === date.getDate() && 
        task.date.getMonth() === date.getMonth() && 
        task.date.getFullYear() === date.getFullYear()
      );
      
      weekDaysData.push({ date, tasks: dayTasks });
    }
    
    return weekDaysData;
  };

  const handleMonthChange = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
  };

  const handleViewTypeChange = (type: 'month' | 'week') => {
    setViewType(type);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setIsTaskDetailsOpen(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    console.log('Editar tarefa:', task);
    // Aqui você pode implementar a lógica de edição
    // Por exemplo, abrir um formulário de edição ou navegar para uma página de edição
  };

  const getTaskTypeClass = (type: string = 'default') => {
    switch (type) {
      case 'meeting': return styles.taskMeeting;
      case 'development': return styles.taskDevelopment;
      case 'review': return styles.taskReview;
      default: return styles.taskDefault;
    }
  };

  const monthDays = generateMonthDays();
  const weekDaysData = generateWeekDays();

  return (
    <>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarControls}>
          <div className={styles.viewTypeSelector}>
            <button
              className={`${styles.viewTypeButton} ${viewType === 'month' ? styles.active : ''}`}
              onClick={() => handleViewTypeChange('month')}
            >
              Mês
            </button>
            <button
              className={`${styles.viewTypeButton} ${viewType === 'week' ? styles.active : ''}`}
              onClick={() => handleViewTypeChange('week')}
            >
              Semana
            </button>
          </div>
          
          <div className={styles.monthSelector}>
            <select 
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month} {currentDate.getFullYear()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {viewType === 'month' ? (
            <>
              <div className={styles.weekDaysHeader}>
                {weekDays.map(day => (
                  <div key={day} className={styles.weekDay}>{day}</div>
                ))}
              </div>
              
              <div className={styles.monthGrid}>
                {monthDays.map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.calendarDay} ${
                      day ? styles.hasContent : styles.empty
                    } ${
                      day && day.date.getDate() === new Date().getDate() && 
                      day.date.getMonth() === new Date().getMonth() ? styles.today : ''
                    }`}
                  >
                    {day && (
                      <>
                        <div className={styles.dayHeader}>
                          <span className={styles.dayNumber}>{day.date.getDate()}</span>
                          <span className={styles.dayName}>
                            {weekDays[day.date.getDay()]}
                          </span>
                        </div>
                        
                        <div className={styles.tasksList}>
                          {day.tasks.map(task => (
                            <div
                              key={task.id}
                              className={`${styles.taskItem} ${getTaskTypeClass(task.type)}`}
                              onClick={() => handleTaskClick(task)}
                              title={`Clique para ver detalhes: ${task.title}`}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.weekDaysHeader}>
                {weekDays.map((day, index) => (
                  <div key={day} className={styles.weekDay}>
                    {day}
                    <br />
                    {weekDaysData[index]?.date.getDate()}
                  </div>
                ))}
              </div>
              
              <div className={styles.weekGrid}>
                {weekDaysData.map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.calendarDay} ${styles.weekDay} ${
                      day.date.getDate() === new Date().getDate() && 
                      day.date.getMonth() === new Date().getMonth() ? styles.today : ''
                    }`}
                  >
                    <div className={styles.tasksList}>
                      {day.tasks.map(task => (
                        <div
                          key={task.id}
                          className={`${styles.taskItem} ${getTaskTypeClass(task.type)}`}
                          onClick={() => handleTaskClick(task)}
                          title={`Clique para ver detalhes: ${task.title}`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <TaskDetails_pop
        task={selectedTask}
        isOpen={isTaskDetailsOpen}
        onClose={handleCloseTaskDetails}
        onEdit={handleEditTask}
        userRole="programador" 
      />
    </>
  );
};

export default CalendarView;