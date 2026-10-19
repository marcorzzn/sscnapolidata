import sys
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_func = '''def norm_light(name):
    if not name: return ""
    s = unidecode(name).lower()
    s = re.sub(r"[\\-\\.\\,\'\"’\`]", " ", s)
    s = re.sub(r\"\\s+\", " ", s).strip()
    return s

def norm_key'''

    # Fix the norm_light function using lambda
    content = re.sub(r'def norm_light\(name\):.*?def norm_key', lambda m: new_func, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
fix_file(os.path.join(BASE_DIR, 'scripts', '65_resolve_names.py'))
fix_file(os.path.join(BASE_DIR, 'scripts', '64_seed_identities.py'))
fix_file(os.path.join(BASE_DIR, 'scripts', '80_review_names.py'))