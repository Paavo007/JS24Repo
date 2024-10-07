/*let savedrows = localStorage.getItem("saved_rows") || 8
let savedcols = localStorage.getItem("saved_cols") || 8
let savedmines = localStorage.getItem("saved_mines") || 10*/

let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = []; // "2-2", "3-4", "2-1"

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let flagEnabled = false;

let gameOver = false;

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
            rows = 1000
        }

        if (columns >= 1_001) {
            columns = 1000
        }

        if (minesCount >= (columns*rows)-1) {
            minesCount = (columns*rows)-1
        }

        if (minesCount <= 0) {
            minesCount = 1;
        }

        document.getElementById("rows").value = rows
        document.getElementById("columns").value = columns
        document.getElementById("mines").value = minesCount

        let tileWidth = 48; // Width of each tile in pixels
        let tileGap = 2; // Gap between tiles in pixels (if any)
        let totalWidth = (tileWidth * columns) + (tileGap * (columns - 1));

        console.log(totalWidth)

        document.getElementById("board").style = "width: "+totalWidth+"px "

        /*localStorage.setItem("saved_rows", rows)
        ocalStorage.setItem("saved_cols", columns)
        ocalStorage.setItem("saved_mines", minesCount)*/

        // Reset game settings
        resetGame();

        startGame();
    });
}

function resetGame() { 
    board = [];
    tilesClicked = 0;
    minesLocation = [];
    gameOver = false;
    
    // Clear the current board
    let boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
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

    //Set the board's grid layout dynamically based on the number of rows and columns
    let boardElement = document.getElementById("board");
    boardElement.style.gridTemplateRows = `repeat(${rows}, 48px)`;
    boardElement.style.gridTemplateColumns = `repeat(${columns}, 48px)`;

    setMines();

    boardElement.innerHTML = '';

    //populate the board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    //console.log(board);
}

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    }
    else {
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
        }
        else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        revealMines();
        return;
    }


    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

    tile.classList.add("tile-clicked");
    tile.style.backgroundColor = "darkgrey";

    if(tile.innerText === ""){
        checkMine(r, c);
    }
}

function revealMines() {
    for (let r= 0; r < rows; r++) {
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

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        board[r][c].innerText = "";
        
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
    }
}

function clearboard() {
    resetGame()

    startGame()
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

document.addEventListener("keydown", function(e) {
    if (e.key == "f") {
        setFlag()
    }

    if (e.key == "r") {
        clearboard()
    }

    if (e.key == "c") { 
        clearmines()
    }
})

function clearmines() {
    for (i=0; i<=rows-1; i++) { 
        for(x=0; x<=columns-1; x++) {
            let str = i+"-"+x 
    
            if (minesLocation.includes(str) == false) {
                checkMine(i, x)
            }
        } 
    }
}