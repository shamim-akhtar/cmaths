# Handover: the labs so far, and how to build the next one

This note is for a new chat. It covers what exists, how it is built, and the
conventions the next week must follow.

## What exists

Three interactive labs for **CMA1C03 Computing Mathematics** at Temasek Polytechnic,
School of Informatics & IT.

| Week | Tutorial | Topic | URL |
|---|---|---|---|
| 1 | Tutorial 01 | Vectors and Vector Operations | https://shamim-akhtar.github.io/cmaths/week01/ |
| 2 | Tutorial 02 | Matrices and Matrix Operations | https://shamim-akhtar.github.io/cmaths/week02/ |
| 3 | Tutorial 03 | Determinants and Inverses | https://shamim-akhtar.github.io/cmaths/week03/ |

Repository on my computer: `C:\dev\github\cmaths`. It is published through GitHub
Pages from the `main` branch.

    index.html          landing page listing the weeks
    README.md           student-facing description
    HANDOVER.md         this file
    .nojekyll           serve the files as they are
    src/                editable sources and build scripts
    week01/index.html   built Week 1 file, about 2.2 MB
    week02/index.html   built Week 2 file, about 2.2 MB
    week03/index.html   built Week 3 file, about 2.2 MB

## What I need to supply before the next week starts

- **The tutorial question paper.** The content must match it, and the practice and
  quiz questions must be different from the ones on the paper.
- **The topic and the lesson plan**, with the timings for each block.

## Build process

The `weekNN/index.html` files are **built** files. They are large because MathJax
is embedded in them, which is what makes the pages work with no internet connection.
Never edit them directly.

Sources and build scripts are in `src/`. `src/README.md` explains the steps. In
summary:

1. Fetch MathJax 3.2.2 with `npm pack mathjax@3.2.2` and unpack it to
   `mj/package/es5/tex-svg.js`.
2. Edit the source files.
3. Run the assemble and build scripts.
4. Copy the built file over `weekNN/index.html`.

Weeks 1 and 3 are assembled from parts so that they share the Week 2 stylesheet and
navigation code. Week 2 is a single source file. For the next week, follow the Week 3
pattern: a `wN-body.html`, a `wN-app.js`, and a copy of `assemble-week03.py` pointed
at them. That way every week stays identical in look and behaviour.

## Page structure

Each lab runs for two hours and is divided into numbered **stations**, with a break
in the middle. The stations are listed down a fixed left panel on screens wider than
1100px, and across a bar at the top on anything narrower.

Both pages open **one station at a time**. A button at the top right switches to
showing everything, which is for revision. The left and right arrow keys move between
stations. The page always opens on station 01 and clears any leftover `#fragment`
from the address bar, so it never reopens part way through.

Section ids do not match station numbers. Week 2 uses `s1, s1b, s2, s2b, s3, s4,
s4b, s5, s6, s7` for stations 01 to 10, which is historical. Week 1 uses `s1` to
`s10`, and Week 3 uses `s1` to `s10`. For the next week, use `s1` to `sNN`. The navigation code reads the order from the
`.clock a[href^='#s']` anchors, so the ids themselves do not matter as long as they
are unique and the order is right.

A typical shape, from Week 1:

| Station | Minutes |
|---|---|
| 01 to 04 | concept stations |
| Break | about 8 minutes |
| 05 to 08 | concept stations, the last marked optional |
| 09 | practice questions |
| 10 | exit quiz |

Timings run from 0 to 120 and appear both in the left panel and beside each station
heading. They must agree.

## Components that can be reused

All of these already exist in the Week 1 and Week 2 sources.

**VPlot** (`w1-app.js`). A small SVG plotting helper on a 340 by 340 viewBox. Call
`VPlot(svgElement, range)` and it gives back `clear`, `grid`, `line`, `arrow`, `dot`,
`ring`, `wedge` and `text`, plus `X`, `Y` and `k` for converting grid units to pixels.
Arrowheads are drawn as polygons, not SVG markers, so they take the theme colour.

**dragHandles** (`w1-app.js`). Makes figures draggable. Pass the SVG, the plot, and a
list of `[xInputId, yInputId]` pairs. It picks the nearest handle within 34 viewBox
units, snaps to whole grid units, writes the values into the number inputs and fires
an `input` event so the existing listeners redraw. Used on Week 1 stations 04, 06
and 07.

**Flash cards** (`setTurned` in the shared code). Real 3D flip with a colour change.
The two faces share one CSS grid cell, so each card sizes itself to its taller face.
Do not set a fixed pixel height; that was a bug that clipped the content.

**Practice questions.** Driven entirely by data attributes on `.vq` elements:
`data-core="1"`, `data-ans="5"` or `data-ans="2,9"` for several boxes, and
`data-tol="0.01"`. The JavaScript marks the answers, gives a hint on the first wrong
attempt and the full working on request. A "Core four only" button hides the
extension questions.

