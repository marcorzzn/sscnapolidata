import os, re
base = r'C:\Users\marco\Desktop\sscnapolidata-remote'

def convert_layout(filepath, active_nav):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Add manifest and SW
    if '<link rel="manifest"' not in html:
        html = html.replace('<link rel="icon"', '<link rel="manifest" href="manifest.json">\n<link rel="icon"')
        
        if 'archivio' in filepath or 'fonti' in filepath:
            html = html.replace('href="manifest.json"', 'href="../manifest.json"')
            sw_path = '../sw.js'
        else:
            sw_path = 'sw.js'
            
        sw_script = f"""<script>
  if('serviceWorker' in navigator) {{ navigator.serviceWorker.register('{sw_path}'); }}"""
        html = html.replace('<script>', sw_script, 1)

    sidebar_home = 'index.html' if active_nav == 'home' else '../index.html'
    sidebar_arch = 'archivio/index.html' if sidebar_home == 'index.html' else '../archivio/index.html'
    sidebar_font = 'fonti/index.html' if sidebar_home == 'index.html' else '../fonti/index.html'

    act_home = ' active' if active_nav == 'home' else ''
    act_arch = ' active' if active_nav == 'arch' else ''
    act_font = ' active' if active_nav == 'font' else ''

    layout = f"""
<div class="app-container">
  <aside class="sidebar">
    <a class="brand" href="{sidebar_home}" style="text-decoration:none">DATA <span>NAPOLI</span></a>
    <nav class="nav-menu">
      <a href="{sidebar_home}" class="nav-item{act_home}">🏠 Home</a>
      <a href="{sidebar_arch}" class="nav-item{act_arch}">📚 Archivio</a>
      <a href="#" class="nav-item">Storico (WIP)</a>
      <a href="{sidebar_font}" class="nav-item{act_font}">📖 Fonti</a>
    </nav>
  </aside>
  <main class="page">
"""
    if '<div class="app-container">' not in html:
        html = html.replace('<div class="page">', layout)

    bottom_nav = f"""
  </main>
  <div class="right-panel"></div>
</div>

<nav class="bottom-nav">
  <a href="{sidebar_home}" class="{act_home.strip()}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
    Home
  </a>
  <a href="{sidebar_arch}" class="{act_arch.strip()}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    Archivio
  </a>
  <a href="{sidebar_font}" class="{act_font.strip()}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    Fonti
  </a>
</nav>
"""
    if '<nav class="bottom-nav">' not in html:
        # Trova l'ultimo </div> prima del JS (spesso è la fine di .page)
        html = html.replace('</div>\n<script src=', bottom_nav + '\n<script src=')
        html = html.replace('</div>\n<script>', bottom_nav + '\n<script>')

    if '<div class="brand-row">' in html:
        html = re.sub(r'<a class="brand".*?</a>', '', html, flags=re.DOTALL)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

convert_layout(os.path.join(base, 'index.html'), 'home')
convert_layout(os.path.join(base, 'archivio', 'index.html'), 'arch')
convert_layout(os.path.join(base, 'fonti', 'index.html'), 'font')
