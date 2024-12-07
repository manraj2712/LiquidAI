from prompy_generator import integrate_files_to_string



# Context store using an in-memory dictionary
context_store : dict[str,list[dict]] = {}

def clear_context(session_id):
    """
    Clear the context for a specific session.
    """
    context_store.pop(session_id, None)

def get_prompt():
    # read file prompt.txt
    return integrate_files_to_string()

def get_context(session_id):
    """
    Retrieve the context for a specific session.
    """
    return context_store.get(session_id, [{"role": "system", "content": get_prompt()}])

def update_context(session_id, user_message, ai_response):
    """
    Update the context for a session.
    """
    context_store[session_id] = context_store.get(session_id, [{"role": "system", "content": get_prompt()}]) + [
        {"role": "user", "content": user_message},
        {"role": "system", "content": ai_response}
    ]
    
    
    
