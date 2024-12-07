import openai
from openai import OpenAI

from context_store import get_context , update_context

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Retrieve API key
API_KEY = os.getenv("API_KEY")

client = OpenAI(
        api_key=API_KEY
    )

def ask_openai(messages):
    """
    Query the OpenAI API with a given prompt and context.
    """
    completion  = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        # response_format={
        #     "type": "json_object"
        # },
        response_format={
            "type": "json_schema",
            "json_schema": {
            "name": "api_response",
            "strict": False,
            "schema": {
                "type": "object",
                "properties": {
                "status": {
                    "type": "string",
                    "description": "Indicates the status where you have all the info or not"
                },
                "description": {
                    "type": "string",
                    "description": "A detailed description of the response."
                },
                "API": {
                    "type": "string",
                    "description": "The name of the API that is to be called"
                },
                "payload": {
                    "type": "object",
                    "description": "The Payload of API to be called",
                    "additionalProperties": True
                },
                "missing_data": {
                    "type": "array",
                    "description": "A list of missing data items associated with the response.",
                    "items": {
                    "type": "string",
                    "description": "Each missing data item."
                    }
                }
                },
                "required": [
                    "status",
                    "description",
                    "API",
                    "payload",
                    "missing_data"
                ],
                "additionalProperties": False
            }
            }
        },
    )
    return completion.choices[0].message.content

def generate_ai_response(user_input, session_id):
    """
    Generate an AI response using the session context.
    """
    
    context = get_context(session_id)
    context.append({"role": "user", "content": user_input})
    
    ai_response = ask_openai(context)
    
    update_context(session_id, user_input, ai_response)
    
    return ai_response
