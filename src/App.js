import { useState } from "react";

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    // spread ... operator to add next snapshot of game
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    // Get the previous move's squares
    // Default to an empty board for move 0
    const prevSquares = move > 0 ? history[move - 1] : Array(9).fill(null);

    // Find the index of the changed square
    const lastMoveIndex = squares.findIndex(
      (square, index) => square !== prevSquares[index]
    );
    // Get row and column from the index
    const { row, col } = getRowCol(lastMoveIndex);
    const player = squares[lastMoveIndex];

    let description;
    move > 0
      ? (description = `Go to move # ${move} ${player} = (${row}, ${col})`)
      : (description = "Go to game start");

    return (
      <ul key={move}>
        {move === currentMove && move > 0 ? (
          <p>{`You are at move # ${move} ${player} = (${row}, ${col})`}</p>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </ul>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const [winnerSquares, setWinner] = useState(Array(3).fill(null)); // To store the winning combination

  function handleClick(i) {
    const [winner] = calculateWinner(squares);
    // squares occupied, or if calculateWinner returns non-null winner
    if (squares[i] || winner) return;

    const nextSquares = squares.slice();
    xIsNext ? (nextSquares[i] = "X") : (nextSquares[i] = "O");
    const [_winner, combination] = calculateWinner(nextSquares);
    setWinner(combination);
    onPlay(nextSquares);
  }

  const [winner, currCombination] = calculateWinner(squares);
  let status;
  // check if all squares are filled yet no winner
  if (!winner && squares.reduce((acc, curr) => acc && curr !== null, true)) {
    status = "Draw";
  } else if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  const boardRows = Array(3).fill();
  const boardCols = Array(3).fill();

  const boardTable = () => {
    return (
      <div>
        {boardRows.map((_, row) => (
          <div key={row} className="board-row">
            {boardCols.map((_, col) => {
              const index = row * 3 + col; // Calculate the index for each square
              const isWinningSquare =
                winnerSquares && winnerSquares.includes(index);
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onSquareClick={() => handleClick(index)}
                  isHighlighted={isWinningSquare && currCombination}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="status">{status}</div>
      {boardTable()}
    </div>
  );
}

function Square({ value, onSquareClick, isHighlighted }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={isHighlighted ? { backgroundColor: "yellow" } : {}}
    >
      {value}
    </button>
  );
}

function getRowCol(index, numCols = 3) {
  const row = Math.floor(index / numCols); // Integer division to get the row
  const col = index % numCols; // Remainder to get the column
  return { row, col };
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      const winner = squares[a];
      const combination = lines[i];
      return [winner, combination];
    }
  }
  return [null, null];
}
