const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext("2d");
let levelScore = 0;
let totalScore = 0;
let levelCount = 1;
let lives = 3;
const highScores = [];
let rightArrowPressed = false;
let leftArrowPressed = false;
let buttonClicked = false; // Stores boolean showing if the leaderboard button has been selected
const characterHeight = 63;
const characterWidth = 80;
let characterPositionX = (canvas.width - characterWidth)/ 2;
const projectileRadius = 15;
let switchProjectile; //stores previously selected projectiles (or current projectile before selecting a different one)
const projectile = new Image();
let projectileVelocityX = 6;
let projectileVelocityY = -6;
let projectilePositionX = canvas.width / 2;
let projectilePositionY = canvas.height - characterHeight;
let ufoRowCount = 2;
let ufoColumnCount = 7;
const ufoWidth = 70;
const ufoHeight = 30;
let ufoPadding = 35;
let ufoOffsetTop = 30;
let ufoOffsetLeft = 60;
const ufos = [];
const leaderBoard = document.getElementById("leaderboard-button");
const leaderBoardContainer = document.getElementById("leaderboard-container");
const resultContainer = document.getElementById("result-container");
const results = document.getElementById("results");
const points = document.getElementById("points");
const tryAgainButton = document.getElementById("try-again-button"); //starts again from same level
const startOver = document.getElementById("start-from-beginning"); //starts from level one
const mainAudio = document.getElementById("main-audio");
const bounceAudio = document.getElementById("bounce-audio");
const collisionAudio = document.getElementById("collision-audio");
const losingScreenAudio = document.getElementById("losing-screen-audio");
const winningScreenAudio = document.getElementById("winning-screen-audio");
const soundEffectsIcon = document.getElementById("sound-effects-icon");
const backgroundMusicIcon = document.getElementById("background-music-icon");
const soundEffects = document.getElementById("sound-effects-path");
const backgroundMusic = document.getElementById("background-music-path");
const asteroidProjectile = document.getElementById("asteroid-projectile");
const starProjectile = document.getElementById("star-projectile");
const heartProjectile = document.getElementById("heart-projectile");
const carrotProjectile = document.getElementById("carrot-projectile");
const levelTwo = document.getElementById("level-two");
const levelThree = document.getElementById("level-three");
let soundOnIcon = `M11 2H9v2H7v2H5v2H1v8h4v2h2v2h2v2h2V2zM7 18v-2H5v-2H3v-4h2V8h2V6h2v12H7zm6-8h2v4h-2v-4zm8-6h-2V2h-6v2h6v2h2v12h-2v2h-6v2h6v-2h2v-2h2V6h-2V4zm-2 4h-2V6h-4v2h4v8h-4v2h4v-2h2V8z`;
let soundOffIcon = `M13 2h-2v2H9v2H7v2H3v8h4v2h2v2h2v2h2V2zM9 18v-2H7v-2H5v-4h2V8h2V6h2v12H9zm10-6.777h-2v-2h-2v2h2v2h-2v2h2v-2h2v2h2v-2h-2v-2zm0 0h2v-2h-2v2z`;
let musicOnIcon ="M20 2.5V0L6 2v12.17A3 3 0 0 0 5 14H3a3 3 0 0 0 0 6h2a3 3 0 0 0 3-3V5.71L18 4.3v7.88a3 3 0 0 0-1-.17h-2a3 3 0 0 0 0 6h2a3 3 0 0 0 3-3V2.5z";
let musicOffIcon ="m2 5.27 1.28-1.27 16.72 16.72-1.27 1.28-9.73-9.73v5.23a3.5 3.5 0 0 1 -3.5 3.5 3.5 3.5 0 0 1 -3.5-3.5 3.5 3.5 0 0 1 3.5-3.5c.54 0 1.05.12 1.5.34v-4.07zm19-2.27v12.5c0 1-.43 1.92-1.12 2.56l-4.94-4.94c.64-.69 1.56-1.12 2.56-1.12.54 0 1.05.12 1.5.34v-5.87l-8.83 1.88-2.51-2.51z";
let mutedState = false; // Holds background music muted status
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
tryAgainButton.addEventListener("click", redrawCanvas);
levelTwo.addEventListener("click", goLevelTwo);
levelThree.addEventListener("click", goLevelThree);
startOver.addEventListener("click", startAgain);
leaderBoard.addEventListener("click", showLeaderboard);
soundEffectsIcon.addEventListener("click", toggleSoundEffects);
backgroundMusicIcon.addEventListener("click", toggleBackgroundMusic);
asteroidProjectile.addEventListener("click", selectProjectile);
starProjectile.addEventListener("click", selectProjectile);
heartProjectile.addEventListener("click", selectProjectile);
carrotProjectile.addEventListener("click", selectProjectile);
projectile.src = "./icons/asteroid-projectile.png";
setUfos();


