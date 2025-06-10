let s; //snake
let food;
let obstacles = [];
let scl = 40; //pixel size
let treesPlanted = 0;
let highestTreesPlanted = 0;
let level = 5; //level
let boxW, boxH;
let eatSound;
let snakeColor;
let foodIcon;
let obstacleIcon;
let gameOverFont;
let gameEnded = false;
let gameOverSound;
let backgroundMusic;
let state = 'MENU'; // initial state
let startButton; // start button

function preload() {
  eatSound = loadSound('eat.wav'); // eat sound
  foodIcon = loadImage('trash.png'); // food icon
  obstacleIcon = loadImage('obstacle.png'); // obstacle icon
  gameOverFont = loadFont('Bangers.ttf'); // font for game over screen
  gameOverSound = loadSound('gameover.mp3'); // game over sound
  backgroundMusic = loadSound('background.mp3'); // background music
  snakeSegmentImg = loadImage('snake_segment.png'); // Snake segment image
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  boxW = width - 2 * scl;
  boxH = height - 4 * scl; // Adjusted to provide equal padding on all sides

  s = new Snake();
  strokeWeight(scl * 0.15);
  pickLocation();
  snakeColor = color(80); //original snake color

  // Create a start button
  startButton = createButton('Start Game');
  startButton.position(width / 2 - 50, height / 2 + 50);
  startButton.size(100, 50);
  startButton.style('font-size', '20px');
  startButton.style('background-color', '#4CAF50');
  startButton.style('color', 'white');
  startButton.mousePressed(startGame);
}

function draw() {
  if (state === 'MENU') {
    drawMenu();
  } else if (state === 'GAME') {
    frameRate(level);
    background(200);

    drawGrid();
    drawFood();

    // Draw obstacles
    for (let obs of obstacles) {
      image(obstacleIcon, obs.x, obs.y, scl, scl);
    }

    // Draw snake
    if (!gameEnded) {
      s.update();
      s.show();
      s.death();
    }
    strokeWeight(scl * 0.15);
    drawGame();
  }
}

function drawMenu() {
  background("black");
  
  // Draw border with a design
  let borderColor = color(random(255), random(255), random(255));
  frameRate(5);
  let borderWidth = 20;
  noFill();
  stroke(borderColor);
  strokeWeight(borderWidth);
  rect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, 20);
  
  textAlign(CENTER);
  textSize(64);
  fill(random(255), random(255), random(255));
  frameRate(2);
  noStroke();
  text('Snake Game', width / 2, height / 3);
  textSize(32);
  text('Collect the Trash and Help out the Envirament!', width / 2, height / 2.5);
}

function startGame() {
  state = 'GAME';
  startButton.hide();
  if (backgroundMusic) {
    backgroundMusic.loop();
  }
}

function pickLocation() {
  let cols = floor(boxW / scl);
  let rows = floor(boxH / scl);
  food = createVector(1 + floor(random(cols)), 2 + floor(random(rows)));
  food.mult(scl);
  for (let i = 0; i < s.tail.length; i++) {
    if (s.tail[i].equals(food)) {
      pickLocation();
    }
  }

  // Add obstacles based on the current level
  obstacles = [];
  for (let i = 0; i < level; i++) {
    let obs = createVector(1 + floor(random(cols)), 1 + floor(random(rows)));
    obs.mult(scl);
    obstacles.push(obs);
  }
}

