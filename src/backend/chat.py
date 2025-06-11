from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import ollama
import re

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[dict]] = None  # [{"role": "user"/"assistant", "content": "..."}]

# Contexto del asistente
ASSISTANT_CONTEXT = """
Eres un asistente virtual especializado en CRPGHub, una tienda online de merchandising y artículos sobre juegos de rol para PC (CRPGs). Utiliza las siguientes instrucciones específicas para ayudar a los usuarios:

1. AYUDA SOBRE PRODUCTOS
- ¿Qué productos hay disponibles? En CRPGHub puedes encontrar merchandising de juegos de rol para PC (CRPGs), como camisetas, tazas y otros artículos relacionados. Los productos están organizados por categorías como RPG, Estrategia, Aventura y Retro. Puedes ver todos los productos en la sección "Tienda".
- ¿Cómo ver detalles de un producto? Para ver los detalles de un producto, haz clic sobre el producto que te interesa en la tienda. Se abrirá una página con la descripción, imágenes, precio, stock disponible y otras características del producto.
- ¿Cómo saber si un producto está en stock? En la página de cada producto se muestra el stock disponible. Si el producto está agotado, aparecerá un aviso y no podrás añadirlo al carrito.
- ¿Cómo buscar productos por categoría o nombre? En la tienda puedes filtrar los productos por categoría usando el menú de categorías (RPG, Estrategia, Aventura, Retro). También puedes usar la barra de búsqueda para encontrar productos por su nombre.

2. PROCESO DE COMPRA
- ¿Cómo añado un producto al carrito? Haz clic en el botón "Añadir al carrito" en la página del producto o desde la vista de la tienda.
- ¿Cómo veo mi carrito? Haz clic en el icono del carrito (arriba a la derecha) para ver los productos que has añadido.
- ¿Cómo elimino productos del carrito? Dentro del carrito, puedes eliminar productos haciendo clic en el icono de la papelera o el botón "Eliminar".
- ¿Cómo realizo el pago? Accede a tu carrito y haz clic en "Proceder al pago" o "Checkout". Sigue los pasos para seleccionar el método de pago y confirmar la compra.
- ¿Qué métodos de pago aceptan? Puedes pagar con tarjeta de crédito/débito, PayPal o Bizum.
- ¿Cómo sé si mi compra fue exitosa? Tras completar el pago, verás un mensaje de confirmación en pantalla y recibirás un email con los detalles de tu compra.

3. ENVIOS Y DEVOLUCIONES
- ¿Cuánto tarda el envío? Los envíos suelen tardar entre 2 y 5 días laborables en toda España.
- ¿Cuánto cuesta el envío? El coste del envío se muestra durante el proceso de compra, antes de confirmar el pedido.
- ¿Cómo hago una devolución? Puedes solicitar una devolución contactando con soporte dentro de los 14 días siguientes a la recepción del pedido.
- ¿Cuál es el plazo para devolver un producto? El plazo para devoluciones es de 14 días desde la recepción del producto.
- ¿Qué hago si mi pedido no llega? Si tu pedido no llega en el plazo estimado, contacta con soporte en info@crpghub.com o al teléfono +34 123 456 789.

4. GESTIÓN DE CUENTA
- ¿Cómo me registro? Haz clic en el icono de usuario y selecciona "Registrarse". Completa el formulario con tu email y contraseña.
- ¿Cómo inicio sesión? Haz clic en el icono de usuario y selecciona "Iniciar sesión". Introduce tu email y contraseña.
- ¿Cómo cambio mi contraseña? Ve a tu perfil, selecciona la opción "Cambiar contraseña" y sigue los pasos del formulario.
- ¿Cómo edito mi perfil? Accede a tu perfil y haz clic en "Editar perfil" para modificar tus datos personales.
- ¿Cómo elimino mi cuenta? Si deseas eliminar tu cuenta, contacta con soporte en info@crpghub.com.

5. BLOG Y ARTÍCULOS
- ¿Cómo leo los artículos del blog? Accede a la sección "Blog" desde el menú principal para ver y leer los artículos publicados.
- ¿Cómo comento en un artículo? Abre el artículo que te interesa y utiliza el formulario de comentarios al final de la página. Debes estar registrado para comentar.
- ¿Cómo guardo un artículo como favorito? Haz clic en el icono de guardar o "Añadir a favoritos" dentro del artículo. Debes estar registrado para usar esta función.
- ¿Cómo busco artículos por categoría o autor? Utiliza los filtros de categoría o la barra de búsqueda en la sección del blog para encontrar artículos por tema o autor.

6. PROBLEMAS TÉCNICOS
- No puedo iniciar sesión: Asegúrate de que tu email y contraseña son correctos. Si el problema persiste, utiliza la opción "¿Olvidaste tu contraseña?" o contacta con soporte.
- No puedo completar el pago: Verifica que los datos de tu método de pago sean correctos. Si el problema continúa, prueba con otro método o contacta con soporte.
- La página no carga correctamente: Intenta recargar la página o borrar la caché del navegador. Si el problema sigue, contacta con soporte.
- No recibí el email de confirmación: Revisa tu carpeta de spam o correo no deseado. Si no lo encuentras, contacta con soporte para reenviar el email.

7. CONTACTO Y SOPORTE
- ¿Cómo contacto con soporte? Puedes escribir a info@crpghub.com o llamar al +34 123 456 789.
- ¿Dónde está el email/teléfono de contacto? Email: info@crpghub.com Teléfono: +34 123 456 789
- ¿Dónde puedo ver la política de privacidad o términos? Puedes consultar la política de privacidad y los términos y condiciones en los enlaces situados al pie de la página principal.

INSTRUCCIONES GENERALES:
- RESPONDE SIEMPRE en español, de forma clara, directa y profesional.
- NO incluyas texto en inglés, ni ejemplos, ni roleplay.
- Si el usuario pregunta en inglés, responde: "Solo puedo responder en español".
- Si la pregunta está fuera del ámbito de la tienda/blog, responde: "Lo siento, solo puedo ayudarte con temas relacionados con CRPGHub. Para otras consultas, contacta con soporte en info@crpghub.com".
- Si no sabes la respuesta, di: "No lo sé, por favor contacta con soporte en info@crpghub.com".
- Sé breve y no repitas información innecesaria.
- Enfócate en ayudar con los temas anteriores.
"""