/*
* Changes between a muted and unmuted state for all sound effects
*/
function toggleSoundEffects(event) {
  if (bounceAudio.muted === false) {
    soundEffects.setAttribute("d", soundOffIcon);
    bounceAudio.muted = true;
    collisionAudio.muted = true;
  }
  else if (bounceAudio.muted === true) {
    soundEffects.setAttribute("d", soundOnIcon);
    bounceAudio.muted = false;
    collisionAudio.muted = false;
  }
}

/*
* Changes between a muted and unmuted state for all background music
*/
function toggleBackgroundMusic(event) {
  if (mainAudio.muted === false) {
    mutedState = true;
    backgroundMusic.setAttribute("d", musicOffIcon);
    mainAudio.muted = true;
    losingScreenAudio.muted = true;
    winningScreenAudio.muted = true;
  }
  else if (mainAudio.muted === true) {
    mutedState = false;
    backgroundMusic.setAttribute("d", musicOnIcon);
    mainAudio.muted = false;
    losingScreenAudio.muted = false;
    winningScreenAudio.muted = false;
  }
}

/*
* Checks if background music has been turned off.
* If not, audio will play.
*/
function isMuted() {
  if (mutedState === false) {
    winningScreenAudio.muted = false;
    winningScreenAudio.play();
  }
}

/*
* Switches the selected projectile by toggling the selected projectile class.
* If statements cover multiple scenarios like where selected projectile may be the same as the current projectile or when a projectile hasn't been selected yet.
*/
function selectProjectile(event) {
  if (event.target === switchProjectile || switchProjectile === undefined) {
    event.target.classList.toggle("selected-projectile");
  }
  else if (switchProjectile !== event.target){
    event.target.classList.toggle("selected-projectile");
    switchProjectile.classList.remove("selected-projectile");
  }
  switchProjectile = event.target;
  projectile.src = event.target.previousElementSibling.src;
}

/*
* Stores boolean that represents if the arrow keys have been pressed
*/
function keyDownHandler(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightArrowPressed = true;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftArrowPressed = true;
  }
}

/*
* Stores boolean that represents if the arrow keys are no longer pressed
*/
function keyUpHandler(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    rightArrowPressed = false;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    leftArrowPressed = false;
  }
}

/*
* Stores variable that represents the position of the mouse
*/
function mouseMoveHandler(event) {
  const mousePositionX = event.clientX-((window.innerWidth-canvas.width)/2);
  if (
    mousePositionX > characterWidth / 2 &&
    mousePositionX < canvas.width - characterWidth / 2
  ) {
    characterPositionX = mousePositionX - (characterWidth/2);
  }
}

/*
* Displays the highest scores up to 10. 
* If leaderboard is selected while either losing/winning screens are up, the losing/winning screens will be removed
* If selected during gameplay, the game will pause and continue when deselected. 
* The buttonClick variable is used later on to continue game where it was paused
*/
function showLeaderboard(event) {
  buttonClicked = true;
  let scores = ['score-one', 'score-two', 'score-three', 'score-four', 'score-five', 'score-six', 'score-seven', 'score-eight', 'score-nine', 'score-ten'];
  let names = ['name-one', 'name-two', 'name-three', 'name-four', 'name-five', 'name-six', 'name-seven', 'name-eight', 'name-nine', 'name-ten'];
  let length = highScores.length;
  if (length >= 0) {
    for (let i=0; i < highScores.length; i++) {
      document.getElementById(scores[i]).innerHTML = highScores[i];
      document.getElementById(names[i]).innerHTML = 'Player';
    }
  }
  if (!resultContainer.classList.contains("hide-screen")) {
    resultContainer.classList.toggle("hide-screen");
    if (totalScore === 14) {
      resultContainer.classList.toggle("hide-screen");
      goLevelTwo();
    }
    if (totalScore=== 35) {
      resultContainer.classList.toggle("hide-screen");
      goLevelThree();
    }
    if (totalScore === 50) {
      resultContainer.classList.toggle("hide-screen");
      startAgain();
    }
    else if (totalScore != 14 || totalScore != 35 || totalScore != 50) {
      redrawCanvas();
      resultContainer.classList.toggle("hide-screen");
    }
  }
   if (leaderBoardContainer.classList.contains("hide-screen")) {
    leaderBoardContainer.classList.toggle("hide-screen");
    
  }
   else if (!leaderBoardContainer.classList.contains("hide-screen")) {
    leaderBoardContainer.classList.toggle("hide-screen");
    buttonClicked = false;
    draw();
  }
}

/*
* Starts game over by setting variable to level 1 parameters
*/
function startAgain(event) {
  tryAgainButton.classList.add("hide-button");
  totalScore = 0;
  winningScreenAudio.muted = true;
  projectileVelocityX = 6;
  projectileVelocityY = -6;
  levelCount = 1;
  ufoRowCount = 2;
  ufoColumnCount = 7;
  ufoPadding = 35;
  ufoOffsetLeft = 60;
  redrawCanvas();
}

