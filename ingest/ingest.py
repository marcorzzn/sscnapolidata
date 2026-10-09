import os
import shutil
import sqlite3
import glob
from datetime import datetime
import trafilatura
from charset_normalizer import from_bytes
import pdfplumber

# Configurazioni e percorsi
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX_DIR = os.path.join(BASE_DIR, 'inbox')
ARCHIVE_DIR = os.path.join(BASE_DIR, 'archive')
FOTO_DIR = os.path.join(BASE_DIR, 'foto')
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_DIR = os.path.join(BASE_DIR, 'db')
DB_PATH = os.path.join(DB_DIR, 'datanapoli.sqlite')
SCHEMA_PATH = os.path.join(DB_DIR, 'schema.sql')

# Crea le cartelle se non esistono
for d in [INBOX_DIR, ARCHIVE_DIR, FOTO_DIR, DATA_DIR]:
    os.makedirs(d, exist_ok=True)

def setup_db():
    """Inizializza il database SQLite usando schema.sql"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())
    conn.commit()
    return conn

def parse_note(note_path):
    """Legge il file note.txt ed estrae i metadati essenziali e le didascalie delle foto"""
    metadata = {
        'titolo': '',
        'fonte': '',
        'url': '',
        'data_raccolta': '',
        'tipo': '',
        'data_scatto': '',
        'confidence': '',
        'collector': '',
        'note': '',
        'foto_captions': {}
    }
    if not os.path.exists(note_path):
        return metadata

    with open(note_path, 'rb') as f:
        raw_data = f.read()
        best = from_bytes(raw_data).best()
        encoding = best.encoding if best else 'utf-8'

    with open(note_path, 'r', encoding=encoding, errors='ignore') as f:
        for line in f:
            line = line.strip().lstrip('﻿')
            if not line: continue
                
            if line.lower().startswith('titolo:'):
                metadata['titolo'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('fonte:'):
                metadata['fonte'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('url:'):
                metadata['url'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('data raccolta:') or line.lower().startswith('data:'):
                metadata['data_raccolta'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('tipo:'):
                metadata['tipo'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('data scatto:'):
                metadata['data_scatto'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('confidence:'):
                metadata['confidence'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('collector:'):
                metadata['collector'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('note:'):
                metadata['note'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('foto '):
                # Gestisce formati come "Foto 1: didascalia" o "Foto nomefile.jpg: didascalia"
                parts = line.split(':', 1)
                if len(parts) == 2:
                    key = parts[0].strip().lower()
                    caption = parts[1].strip()
                    metadata['foto_captions'][key] = caption
    return metadata

def estrai_testo(cartella):
    """Combina tutti i file testuali e PDF trovati nella cartella eccetto note.txt"""
    testo_completo = ""
    titolo = os.path.basename(cartella)
    
    # Text and Markdown
    for ext in ['*.txt', '*.md']:
        for file_path in glob.glob(os.path.join(cartella, ext)):
            if os.path.basename(file_path).lower() == 'note.txt':
                continue
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                best = from_bytes(raw_data).best()
                encoding = best.encoding if best else 'utf-8'
            with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
                testo_completo += f"\n--- Contenuto da {os.path.basename(file_path)} ---\n"
                testo_completo += f.read().lstrip('﻿')

    # HTML
    for ext in ['*.html', '*.htm']:
        for file_path in glob.glob(os.path.join(cartella, ext)):
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                best = from_bytes(raw_data).best()
                encoding = best.encoding if best else 'utf-8'
            with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
                html_content = f.read()
                estratto = trafilatura.extract(html_content)
                if estratto:
                    testo_completo += f"\n--- Contenuto da {os.path.basename(file_path)} ---\n"
                    testo_completo += estratto

    # PDF
    for file_path in glob.glob(os.path.join(cartella, '*.pdf')):
        try:
            with pdfplumber.open(file_path) as pdf:
                testo_pdf = ""
                for page in pdf.pages:
                    testo_pagina = page.extract_text()
                    if testo_pagina:
                        testo_pdf += testo_pagina + "\n"
                
                if testo_pdf.strip():
                    testo_completo += f"\n--- Contenuto da {os.path.basename(file_path)} ---\n"
                    testo_completo += testo_pdf
        except Exception as e:
            raise Exception(f"Errore lettura PDF {os.path.basename(file_path)}: {e}")
                
    return titolo, testo_completo

def process_inbox():
    """Esegue il ciclo completo di ingestione dalla cartella inbox/ al database SQLite"""
    print(f"Controllo la cartella inbox: {INBOX_DIR}...")
    
    # Prepara connessione DB
    conn = setup_db()
    cursor = conn.cursor()
    
    # Trova le sottocartelle dentro inbox/
    cartelle = [os.path.join(INBOX_DIR, d) for d in os.listdir(INBOX_DIR) 
                if os.path.isdir(os.path.join(INBOX_DIR, d))]
    
    if not cartelle:
        print("La cartella inbox è vuota. Non c'è nulla da elaborare.")
        conn.close()
        return

    cartelle_successo = 0
    cartelle_fallite = 0
    errori = []
    documenti_inseriti = 0
    foto_spostate = 0

    for cartella in cartelle:
        print(f"\nSto elaborando: {os.path.basename(cartella)}")
        try:
            # 1. Metadati
            note_path = os.path.join(cartella, 'note.txt')
            meta = parse_note(note_path)
            
            # 2. Testo e titolo
            titolo_cartella, testo = estrai_testo(cartella)
            titolo_finale = meta['titolo'] if meta['titolo'] else titolo_cartella
            
            # 3. Inserisci documento in DB
            cursor.execute("""
                INSERT INTO documenti (titolo, testo_completo, fonte, url, data_raccolta, tipo, confidence, collector, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (titolo_finale, testo, meta['fonte'], meta['url'], meta['data_raccolta'], meta['tipo'], meta['confidence'], meta['collector'], meta['note']))
            
            doc_id = cursor.lastrowid
            
            # 4. Prepara lo spostamento Immagini e l'inserimento
            foto_files = glob.glob(os.path.join(cartella, '*.[jJ][pP][gG]')) + \
                         glob.glob(os.path.join(cartella, '*.[jJ][pP][eE][gG]')) + \
                         glob.glob(os.path.join(cartella, '*.[pP][nN][gG]'))
            
            foto_files = sorted(foto_files, key=lambda p: os.path.basename(p).lower())
            
            tipo_pulito = ''.join(c for c in meta['tipo'] if c.isalnum() or c == '_').strip('_')
            prefisso_foto = f"foto_{tipo_pulito}_" if tipo_pulito else "foto_generico_"
            
            foto_da_spostare = []
            
            for i, foto_path in enumerate(foto_files, start=1):
                estensione = os.path.splitext(foto_path)[1].lower()
                nome_esatto = os.path.basename(foto_path)
                nome_originale_lower = nome_esatto.lower()
                
                # Cerca didascalia da 'foto nome_originale' per prima, altrimenti 'foto {i}'
                didascalia = meta['foto_captions'].get(f'foto {nome_originale_lower}', '')
                if not didascalia:
                    didascalia = meta['foto_captions'].get(f'foto {i}', '')
                
                # Nuovo nome univoco per non avere mai conflitti
                anno_corrente = datetime.now().strftime('%Y')
                nuovo_nome = f"{prefisso_foto}{anno_corrente}_doc{doc_id:04d}_{i:02d}{estensione}"
                nuovo_percorso = os.path.join(FOTO_DIR, nuovo_nome)
                
                percorso_db = f"foto/{nuovo_nome}"
                cursor.execute("""
                    INSERT INTO foto (percorso_file, didascalia, fonte, data_scatto, documento_id, data_raccolta, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (percorso_db, didascalia, meta['fonte'], meta['data_scatto'], doc_id, meta['data_raccolta'], meta['note']))
                
                foto_da_spostare.append((nome_esatto, nuovo_percorso))
                
            # Commit dei dati nel DB PRIMA di spostare i file nel filesystem
            conn.commit()
            
            # 5. Sposta l'intera cartella in archive/ gestendo collisioni
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            nome_cartella = os.path.basename(cartella)
            cartella_archiviata = os.path.join(ARCHIVE_DIR, nome_cartella)
            if os.path.exists(cartella_archiviata):
                cartella_archiviata = os.path.join(ARCHIVE_DIR, f"{nome_cartella}_{timestamp}")
                
            shutil.move(cartella, cartella_archiviata)
            
            # 6. Sposta le foto dalla cartella archiviata a FOTO_DIR
            foto_spostate_correttamente = 0
            try:
                for nome_esatto, nuovo_percorso in foto_da_spostare:
                    foto_path_archiviata = os.path.join(cartella_archiviata, nome_esatto)
                    if os.path.exists(foto_path_archiviata):
                        shutil.move(foto_path_archiviata, nuovo_percorso)
                        foto_spostate_correttamente += 1
            except Exception as move_exc:
                print(f"[ERRORE] durante lo spostamento delle foto in {FOTO_DIR}: {str(move_exc)}")
                # Il database è già stato committato, logghiamo solo l'errore per recupero manuale
            
            cartelle_successo += 1
            documenti_inseriti += 1
            foto_spostate += foto_spostate_correttamente
            
            print(f"[OK] Completato: inserito il documento e salvate {foto_spostate_correttamente} foto collegate.")
            
        except Exception as e:
            error_msg = f"Errore durante l'elaborazione di {os.path.basename(cartella)}: {str(e)}"
            print(f"[ERRORE] {error_msg}")
            errori.append(error_msg)
            cartelle_fallite += 1
            conn.rollback()
            continue

    conn.close()
    
    print("\n--- Riepilogo Finale ---")
    print(f"Cartelle processate con successo: {cartelle_successo}")
    print(f"Cartelle fallite: {cartelle_fallite}")
    print(f"Documenti inseriti: {documenti_inseriti}")
    print(f"Foto spostate: {foto_spostate}")
    print(f"Numero di errori: {len(errori)}")
    if errori:
        print("Elenco degli errori:")
        for err in errori:
            print(f" - {err}")

if __name__ == '__main__':
    process_inbox()
