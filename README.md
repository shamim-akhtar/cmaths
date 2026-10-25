# Computing Mathematics labs

Interactive tutorial pages for CMA1C03 at Temasek Polytechnic, School of
Informatics & IT.

Live at **<https://shamim-akhtar.github.io/cmaths/>**

Each lab is a single self-contained HTML file. The maths typesetting engine
(MathJax 3.2.2, tex-svg build) is embedded in the page, so the equations render
with no internet connection. Students can download a lab and keep it for
revision, and it will still work.

There is no sign-in, no tracking and no server. Everything runs in the browser.

Every lab carries a week switcher at the top, so moving from one week to the
next takes one click.

## Week 1: Vectors and Vector Operations

<https://shamim-akhtar.github.io/cmaths/week01/>

Goes with Tutorial 01. Two hours, built around things students operate rather
than watch.

| Station | Minutes | What it covers |
| --- | --- | --- |
| 01 What a vector is | 0 to 8 | Scalars against vectors, and a draggable arrow whose components update live |
| 02 Adding and subtracting | 8 to 20 | The tip to tail picture, animated, with editable components |
| 03 Scalar multiples | 20 to 28 | A slider from -3 to 3, with the arrow growing, shrinking and reversing |
| 04 Magnitude and unit vectors | 28 to 40 | Pythagoras drawn on the grid, then normalising animated onto the unit circle |
| Break | 40 to 48 | |
| 05 The dot product | 48 to 66 | The rule stepped through one pair at a time, then a turning arrow showing what the sign means |
| 06 Angle between two vectors | 66 to 78 | The rearranged formula, with a live calculator and a shaded angle |
| 07 Parallel, perpendicular and collinear | 78 to 90 | The three tests, and a collinearity checker driven by three movable points |
| 08 Vectors in three dimensions | 90 to 100 | The same rules with one more component, on a 3D figure |
| 09 Practice questions | 100 to 112 | Eight 2D questions and one longer 3D question, marked in the page |
| 10 Exit quiz | 112 to 120 | Six questions, none taken from the tutorial paper |

## Week 2: Matrices and Matrix Operations

<https://shamim-akhtar.github.io/cmaths/week02/>

Goes with Tutorial 02. Two hours, in the same shape as Week 1.

| Station | Minutes | What it covers |
| --- | --- | --- |
| 01 Vector recap | 0 to 5 | Three flash cards from Week 1 |
| 02 Vector practice | 5 to 22 | Eight 2D questions and one longer 3D question, marked in the page |
| 03 What a matrix is | 22 to 30 | An 8 x 8 greyscale image as a matrix, with clickable pixels |
| 04 Special matrices | 30 to 38 | Square, row, column, zero, diagonal, identity and symmetric, with a naming exercise |
| 05 Addition and scalar multiplication | 38 to 50 | Entry by entry arithmetic running on that image |
| Break | 50 to 58 | |
| 06 Matrix multiplication | 58 to 80 | The row by column rule, stepped through one entry at a time, plus eight flash cards on when a product exists |
| 07 Matrices in computer graphics | 80 to 92 | A point as a column, a shape as a set of points, and two transformations combined into one |
| 08 Using matrices to transform objects | 92 to 105 | Scale, rotate and translate, the determinant, and why translation needs a 3 x 3 matrix |
| 09 Transpose and inverse | 105 to 111 | A first look, ahead of the next tutorial |
| 10 Exit quiz | 111 to 120 | Six questions, none taken from the tutorial paper |

## What is interactive

Students type answers into the practice questions and the page marks them, with
a hint on the first wrong attempt and the full working behind a button on every
question. Figures are driven by sliders, draggable points and editable
coordinates, so a second example can be run without leaving the page. The flash
cards make the class commit to an answer before turning over. Nothing is
recorded anywhere, so students can try as often as they like.

## Two switches worth knowing

**Show all.** Each page opens one station at a time, which keeps the class
together. The button at the top right switches to the whole page at once, for
revision. The left and right arrow keys move between stations.

**Core four only.** Each practice station has nine questions, four of them
marked core. The button hides the extension ones and takes the station from
about 17 minutes to about 8.

## Scope

Both labs go slightly beyond the tutorial paper, and the extra stations are
badged on the page, so they can be dropped without leaving a gap. In Week 1
that is station 08, and in Week 2 it is stations 08 and 09.

## Layout

    index.html          landing page listing the weeks
    week01/index.html   Week 1, Vectors and Vector Operations
    week02/index.html   Week 2, Matrices and Matrix Operations
    .nojekyll           serve the files as they are, no Jekyll build

## Adding a week

Create `weekNN/index.html`, add a card to `index.html`, and add the week to the
switcher at the top of each existing lab. Pages picks it up on the next push.
