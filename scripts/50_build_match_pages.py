import os
import json
import glob
from jinja2 import Environment, FileSystemLoader

def main():
    # Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    templates_dir = os.path.join(base_dir, 'scripts', 'templates')
    output_dir = os.path.join(base_dir, 'partite')

    # Ensure output dir exists
    os.makedirs(output_dir, exist_ok=True)

    # Setup Jinja2 environment
    env = Environment(loader=FileSystemLoader(templates_dir))
    
    # We will use match.html as our template
    try:
        template = env.get_template('match.html')
    except Exception as e:
        print(f"Error loading template: {e}")
        return

    # Find all JSON match files
    match_files = glob.glob(os.path.join(data_dir, '*-*-*.json'))
    
    if not match_files:
        print(f"No match JSON files found in {data_dir}. Waiting for data to be scraped.")
        return

    for file_path in match_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                match_data = json.load(f)
            
            slug = os.path.splitext(os.path.basename(file_path))[0]
            output_file = os.path.join(output_dir, f"{slug}.html")

            # Render template
            html_content = template.render(match=match_data)

            # Write to output
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
            print(f"Generated {output_file}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == '__main__':
    main()
