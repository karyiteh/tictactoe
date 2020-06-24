import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={props.focus ? "winning-square" : "square"}
            onClick={props.onClick}>
            {props.value}
        </button>
    );
}

const r = [0, 0, 0, 1, 1, 1, 2, 2, 2];
const c = [0, 1, 2, 0, 1, 2, 0, 1, 2];

class Board extends React.Component {
    renderSquare(i) {
        // Determine whether to render the square as a winning square.
        let highlight = false;
        const winningLine = this.props.winnerLine;
        if (winningLine) {
            for (let pos = 0; pos < winningLine.length; pos++) {
                if (winningLine[pos] === i) {
                    highlight = true;
                    break;
                }
            }
        }
        return (
            <Square key={i}
                value={this.props.squares[i]}
                focus={highlight}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        // Render the board in a for-loop fashion.
        const squares = [];
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                row.push(this.renderSquare(3 * i + j));
            }
            squares.push(
                <div key={i} className="board-row">
                    {row}
                </div>
            );
        }
        return (
            <div>
                {squares}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                location: null,
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        // Return early if game is already won OR square is already filled.
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                location: {
                    row: r[i],
                    col: c[i],
                },
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        // Use most recent history entry to determine and display current board.
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        // Determine the winner of the current board.
        const winner = calculateWinner(current.squares);

        // Map history of moves to buttons on the screen.
        const moves = history.map((step, move) => {
            const moveLocation = move ? ' (' + history[move].location.col + ',' + history[move].location.row + ')' : null;
            const desc = move ? 'Go to move #' + move + moveLocation : 'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {move === this.state.stepNumber ? <b>{desc}</b> : desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner.player;
        } else if (isBoardFull(current.squares)) {
            status = 'It\'s a tie!';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winnerLine={winner ? winner.line : null}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

// ========================================

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
            return {
                player: squares[a],
                line: lines[i],
            }
        }
    }
    return null;
}

function isBoardFull(squares) {
    let foundEmpty = false;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            foundEmpty = true;
            break;
        }
    }
    return !foundEmpty;
}