import re

src = open('matrix-lab.html', encoding='utf8').read()

# 1. the style block, verbatim, so the two weeks look identical
style = src[src.index('<style>'):src.index('</style>') + len('</style>')]

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
style = style.replace('</style>', WEEKNAV_CSS + '</style>')

# 2. the shared scaffolding: theme toggle, station navigation, flash-card turn
start = src.index('  /* ---------------- theme ---------------- */')
end = src.index('  /* ---------------- 1. recap ---------------- */')
shared = src[start:end]

body = open('w1-body.html', encoding='utf8').read()
app = open('w1-app.js', encoding='utf8').read()

head = """<title>Week 1 Vector Lab</title>
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

open('vector-lab.html', 'w', encoding='utf8').write(out)
print('vector-lab.html', len(out))
