import json

def integrate_files_to_string():
    # Define file paths (adjust based on your folder structure)
    file_paths = {
        "services_description": "services_description.txt",
        "add_liquidity_schema": "add_liquidity_schema.json",
        "remove_liquidity_schema": "remove_liquidity_schema.json",
        "migrate_liquidity_schema": "migrate_liquidity_schema.json",
        "chain_infomation": "chain_info.json",
        "provider_info": "provider_info.json",
        "pools_information": "pools_information.json",
        "tokens_information": "tokens_information.json",
        "status_information": "status_info.json",
        "default_values": "default_values.json",
        "example_breakdown": "examples.txt",
        "response_format": "response_format.txt"
    }
    
    integrated_string = ""

    # Load and concatenate files
    for key, file_path in file_paths.items():
        file_path = f"prompts/{file_path}"
        
        try:
            with open(file_path, 'r') as file:
                content = file.read()
                if file_path.endswith(".json"):
                    # Pretty format JSON content
                    content = json.dumps(json.loads(content), indent=4)
                integrated_string += f"\n\n--- {key.replace('_', ' ').title()} ---\n"
                integrated_string += content
        except FileNotFoundError:
            print(f"Error: {file_path} not found. Skipping...")
            
    print(integrated_string)
    
    return integrated_string


if __name__ == "__main__":
    integrated_string = integrate_files_to_string()
    print(integrated_string)


