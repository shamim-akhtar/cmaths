# Computing Mathematics Labs

Interactive learning materials for **CMA1C03 Computing Mathematics** at Temasek Polytechnic, School of Informatics & IT.

**Website:** https://shamim-akhtar.github.io/cmaths/

These materials support the weekly tutorials. Students can explore mathematical concepts through interactive examples, practise calculations and check their understanding.

Each lab is a single HTML file. Students can download it and use it without an internet connection.

No login is required. The pages do not collect or store student information.

## Week 1: Vectors and Vector Operations

https://shamim-akhtar.github.io/cmaths/week01/

This lab supports Tutorial 01. It covers vectors, vector operations and their applications in computing.

| Station | Topic | What students can do |
|---|---|---|
| 01 | What a vector is | Explore vectors by moving arrows on a grid. |
| 02 | Adding and subtracting vectors | See how vectors are added and subtracted. Change the values to try different examples. |
| 03 | Scalar multiples | Use a slider to change a vector's length and direction. |
| 04 | Magnitude and unit vectors | Calculate vector lengths and see how unit vectors are formed. |
| 05 | The dot product | Follow the calculation step by step. Explore how the angle affects the answer. |
| 06 | Angle between two vectors | Change vector values and calculate the angle between them. |
| 07 | Parallel, perpendicular and collinear | Learn how to check whether vectors are parallel or perpendicular, and whether points lie on a straight line. |
| 08 | Vectors in 3D | Explore vectors with three components. |
| 09 | Practice questions | Answer questions and check the solutions. |
| 10 | Exit quiz | Complete six questions to check your understanding. |

## Week 2: Matrices and Matrix Operations

https://shamim-akhtar.github.io/cmaths/week02/

This lab supports Tutorial 02. It covers matrices, matrix operations and their applications in computer graphics.

| Station | Topic | What students can do |
|---|---|---|
| 01 | Vector recap | Review key concepts from Week 1 using flashcards. |
| 02 | Vector practice | Practise vector calculations and check the solutions. |
| 03 | What a matrix is | Explore how an image can be represented using a matrix. |
| 04 | Special matrices | Learn to identify different types of matrices. |
| 05 | Matrix addition and scalar multiplication | Practise calculations using matrices. |
| 06 | Matrix multiplication | Follow the calculation step by step. Check whether two matrices can be multiplied. |
| 07 | Matrices in computer graphics | See how matrices can change the positions of points and shapes. |
| 08 | Using matrices to transform objects | Explore how matrices are used to resize, rotate and move objects. |
| 09 | Transpose and inverse | Explore the transpose and inverse of a matrix. |
| 10 | Exit quiz | Complete six questions to check your understanding. |

## Week 3: Determinants and Inverses

https://shamim-akhtar.github.io/cmaths/week03/

This lab supports Tutorial 03. It covers the transpose, determinants, the adjoint and the inverse of 2×2 and 3×3 matrices, and how the inverse is used to undo a transformation.

| Station | Topic | What students can do |
|---|---|---|
| 01 | Week 2 recall | Review matrix order, the identity matrix and multiplication using flashcards and quick checks. |
| 02 | The transpose | Watch rows become columns. Predict the order of a transpose and locate an entry. |
| 03 | What is a determinant? | Learn to calculate a 2×2 determinant, decide whether a matrix has an inverse, then change the matrix and see what happens to a square. |
| 04 | Finding the inverse of a 2×2 matrix | Build the inverse one step at a time, check it by multiplication, and apply it to undo a transformation. |
| 05 | 3×3 determinant | Expand along the first row with the row and column crossed out at each step. Pick out the correct minor. |
| 06 | 3×3 inverse | Find all nine cofactors with feedback on sign errors, transpose into the adjoint, divide by the determinant and verify. |
| 07 | Guided practice | Three worked problems in Learn mode, which reveals the working line by line, or Practice mode, which checks each stage. |
| 08 | Tutorial questions | Work through the Tutorial 03 questions and three extra questions stage by stage, with hints and working on request. |
| 09 | Undoing a transformation | See how a game engine uses the inverse to go from screen coordinates back to a sprite, and why a flattened sprite cannot be recovered. |
| 10 | Exit quiz | Complete six questions to check your understanding. |

## Interactive Features

The labs include interactive activities to help students learn and practise.

- **Interactive diagrams:** Move points, change values and see how the results change.
- **Worked examples:** Follow calculations one step at a time.
- **Practice questions:** Enter answers and check whether they are correct.
- **Hints and solutions:** Get help when needed and view the full working.
- **Flashcards:** Review key concepts and check your understanding.
- **Exit quizzes:** Test what you have learnt at the end of each tutorial.

Students can repeat the activities as many times as they wish.

## Using the Labs

Each lab is divided into stations.

**Show all:** Displays every station on one page. This is useful for revision.

**Arrow keys:** Use the left and right arrow keys to move between stations.

**Core four only:** Shows the four main practice questions. Students can also attempt the additional questions.

**Theme:** Switches between light and dark display modes.

## Additional Learning

Some sections provide examples beyond the tutorial questions.

These sections are marked as optional. Students can explore them to see how mathematical concepts are applied in computing and computer graphics.

## Repository Structure

```text
index.html          Main page with links to the weekly labs
week01/index.html   Week 1: Vectors
week02/index.html   Week 2: Matrices
week03/index.html   Week 3: Determinants and inverses
src/                Editable sources and build scripts
.nojekyll           GitHub Pages configuration
```

## Adding a New Week

1. Create a new folder, such as `week04`.
2. Add the `index.html` file to the folder.
3. Add the new week to the main page.
4. Update the week links in the existing labs.
5. Upload the changes to GitHub.

GitHub Pages will publish the updated website.