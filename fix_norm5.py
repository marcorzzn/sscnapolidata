import sys
import re

def fix(p):
    with open(p, 'r', encoding='utf-8') as f: c = f.read()
    
    new_func = 'def norm_light(name):\n    if not name: return ""\n    s = unidecode(name).lower()\n    s = re.sub(r"[-.,\'\u2019]", " ", s)\n    s = re.sub(r"\\s+", " ", s).strip()\n    return s\n\ndef norm_key'
    
    c = re.sub(r'def norm_light\(name\):.*?def norm_key', lambda m: new_func, c, flags=re.DOTALL)
    
    with open(p, 'w', encoding='utf-8') as f: f.write(c)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
fix(os.path.join(BASE_DIR, 'scripts', '65_resolve_names.py'))
fix(os.path.join(BASE_DIR, 'scripts', '64_seed_identities.py'))
fix(os.path.join(BASE_DIR, 'scripts', '80_review_names.py'))
