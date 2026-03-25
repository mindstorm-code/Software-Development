<!doctype html>
<!--
Author: Jeffrey Jenson
Last Updated: 3/24/2026

Project: Final Website Project
Description: PHASE overview page with CTA to start the full PHP quiz.
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PHASE + Quiz | James Thelin</title>
    <link rel="stylesheet" href="style.css" />
    <script src="script.js" defer></script>
  </head>
  <body>
    <header class="navbar">
      <div class="container nav-inner">
        <a class="brand" href="index.html"
          >JAMES THELIN | ENTREPRENEUR | KEYNOTE SPEAKER | AUTHOR</a
        >
        <nav class="nav-links">
          <a href="index.html">Home</a>
          <a href="phase.php">PHASE + Quiz</a>
          <a href="blog.html">Blog</a>
          <a href="contact.php">Book / Contact</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="section">
        <div class="container">
          <h2>PHASE + Color Code (Overview)</h2>
          <p>
            PHASE is a simple personality lens that helps people understand how
            they respond under pressure, how they learn best, and how to protect
            attention in a tech-heavy world.
          </p>

          <div class="grid-3">
            <div class="card">
              <img src="images/1.png" alt="Charger symbol" class="phase-icon" />
              <h3>Charger</h3>
              <p class="mini">
                Action-first, momentum-driven. Growth move: pause and verify
                before committing.
              </p>
            </div>
            <div class="card">
              <img
                src="images/2.png"
                alt="Analyzer symbol"
                class="phase-icon"
              />
              <h3>Analyzer</h3>
              <p class="mini">
                Pattern-first, deep thinker. Growth move: decide and ship
                version 1.
              </p>
            </div>
            <div class="card">
              <img
                src="images/3.png"
                alt="Explorer symbol"
                class="phase-icon"
              />
              <h3>Explorer</h3>
              <p class="mini">
                Curiosity-first, creative. Growth move: finish one thing before
                chasing the next.
              </p>
            </div>
          </div>

          <hr class="sep" />

          <div class="grid-3">
            <div class="card">
              <img src="images/4.png" alt="Helper symbol" class="phase-icon" />
              <h3>Helper</h3>
              <p class="mini">
                People-first, supportive. Growth move: help without carrying
                everyone's load.
              </p>
            </div>
            <div class="card">
              <img src="images/5.png" alt="Planner symbol" class="phase-icon" />
              <h3>Planner</h3>
              <p class="mini">
                Structure-first, stabilizer. Growth move: don't wait for perfect
                conditions.
              </p>
            </div>
            <div class="card">
              <img
                src="images/6.png"
                alt="Color Code symbol"
                class="phase-icon"
              />
              <h3>Color Code (Bonus Lens)</h3>
              <p class="mini">
                Motive-based insight for communication and relationships. Used
                as a companion lens.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="book">
        <div class="container split">
          <div>
            <h2>Buy the Book</h2>
            <p class="mini">
              A practical framework for turning setbacks into momentum. Great
              for student assemblies, leadership groups, and team trainings.
            </p>
            <a class="btn btn-primary" href="contact.php"
              >Ask about bulk orders</a
            >
            <p class="mini" style="margin-top: 10px">
              (Demo site: purchase links can be added later.)
            </p>
          </div>
          <div>
            <img
              class="book-img"
              src="images/book-cover.png"
              alt="Book cover: The Art of Collapsing Time"
            />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container callout">
          <h2>Ready for the Full PHASE Quiz?</h2>
          <p class="mini">
            Start with your contact info, then take the full 10-question PHASE
            assessment. Results appear instantly.
          </p>
          <a class="btn btn-primary" href="contact.php">Start the Quiz</a>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        &copy; <span id="year"></span> James Thelin. Educational content. Not a
        diagnosis.
      </div>
    </footer>

    <script>
      document.getElementById("year").textContent = new Date().getFullYear();
    </script>
  </body>
</html>
