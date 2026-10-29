import re, time, os
src = open('limits-lab.html', encoding='utf8').read()
mj  = re.sub(r'</script', r'<\\/script', open('mj/package/es5/tex-svg.js', encoding='utf8').read(), flags=re.I)
title = re.search(r'<title>(.*?)</title>', src, re.S).group(1)
split = src.index('<div class="clock">')
h, b2 = src[:split], src[split:]
h = re.sub(r'<title>.*?</title>\s*', '', h, flags=re.S)
h = re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\s*', '', h)
b2 = b2.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js"></script>',
  '<script>\n/* MathJax 3.2.2 tex-svg, embedded */\n'+mj+'\n</script>')
doc = ('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
 '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
 '<title>'+title+'</title>\n'
 '<style>:root{color-scheme:light}html{-webkit-text-size-adjust:100%}'
 'img{max-width:100%}[hidden]{display:none!important}</style>\n'
 + h + '</head>\n<body>\n' + b2 + '\n</body>\n</html>\n')
stamp = time.strftime('%H%M%S')
os.makedirs('/mnt/user-data/outputs/gh', exist_ok=True)
open('/mnt/user-data/outputs/Week 5 Limits Lab.html','w',encoding='utf8').write(doc)
p='/mnt/user-data/outputs/gh/week05-%s.html'%stamp
open(p,'w',encoding='utf8').write(doc)
print(p, len(doc))
