// src/types/task.ts
export interface Task {
  id: number;
  idGestor: number;
  idProgramador: number;
  ordemExecucao: number;
  descricao: string;
  dataPrevistaInicio: Date;
  dataPrevistaFim: Date;
  idTipoTarefa: number;
  storyPoints: number;
  dataRealInicio?: Date;
  dataRealFim?: Date;
  dataCriacao: Date;
  estadoAtual: string;
  tipoTipoTarefa?: string;
  programadorNome?: string;
  gestorNome?: string;
  title?: string;
  type?: string;
  date: Date;
}