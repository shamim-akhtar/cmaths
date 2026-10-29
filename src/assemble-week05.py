import re, base64, os

# Week 5 reuses the Week 2 stylesheet and navigation, the Week 3 additions, and adds its own.
src = open('matrix-lab.html', encoding='utf8').read()
style = src[src.index('<style>'):src.index('</style>') + len('</style>')]

a3 = open('assemble-week03.py', encoding='utf8').read()
W3_CSS = re.search(r'W3_CSS = """(.*?)"""', a3, re.S).group(1)
WEEKNAV_CSS = re.search(r'WEEKNAV_CSS = """(.*?)"""', a3, re.S).group(1)

W5_CSS = """
/* week 5 additions */
.gbox{width:100%;display:block;max-width:440px;margin-inline:auto;height:auto;touch-action:manipulation}
.gbox.big{max-width:520px}
.nline{width:100%;display:block;max-width:440px;margin-inline:auto;height:auto}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;font-family:var(--mono);font-size:.72rem;margin-top:6px}
.legend .lg-l{color:var(--accent)}.legend .lg-r{color:var(--hot)}.legend .lg-o,.legend .lg-f{color:var(--muted)}
.ltab{width:100%;border-collapse:collapse;font-size:.88rem;font-variant-numeric:tabular-nums}
.ltab th,.ltab td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:center}
.ltab thead th{font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.ltab tbody th{text-align:left;font-weight:500;color:var(--muted);font-size:.84rem}
.ltab td{font-family:var(--mono)}
.ltab td.cl{color:var(--accent)}.ltab td.cr{color:var(--hot)}
.ltab td.empty{color:var(--muted);font-family:var(--body);font-style:italic}
.ltab tbody tr{height:2.35em}
.tscroll{overflow-x:auto;max-width:100%}
@media (max-width:1100px){#s3 .cols{grid-template-columns:1fr}}
.ltab tbody td,.ltab tbody th{white-space:nowrap}
.ltab.mini{font-size:.8rem;margin-top:8px}.ltab.mini th,.ltab.mini td{padding:4px 5px}
.ltab.mini tbody tr{height:2.1em}
@media (max-width:560px){.ltab{font-size:.78rem}.ltab th,.ltab td{padding:5px 4px}}
.ltab tr.new td,.ltab td.new{animation:rowin .6s ease}
@keyframes rowin{from{background:var(--accent-soft)}to{background:transparent}}
.tog{display:flex;gap:8px;align-items:center;font-size:.86rem;margin-top:10px;color:var(--muted);cursor:pointer}
.sel{font-family:var(--body);font-size:.9rem;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--surface-2);color:var(--fg)}
.note{font-size:.84rem;color:var(--muted);border-left:3px solid var(--hot);padding-left:10px;margin-top:10px}
.detective{display:grid;gap:16px;grid-template-columns:1fr}
.dhead{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:baseline;margin-bottom:6px}
.dhead .math{margin:0}
.detective .panel+.panel{margin-top:0}
.dcard .math{margin-block:6px}
.dq{border:1px solid var(--line);border-radius:9px;padding:10px 12px;margin-top:12px}
.dq legend{font-size:.88rem;font-weight:600;padding:0 4px}
.rad{display:flex;gap:8px;align-items:flex-start;font-size:.86rem;margin:4px 0;cursor:pointer}
.apps{display:grid;gap:16px;grid-template-columns:1fr}
.apps .cols{margin-top:8px;align-items:center}
.apps .panel+.panel{margin-top:0}
.cq{margin-top:14px;padding-top:12px;border-top:1px dashed var(--line);font-size:.92rem}
.cq label,.cq .cql{display:block;font-weight:500;margin:0 0 8px}
.mrow{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;font-size:.92rem}
.qtext{font-size:1rem;margin:4px 0 0}
.pnav{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:14px}
.tline{font-size:.95rem;row-gap:10px}
.vin.wide{width:150px}
.verdict.info{background:var(--accent-soft);color:var(--fg);border:1px solid var(--accent)}
.wl.new{animation:rowin .8s ease}
.opt mjx-container{display:inline-block!important;margin:0!important}
"""

def fontface(fam, file, weight):
    b = base64.b64encode(open(os.path.join('fonts', file), 'rb').read()).decode()
    return ("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format('woff2')}\n") % (fam, weight, b)

FONTS = ''.join(fontface(f, '%s-latin-%d-normal.woff2' % (n, w), w)
                for f, n in [('IBM Plex Sans', 'ibm-plex-sans'), ('IBM Plex Mono', 'ibm-plex-mono'), ('Newsreader', 'newsreader')]
                for w in (400, 500, 600))

style = style.replace('<style>', '<style>\n' + FONTS, 1)
style = style.replace('</style>', WEEKNAV_CSS + W3_CSS + W5_CSS + '</style>')

start = src.index('  /* ---------------- theme ---------------- */')
end = src.index('  /* ---------------- 1. recap ---------------- */')
shared = src[start:end]

body = open('w5-body.html', encoding='utf8').read()
app = ''.join(open('w5-app-%d.js' % i, encoding='utf8').read() for i in (1, 2, 3, 4))

head = """<title>Week 5 Limits Lab</title>
<meta name="claude:viewport-fit-sides" content="cover">

"""
mj_start = src.index('window.MathJax')
mj_block_start = src.rindex('<script>', 0, mj_start)
mj_tag_end = src.index('</script>', src.index('cdnjs.cloudflare.com/ajax/libs/mathjax'))
mathjax = src[mj_block_start:mj_tag_end + len('</script>')]

out = head + style + "\n" + body + "\n" + mathjax + "\n<script>\n(function(){\n  \"use strict\";\n\n" \
      + shared + app + "\n})();\n</script>\n"
open('limits-lab.html', 'w', encoding='utf8').write(out)
print('limits-lab.html', len(out))
