"use strict";

const cells = document.querySelectorAll(".cell");
const activePlayerField = document.querySelector(".active-player");
const xWins = document.querySelector(".x-wins span");
const draws = document.querySelector(".draw span");
const oWins = document.querySelector(".o-wins span");
const modalWindow = document.querySelector(".modal-window");
const gameContainer = document.querySelector(".game-container");
const result = document.querySelector(".result");
const nextRound = document.querySelector(".next-round");
const homePage = document.querySelector(".home-page");
const twoPlayers = document.querySelector(".two-players-button");
const easyBtn = document.querySelector(".easy");
const hardBtn = document.querySelector(".hard");
const userChoice = document.querySelector(".choices");
const aiThinking = document.querySelector(".ai-thinking");
const quit = document.querySelector(".quit");
const restartButton = document.querySelector(".restart");

let table = [
  [".", ".", "."],
  [".", ".", "."],
  [".", ".", "."],
];
let user = "x"; // user choice, only matters if aiGame mode is selected, by defaultit is  "x"
let ai = "o"; // ai choice, only matters if aiGame mode is selected, by defaultit is  "o"
let player = "x"; // player to play, by default it is "x"
let choosenCells = 0; // if this variable == 9 and no winner found, result of the game is draw
let gameMode; // varible to keep what game mode is on
let aiLevel;

userChoice.addEventListener("click", () => {
  // this function only matters if gameMode is "aiGame"
  // when this event happen ::before pseudo element of .choices moves left or right
  // has a role of check button
  userChoice.classList.toggle("selected");
});

twoPlayers.addEventListener("click", () => {
  // function that will display and enable game for two players
  showGame("twoPlayers");
});

// function that will display and enable "aiGame" mode
// function startGame() is helper function in case if user's choice is "o"
// startGame() allows ai to play first
hardBtn.addEventListener("click", () => {
  aiLevel = "hard";
  setPlayers();
  showGame("aiGame");
  if (user === "o") {
    startGame();
  }
});

easyBtn.addEventListener("click", () => {
  aiLevel = "easy";
  setPlayers();
  showGame("aiGame");
  if (user === "o") {
    startGame();
  }
});

nextRound.addEventListener("click", () => {
  restart(false);
});

restartButton.addEventListener("click", () => {
  restart(false);
});

quit.addEventListener("click", () => {
  restart(true);
});

cells.forEach((cell) => {
  cell.addEventListener("mouseover", () => {
    if (!cell.classList.contains("noEvents")) {
      const img = `<img src = 'images/icon-${player}-outline.svg' class = 'noEvents'>`;
      cell.insertAdjacentHTML("beforeend", img);
    }
  });

  cell.addEventListener("mouseout", () => {
    if (!cell.classList.contains("noEvents")) {
      cell.innerHTML = "";
    }
  });

  cell.addEventListener("click", () => {
    const [x, y] = displayMove(cell);
    game(x, y);
  });
});

function showGame(mode) {
  gameMode = mode;
  gameContainer.style.display = "flex";
  homePage.style.display = "none";
}

function displayMove(cell) {
  // function displays user's and ai's moves
  // returns [x, y] of the choosen cell
  // this data will be used in next call of game() function
  // in which will be checked if there is winner
  cell.innerHTML = "";
  const img = `<img src = 'images/icon-${player}.svg'>`;
  cell.insertAdjacentHTML("beforeend", img);
  cell.classList.add("noEvents");
  const [x, y] = [+cell.dataset.row, +cell.dataset.column];
  table[x][y] = player;
  choosenCells += 1;
  return [x, y];
}

function game(x, y) {
  if (checkWinner(x, y)) {
    updateScore();
  } else if (choosenCells === 9) {
    draws.textContent = +draws.textContent + 1;
    result.innerHTML = "Result of the round: Draw";
    modalWindow.style.display = "flex";
    gameContainer.style.opacity = "0.5";
    gameContainer.classList.add("noEvents");
  } else {
    player = player === "o" ? "x" : "o";
    activePlayerField.src = `images/icon-${player}-default.svg`;
    if (gameMode == "aiGame" && player == ai) {
      gameContainer.classList.add("noEvents");
      aiThinking.style.display = "flex";
      setTimeout(() => {
        aiThinking.style.display = "none";
        const [x, y] = aiChoice(table);
        const cell1 = getCell(cells, x, y);
        displayMove(cell1);
        game(x, y);
        gameContainer.classList.remove("noEvents");
      }, 2000);
    }
  }
}

function setPlayers() {
  if (userChoice.classList.contains("selected")) {
    user = "o";
    ai = "x";
  } else {
    user = "x";
    ai = "o";
  }
}

function checkWinner(x, y) {
  return checkRows(x) || checkCols(y) || checkDiag(x, y);
}

function checkRows(x) {
  return [...new Set(table[x])].length === 1;
}

function checkCols(y) {
  let s = [];
  for (let i = 0; i < 3; i++) {
    s.push(table[i][y]);
  }
  return [...new Set(s)].length === 1;
}