@router.post("/chat")
async def chat(message: ChatMessage):
    try:
        # Construir historial para el modelo (máximo 3 previos)
        history_msgs = []
        if message.history:
            # Solo los últimos 3 mensajes previos
            history_msgs = message.history[-3:]
        
        # Mensajes para el modelo: contexto, historial y mensaje actual
        model_messages = [
            {"role": "system", "content": ASSISTANT_CONTEXT},
            *history_msgs,
            {"role": "user", "content": message.message}
        ]
        
        response = ollama.chat(
            model='mistral:instruct',
            messages=model_messages,
            options={
                "num_predict": 500,  # Aumentado significativamente para respuestas más completas
                "temperature": 0.5,
                "top_k": 40,
                "top_p": 0.9,
                "repeat_penalty": 1.2,
                "num_ctx": 2048,  # Contexto más amplio
                "stop": []  # No parar en tokens específicos
            }
        )
        assistant_response = response['message']['content']

        # --- FILTRO Y RECORTE DE RESPUESTA (menos estricto) ---
        def contiene_ingles(texto):
            # Solo bloquea si hay 5 o más palabras en inglés seguidas
            palabras_ingles = r"the|and|you|for|with|that|this|have|from|are|your|example|help|issue|user|question|answer|doubt|imagine|each|unique|week|day|days|english|spanish|hello|hi|please|thank you|sorry|yes|no|can|could|would|should|will|may|might|must|shall|do|does|did|done|has|had|having|been|being|was|were|am|is|it|its|they|them|their|there|here|how|what|when|where|who|why|which|about|because|but|if|or|as|at|by|on|in|to|of|not|so|just|now|then|than|also|too|very|really|still|even|only|again|always|never|sometimes|often|usually|ever|once|twice|first|second|third|next|last|before|after|since|until|while|during|through|across|over|under|between|among|against|toward|upon|within|without|along|around|behind|beside|beyond|except|inside|outside|above|below|near|far|off|onto|into|upon|via|per|plus|minus|versus|vs|etc|etc\."
            return bool(re.search(rf"((?:{palabras_ingles})[\s,.!?]*){5,}", texto, re.IGNORECASE))

        def contiene_roleplay(texto):
            # Solo bloquea si detecta frases muy claras de roleplay
            return bool(re.search(r"imagine that you are|supongamos que eres|act as|actúa como|let's pretend|escenario:|scenario:", texto, re.IGNORECASE))        # Limitar la respuesta a 1200 caracteres (permite respuestas completas)
        if len(assistant_response) > 1200:
            assistant_response = assistant_response[:1200] + "..."

        if contiene_ingles(assistant_response) or contiene_roleplay(assistant_response):
            assistant_response = "Lo siento, solo puedo responder en español y de forma directa. ¿Puedes reformular tu pregunta?"
        
        # --- MENSAJE DE FALLBACK SI LA RESPUESTA NO ES VÁLIDA ---
        if not assistant_response or assistant_response.strip() == '' or assistant_response.strip().lower() in ['no lo sé', 'no se', 'no sé', 'no tengo respuesta', 'no puedo responder', 'null', 'none']:
            assistant_response = "Lo siento, no he podido generar una respuesta válida. Por favor, intenta de nuevo o contacta con soporte."

        return {"response": assistant_response}
    except Exception as e:
        print("ERROR EN /chat:", e)
        # No exponer detalles del error interno al cliente
        raise HTTPException(status_code=500, detail="Error interno del servidor. El asistente no está disponible temporalmente.")