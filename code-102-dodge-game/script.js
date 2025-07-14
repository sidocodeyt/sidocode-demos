document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------
   BASIC SETUP
--------------------------------------------------*/
const player        = document.getElementById('player-character');
const obstacle      = document.getElementById('falling-obstacle');
const startScreen   = document.getElementById('start-screen');
const scoreDisplay  = document.getElementById('score-display');

const LANE_WIDTH        = 100;   // each “road lane” is 100 px apart
const COLLISION_PADDING = 4;     // shrink hit‑boxes by 4 px
let   obstacleSpeed     = 2;     // seconds for one fall (gets faster)

let isRunning = false;           // is the game currently active?
let playerLane = 0;              // 0, 1 or 2 (which lane the player is in)
let score = 0;                   // player’s current score

/* -------------------------------------------------
   GAME START / RESTART
--------------------------------------------------*/
function startGame () {
  if (isRunning) return;         // ignore double‑clicks
  isRunning   = true;
  playerLane  = 0;
  score       = 0;
  obstacleSpeed = 2;             // reset difficulty

  scoreDisplay.textContent = 'Score: 0';
  player.style.left = '10px';    // leftmost lane
  startScreen.style.display = 'none';

  resetObstacle();               // drop the first obstacle
  requestAnimationFrame(gameLoop);
}

/* start when the user clicks or presses a key */
document.addEventListener('click',        startGame);
document.addEventListener('keydown', e => {
  if (!isRunning && ['ArrowLeft','ArrowRight'].includes(e.key)) startGame();
});

/* -------------------------------------------------
   PLAYER CONTROLS
--------------------------------------------------*/
function movePlayer (dir) {               // dir = –1 or +1
  playerLane = Math.max(0, Math.min(2, playerLane + dir));
  player.style.left = `${10 + playerLane * LANE_WIDTH}px`;
}

document.addEventListener('keydown', e => {
  if (!isRunning) return;
  if (e.key === 'ArrowLeft')  movePlayer(-1);
  if (e.key === 'ArrowRight') movePlayer(+1);
});

document.getElementById('left-touch-area' )
        .addEventListener('touchstart', () => movePlayer(-1));
document.getElementById('right-touch-area')
        .addEventListener('touchstart', () => movePlayer(+1));

/* -------------------------------------------------
   OBSTACLE LOGIC
--------------------------------------------------*/
/* called every time the obstacle *finishes* a fall */
obstacle.addEventListener('animationiteration', () => {
  // 1 ) choose a random new lane
  const lane = Math.floor(Math.random() * 3);
  obstacle.style.left = `${10 + lane * LANE_WIDTH}px`;

  // 2 ) increase score and maybe ramp up speed
  scoreDisplay.textContent = `Score: ${++score}`;
  if (score % 5 === 0) obstacleSpeed = Math.max(0.5, obstacleSpeed - 0.1);

  resetObstacle();                       // ★ restart animation from the top
});

/* remove + re‑add the CSS animation so it always starts above the screen */
function resetObstacle () {               // ★ the “spawn‑in‑middle” fix
  obstacle.style.animation = 'none';      // stop
  obstacle.offsetHeight;                  // force re‑flow (browser trick)
  obstacle.style.animation = `fall ${obstacleSpeed}s linear infinite`; // start again
}

/* -------------------------------------------------
   MAIN GAME LOOP (runs once per screen refresh)
--------------------------------------------------*/
function gameLoop () {
  checkCollision();
  if (isRunning) requestAnimationFrame(gameLoop);
}

/* -------------------------------------------------
   COLLISION DETECTION
--------------------------------------------------*/
function checkCollision () {
  const p = player.getBoundingClientRect();
  const o = obstacle.getBoundingClientRect();

  /* quick exit if the obstacle is far above or below the player */
  if (o.bottom < p.top - COLLISION_PADDING ||
      o.top    > p.bottom + COLLISION_PADDING) return;

  /* shrunken rectangle test (Axis‑Aligned Bounding Box) */
  if (
      p.left   + COLLISION_PADDING < o.right  - COLLISION_PADDING &&
      p.right  - COLLISION_PADDING > o.left   + COLLISION_PADDING &&
      p.top    + COLLISION_PADDING < o.bottom - COLLISION_PADDING &&
      p.bottom - COLLISION_PADDING > o.top    + COLLISION_PADDING
  ) endGame();
}

/* -------------------------------------------------
   GAME OVER
--------------------------------------------------*/
function endGame () {
  isRunning = false;
  obstacle.style.animation = 'none';      // stop the fall

  setTimeout(() => {                      // short pause so the screen updates
    alert(`Game Over!\nYour score: ${score}`);
    startScreen.style.display = 'flex';   // show start screen again
  }, 10);
}

/* -------------------------------------------------
   CSS KEYFRAMES (pure JS so everything is in one file)
--------------------------------------------------*/
const sheet = document.styleSheets[0];
sheet.insertRule(`
  @keyframes fall {
    0%   { top: -80px; }
    100% { top: 500px; }
  }
`, sheet.cssRules.length);
});