function checkDiag(x, y) {
  // here we check main diagonal and secondary diagonal
  // we have matrix with two rows
  // first row is for main diagonal
  // second row is for secondary diagonal
  // in both of this rows we push certains elements
  // at the end we use Set() to filter duplicates from both rows and to
  // get new arrays
  // if any arrays got length of 1 we need to check if this element is '.'
  // because in the first couple of turns it is the case
  // for this case we dont want anything to do so we return false
  // if it is not the case we have a winner so we return true
  if (x === y || Math.abs(x - 2) === y) {
    let s = [[], []];
    for (let i = 0; i < 3; i++) {
      s[0].push(table[i][i]);
      s[1].push(table[i][2 - i]);
    }
    const mainDiag = [...new Set(s[0])];
    const secondaryDiag = [...new Set(s[1])];

    if (mainDiag.length === 1 && mainDiag[0] != ".") {
      return true;
    } else if (secondaryDiag.length === 1 && secondaryDiag[0] != ".") {
      return true;
    }
    return false;
  }
  return false;
}

// function to update score and display winner
function updateScore() {
  let html;
  if (player === "x") {
    xWins.textContent = +xWins.textContent + 1;
    html = renderWinner("x");
  } else {
    oWins.textContent = +oWins.textContent + 1;
    html = renderWinner("o");
  }
  result.insertAdjacentHTML("beforeend", html);
  modalWindow.style.display = "flex";
  gameContainer.style.opacity = "0.5";
  gameContainer.classList.add("noEvents");
}

function renderWinner(player) {
  const html = `<p>
                    <span>Player</span> <img src = "images/icon-${player}.svg"> <span>takes the round</span>
                  </p>`;
  return html;
}

// restart() is used either to quit game if quit button is clicked and display home page
// or to start again game if user clicked restart button
// if indicator(flag) is false user clicked restart button
// else user clicked quit button
function restart(flag) {
  if (!flag) {
    if (user === "o") {
      startGame();
    }
    gameContainer.style.opacity = "1";
  } else {
    user = "x";
    ai = "o";
    gameContainer.style.display = "none";
    homePage.style.display = "flex";
    xWins.textContent = 0;
    draws.textContent = 0;
    oWins.textContent = 0;
    if (userChoice.classList.contains("selected")) {
      userChoice.classList.remove("selected");
    }
  }
  table = [
    [".", ".", "."],
    [".", ".", "."],
    [".", ".", "."],
  ];
  player = "x";
  choosenCells = 0;
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("noEvents");
  });
  activePlayerField.src = `images/icon-${player}-default.svg`;
  gameContainer.classList.remove("noEvents");
  gameContainer.style.opacity = "1";
  modalWindow.style.display = "none";
  result.innerHTML = "";
}

function aiChoice(table) {
  if (aiLevel === "hard") {
    let bestMove = [0, 0];
    let bestScore = -1;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (table[i][j] === ".") {
          choosenCells += 1;
          table[i][j] = ai;
          const val = minimax(i, j, true);
          if (val > bestScore) {
            bestMove[0] = i;
            bestMove[1] = j;
            bestScore = val;
          }
          table[i][j] = ".";
          choosenCells -= 1;
        }
      }
    }
    return bestMove;
  } else if (aiLevel === "easy") {
    const remainedMoves = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (table[i][j] === ".") {
          remainedMoves.push([i, j]);
        }
      }
    }

    const index = Math.floor(Math.random() * remainedMoves.length);
    return [remainedMoves[index][0], remainedMoves[index][1]];
  }
}

// helper function to find cell with [x y] coordinates
function getCell(cells, x, y) {
  return [...cells].find(
    (cell) => +cell.dataset.column === y && +cell.dataset.row === x
  );
}

// helper function to start the game if user's choice is "o"
function startGame() {
  const [x, y] = aiChoice(table);
  const cell1 = getCell(cells, x, y);
  displayMove(cell1);
  player = "o";
  activePlayerField.src = `images/icon-${player}-default.svg`;
}

// recursive function which helps ai to find best move in some position
// argument flag indicates last player who played move in the cell with coordinates x, y
// if flag is true -> ai played last move at (x, y)
// else flag is false -> user played last move at(x, y)
function minimax(x, y, flag) {
  // base case: three possible scenarios: ai won -> 1; draw -> 0; user won -> -1
  if (checkWinner(x, y)) {
    // in this case ai made last move and won, and i want for ai to maximize score
    if (flag) return 1;
    // in this case player made last move and won, and i want for user to minimize score
    if (!flag) return -1;
  }
  if (choosenCells === 9) return 0;

  // user's move
  if (flag) {
    // bestScore variable that i want to make it as small as possible
    // best scenario is to make it -1, or at least 0 to ensure draw
    let bestScore = 1;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // if cell is free, i will try to put there user's move
        // change flag to false as it means user played last move
        // for this choice function minimax() will return me 1, 0, -1
        // if this result is less than bestScore, that means that this move made by
        // player is optimal and good to play
        if (table[i][j] == ".") {
          choosenCells += 1;
          table[i][j] = user;
          const val = minimax(i, j, false);
          if (val < bestScore) {
            bestScore = val;
          }
          // backtrack to check other solutions
          table[i][j] = ".";
          choosenCells -= 1;
        }
      }
    }
    return bestScore;
  } else {
    // same logic for ai
    let bestScore = -1;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (table[i][j] === ".") {
          choosenCells += 1;
          table[i][j] = ai;
          const val = minimax(i, j, true);
          if (val > bestScore) {
            bestScore = val;
          }
          table[i][j] = ".";
          choosenCells -= 1;
        }
      }
    }
    return bestScore;
  }
}