function keyPressed() {
  if (keyCode === ENTER && gameEnded) {
    // Restart the game on enter key press
    startGame();
    gameEnded = true;
    treesPlanted = 0;
    level = 5;
    s.total = 0;
    s.tail = [];
    pickLocation();
  } else if (!gameEnded) {
    // Arrow key presses to change snake direction
    if (keyCode === UP_ARROW) {
      s.dir(0, -1);
    } else if (keyCode === DOWN_ARROW) {
      s.dir(0, 1);
    } else if (keyCode === LEFT_ARROW) {
      s.dir(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
      s.dir(1, 0);
    }
  }
}

function drawGrid() {
  fill('green');
  stroke(200);
  for (let i = scl; i < width - scl; i += scl) {
    for (let j = 2 * scl; j < height - 2 * scl; j += scl) {
      rect(i, j, scl, scl);
    }
  }
}

function drawGame() {
  // Draw game box
  noFill();
  stroke(51);
  rect(scl, 2 * scl, boxW, boxH);

  // Draw score
  fill(51);
  noStroke();
  textSize(0.7 * scl);
  text('Trees Planted: ' + treesPlanted, scl, 0.8 * scl);
  text('High Score: ' + highestTreesPlanted, scl, 1.55 * scl);

  if (gameEnded) {
    // Display game over screen
    fill("black"); // Background color black
    rect(0, 0, width, height);
    frameRate(60);
    fill(random(255), random(255), random(255)); // Set text color to random colors
    textAlign(CENTER);
    textSize(64);
    textFont(gameOverFont); // Font for game over screen
    text("Game Over", width / 2, height / 3);
    textSize(32);
    text("Trees Planted: " + treesPlanted, width / 2, height / 2);
    textSize(24);
    text("TRY AGAIN!!", width / 2, 2 * height / 3);
  }
}

function changeSnakeColor() {
  snakeColor = color(random(255), random(255), random(255)); // Switch to a random color
}

function drawFood() {
  if (s.eat(food)) {
    eatSound.play(); // Play sound when the snake eats the food
    changeSnakeColor(); // Switch the color of the snake
    level++; // Increment level
    treesPlanted += floor(level);
    if (treesPlanted > highestTreesPlanted) {
      highestTreesPlanted = treesPlanted;
    }
    pickLocation();
  }
  image(foodIcon, food.x, food.y, scl, scl);
}

function Snake() {
  this.x = scl;
  this.y = 2 * scl;
  this.xspeed = 0;
  this.yspeed = scl;
  this.total = 0;
  this.tail = [];

  this.update = () => {
    for (let i = this.total - 1; i > 0; i--) {
      this.tail[i] = this.tail[i - 1].copy();
    }
    if (this.total > 0) {
      this.tail[0] = createVector(this.x, this.y);
    }

    this.x += this.xspeed;
    this.y += this.yspeed;

    // Boundary check
    if (this.x >= boxW + scl || this.x < scl || this.y >= boxH + 2 * scl || this.y < 2 * scl) {
      gameOver();
    }
  };

  this.show = () => {
    for (let i = 0; i < this.total; i++) {
      image(snakeSegmentImg, this.tail[i].x, this.tail[i].y, scl, scl); // Draw snake segment image
    }
    image(snakeSegmentImg, this.x, this.y, scl, scl); // Draw snake head image
  };

  this.eat = (pos) => {
    let d = dist(this.x, this.y, pos.x, pos.y);
    if (d < 1) {
      this.total++;
      return true;
    } else {
      return false;
    }
  };

  this.dir = (x, y) => {
    this.xspeed = x * scl;
    this.yspeed = y * scl;
  };

  this.death = () => {
    for (let i = 0; i < this.total; i++) {
      let pos = this.tail[i];
      let d = dist(this.x, this.y, pos.x, pos.y);
      if (d < 1) {
        gameOver();
      }
    }

    // Check for collision with obstacles
    for (let obs of obstacles) {
      let d = dist(this.x, this.y, obs.x, obs.y);
      if (d < 1) {
        gameOver(); // Call gameOver() function when an obstacle is hit
      }
    }
  };
}

function gameOver() {
  gameEnded = true;
  // Play game over sound
  if (gameOverSound) {
    gameOverSound.play();
  }
 // stop background mysic when Enter is pressed
  if (backgroundMusic) {
    backgroundMusic.stop();
  }
}