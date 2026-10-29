# Source files

The files in `week01/index.html`, `week02/index.html` and `week03/index.html` are **built** files. Each is
about 2.2 MB because the MathJax library is embedded inside it. Do not edit those
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
| `assemble-week01.py` | Joins the Week 2 style block, the Week 2 shared navigation code, `w1-body.html` and `w1-app.js` into `vector-lab.html`. |
| `build-week01.py` | Turns `vector-lab.html` into the offline single file. |
| `build-week02.py` | Turns `matrix-lab.html` into the offline single file. |

Weeks 1 and 3 are assembled from parts so that they share the Week 2 stylesheet and navigation
code exactly. Change the style block in `matrix-lab.html` and all three weeks pick it up on
the next build. Week 3 adds a few of its own rules in `assemble-week03.py`.

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

Each build script writes to a timestamped filename. To test Week 3, run
`node test-week03.js <built file>`; it needs Playwright with Chromium. Copy the result over
`weekNN/index.html`.
