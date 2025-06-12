import { useState } from 'react';
import confetti from 'canvas-confetti';

function Square({ value, onSquareClick, currentSymbol }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value ? value : <span className="ghost">{currentSymbol}</span>}
    </button>
  );
}

function RoundInfo({ playerWins, currentPlayer }) {
  return (
    <div className="round-info">
      Round #{playerWins.roundNumber}
      <h3>Next player: {currentPlayer.name}</h3>
    </div>
  );
}

function MatchInfo({ players, playerWins, winsRequired }) {
  return (
    <div className="match-info">
      <h2>{players.player1}: {playerWins.X} wins | {players.player2}: {playerWins.O} wins</h2>
      First to get {winsRequired} wins the match!
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
                currentSymbol={currentPlayer.symbol}
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
  
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [wins, setWins] = useState('');

  const [showExitModal, setShowExitModal] = useState(false);
  
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
        resultMsg = `${winnerName} and has won the match!`;

        confetti({
          particleCount: 200,
          spread: 360,
          origin: { y: 0.5 },
        });
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
    setShowExitModal(false);
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
      <div className="game-container">
        <div className="game">
          <div className="game-setup">
            <h1>Tic-Tac-Toe</h1>
            <h3>Start New Match</h3>
            <form onSubmit={handleFormSubmit} className="form-body">
            <input
              name="player1"
              placeholder="Player (X) Name"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              required
              maxLength={12}
            />

            <input
              name="player2"
              placeholder="Player (O) Name"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              required
              maxLength={12}
            />

            <input
              name="wins"
              placeholder="Number of wins"
              type="number"
              min="1"
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              required
            />

            <button
              type="submit"
              className="action-button"
              disabled={
                !player1.trim() || !player2.trim() || wins < 1
              }
            >
              Start Game
            </button>
          </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game">
        <button className="exit-button" onClick={() => setShowExitModal(true)}>✕</button>
        <div className="game-body">
          <h1>Tic-Tac-Toe</h1>
          <RoundInfo
            playerWins={{ ...playerWins, roundNumber }}
            currentPlayer={currentPlayer}
          />
          <div className="game-board">
            <Board
              squares={currentSquares}
              onPlay={handlePlay}
              currentPlayer={currentPlayer}
            />
          </div>
          <button onClick={handleUndo} disabled={currentMove === 0} className="action-button">
            Undo
          </button>
          <MatchInfo
            players={players}
            playerWins={{ ...playerWins, roundNumber }}
            winsRequired={winsRequired}
          />
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>{gameResult}</p>
            <div className="modal-buttons">
              {matchWinner ? (
                <>
                  <button onClick={handleResetMatch} className="action-button">Replay</button>
                  <button onClick={handleReturnToStart} className="action-button">Return to Start</button>
                </>
              ) : (
                <button onClick={handleNextRound} className="action-button">Next Round</button>
              )}
            </div>
          </div>
        </div>
      )}
      {showExitModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Start new game?</p>
            <div className="modal-buttons">
              <button className="action-button" onClick={handleReturnToStart}>Yes</button>
              <button className="action-button" onClick={() => setShowExitModal(false)}>No</button>
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