import re

src = open('matrix-lab.html', encoding='utf8').read()

# 1. the style block, verbatim, so the two weeks look identical
style = src[src.index('<style>'):src.index('</style>') + len('</style>')]

W3_CSS = """
/* week 3 additions */
.mx td.cross{color:var(--muted);opacity:.38;text-decoration:line-through}
.mx td.pick{background:var(--accent-soft);outline:2px solid var(--accent);outline-offset:-2px}
.mx td.sel{outline:2px solid var(--hot);outline-offset:-2px}
.mx td[role=button]:hover{background:var(--accent-soft)}
.mx input.frac{width:72px}
.walk{margin-bottom:14px}
.walk .cols{margin-top:4px}
.wsteps{margin:16px 0 0;padding-left:22px;font-size:.88rem;color:var(--muted)}
.wsteps li{margin-bottom:5px;padding-left:2px}
.wsteps li.now{color:var(--fg);font-weight:600}
.wsteps li.ok{color:var(--good)}
.wsteps li.ok::marker{color:var(--good)}
.wsteps li.now::marker{color:var(--accent)}
.wnote{font-family:var(--body);font-size:.92rem;margin:0 0 6px}
.wnote+.wnote{margin-top:8px}
.work .wnote{text-align:left}
.pracbox{margin-top:14px}
.verdict:empty{display:none}
.panel.locked #cGrid,.panel.locked #cView{opacity:.45}
.work,.walk .cols>*{min-width:0}
mjx-container[display="true"]{display:block;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-block:2px}
.mathrow{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:40px}
.mathrow .math{margin-block:4px;flex:0 1 auto;min-width:0}
@media (max-width:1000px){.walk .cols{grid-template-columns:1fr}}
.tpfly{position:absolute;z-index:30;display:grid;place-items:center;font-family:var(--mono);font-size:1rem;font-weight:700;background:var(--hot);color:#1a1205;border-radius:6px;box-shadow:0 8px 18px rgba(15,20,35,.28);pointer-events:none}
.hero-intro p+p,.hero-intro ul+p{margin-top:8px}
.intro-list{margin:8px 0 0;padding-left:22px}
.intro-list li{margin-bottom:4px}
.lede p{margin:0}
.lede .intro-list{color:var(--fg)}
details.more{margin-top:14px;border:1px solid var(--line);border-radius:9px;padding:10px 14px;background:var(--surface)}
details.more summary{cursor:pointer;font-size:.88rem;font-weight:500;color:var(--accent)}
details.more[open] summary{margin-bottom:4px}
.dtab{width:100%;border-collapse:collapse;margin-top:12px;font-size:.92rem}
.dtab th,.dtab td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
.dtab th{font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
.dtab td:first-child{font-family:var(--mono);font-weight:600;color:var(--accent);width:110px}
"""
WEEKNAV_CSS = """
.weeknav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.weeknav a{text-decoration:none;color:var(--muted);border:1px solid var(--line);border-radius:999px;
  background:var(--surface);padding:6px 14px;display:flex;align-items:baseline;gap:8px}
.weeknav a:hover{border-color:var(--accent);color:var(--fg)}
.weeknav a.on{background:var(--accent);border-color:var(--accent);color:#fff}
.weeknav .wk{font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.weeknav .wt{font-size:.84rem}
.weeknav a.on .wt{color:#fff}
.steps{margin:14px 0 0;padding-left:22px}
.steps li{margin-bottom:7px;font-size:.95rem}
.steps li::marker{font-family:var(--mono);color:var(--accent);font-weight:600}
"""
style = style.replace('</style>', WEEKNAV_CSS + W3_CSS + '</style>')

# 2. the shared scaffolding: theme toggle, station navigation, flash-card turn
start = src.index('  /* ---------------- theme ---------------- */')
end = src.index('  /* ---------------- 1. recap ---------------- */')
shared = src[start:end]

body = open('w3-body.html', encoding='utf8').read()
app = open('w3-app.js', encoding='utf8').read()

head = """<title>Week 3 Determinant Lab</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">

"""

mathjax = src[src.index('<script>\nwindow.MathJax'):src.index('</script>', src.index('<script>\nwindow.MathJax')) + len('</script>')] \
    if 'window.MathJax' in src else ''
# the MathJax configuration block plus the library tag, copied verbatim
mj_start = src.index('window.MathJax')
mj_block_start = src.rindex('<script>', 0, mj_start)
mj_tag_end = src.index('</script>', src.index('cdnjs.cloudflare.com/ajax/libs/mathjax'))
mathjax = src[mj_block_start:mj_tag_end + len('</script>')]

out = head + style + "\n" + body + "\n" + mathjax + "\n<script>\n(function(){\n  \"use strict\";\n\n" \
      + shared + app + "\n})();\n</script>\n"

open('det-lab.html', 'w', encoding='utf8').write(out)
print('det-lab.html', len(out))