/*
* Canvas is redrawn without changing level
*/
function redrawCanvas() {
  losingScreenAudio.muted = true;
  mainAudio.load();
  mainAudio.play();
  resultContainer.classList.toggle("hide-screen");
  startOver.classList.add("hide-button");
  levelScore = 0; 
  lives = 3;
  projectilePositionY = canvas.height - projectileRadius + characterHeight;
  projectilePositionX = characterPositionX;
  setUfos();
  draw();
}

/*
* Stores high scores by storing them into array and removing the lowest scores as array length exceeds 10
*/
function storeScores(score){
  if (highScores.length <= 10) {
    highScores.push(score);
  }
  if (highScores.length > 1) {
    highScores.sort((a, b) => b-a);
    if (highScores.length === 11) {
    highScores.pop();
  }
  }
}

/*
* Implements level 2 parameters on a redrawn canvas
*/
function goLevelTwo(event) {
  winningScreenAudio.muted = true;
  levelCount = 2;
  projectileVelocityX = 8;
  projectileVelocityY = -8;
  ufoRowCount = 3;
  ufoColumnCount = 7;
  redrawCanvas();
}

/*
* Implements level 3 parameters on a redrawn canvas
*/
function goLevelThree(event) {
  winningScreenAudio.muted = true;
  levelCount = 3;
  projectileVelocityX = 10;
  projectileVelocityY = -10;
  ufoRowCount = 3;
  ufoColumnCount = 5;
  ufoOffsetLeft = 100;
  ufoPadding = 60;
  redrawCanvas();
}

/*
* If the projectile crosses into the space determined by the x and y values set for the ufos, 
* the ufo is 'destroyed' by changing its status to 0 and the projectile is sent in the opposite direction.
* Once the level score is the same as the number of bricks set for that level, the winning screen is initiated and the game is paused
*/
function collisionDetection() {
  for (let columns = 0; columns < ufoColumnCount; columns++) {
    for (let rows = 0; rows < ufoRowCount; rows++) {
      const ufo = ufos[columns][rows];
      if (ufo.status === 1) {
        if (
          projectilePositionX > ufo.x &&
          projectilePositionX < ufo.x + ufoWidth &&
          projectilePositionY > ufo.y &&
          projectilePositionY < ufo.y + ufoHeight
        ) {
          collisionAudio.volume = .2;
          collisionAudio.playbackRate = 3; 
          collisionAudio.play();
          projectileVelocityY = -projectileVelocityY;
          ufo.status = 0;
          levelScore++;
        }
        if (levelScore === (ufoRowCount * ufoColumnCount)) {
            if (levelScore=== 14) {
              totalScore = levelScore;
              mainAudio.pause();
              isMuted();
              results.innerHTML = "Dont let it get to your head";
              points.innerHTML = `Score: ${levelScore}`;
              tryAgainButton.classList.add("hide-button");
              levelTwo.classList.remove("hide-button");
            }
            else if (levelScore + totalScore === 35) {
              totalScore += levelScore;
              mainAudio.pause();
              isMuted();
              results.innerHTML = "It wont be so easy next time";
              points.innerHTML = `Score: ${totalScore}`;
              levelTwo.classList.add("hide-button");
              tryAgainButton.classList.add("hide-button");
              levelThree.classList.remove("hide-button");
            }
            else if (levelScore + totalScore === 50) {
              totalScore += levelScore;
              mainAudio.pause();
              isMuted();
              results.innerHTML = "ok......fine";
              points.innerHTML = `Score: ${totalScore}`;
              levelThree.classList.add("hide-button");
              startOver.classList.remove("hide-button");
              tryAgainButton.classList.add("hide-button");
            }
            resultContainer.classList.toggle("hide-screen");
            return false;
          }
      }
    }
  }
}

/*
* Creates projectile and it's movement by setting position to a changing variable
*/
function drawProjectile() {
  ctx.beginPath();
  ctx.drawImage(projectile, projectilePositionX, projectilePositionY, 30, 30);
  ctx.fill();
  ctx.closePath();
}

/*
* Creates character and it's movement by setting position to changing variable
*/
function drawCharacter() {
  let spaceShip = new Image();
  spaceShip.src = "./icons/character-icon.png";
  ctx.beginPath();
  ctx.drawImage(spaceShip, characterPositionX, canvas.height - characterHeight, 80, 80);
  ctx.fill();
  ctx.closePath();
}

