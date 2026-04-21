from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UtilizadorLogin(BaseModel):
    username: str
    password: str


class UtilizadorCreate(BaseModel):
    nome: str
    username: str
    password: str
    tipo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    departamento: Optional[str] = None
    nivel_experiencia: Optional[str] = None
    id_gestor: Optional[int] = None


class UtilizadorResponse(BaseModel):
    id: int = Field(alias="Id")
    nome: str = Field(alias="Nome")
    username: str = Field(alias="Username")
    email: Optional[str] = Field(alias="Email", default=None)
    telefone: Optional[str] = Field(alias="Telefone", default=None)
    id_programador: Optional[int] = Field(alias="IdProgramador", default=None)
    id_gestor: Optional[int] = Field(alias="IdGestor", default=None)

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class GestorUpdate(BaseModel):
    departamento: str | None = None
    nome: str | None = None
    username: str | None = None
    email: str | None = None
    telefone: str | None = None


class TipoTarefaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = "#4cdb94ac"
    icone: Optional[str] = "fa-tasks"
    ativo: Optional[bool] = True


class TipoTarefaCreate(TipoTarefaBase):
    pass


class TipoTarefaResponse(BaseModel):
    id: int = Field(alias="Id")
    nome: str = Field(alias="Nome")
    descricao: Optional[str] = Field(alias="Descricao", default=None)
    cor: str = Field(alias="Cor")
    icone: str = Field(alias="Icone")
    ativo: bool = Field(alias="Ativo")
    data_criacao: datetime = Field(alias="DataCriacao")

    model_config = {"from_attributes": True, "populate_by_name": True}


class TarefaCreate(BaseModel):
    id_gestor: int
    id_programador: int
    id_tipo_tarefa: int
    ordem_execucao: int
    descricao: Optional[str] = None
    data_prevista_inicio: datetime
    data_prevista_fim: datetime
    story_points: int
    data_real_inicio: Optional[datetime] = None
    data_real_fim: Optional[datetime] = None
    estado_atual: Optional[str] = "ToDo"
    title: Optional[str] = ""
    tipo_tipo_tarefa: Optional[str] = None
    programador_nome: Optional[str] = None
    gestor_nome: Optional[str] = None
    date: Optional[datetime] = None


class TarefaResponse(BaseModel):
    id: int = Field(alias="Id")
    id_gestor: int = Field(alias="IdGestor")
    id_programador: int = Field(alias="IdProgramador")
    id_tipo_tarefa: int = Field(alias="IdTipoTarefa")
    ordem_execucao: int = Field(alias="OrdemExecucao")
    descricao: Optional[str] = Field(alias="Descricao", default=None)
    data_prevista_inicio: datetime = Field(alias="DataPrevistaInicio")
    data_prevista_fim: datetime = Field(alias="DataPrevistaFim")
    story_points: int = Field(alias="StoryPoints")
    data_real_inicio: Optional[datetime] = Field(alias="DataRealInicio", default=None)
    data_real_fim: Optional[datetime] = Field(alias="DataRealFim", default=None)
    data_criacao: datetime = Field(alias="DataCriacao")
    estado_atual: str = Field(alias="EstadoAtual")
    title: str = Field(alias="Title")
    tipo_tipo_tarefa: Optional[str] = Field(alias="TipoTipoTarefa", default=None)
    programador_nome: Optional[str] = Field(alias="ProgramadorNome", default=None)
    gestor_nome: Optional[str] = Field(alias="GestorNome", default=None)
    date: Optional[datetime] = Field(alias="Date", default=None)

    model_config = {"from_attributes": True, "populate_by_name": True}

class PedidosAlteracaoBase(BaseModel):
    UserId: int
    UserName: str
    Tipo: str
    DadosAtuais: str
    DadosSolicitados: str
    DataPedido: datetime
    Status: str
    Justificativa: Optional[str] = None
    DataProcessamento: Optional[datetime] = None
    ProcessadoPor: Optional[int] = None


class PedidosAlteracaoCreate(PedidosAlteracaoBase):
    pass


class PedidosAlteracaoUpdate(BaseModel):
    Status: Optional[str] = None
    Justificativa: Optional[str] = None
    DataProcessamento: Optional[datetime] = None
    ProcessadoPor: Optional[int] = None


class PedidosAlteracaoResponse(PedidosAlteracaoBase):
    Id: int = Field(alias="Id")

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }