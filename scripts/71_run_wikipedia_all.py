import subprocess
import os
import glob

BASE_DIR = 'C:\\Users\\marco\\sscnapolidata-remoto'

print("--- SCARICANDO STAGIONI WIKIPEDIA ---")
for anno in range(1926, 2013):
    subprocess.run(['python', os.path.join(BASE_DIR, 'scripts', '70_import_wikipedia.py'), str(anno)], cwd=BASE_DIR)

print("--- IMPORTAZIONE CSV WIKIPEDIA NEL DB ---")
for csv_file in sorted(glob.glob(os.path.join(BASE_DIR, 'data', 'import', 'wikipedia', '*.csv'))):
    if 'cache' not in csv_file:
        print(f"Importing {csv_file}")
        subprocess.run(['python', os.path.join(BASE_DIR, 'scripts', '62_bulk_import_csv.py'), csv_file], cwd=BASE_DIR)

print("Operazione completata.")
