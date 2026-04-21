from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models import PedidosAlteracao, Utilizador, Gestor, Programador
import schemas
from schemas import UtilizadorCreate
from passlib.context import CryptContext
from models import Tarefa, TipoTarefa

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_utilizadores_completo(db: Session):
    utilizadores = db.query(Utilizador).all()
    resultado = []

    for user in utilizadores:
        if user.IdProgramador is None:
            gestor = db.query(Gestor).filter(Gestor.Id == user.IdGestor).first()

            resultado.append({
                "id": user.Id,
                "nome": user.Nome,
                "username": user.Username,
                "email": user.Email,
                "telefone": user.Telefone,
                "tipo": "Gestor",
                "dados_gestor": {
                    "id_gestor": gestor.Id,
                    "departamento": gestor.Departamento
                } if gestor else None
            })

        else:
            programador = db.query(Programador).filter(Programador.Id == user.IdProgramador).first()

            resultado.append({
                "id": user.Id,
                "nome": user.Nome,
                "username": user.Username,
                "email": user.Email,
                "telefone": user.Telefone,
                "tipo": "Programador",
                "dados_programador": {
                    "id_programador": programador.Id,
                    "nivel_experiencia": programador.NivelExperiencia,
                    "id_gestor": programador.IdGestor
                } if programador else None
            })

    return resultado

def get_utilizador_completo_id(id_utilizador: int, db: Session):
    user = db.query(Utilizador).filter(Utilizador.Id == id_utilizador).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")

    if user.IdProgramador is None:
        gestor = db.query(Gestor).filter(Gestor.Id == user.IdGestor).first()

        return {
            "id": user.Id,
            "nome": user.Nome,
            "username": user.Username,
            "email": user.Email,
            "telefone": user.Telefone,
            "tipo": "Gestor",
            "dados_gestor": {
                "id_gestor": gestor.Id,
                "departamento": gestor.Departamento
            } if gestor else None
        }

    programador = db.query(Programador).filter(Programador.Id == user.IdProgramador).first()

    return {
        "id": user.Id,
        "nome": user.Nome,
        "username": user.Username,
        "email": user.Email,
        "telefone": user.Telefone,
        "tipo": "Programador",
        "dados_programador": {
            "id_programador": programador.Id,
            "nivel_experiencia": programador.NivelExperiencia,
            "id_gestor": programador.IdGestor
        } if programador else None
    }


def criar_utilizador(db: Session, user: UtilizadorCreate, id_gestor_autenticado: int | None = None):
    existing_user = db.query(Utilizador).filter(Utilizador.Username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username já existente.")

    if user.tipo.lower() == "gestor":
        gestor = Gestor(Departamento=user.departamento or "A definir")
        db.add(gestor)
        db.flush()

        novo_user = Utilizador(
            Nome=user.nome,
            Username=user.username,
            Password=get_password_hash(user.password),
            Email=user.email,
            Telefone=user.telefone,
            IdGestor=gestor.Id
        )
        db.add(novo_user)

    elif user.tipo.lower() == "programador":
        if not id_gestor_autenticado:
            raise HTTPException(
                status_code=403,
                detail="É necessário um gestor autenticado para criar um programador."
            )
        programador = Programador(
            NivelExperiencia=user.nivel_experiencia or "Júnior",
            IdGestor=id_gestor_autenticado
        )
        db.add(programador)
        db.flush()

        novo_user = Utilizador(
            Nome=user.nome,
            Username=user.username,
            Password=get_password_hash(user.password),
            Email=user.email,
            Telefone=user.telefone,
            IdProgramador=programador.Id,
            IdGestor=id_gestor_autenticado
        )
        db.add(novo_user)

    else:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    db.commit()
    db.refresh(novo_user)
    return novo_user

def autenticar_utilizador(db: Session, username: str, password: str):
    utilizador = db.query(Utilizador).filter(Utilizador.Username == username).first()

    if not utilizador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilizador não encontrado"
        )
    
    if not verify_password(password, utilizador.Password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password incorreta"
        )
    return utilizador

