# Source files

The files in `week01/index.html`, `week02/index.html`, `week03/index.html` and `week05/index.html` are
**built** files. Each is about 2.2 to 2.5 MB because the MathJax library is embedded inside it. Do not edit those
directly. Edit the sources here and rebuild.

## Files

| File | What it is |
|---|---|
| `matrix-lab.html` | Week 2 source. One file: style block, markup, then all the JavaScript. |
| `w1-body.html` | Week 1 markup only, from the `<div class="clock">` navigation to the closing `</div>`. |
| `w1-app.js` | Week 1 station JavaScript. Goes inside the shared IIFE. |
| `w3-body.html` | Week 3 markup only, in the same form as `w1-body.html`. |
| `w3-app.js` | Week 3 station JavaScript. The maths (fractions, determinants, cofactors, adjoint, inverse) sits at the top, separate from the display code. |
| `assemble-week03.py` | Joins the Week 2 style block, the shared navigation code, `w3-body.html` and `w3-app.js` into `det-lab.html`. |
| `build-week03.py` | Turns `det-lab.html` into the offline single file. |
| `test-week03.js` | Headless Playwright check for Week 3: offline load, every station, every answer, the quiz and three screen widths. |
| `w5-body.html` | Week 5 markup only, in the same form as `w1-body.html`. |
| `w5-app-1.js` to `w5-app-4.js` | Week 5 JavaScript in four parts: helpers and the graph plotter; stations 01 to 05; the problem engine and the questions for stations 06 and 08 (all the maths is in `PROBS`); station 07 and the quiz. |
| `assemble-week05.py` | Joins the Week 2 style block, the Week 3 and Week 5 additions, the embedded fonts, the shared navigation code, `w5-body.html` and the four script parts into `limits-lab.html`. |
| `build-week05.py` | Turns `limits-lab.html` into the offline single file. |
| `test-week05.js` | Headless check for Week 5, covering the acceptance checks in the Week 5 brief. |
| `overflow-week05.js` | Lists any maths, graph or table that is wider than its box at 1440, 768 and 390 px. |
| `fonts/` | IBM Plex Sans, IBM Plex Mono and Newsreader, latin subset, weights 400 to 600, with their licences (SIL Open Font License). Week 5 embeds these so it needs no internet connection for fonts. |
| `assemble-week01.py` | Joins the Week 2 style block, the Week 2 shared navigation code, `w1-body.html` and `w1-app.js` into `vector-lab.html`. |
| `build-week01.py` | Turns `vector-lab.html` into the offline single file. |
| `build-week02.py` | Turns `matrix-lab.html` into the offline single file. |

Weeks 1, 3 and 5 are assembled from parts so that they share the Week 2 stylesheet and navigation
code exactly. Change the style block in `matrix-lab.html` and every week picks it up on
the next build. Week 3 adds a few of its own rules in `assemble-week03.py`, and Week 5 adds more in
`assemble-week05.py`.

## MathJax

The build embeds MathJax 3.2.2, tex-svg build. It is not kept in this repository.
Fetch it before building:

    npm pack mathjax@3.2.2
    tar xf mathjax-3.2.2.tgz
    mkdir -p mj && mv package mj/

The build scripts expect it at `mj/package/es5/tex-svg.js` relative to the working
directory.

## Building

Run from the directory that holds the source files and the `mj` folder:

    python3 assemble-week01.py     # writes vector-lab.html
    python3 build-week01.py        # writes the Week 1 offline file
    python3 build-week02.py        # writes the Week 2 offline file
    python3 assemble-week03.py     # writes det-lab.html
    python3 build-week03.py        # writes the Week 3 offline file
    python3 assemble-week05.py     # writes limits-lab.html
    python3 build-week05.py        # writes the Week 5 offline file

Each build script writes to a timestamped filename. To test Week 3 or Week 5, run
`node test-week03.js <built file>` or `node test-week05.js <built file>`; it needs Playwright with Chromium. Copy the result over
`weekNN/index.html`.
