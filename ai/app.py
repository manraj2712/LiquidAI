from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from ai_agent import generate_ai_response
from context_store import clear_context as clr_context

import json


app = FastAPI()

# Data model for user input
class ChatRequest(BaseModel):
    session_id: str
    message: str
    wallet_address: str = None

@app.post("/chat")
async def chat(request: ChatRequest):
    # Retrieve session context
    session_id = request.session_id
    user_message = request.message
    wallet_address = request.wallet_address

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")
    
    # Generate AI response  
    ai_response = generate_ai_response(user_message, session_id)
    
    json_response = json.loads(ai_response)
    
    if json_response.get("payload"):
        json_response["payload"]["account"] = wallet_address

    return json_response


class CLearContextRequest(BaseModel):
    session_id: str
    
@app.post("/clear_context")
async def clear_context(request: CLearContextRequest):
    session_id = request.session_id
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")
    
    clr_context(session_id)
    
    return {"message": "Context cleared successfully"}