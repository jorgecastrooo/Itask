import type { Task } from '../types/task';

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "Implementar sistema de autenticação",
    description: "Criar login com JWT e refresh tokens",
    status: "doing",
    type: "feature",
    priority: "high",
    manager: "João Silva",
    programmer: "Maria Santos",
    startDate: "2024-01-15",
    dueDate: "2024-01-25",
    completedDate: null
  },
  {
    id: 2,
    title: "Corrigir bug no formulário de contacto",
    description: "Validar campos obrigatórios no mobile",
    status: "todo",
    type: "bug",
    priority: "medium",
    manager: "Ana Costa",
    programmer: "Pedro Oliveira",
    startDate: "2024-01-20",
    dueDate: "2024-01-30",
    completedDate: null
  },
  {
    id: 3,
    title: "Deploy da versão 2.0",
    description: "Fazer deploy em produção com zero downtime",
    status: "done",
    type: "deployment",
    priority: "high",
    manager: "João Silva",
    programmer: "Carlos Lima",
    startDate: "2024-01-10",
    dueDate: "2024-01-12",
    completedDate: "2024-01-12"
  },
  {
    id: 4,
    title: "Otimizar performance do banco",
    description: "Criar índices para queries lentas",
    status: "todo",
    type: "improvement",
    priority: "medium",
    manager: "Ana Costa",
    programmer: "Maria Santos",
    startDate: "2024-01-22",
    dueDate: "2024-02-01",
    completedDate: null
  },
  {
    id: 5,
    title: "Implementar dark mode",
    description: "Adicionar tema escuro à aplicação",
    status: "doing",
    type: "feature",
    priority: "low",
    manager: "João Silva",
    programmer: "Pedro Oliveira",
    startDate: "2024-01-18",
    dueDate: "2024-01-28",
    completedDate: null
  },
  {
    id: 6,
    title: "Configurar CI/CD pipeline",
    description: "Automatizar deploy com GitHub Actions",
    status: "done",
    type: "deployment",
    priority: "high",
    manager: "Ana Costa",
    programmer: "Carlos Lima",
    startDate: "2024-01-08",
    dueDate: "2024-01-15",
    completedDate: "2024-01-14"
  },
  {
    id: 7,
    title: "Refatorar componente de calendário",
    description: "Melhorar acessibilidade e performance",
    status: "doing",
    type: "improvement",
    priority: "medium",
    manager: "João Silva",
    programmer: "Maria Santos",
    startDate: "2024-01-25",
    dueDate: "2024-02-05",
    completedDate: null
  }
];