**Exit quiz.** A `QS` array of `{q, o, a, w}` objects: question, options, index of the
correct option, and the explanation shown after answering.

**Stepped walkthroughs.** Week 1 station 07 and Week 2 station 06 both step through a
calculation one line at a time, with the figure animating as each step appears. The
verdict box hides itself during the middle steps so students cannot read the answer
before working it out.

**Exact fractions and matrix maths** (`w3-app.js`). `F(n,d)` makes a reduced
fraction; `fadd`, `fmul`, `ftex` and `fstr` work on them. `det2`, `det3`, `minorOf`,
`cofactors`, `adjoint`, `inverse` and `mulM` compute from integer matrices and return
fractions. `parseAns` reads a typed answer as a whole number, a decimal or a fraction
such as `-3/10`, and `matches` compares it with a fraction. Nothing on the Week 3 page
is hand-typed; every displayed solution is computed.

**Walk** (`w3-app.js`). The stepped inverse walkthrough used in Week 3 stations 07 and
08. Give it a host element and `{name, M}` and it builds the whole panel: a Learn mode
that reveals the working line by line with the relevant cells highlighted, and a
Practice mode with inputs for each stage, Hint, Check and Show working, and feedback
that names the specific mistake (wrong subtraction order, missing sign change,
cofactor matrix given instead of its transpose, adjoint not divided by the
determinant). Pass `{modes:false}` for Practice mode only.

**Deferred typesetting.** Week 3's `retex` puts off MathJax typesetting for any element
that is hidden and runs it when the station is shown. Typesetting into a hidden
element makes MathJax log NaN size errors.

## When a week is added

Four things need updating, not just the new folder.

1. Create `weekNN/index.html`.
2. Add a card to `index.html`.
3. Add a pill to the **week switcher** at the top of every existing week and rebuild
   them. It is the `<nav class="weeknav">` block in each source file, with absolute
   links to the live site so it works from a downloaded copy too. The current week
   carries `class="on"`.
4. Add a section and station table to `README.md`.

## Conventions

**Language.** Simple British English. Short sentences, one idea each. No em-dashes.
Write for a first-year polytechnic student, not for a colleague. No clauses added for
effect. No lecturer-facing instructions on the page; everything addresses the student.

Phrases to avoid, with what to use instead:

| Avoid | Use |
|---|---|
| the dot product vanishes | the dot product is zero |
| the product is defined | the matrices can be multiplied |
| the rule carries over | the same rule applies |
| the row index | the row number |
| the transformation is reversible | the transformation can be undone |

**Maths.** Use proper LaTeX through MathJax, never plain-text approximations. State
conventions explicitly where they could be misread. For example, Week 2 now says that
in \(a_{ij}\) the row is counted from the top and the column from the left, and warns
that \(i\) is the row number rather than the \(x\) direction, because rows count
downwards while the \(y\) axis counts upwards.

**Questions.** Practice and quiz questions must not repeat the tutorial paper or the
Alert Quiz. Spread the correct answers across the option positions; all six Week 2
quiz answers were originally the first option, which students would notice.

Matrices already used on the Week 3 page, which later weeks should not reuse as
fresh examples: the Tutorial 03 questions, the three extra practice questions, the
Week 3 guided problems `[[2,5],[1,4]]`, `[[3,6],[1,2]]` and `[[1,2,1],[0,1,2],[1,0,3]]`,
the station defaults `[[3,1],[1,2]]` and `[[2,1,3],[1,0,2],[3,1,1]]`, and the exit quiz
matrices.

**Figures.** Prefer something the student operates over something they watch. Where
an animation would help, run it over about a second with easing, and make sure the
interpolation is mathematically honest. An early version interpolated a rotation
matrix entry by entry, which shrank the grid at the half way point; it now
interpolates the angle.

## Testing before committing

I check every build in a headless browser before it goes to the repository. For
Week 3 the whole list below is automated in `src/test-week03.js`, which also answers
every walkthrough stage with its own independent calculation:

- Load the built file with the network blocked, to prove it works offline.
- Walk every station and confirm no console errors.
- Answer every practice question correctly and confirm the score reads full marks.
- Answer every quiz question correctly and confirm six of six.
- Check the page at desktop, tablet and phone widths with no sideways scrolling.
- Screenshot the figures and look at them.

## One practical trap

Writing a file back to my computer can silently keep the old contents if the staged
filename has been used before. Always write to a fresh timestamped filename first,
then copy that over the target. This caused a change to appear to have worked when
the file on disk had not changed at all.

## Review cycle

I usually send the finished page to a reviewer and pass their comments back. Expect
two or three rounds, mostly on language rather than mathematics. When reviewing
documents for me, state only the outstanding issues, not what already checks out.