def atualizar_programador(db: Session, id_programador: int, dados: dict, id_gestor_autenticado: int):
    programador = db.query(Programador).filter(Programador.Id == id_programador).first()
    if not programador:
        raise HTTPException(status_code=404, detail="Programador não encontrado.")

    if programador.IdGestor != id_gestor_autenticado:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar este programador.")

    if "nivel_experiencia" in dados and dados["nivel_experiencia"]:
        programador.NivelExperiencia = dados["nivel_experiencia"]

    if "id_gestor" in dados and dados["id_gestor"]:
        novo_gestor = db.query(Gestor).filter(Gestor.Id == dados["id_gestor"]).first()
        if not novo_gestor:
            raise HTTPException(status_code=404, detail="Novo gestor não encontrado.")

        programador.IdGestor = dados["id_gestor"]

    utilizador = db.query(Utilizador).filter(Utilizador.IdProgramador == id_programador).first()
    if not utilizador:
        raise HTTPException(status_code=404, detail="Utilizador associado não encontrado.")

    if "nome" in dados and dados["nome"]:
        utilizador.Nome = dados["nome"]

    if "username" in dados and dados["username"]:
        utilizador.Username = dados["username"]

    if "email" in dados and dados["email"]:
        utilizador.Email = dados["email"]

    if "telefone" in dados and dados["telefone"]:
        utilizador.Telefone = dados["telefone"]
    
    if "id_gestor" in dados and dados["id_gestor"]:
        utilizador.IdGestor = dados["id_gestor"]

    db.commit()
    db.refresh(utilizador)
    return utilizador



def eliminar_programador(db: Session, id_programador: int, id_gestor_autenticado: int):
    programador = db.query(Programador).filter(Programador.Id == id_programador).first()
    if not programador:
        raise HTTPException(status_code=404, detail="Programador não encontrado.")

    if programador.IdGestor != id_gestor_autenticado:
        raise HTTPException(status_code=403, detail="Sem permissão para eliminar este programador.")

    utilizador = db.query(Utilizador).filter(Utilizador.IdProgramador == id_programador).first()
    if utilizador:
        db.delete(utilizador)

    db.delete(programador)
    db.commit()

    return {"detail": f"Programador {id_programador} eliminado com sucesso."}

def atualizar_gestor(db: Session, id_gestor: int, dados: dict):
    gestor = db.query(Gestor).filter(Gestor.Id == id_gestor).first()
    if not gestor:
        raise HTTPException(status_code=404, detail="Gestor não encontrado.")

    if "departamento" in dados:
        gestor.Departamento = dados["departamento"]

    utilizador = db.query(Utilizador).filter(Utilizador.IdGestor == id_gestor).first()
    if utilizador:
        if "nome" in dados:
            utilizador.Nome = dados["nome"]
        if "username" in dados:
            utilizador.Username = dados["username"]
        if "email" in dados:
            utilizador.Email = dados["email"]
        if "telefone" in dados:
            utilizador.Telefone = dados["telefone"]

    db.commit()
    return {"detail": "Gestor atualizado com sucesso"}

def eliminar_gestor(db: Session, id_gestor: int):
    gestor = db.query(Gestor).filter(Gestor.Id == id_gestor).first()
    if not gestor:
        raise HTTPException(status_code=404, detail="Gestor não encontrado.")

    programadores = db.query(Programador).filter(Programador.IdGestor == id_gestor).all()
    if len(programadores) > 0:
        raise HTTPException(
            status_code=403,
            detail="Não é possível eliminar o gestor pois ainda tem programadores associados."
        )

    utilizador = db.query(Utilizador).filter(Utilizador.IdGestor == id_gestor).first()
    if utilizador:
        db.delete(utilizador)

    db.delete(gestor)
    db.commit()

    return {"detail": f"Gestor {id_gestor} eliminado com sucesso."}

