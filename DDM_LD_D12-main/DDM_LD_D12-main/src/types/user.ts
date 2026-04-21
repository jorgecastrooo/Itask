// src/types/user.ts
export interface User {
  id: number;
  nome: string;
  username: string;
  password: string;
  tipo: 'Gestor' | 'Programador';
  nivelExperiencia?: 'Júnior' | 'Sénior';
  departamento?: 'IT' | 'Marketing' | 'Administração';
  gestorAssociado?: string;
  email?: string;
  telefone?: string;
  tarefasAtivas?: number;        // ← Adiciona este campo
  tarefasConcluidas?: number;    // ← Adiciona este campo
}

export interface PedidoAlteracao {
  id: number;
  userId: number;
  userName: string;
  tipo: 'alteracao_perfil';
  dadosAtuais: Partial<User>;
  dadosSolicitados: Partial<User>;
  dataPedido: Date;
  status: 'pendente' | 'aprovado' | 'recusado';
  justificativa?: string;
}