import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function GameInfo({ players, playerWins, winsRequired, currentPlayer }) {
  return (
    <div className="game-info">
      <h2>
        {players.player1}: {playerWins.X} wins | {players.player2}: {playerWins.O} wins
      </h2>
      <h3>
        First to get {winsRequired} wins the match!
      </h3>
      <div className="status">Round {playerWins.roundNumber}</div>
      <div className="status">
        Next player: {currentPlayer.name} ({currentPlayer.symbol})
      </div>
    </div>
  );
}

function Board({ squares, onPlay, currentPlayer }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = currentPlayer.symbol;
    onPlay(nextSquares);
  }

  return (
    <>
      {[0, 3, 6].map((rowStart) => (
        <div className="board-row" key={rowStart}>
          {[0, 1, 2].map((offset) => {
            const i = rowStart + offset;
            return (
              <Square
                key={i}
                value={squares[i]}
                onSquareClick={() => handleClick(i)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [players, setPlayers] = useState(null);
  const [winsRequired, setWinsRequired] = useState(0);
  const [playerWins, setPlayerWins] = useState({ X: 0, O: 0 });
  const [roundNumber, setRoundNumber] = useState(1);

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [startingSymbol, setStartingSymbol] = useState('X');
  const [showModal, setShowModal] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [matchWinner, setMatchWinner] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const currentSquares = history[currentMove];
  const xStarts = currentMove % 2 === 0;
  const currentSymbol = xStarts ? startingSymbol : startingSymbol === 'X' ? 'O' : 'X';
  const currentPlayer = players
    ? {
        name: currentSymbol === 'X' ? players.player1 : players.player2,
        symbol: currentSymbol,
      }
    : null;

  const winnerSymbol = calculateWinner(currentSquares);
  const isDraw = !winnerSymbol && currentSquares.every(Boolean);

  if ((winnerSymbol || isDraw) && players && !showModal) {
    let resultMsg = '';
    let nextStarter = startingSymbol === 'X' ? 'O' : 'X';

    if (winnerSymbol) {
      const winnerName =
        winnerSymbol === 'X' ? players.player1 : players.player2;
      const loserSymbol = winnerSymbol === 'X' ? 'O' : 'X';
      const updatedWins = {
        ...playerWins,
        [winnerSymbol]: playerWins[winnerSymbol] + 1,
      };
      setPlayerWins(updatedWins);
      resultMsg = `${winnerName} has won round ${roundNumber}`;

      if (updatedWins[winnerSymbol] === winsRequired) {
        setMatchWinner(winnerName);
        resultMsg += ` and has won the match!`;
      }

      nextStarter = loserSymbol;
    } else {
      resultMsg = `Round ${roundNumber} is a draw!`;
    }

    setGameResult(resultMsg);
    setShowModal(true);
    setStartingSymbol(nextStarter);
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleUndo() {
    if (currentMove > 0) setCurrentMove(currentMove - 1);
  }

  function handleNextRound() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setShowModal(false);
    setGameResult('');
    setRoundNumber(roundNumber + 1);
  }

  function handleResetMatch() {
    setPlayerWins({ X: 0, O: 0 });
    setRoundNumber(1);
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setStartingSymbol('X');
    setShowModal(false);
    setGameResult('');
    setMatchWinner('');
  }

  function handleReturnToStart() {
    setPlayers(null);
    setWinsRequired(0);
    setGameStarted(false);
    handleResetMatch();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    setPlayers({
      player1: formData.get('player1'),
      player2: formData.get('player2'),
    });
    setWinsRequired(parseInt(formData.get('wins')));
    setGameStarted(true);
  }

  if (!gameStarted) {
    return (
      <div className="game-setup">
        <h2>Start New Tic-Tac-Toe Match</h2>
        <form onSubmit={handleFormSubmit}>
          <input name="player1" placeholder="Player 1 Name (X)" required />
          <input name="player2" placeholder="Player 2 Name (O)" required />
          <input
            name="wins"
            placeholder="Number of wins to win match"
            type="number"
            min="1"
            required
          />
          <button type="submit">Start Game</button>
        </form>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="game-header">
        <h1>Tic-Tac-Toe</h1>
        <GameInfo
          players={players}
          playerWins={{ ...playerWins, roundNumber }}
          winsRequired={winsRequired}
          currentPlayer={currentPlayer}
        />
      </div>
      <div className="game-board">
        <Board
          squares={currentSquares}
          onPlay={handlePlay}
          currentPlayer={currentPlayer}
        />
      </div>
      <div className="game-controls">
        <button onClick={handleUndo} disabled={currentMove === 0}>
          Undo
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>{gameResult}</p>
            <div className="modal-buttons">
            {matchWinner ? (
              <>
                <button onClick={handleResetMatch}>Replay</button>
                <button onClick={handleReturnToStart}>Return to Start</button>
              </>
            ) : (
              <button onClick={handleNextRound}>Next Round</button>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}