from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import ollama
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O pon ["http://localhost:3000"] si quieres restringirlo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

# Contexto del asistente
ASSISTANT_CONTEXT = """
Eres un asistente virtual amigable y servicial para una tienda online. Tu objetivo es ayudar a los usuarios con:
1. Preguntas sobre productos
2. Ayuda con el proceso de compra
3. Resolución de problemas técnicos
4. Información sobre envíos y devoluciones
5. Cualquier otra consulta relacionada con la tienda

Mantén un tono profesional pero amigable. Si no sabes la respuesta a algo, sé honesto y sugiere contactar con el servicio de atención al cliente.
"""

@app.post("/chat")
async def chat(message: ChatMessage):
    try:
        response = ollama.chat(
            model='phi',  # Cambiamos a phi que es más rápido
            messages=[
                {"role": "system", "content": ASSISTANT_CONTEXT},
                {"role": "user", "content": message.message}
            ],
            options={
                "num_predict": 100,  # Limitamos la longitud de la respuesta
                "temperature": 0.7,  # Controlamos la creatividad
                "top_k": 40,        # Optimización de rendimiento
                "top_p": 0.9        # Optimización de rendimiento
            }
        )
        assistant_response = response['message']['content']
        return {"response": assistant_response}
    except Exception as e:
        print("ERROR EN /chat:", e)
        raise HTTPException(status_code=500, detail=str(e))