/*
* Draws ufos with specified rows, columns, padding, and offsets
*/
function drawUfos() {
  for (let columns = 0; columns < ufoColumnCount; columns++) {
    for (let rows = 0; rows < ufoRowCount; rows++) {
      if (ufos[columns][rows].status === 1) {
        const ufoPositionX = columns * (ufoWidth + ufoPadding) + ufoOffsetLeft;
        const ufoPositionY = rows * (ufoHeight + ufoPadding) + ufoOffsetTop;
        ufos[columns][rows].x = ufoPositionX;
        ufos[columns][rows].y = ufoPositionY;
        let ufoIcon = new Image();
        ufoIcon.src = "./icons/ufo-icon.png";
        ctx.beginPath();
        ctx.drawImage(ufoIcon, ufoPositionX, ufoPositionY, 70, 60);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

/*
* Sets the status of the ufos to true between levels when the canvas is not redrawn/reloaded
*/
function setUfos() {
for (let columns = 0; columns < ufoColumnCount; columns++) {
  ufos[columns] = [];
  for (let rows = 0; rows < ufoRowCount; rows++) {
    ufos[columns][rows] = { x: 0, y: 0, status: 1 };
  }
} 
}

/*
* Draws total score with specified styling and coordinates
*/
function drawScore() {
  ctx.font = "22px textFont";
  ctx.fillStyle = "rgb(157, 232, 255)";
  ctx.fillText(`Score: ${levelScore+totalScore}`, 18, 25);
}

/*
* Draws current level with specified styling and coordinates
*/
function drawLevel() {
  ctx.font = "22px textFont";
  ctx.fillStyle = "rgb(157, 232, 255)";
  ctx.fillText(`Level`+ levelCount, canvas.width/2-28, 25);
}

/*
* Draws remaining lives with specified styling and coordinates
*/
function drawLives() {
  ctx.font = "22px textFont";
  ctx.fillStyle = "rgb(157, 232, 255)";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 95, 25);
}

/*
* - draws the canvas from start to finish
* - initializes all drawing functions
* - sets background
* - determines the status of the leaderboard and background mute options
* - creates the canvas edges so the projectile bounces off the walls
* - tracks number of lives
* - updates character and projectile positions
* - calls losing screen when lives fall below 1
*/
function draw() {
  while (buttonClicked === true) {
    return;
  }
  mainAudio.volume = .5;
  let newImage = new Image();
  newImage.src = "./background-images/canvas-background.jpg";
  newImage.onload = () => {
    ctx.drawImage(newImage, 0, 0, 1200, 650);
  }
  drawUfos();
  drawProjectile();
  drawCharacter();
  drawScore();
  drawLevel();
  drawLives();
  
  if (collisionDetection() === false) {
    return;
  }
  if (projectilePositionX + projectileVelocityX > canvas.width - projectileRadius || projectilePositionX + projectileVelocityX < projectileRadius) {
    projectileVelocityX = -projectileVelocityX;
  }
  if (projectilePositionY + projectileVelocityY < projectileRadius) {
    projectileVelocityY = -projectileVelocityY;
  }
  else if (projectilePositionY + projectileVelocityY > canvas.height - projectileRadius) {
    if (projectilePositionX > characterPositionX && projectilePositionX < characterPositionX + characterWidth) {
      bounceAudio.playbackRate = 4;
      bounceAudio.play();
      projectileVelocityY = -projectileVelocityY;
      
    } 
    else {
      if (levelScore > 0) {
        lives--; 
      }
      if (4 > lives >=0) {
        if (lives < 1) {
        mainAudio.pause();
        if (mutedState === false) {
        losingScreenAudio.muted = false;
        losingScreenAudio.volume = .15;
        }
        losingScreenAudio.play(); 
        results.innerHTML = "Just surrender already";
        points.innerHTML = `Score: ${levelScore+totalScore}`;
        storeScores(levelScore+totalScore);
        resultContainer.classList.toggle("hide-screen");
        tryAgainButton.classList.remove("hide-button");
        levelTwo.classList.add("hide-button");
        levelThree.classList.add("hide-button");
        return;
      } 
      if (1 < lives <= 3) {
        projectilePositionX = characterPositionX + (characterWidth/2);
        projectilePositionY = canvas.height - characterHeight;
        projectileVelocityX = Math.abs(projectileVelocityX);
        projectileVelocityY = -Math.abs(projectileVelocityY);
      }
      }
    }
  }
  if (rightArrowPressed && characterPositionX < canvas.width - characterWidth) {
    characterPositionX = Math.min(characterPositionX + 7, canvas.width - characterWidth); // Moves character to the right 7 pixels everytime it is redrawm until its at the edge
  } 
  else if (leftArrowPressed && characterPositionX > 0) {
    characterPositionX = Math.max(characterPositionX - 7, 0); // Moves character to the left 7 pixels every redraw until its at the edge
  }
  projectilePositionX += projectileVelocityX;
  projectilePositionY += projectileVelocityY;
  requestAnimationFrame(draw);
}

draw();

