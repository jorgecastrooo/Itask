// src/types/taskType.ts
export interface TaskType {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  ativo: boolean;
  dataCriacao: Date;
}