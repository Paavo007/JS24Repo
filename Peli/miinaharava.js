let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = [];

let tilesClicked = 0; // goal to click all tiles except the ones containing mines
let flagEnabled = false;
let gameOver = false;

// Timer variables
let timerInterval;
let secondsPassed = 0;
let timerStarted = false; // Track whether the timer has started

window.onload = function() {
    startGame();
}

function userInput() {
    document.getElementById("settings-form").addEventListener("submit", function(event) {
        event.preventDefault();

        rows = parseFloat(document.getElementById("rows").value);
        columns = parseFloat(document.getElementById("columns").value);
        minesCount = parseFloat(document.getElementById("mines").value);

        if (rows >= 1_001) {
            rows = 1000;
        }

        if (columns >= 1_001) {
            columns = 1000;
        }

        if (minesCount >= (columns * rows) - 1) {
            minesCount = (columns * rows) - 1;
        }

        if (minesCount <= 0) {
            minesCount = 1;
        }

        document.getElementById("rows").value = rows;
        document.getElementById("columns").value = columns;
        document.getElementById("mines").value = minesCount;

        let tileWidth = 48; // Width of each tile in pixels
        let tileHeight = 48;
        let tileGap = 2; // Gap between tiles in pixels (if any)
        let totalWidth = (tileWidth * columns) + (tileGap * (columns - 1));
        let totalHeight = (tileHeight * rows) + (tileGap * (rows - 1));
        
        if (totalWidth >= 1300) {
            document.getElementById("oikea").style = "order: 1;";
            document.getElementById("vasen").style = "order: 2;";
            document.getElementById("board").style = "width: " + totalWidth + "px; height: " + totalHeight + "px; order: 3;";
        } else {
            document.getElementById("oikea").style = "order: 1;";
            document.getElementById("vasen").style = "order: 3;";
            document.getElementById("board").style = "width: " + totalWidth + "px; height: " + totalHeight + "px; order: 2;";
        }

        resetGame();
        startGame();
    });
}

function resetGame() {
    board = [];
    tilesClicked = 0;
    minesLocation = [];
    gameOver = false;
    timerStarted = false; // Reset the timer flag when resetting the game

    let boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    stopTimer(); // Stop the timer when resetting the game
}

function setMines() {
    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}

function startGame() {
    document.getElementById("mines-count").innerText = minesCount;
    document.getElementById("flag-button").addEventListener("click", setFlag);
    userInput();

    let boardElement = document.getElementById("board");
    boardElement.style.gridTemplateRows = `repeat(${rows}, 48px)`;
    boardElement.style.gridTemplateColumns = `repeat(${columns}, 48px)`;

    setMines();
    boardElement.innerHTML = '';

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    } else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    let tile = this;

    if (flagEnabled) {
        if (tile.innerText == "") {
            tile.innerText = "🚩";
        } else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }

    // Start the timer on the first click
    if (!timerStarted) {
        startTimer();  // Start the timer when a tile is clicked for the first time
        timerStarted = true;
    }

    if (minesLocation.includes(tile.id)) {
        gameOver = true;
        revealMines();
        stopTimer(); // Stop the timer when the game is over
        return;
    }

    let coords = tile.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

    tile.classList.add("tile-clicked");
    tile.style.backgroundColor = "darkgrey";

    if (tile.innerText === "") {
        checkMine(r, c);
    }
}

function revealMines() {
    stopTimer();  // Stop the timer when the game is over
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    board[r][c].style.backgroundColor = "darkgrey";
    tilesClicked += 1;

    let minesFound = 0;

    minesFound += checkTile(r-1, c-1);
    minesFound += checkTile(r-1, c);
    minesFound += checkTile(r-1, c+1);
    minesFound += checkTile(r, c-1);
    minesFound += checkTile(r, c+1);
    minesFound += checkTile(r+1, c-1);
    minesFound += checkTile(r+1, c);
    minesFound += checkTile(r+1, c+1);

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    } else {
        board[r][c].innerText = "";
        checkMine(r-1, c-1);
        checkMine(r-1, c);
        checkMine(r-1, c+1);
        checkMine(r, c-1);
        checkMine(r, c+1);
        checkMine(r+1, c-1);
        checkMine(r+1, c);
        checkMine(r+1, c+1);
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
        stopTimer();  // Stop the timer when the game is won
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}

function clearboard() {
    resetGame();
    startGame();
    resetTimer()
}

document.addEventListener("keydown", function(e) {
    if (e.key == "f") {
        setFlag();
    }
    if (e.key == "r") {
        clearboard();
        resetTimer();
    }
    if (e.key == "c") {
        clearmines();
    }
})

function clearmines() {
    for (let i = 0; i <= rows - 1; i++) {
        for (let x = 0; x <= columns - 1; x++) {
            let str = i + "-" + x;
            if (!minesLocation.includes(str)) {
                checkMine(i, x);
            }
        }
    }
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    secondsPassed++;
    let minutes = Math.floor(secondsPassed / 60);
    let seconds = secondsPassed % 60;
    let timeString = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    document.getElementById("timer").innerText = timeString;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    secondsPassed = 0;
    document.getElementById("timer").innerText = "00:00";
}
