
import subprocess
import json
import os

def run_gemini_command(prompt: str, session_id: str = None, output_format: str = "json") -> dict | list:
    """
    Runs a Gemini CLI command and returns the parsed JSON output.
    """
    command = ["gemini", "-p", prompt, "--output-format", output_format]
    if session_id:
        command.extend(["--session", session_id])
    
    print(f"Executing command: {' '.join(command)}")
    process = subprocess.run(command, capture_output=True, text=True, check=True)
    
    try:
        if output_format == "json":
            return json.loads(process.stdout)
        elif output_format == "jsonl":
            # For jsonl, we expect multiple JSON objects, one per line.
            # We'll return a list of parsed JSON objects.
            return [json.loads(line) for line in process.stdout.strip().split('\n') if line.strip()]
        else:
            print(f"Unsupported output format: {output_format}")
            return {}
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"STDOUT: {process.stdout}")
        print(f"STDERR: {process.stderr}")
        return {}

def extract_conversation_data(cli_output: dict | list) -> tuple[str, dict, str | None]:
    """
    Extracts conversation response, token usage, and session ID from Gemini CLI output.
    Handles both 'json' and 'jsonl' output formats.
    """
    response_text = ""
    token_usage = {}
    session_id = None
    
    if isinstance(cli_output, dict): # Single JSON output (e.g., from --output-format json)
        if "response" in cli_output:
            response_text = cli_output["response"]
        if "stats" in cli_output and "token_usage" in cli_output["stats"]:
            token_usage = cli_output["stats"]["token_usage"]
        if "session_id" in cli_output: # Assuming session_id might be directly in top-level for simple json
            session_id = cli_output["session_id"]

    elif isinstance(cli_output, list): # List of JSON objects (e.g., from --output-format jsonl)
        for item in cli_output:
            if item.get("event") == "response" and "response" in item:
                response_text = item["response"] # Get the final response
            if item.get("event") == "stats" and "token_usage" in item.get("stats", {}):
                token_usage = item["stats"]["token_usage"] # Get the final token usage
            if item.get("event") == "init" and "session_id" in item:
                session_id = item["session_id"] # Get the session ID from init event
            # You might want to collect all user prompts and agent responses for a full conversation history
            # For simplicity, we're just getting the final response here.

    return response_text, token_usage, session_id

def build_conversation_context(user_prompts: list[str], agent_responses: list[str], token_info: dict) -> str:
    """
    Builds a comprehensive string representing the conversation context.
    """
    context = "--- CONVERSATION CONTEXT ---\n"
    for i, (prompt, response) in enumerate(zip(user_prompts, agent_responses)):
        context += f"USER {i+1}: {prompt}\n"
        context += f"AGENT {i+1}: {response}\n"

    context += "\n--- TOKEN USAGE ---\n"
    for key, value in token_info.items():
        context += f"{key.replace('_', ' ').title()}: {value}\n"

    context += "--- END CONTEXT ---"
    return context

def summarize_conversation_with_gemini(full_context: str) -> str:
    """
    (CONCEPTUAL) Sends the full conversation context to a Gemini model for summarization.
    This would typically involve using a Gemini API client (e.g., `google-generativeai` library).
    For this example, we'll just print the context and a placeholder for the summary.
    """
    print("--- Sending context for summarization (conceptual) ---")
    print(full_context)
    print("--- Invoking Gemini API for summarization... (placeholder) ---")
    
    # In a real scenario, you would do something like:
    # import google.generativeai as genai
    # genai.configure(api_key="YOUR_GEMINI_API_KEY")
    # model = genai.GenerativeModel('gemini-pro')
    # response = model.generate_content(f"Summarize the following conversation context:{full_context}")
    # return response.text
    
    return "This is a placeholder for the actual summarized conversation from Gemini."

if __name__ == "__main__":
    # --- Example Usage ---
    
    # Simulate a multi-turn conversation
    user_prompts_history = []
    agent_responses_history = []
    current_session_id = None
    
    # Turn 1
    prompt1 = "Hello Gemini, what can you do for me today?"
    user_prompts_history.append(prompt1)
    cli_output1 = run_gemini_command(prompt1, output_format="jsonl")
    response1, token_usage1, session_id1 = extract_conversation_data(cli_output1)
    agent_responses_history.append(response1)
    current_session_id = session_id1
    
    print("--- Turn 1 Results ---")
    print(f"Agent Response: {response1}")
    print(f"Token Usage: {token_usage1}")
    print(f"Session ID: {current_session_id}")

    # Turn 2 (using the same session_id)
    if current_session_id:
        prompt2 = "Can you help me write a Python script to manage files?"
        user_prompts_history.append(prompt2)
        cli_output2 = run_gemini_command(prompt2, session_id=current_session_id, output_format="jsonl")
        response2, token_usage2, session_id2 = extract_conversation_data(cli_output2) # token_usage2 will reflect combined usage
        agent_responses_history.append(response2)
        # current_session_id should remain the same if --session was used
        
        print("--- Turn 2 Results ---")
        print(f"Agent Response: {response2}")
        print(f"Token Usage: {token_usage2}") # This will likely be the cummulative token usage for the session
        print(f"Session ID: {session_id2}")
    else:
        print("Could not get session ID from Turn 1, skipping Turn 2 simulation.")

    # Build the full context for summarization
    full_conversation_context = build_conversation_context(
        user_prompts_history, 
        agent_responses_history, 
        token_usage2 if current_session_id else token_usage1 # Use the latest token usage
    )
    
    # Get the summary
    summary = summarize_conversation_with_gemini(full_conversation_context)
    print(f"--- Conversation Summary ---{summary}")
    
    print("--- End of Script ---")
