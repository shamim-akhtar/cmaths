# Handover: the labs so far, and how to build the next one

This note is for a new chat. It covers what exists, how it is built, and the
conventions the next week must follow.

## What exists

Four interactive labs for **CMA1C03 Computing Mathematics** at Temasek Polytechnic,
School of Informatics & IT.

| Week | Tutorial | Topic | URL |
|---|---|---|---|
| 1 | Tutorial 01 | Vectors and Vector Operations | https://shamim-akhtar.github.io/cmaths/week01/ |
| 2 | Tutorial 02 | Matrices and Matrix Operations | https://shamim-akhtar.github.io/cmaths/week02/ |
| 3 | Tutorial 03 | Determinants and Inverses | https://shamim-akhtar.github.io/cmaths/week03/ |
| 5 | Tutorial 05 | Limits | https://shamim-akhtar.github.io/cmaths/week05/ |

Week 4 has no lab. The week switcher shows it as a greyed "No lab" label, not a link, so
there is no broken link. Do not create a `week04` folder unless a Week 4 lab is made.

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
    week05/index.html   built Week 5 file, about 2.5 MB (fonts embedded)

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

**Week 5 parts** (`w5-app-1.js` and `w5-app-3.js`). `GPlot` plots functions on labelled,
correctly scaled axes, with open circles, filled dots, a dashed target line and L and R
markers that point in the direction of travel. `Approach` moves the L and R markers
towards a target one step at a time, with play, pause, step, back and reset; it tracks
where each marker is heading, so rapid clicks add up correctly. `dec` prints a fraction
as an exact decimal (24.990001, not 24.99) and only rounds, with a ≈ sign, when the
decimal does not end. `Prob` is the Learn and Practice engine for stations 06 and 08;
every question and its answers are in `PROBS`.

**MathJax extensions.** Only the extensions inside the tex-svg build work offline.
`\color`, `\cancel`, `\bbox` and `\enclose` load from the internet and fail, showing
raw TeX. Use `\boxed` to highlight, as Week 5 does for the factors that cancel.

**Fonts.** Weeks 1 to 3 load their fonts from Google Fonts and fall back to system fonts
offline. Week 5 embeds the same three fonts from `src/fonts`, so it looks the same with
no connection. Later weeks should do the same.

**Reduced motion.** Weeks 1 and 2 skip their animations when the computer is set to
reduce motion. Week 3 always plays them, because each one is started by a button and
shows a step of the maths. Week 5 plays stepped animations with reduced motion: no
sliding between positions, but each step still appears in turn.

**Compact header.** Every week shows its full title and introduction on station 01 only.
On the other stations, a short line reads "Week N · Station NN of NN · title". The code is in
the shared section of `matrix-lab.html`, so every week picks it up. It reads the week from the
current pill in the week switcher. A new week needs `<div class="compact-line" id="compactLine"
hidden></div>` after its `<h1>` and the class `hero-intro` on its introduction.

**Deferred typesetting.** Week 3's `retex` puts off MathJax typesetting for any element
that is hidden and runs it when the station is shown. Typesetting into a hidden
element makes MathJax log NaN size errors.

## When a week is added

Four things need updating, not just the new folder.

1. Create `weekNN/index.html`.
2. Add a card to `index.html`.
3. Add a pill to the **week switcher** at the top of every existing week and rebuild
   them. A week with no lab gets a `<span class="nolab">` label instead of a link. It is the `<nav class="weeknav">` block in each source file, with absolute
   links to the live site so it works from a downloaded copy too. The current week
   carries `class="on"`.
4. Add a section and station table to `README.md`.

## Conventions

**Footer.** Every week ends with the same two lines:
"Computing Mathematics | Week N – Title" and "Supplementary learning material for revision
and practice."

**Opening introduction.** Every week opens with three sentences, about 35 to 45 words, in
one paragraph under the title:

1. What is it? Introduce the idea in simple language.
2. What will you learn? Name the main things students will do. Start with "In this
   lesson, you will learn".
3. Why is it useful? Start with "You will also explore how" and link the topic to
   computing.

Example, from Week 5: "A limit tells us what value a function gets close to as its input
approaches a number. In this lesson, you will learn how to find limits using tables, graphs
and calculations. You will also explore how limits are used in computing." Keep detailed
explanations inside the stations, not in the introduction.

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
Weeks 3 and 5 the whole list below is automated in `src/test-week03.js` and
`src/test-week05.js`, which also answer
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
