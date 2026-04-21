from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Gestor(Base):
    __tablename__ = "Gestor"

    Id = Column(Integer, primary_key=True, index=True)
    Departamento = Column(String)

    programadores = relationship("Programador", back_populates="gestor")
    utilizadores = relationship("Utilizador", back_populates="gestor")

class PedidosAlteracao(Base):
    __tablename__ = "PedidosAlteracao"

    Id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    UserId = Column(Integer, ForeignKey("Utilizador.Id"), nullable=False)
    UserName = Column(String(100), nullable=False)
    Tipo = Column(String(50), nullable=False)
    DadosAtuais = Column(String, nullable=False)
    DadosSolicitados = Column(String, nullable=False)
    DataPedido = Column(DateTime, nullable=False)
    Status = Column(String(20), nullable=False)
    Justificativa = Column(String, nullable=True)
    DataProcessamento = Column(DateTime, nullable=True)
    ProcessadoPor = Column(Integer, ForeignKey("Utilizador.Id"), nullable=True)

    utilizador = relationship("Utilizador", foreign_keys=[UserId], backref="pedidos_enviados")
    processador = relationship("Utilizador", foreign_keys=[ProcessadoPor], backref="pedidos_processados")

class Programador(Base):
    __tablename__ = "Programador"

    Id = Column(Integer, primary_key=True, index=True)
    NivelExperiencia = Column(String)
    IdGestor = Column(Integer, ForeignKey("Gestor.Id"))

    gestor = relationship("Gestor", back_populates="programadores")
    utilizadores = relationship("Utilizador", back_populates="programador")
    tarefas = relationship("Tarefa", back_populates="programador")


class Utilizador(Base):
    __tablename__ = "Utilizador"

    Id = Column(Integer, primary_key=True, index=True)
    Nome = Column(String, nullable=False)
    Username = Column(String(50), unique=True)
    Password = Column(String, nullable=False)
    Email = Column(String(100), unique=True, nullable=True)
    Telefone = Column(String(20), nullable=True)
    IdProgramador = Column(Integer, ForeignKey("Programador.Id"))
    IdGestor = Column(Integer, ForeignKey("Gestor.Id"))

    gestor = relationship("Gestor", back_populates="utilizadores")
    programador = relationship("Programador", back_populates="utilizadores")


class TipoTarefa(Base):
    __tablename__ = "TipoTarefa"

    Id = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(50), nullable=False)
    Descricao = Column(String(500), nullable=True)
    Cor = Column(String(20), nullable=False, default="#4cdb94ac")
    Icone = Column(String(50), nullable=False, default="fa-tasks")
    Ativo = Column(Boolean, nullable=False, default=True)
    DataCriacao = Column(DateTime, default=datetime.utcnow)

    tarefas = relationship("Tarefa", back_populates="tipo_tarefa")


class Tarefa(Base):
    __tablename__ = "Tarefa"

    Id = Column(Integer, primary_key=True, index=True)
    IdGestor = Column(Integer, ForeignKey("Gestor.Id"), nullable=False)
    IdProgramador = Column(Integer, ForeignKey("Programador.Id"), nullable=False)
    OrdemExecucao = Column(Integer, nullable=False)
    Descricao = Column(String, nullable=True)
    DataPrevistaInicio = Column(DateTime, nullable=False)
    DataPrevistaFim = Column(DateTime, nullable=False)
    IdTipoTarefa = Column(Integer, ForeignKey("TipoTarefa.Id"), nullable=False)
    StoryPoints = Column(Integer, nullable=False)
    DataRealInicio = Column(DateTime, nullable=True)
    DataRealFim = Column(DateTime, nullable=True)
    DataCriacao = Column(DateTime, default=datetime.utcnow)
    EstadoAtual = Column(String(50), default="ToDo")
    Title = Column(String(200), default="")
    TipoTipoTarefa = Column(String(100), nullable=True)
    ProgramadorNome = Column(String(100), nullable=True)
    GestorNome = Column(String(100), nullable=True)
    Date = Column(DateTime, nullable=True)

    programador = relationship("Programador", back_populates="tarefas")
    gestor = relationship("Gestor")
    tipo_tarefa = relationship("TipoTarefa", back_populates="tarefas")