def listar_tarefas(db: Session):
    return db.query(Tarefa).all()

def criar_tarefa(db: Session, tarefa: schemas.TarefaCreate):
    programador = db.query(Programador).filter(Programador.Id == tarefa.id_programador).first()
    if not programador:
        raise HTTPException(status_code=404, detail="Programador não encontrado.")

    gestor = db.query(Gestor).filter(Gestor.Id == tarefa.id_gestor).first()
    if not gestor:
        raise HTTPException(status_code=404, detail="Gestor não encontrado.")

    tipo = db.query(TipoTarefa).filter(TipoTarefa.Id == tarefa.id_tipo_tarefa).first()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de tarefa não encontrado.")

    nova_tarefa = Tarefa(
        IdGestor=tarefa.id_gestor,
        IdProgramador=tarefa.id_programador,
        OrdemExecucao=tarefa.ordem_execucao,
        Descricao=tarefa.descricao,
        DataPrevistaInicio=tarefa.data_prevista_inicio,
        DataPrevistaFim=tarefa.data_prevista_fim,
        IdTipoTarefa=tarefa.id_tipo_tarefa,
        StoryPoints=tarefa.story_points,
        DataRealInicio=tarefa.data_real_inicio,
        DataRealFim=tarefa.data_real_fim,
        EstadoAtual=tarefa.estado_atual,
        Title=tarefa.title,
        TipoTipoTarefa=tarefa.tipo_tipo_tarefa,
        ProgramadorNome=tarefa.programador_nome,
        GestorNome=tarefa.gestor_nome,
        Date=tarefa.date,
    )

    db.add(nova_tarefa)
    db.commit()
    db.refresh(nova_tarefa)
    return nova_tarefa


def atualizar_tarefa(db: Session, tarefa_id: int, tarefa_data: schemas.TarefaCreate):
    tarefa = db.query(Tarefa).filter(Tarefa.Id == tarefa_id).first()
    if not tarefa:
        return None

    tarefa.IdGestor = tarefa_data.id_gestor
    tarefa.IdProgramador = tarefa_data.id_programador
    tarefa.IdTipoTarefa = tarefa_data.id_tipo_tarefa
    tarefa.OrdemExecucao = tarefa_data.ordem_execucao
    tarefa.Descricao = tarefa_data.descricao
    tarefa.DataPrevistaInicio = tarefa_data.data_prevista_inicio
    tarefa.DataPrevistaFim = tarefa_data.data_prevista_fim
    tarefa.StoryPoints = tarefa_data.story_points
    tarefa.DataRealInicio = tarefa_data.data_real_inicio
    tarefa.DataRealFim = tarefa_data.data_real_fim
    tarefa.EstadoAtual = tarefa_data.estado_atual
    tarefa.Title = tarefa_data.title
    tarefa.TipoTipoTarefa = tarefa_data.tipo_tipo_tarefa
    tarefa.ProgramadorNome = tarefa_data.programador_nome
    tarefa.GestorNome = tarefa_data.gestor_nome
    tarefa.Date = tarefa_data.date

    db.commit()
    db.refresh(tarefa)
    return tarefa


def eliminar_tarefa(db: Session, tarefa_id: int):
    tarefa = db.query(Tarefa).filter(Tarefa.Id == tarefa_id).first()
    if not tarefa:
        return None

    db.delete(tarefa)
    db.commit()
    return tarefa


def listar_utilizadores(db: Session):
    return db.query(Utilizador).all()

def criar_tipo_tarefa(db: Session, tipo_tarefa: schemas.TipoTarefaCreate):
    existente = db.query(TipoTarefa).filter(TipoTarefa.Nome == tipo_tarefa.nome).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um tipo de tarefa com esse nome."
        )

    novo_tipo = TipoTarefa(
        Nome=tipo_tarefa.nome,
        Descricao=tipo_tarefa.descricao,
        Cor=tipo_tarefa.cor or "#4cdb94ac",
        Icone=tipo_tarefa.icone or "fa-tasks",
        Ativo=tipo_tarefa.ativo if tipo_tarefa.ativo is not None else True,
        DataCriacao=datetime.utcnow()
    )

    db.add(novo_tipo)
    db.commit()
    db.refresh(novo_tipo)
    return novo_tipo


