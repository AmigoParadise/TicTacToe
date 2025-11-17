//Placeholder global object (not strictly  used, but good practice for  structuring)
const gameState = {};

// ----------------------------------------------------------------------
// Player Factory Function
// Factory Functions are used here to produce players without using the 'new' keyword or classes.
// This is ideal for simple objects that share no methods.
const Player = (name, mark) => {
    // Returns an object containing the player's name (e.g., "Player X") and their mark (e.g., "X").
    return { name, mark };
}
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// Gameboard Module
// The Module Pattern (an Immediately Invoked Function Expression - IIFE) is used here.
// It provides data privacy by keeping the 'board' variable hidden from the global scope (closure).
const Gameboard = (() => {
    // private variable
    // Initalized the array with  9 empty string (indices 0 to 8) to match the 3x3 board
    let board = ["", "", "", "", "", "", "", "", ""];

    //public method : getBoard
    //allow read-only access to the current state of the board array
    const getBoard = () => board;

    //public methd: placeMark
    //attempts to update the board array with a player's mark
    const placeMark = (index, mark) => {
        //input validation check if the index is out of bounds or if the cell is already occupied
        //board.length is now 9, so this check correctly handls all 9 cells
        if (index >= board.length || board[index] !== "") {
            return false; //placement failed
        }
        //if valid, place the mark at the specified index
        board[index] = mark;
        return true; // placement successfull
    };

    //public method
    //resets the board back to its initial empty state
    const reset = () => {
        //Ensured reset also creates a 9-element array
        board = ["", "", "", "", "", "", "", "", ""];
    };

    // Only the explicitly returned object properties are public (getBoard, placeMark, reset).
    return { getBoard, placeMark, reset };
})();
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// Game Controller Module
// This module orchestrates the entire game logic, managing state and UI interaction.
const GameController = (() => {
    //Setup player using the factory function 
    const player1 = Player("Player X", "X");
    const player2 = Player("Player O", "O");

    //Initial state variables
    let currentPlayer = player1; //start with Player X
    let isGameOver = false; //Flag to prevent further moves after win/tie

    //DOM element references
    const cells = document.querySelectorAll('.cell');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');

    //All possible winning combination (indice of the board array)
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],//rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],//columns
        [0, 4, 8], [2, 4, 6] //diagonals
    ];

    //game flow: function to switch turn
    const switchTurn = () => {
        //ternary operator to swap between player1 and player2
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        //update the visible message for the new current player
        updateMessage(`${currentPlayer.name}'s turn`);
    };

    //helper function to update the visible message on the screen
    const updateMessage = (text) => {
        messageElement.textContent = text;
    }

    //win condition check
    //iterates through all win condition to see  any player has 3 in a row
    const checkForWin = (board) => {
        for (const condition of winConditions) {
            const [a, b, c] = condition; //destructure the  three indices
            // check 1 = ensure the cell is not empty (board[a])
            //check 2 = ensure all three cells are equal
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return true;//winning condition met
            }
        }
        return false;//no winner found
    };

    // tie condition check
    // check if every cell in the board array is marked
    const checkForTie = (board) => {
        //the array.prototype.every() method check if all elements satisfy the condition
        return board.every(cell => cell != "");
    };

    //display/render the board
    //syncronizes the visual DOM element with the internal Gameboard array state
    const render = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            //update the cell content (O, X or empty string)
            cell.textContent = board[index];
            //clean up styling classes
            cell.classList.remove('X', 'O', 'marked');

            //add appropriate class for visual style  and to mark it as occupied
            if (board[index] !== "") {
                cell.classList.add(board[index], 'marked');
            }
        });
    };

    //event handler for clicking a cell
    const handleCellClick = (e) => {
        if (isGameOver) {
            return; //exit if  the game ended
        }

        //get the index of the clicked cell from its data-index attribute
        const index = parseInt(e.target.dataset.index);

        //handling moves : attempt to place the current player's mark
        const placementSuccessful = Gameboard.placeMark(index, currentPlayer.mark);

        if (placementSuccessful) {
            render();//update ui to show the new mark

            const currentBoard = Gameboard.getBoard();

            //check for end conditions
            if (checkForWin(currentBoard)) {
                //winner found
                updateMessage(`${currentPlayer.name} Wins!`);
                isGameOver = true;
                return;
            }

            if (checkForTie(currentBoard)) {
                //tie found
                updateMessage("It is Tie!");
                isGameOver = true;
                return;
            }

            // no end condition met, proceed to the next turn
            switchTurn();
        }
    };

    //start/reset logic
    const resetGame = () => {
        Gameboard.reset(); //clear the internal array
        currentPlayer = player1;// reset to the starting player
        isGameOver = false; //allow move again
        render();//clear the visible board
        updateMessage(`${currentPlayer.name}'s turn!`); //display initial message
    };

    //initializer function
    //set up the game environment by attaching  event listener
    const init = () => {
        //attach click listener to every cell
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        //attach click listener to reset button
        resetButton.addEventListener('click', resetGame);

        //initial state setup
        render();
        updateMessage(`${currentPlayer.name}'s turn!`);
    };

    //expose init function to outside world to start the game
    return { init };
})();

//start the game when the window content is fully loaded
window.onload = GameController.init;