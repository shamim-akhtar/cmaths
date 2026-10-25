# Computing Mathematics labs

Interactive tutorial pages for CMA1C03 at Temasek Polytechnic, School of
Informatics & IT.

Live at **<https://shamim-akhtar.github.io/cmaths/>**

Each lab is a single self-contained HTML file. The maths typesetting engine
(MathJax 3.2.2, tex-svg build) is embedded in the page, so the equations render
with no internet connection. Students can download a lab and keep it for
revision, and it will still work.

There is no sign-in, no tracking and no server. Everything runs in the browser.

## Week 2: Matrices and Matrix Operations

<https://shamim-akhtar.github.io/cmaths/week02/>

Goes with Tutorial 02. Two hours, built around things students operate rather
than watch. The page carries a clock across the top that links to each station.

| Station | Minutes | What it covers |
| --- | --- | --- |
| 01 Vector recap | 0 to 5 | Three questions from Week 1, revealed on click |
| 02 Vector practice | 5 to 22 | Eight 2D questions and one longer 3D question, marked and checked in the page |
| 03 What a matrix is | 22 to 30 | An 8 x 8 greyscale image as a matrix, with clickable pixels |
| 04 Addition and scalar multiplication | 30 to 45 | Brightness and contrast sliders running on that image |
| Break | 45 to 55 | |
| 05 Matrix multiplication | 55 to 80 | The row by column rule, stepped through one entry at a time, plus eight flash cards on when a product exists |
| 06 From numbers to movement | 80 to 92 | A point is a column, a shape is a pile of columns, and two instructions multiply into one |
| 07 Scale, rotate, translate | 92 to 105 | Transformation matrices, the determinant, and why translation needs homogeneous coordinates |
| 08 Transpose and inverse | 105 to 111 | A first look, ahead of the next tutorial |
| 09 Exit quiz | 111 to 120 | Six questions, none taken from the tutorial paper |

### What is interactive

Students type answers into the vector practice and the page marks them, with
the full working behind a button on every question. The pixel grid takes
clicks. The multiplication visualiser lights the row and column it is using and
the numbers in both matrices can be edited, so a second example can be run
without leaving the page. The dimension flash cards make the class commit to an
answer before turning over. The transformation panels are driven by sliders for
angle, scale and translation, with the live 3 x 3 matrix and determinant beside
them.

### Two switches worth knowing

**Teaching notes.** The page opens in student view. The button at the top right
reveals the lecturer prompts, the things to ask the class at each station, and
the preparation notes. Students never see them unless they press it.

**Core four only.** The vector practice has nine questions. Four are marked
core, being a magnitude, a dot product, a perpendicular condition and a
collinearity check, and the rest are extension. The button hides the extension
ones and takes the station from 17 minutes to about 8.

### Scope

Tutorial 02 itself covers addition, scalar multiplication and multiplication.
Stations 07 and 08 go beyond it and are badged as such on the page, so they can
be dropped without leaving a gap. Doing that frees about 25 minutes, which is
roughly the tutorial paper worked in class instead of at home.

## Layout

    index.html          landing page listing the weeks
    week02/index.html   Week 2, Matrices and Matrix Operations
    .nojekyll           serve the files as they are, no Jekyll build

## Adding a week

Create `weekNN/index.html` and add a card to `index.html`. Nothing else needs
changing, and Pages picks it up on the next push.
