from typing import List
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import crud, schemas
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="API de Utilizadores", version="1.0")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.post("/gestores", response_model=schemas.UtilizadorResponse)
def criar_gestor(user: schemas.UtilizadorCreate, db: Session = Depends(get_db)):
    novo_user = crud.criar_utilizador(db, user)
    return schemas.UtilizadorResponse.from_orm(novo_user)

@app.post("/programadores/{id_gestor}", response_model=schemas.UtilizadorResponse)
def criar_programador(id_gestor: int, user: schemas.UtilizadorCreate, db: Session = Depends(get_db)):
    user.tipo = "programador"
    novo_user = crud.criar_utilizador(db, user, id_gestor_autenticado=id_gestor)
    return schemas.UtilizadorResponse.from_orm(novo_user)

@app.put("/programadores/{id_programador}/gestor/{id_gestor}")
def atualizar_programador(id_programador: int, id_gestor: int, dados: dict, db: Session = Depends(get_db)):
    return crud.atualizar_programador(db, id_programador, dados, id_gestor)

@app.delete("/programadores/{id_programador}/gestor/{id_gestor}")
def eliminar_programador(id_programador: int, id_gestor: int, db: Session = Depends(get_db)):
    return crud.eliminar_programador(db, id_programador, id_gestor)

@app.put("/gestores/{id_gestor}")
def atualizar_gestor(id_gestor: int, dados: dict, db: Session = Depends(get_db)):
    return crud.atualizar_gestor(db, id_gestor, dados)


@app.delete("/gestores/{id_gestor}")
def eliminar_gestor(id_gestor: int, db: Session = Depends(get_db)):
    return crud.eliminar_gestor(db, id_gestor)


@app.get("/utilizadores", response_model=list[schemas.UtilizadorResponse])
def listar_users(db: Session = Depends(get_db)):
    return crud.listar_utilizadores(db)

@app.get("/utilizadores/completo")
def listar_utilizadores_completos(db: Session = Depends(get_db)):
    return crud.get_utilizadores_completo(db)

@app.get("/utilizadores/{id_utilizador}")
def obter_utilizador(id_utilizador: int, db: Session = Depends(get_db)):
    return crud.get_utilizador_completo_id(id_utilizador, db)


@app.post("/login")
def login(user: schemas.UtilizadorLogin, db: Session = Depends(get_db)):
    utilizador = crud.autenticar_utilizador(db, user.username, user.password)
    return {
        "message": f"Bem-vindo {utilizador.Nome}",
        "id": utilizador.Id,
        "Username": utilizador.Username
    }

@app.post("/tarefas", response_model=schemas.TarefaResponse)
def criar_tarefa(tarefa: schemas.TarefaCreate, db: Session = Depends(get_db)):
    return crud.criar_tarefa(db, tarefa)

@app.get("/tarefas", response_model=list[schemas.TarefaResponse])
def listar_tarefas(db: Session = Depends(get_db)):
    return crud.listar_tarefas(db)

@app.post("/tipos-tarefa/", response_model=schemas.TipoTarefaResponse)
def criar_tipo_tarefa(tipo_tarefa: schemas.TipoTarefaBase, db: Session = Depends(get_db)):
    return crud.criar_tipo_tarefa(db, tipo_tarefa)

@app.get("/tipos-tarefa/", response_model=List[schemas.TipoTarefaResponse])
def listar_tipos_tarefa(db: Session = Depends(get_db)):
    return crud.listar_tipos_tarefa(db)

@app.get("/tipos-tarefa/{tipo_id}", response_model=schemas.TipoTarefaResponse)
def obter_tipo_tarefa(tipo_id: int, db: Session = Depends(get_db)):
    return crud.obter_tipo_tarefa(db, tipo_id)

@app.put("/tipotarefa/{tipo_id}", response_model=schemas.TipoTarefaResponse)
def atualizar_tipo_tarefa(tipo_id: int, tipo_data: schemas.TipoTarefaBase, db: Session = Depends(get_db)):
    tipo = crud.atualizar_tipo_tarefa(db, tipo_id, tipo_data)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de tarefa não encontrado")
    return tipo


@app.delete("/tipotarefa/{tipo_id}")
def eliminar_tipo_tarefa(tipo_id: int, db: Session = Depends(get_db)):
    tipo = crud.eliminar_tipo_tarefa(db, tipo_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de tarefa não encontrado")
    return {"mensagem": "Tipo de tarefa eliminado com sucesso"}


@app.put("/tarefas/{tarefa_id}", response_model=schemas.TarefaResponse)
def atualizar_tarefa(tarefa_id: int, tarefa_data: schemas.TarefaCreate, db: Session = Depends(get_db)):
    tarefa = crud.atualizar_tarefa(db, tarefa_id, tarefa_data)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@app.delete("/tarefas/{tarefa_id}")
def eliminar_tarefa(tarefa_id: int, db: Session = Depends(get_db)):
    tarefa = crud.eliminar_tarefa(db, tarefa_id)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return {"mensagem": "Tarefa eliminada com sucesso"}

@app.post("/pedidos/", response_model=schemas.PedidosAlteracaoResponse)
def criar_pedido(pedido: schemas.PedidosAlteracaoCreate, db: Session = Depends(get_db)):
    return crud.create_pedido(db=db, pedido_data=pedido)


@app.get("/pedidos/", response_model=list[schemas.PedidosAlteracaoResponse])
def listar_pedidos(db: Session = Depends(get_db)):
    return crud.listar_pedidos_alteracao(db)


@app.get("/pedidos/{pedido_id}", response_model=schemas.PedidosAlteracaoResponse)
def obter_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = crud.get_pedido_by_id(db, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido


@app.put("/pedidos/{pedido_id}", response_model=schemas.PedidosAlteracaoResponse)
def atualizar_pedido(pedido_id: int, pedido_update: schemas.PedidosAlteracaoUpdate, db: Session = Depends(get_db)):
    pedido = crud.update_pedido(db, pedido_id, pedido_update)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido


@app.delete("/pedidos/{pedido_id}")
def apagar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    result = crud.delete_pedido(db, pedido_id)
    if not result:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido apagado com sucesso"}