def listar_tipos_tarefa(db: Session):
    return db.query(TipoTarefa).all()


def obter_tipo_tarefa(db: Session, tipo_id: int):
    tipo = db.query(TipoTarefa).filter(TipoTarefa.Id == tipo_id).first()
    if not tipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de tarefa não encontrado."
        )
    return tipo


def atualizar_tipo_tarefa(db: Session, tipo_id: int, tipo_data: schemas.TipoTarefaBase):
    tipo = db.query(TipoTarefa).filter(TipoTarefa.Id == tipo_id).first()
    if not tipo:
        return None

    tipo.Nome = tipo_data.nome
    tipo.Descricao = tipo_data.descricao
    tipo.Cor = tipo_data.cor
    tipo.Icone = tipo_data.icone
    tipo.Ativo = tipo_data.ativo

    db.commit()
    db.refresh(tipo)
    return tipo


def eliminar_tipo_tarefa(db: Session, tipo_id: int):
    tipo = db.query(TipoTarefa).filter(TipoTarefa.Id == tipo_id).first()
    if not tipo:
        return None

    db.delete(tipo)
    db.commit()
    return tipo


def create_pedido(db: Session, pedido_data: schemas.PedidosAlteracaoCreate):
    user = db.query(Utilizador).filter(Utilizador.Id == pedido_data.UserId).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado para o campo UserId.")

    if pedido_data.ProcessadoPor:
        processador = db.query(Utilizador).filter(Utilizador.Id == pedido_data.ProcessadoPor).first()
        if not processador:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado para o campo ProcessadoPor.")

    pedido = PedidosAlteracao(
        UserId=pedido_data.UserId,
        UserName=pedido_data.UserName,
        Tipo=pedido_data.Tipo,
        DadosAtuais=pedido_data.DadosAtuais,
        DadosSolicitados=pedido_data.DadosSolicitados,
        DataPedido=pedido_data.DataPedido,
        Status=pedido_data.Status,
        Justificativa=pedido_data.Justificativa,
        DataProcessamento=pedido_data.DataProcessamento,
        ProcessadoPor=pedido_data.ProcessadoPor
    )

    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return pedido


def listar_pedidos_alteracao(db: Session):
    return db.query(PedidosAlteracao).all()


def get_pedido_by_id(db: Session, pedido_id: int):
    pedido = db.query(PedidosAlteracao).filter(PedidosAlteracao.Id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido de alteração não encontrado.")
    return pedido


def update_pedido(db: Session, pedido_id: int, pedido_data: schemas.PedidosAlteracaoUpdate):
    pedido = db.query(PedidosAlteracao).filter(PedidosAlteracao.Id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido de alteração não encontrado.")

    if pedido_data.Status is not None:
        pedido.Status = pedido_data.Status
    if pedido_data.Justificativa is not None:
        pedido.Justificativa = pedido_data.Justificativa
    if pedido_data.DataProcessamento is not None:
        pedido.DataProcessamento = pedido_data.DataProcessamento
    if pedido_data.ProcessadoPor is not None:
        processador = db.query(Utilizador).filter(Utilizador.Id == pedido_data.ProcessadoPor).first()
        if not processador:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado para ProcessadoPor.")
        pedido.ProcessadoPor = pedido_data.ProcessadoPor

    db.commit()
    db.refresh(pedido)
    return pedido


def delete_pedido(db: Session, pedido_id: int):
    pedido = db.query(PedidosAlteracao).filter(PedidosAlteracao.Id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido de alteração não encontrado.")

    db.delete(pedido)
    db.commit()
    return pedido
