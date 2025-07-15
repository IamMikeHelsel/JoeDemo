
import React, { useState, useEffect, useCallback } from 'react';
import { GameGrid } from './components/GameGrid';
import { GameOverModal } from './components/GameOverModal';
import { RotateIcon } from './components/Icons';
import { getAIMove } from './services/geminiService';
import { GRID_SIZE, SHIPS } from './constants';
import { CellState, GameMode, GamePhase, Grid, Orientation, PlacedShip, Player, Ship } from './types';

const createEmptyGrid = (): Grid => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(CellState.Empty));

const App: React.FC = () => {
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.None);
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Setup);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('player1');
    const [winner, setWinner] = useState<Player | null>(null);

    const [player1Ships, setPlayer1Ships] = useState<PlacedShip[]>([]);
    const [player2Ships, setPlayer2Ships] = useState<PlacedShip[]>([]);
    const [player1Grid, setPlayer1Grid] = useState<Grid>(createEmptyGrid());
    const [player2Grid, setPlayer2Grid] = useState<Grid>(createEmptyGrid());

    // Setup phase state
    const [setupPlayer, setSetupPlayer] = useState<Player>('player1');
    const [shipsToPlace, setShipsToPlace] = useState<Ship[]>(SHIPS);
    const [selectedShip, setSelectedShip] = useState<Ship | null>(SHIPS[0]);
    const [orientation, setOrientation] = useState<Orientation>('horizontal');
    const [placementPreview, setPlacementPreview] = useState<{ positions: { row: number; col: number }[], isValid: boolean } | null>(null);

    const [aiIsThinking, setAiIsThinking] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Select a game mode to begin.");

    const placeShipsRandomly = (): PlacedShip[] => {
        let placedShips: PlacedShip[] = [];
        let grid = createEmptyGrid();

        SHIPS.forEach(ship => {
            let placed = false;
            while (!placed) {
                const randOrientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const randRow = Math.floor(Math.random() * GRID_SIZE);
                const randCol = Math.floor(Math.random() * GRID_SIZE);

                if (canPlaceShip(grid, ship, randRow, randCol, randOrientation)) {
                    const positions = [];
                    for (let i = 0; i < ship.size; i++) {
                        const pos = {
                            row: randRow + (randOrientation === 'vertical' ? i : 0),
                            col: randCol + (randOrientation === 'horizontal' ? i : 0)
                        };
                        positions.push(pos);
                        grid[pos.row][pos.col] = CellState.Ship;
                    }
                    placedShips.push({ ...ship, positions, sunk: false });
                    placed = true;
                }
            }
        });
        return placedShips;
    };

    const resetGame = () => {
        setGameMode(GameMode.None);
        setGamePhase(GamePhase.Setup);
        setCurrentPlayer('player1');
        setWinner(null);
        setPlayer1Ships([]);
        setPlayer2Ships([]);
        setPlayer1Grid(createEmptyGrid());
        setPlayer2Grid(createEmptyGrid());
        setShipsToPlace(SHIPS);
        setSelectedShip(SHIPS[0]);
        setOrientation('horizontal');
        setSetupPlayer('player1');
        setStatusMessage("Select a game mode to begin.");
    };

    const handleModeSelect = (mode: GameMode) => {
        setGameMode(mode);
        setGamePhase(GamePhase.Setup);
        if (mode === GameMode.PvAI) {
            setStatusMessage("Place your ships to start the battle against the AI.");
        } else {
            setStatusMessage("Player 1, place your ships.");
        }
    };

    const canPlaceShip = (grid: Grid, ship: Ship, row: number, col: number, orientation: Orientation): boolean => {
        for (let i = 0; i < ship.size; i++) {
            const r = row + (orientation === 'vertical' ? i : 0);
            const c = col + (orientation === 'horizontal' ? i : 0);
            if (r >= GRID_SIZE || c >= GRID_SIZE || grid[r][c] !== CellState.Empty) {
                return false;
            }
        }
        return true;
    };

    const handleGridHover = (row: number, col: number) => {
        if (gamePhase !== GamePhase.Setup || !selectedShip || row === -1) {
            setPlacementPreview(null);
            return;
        }

        const positions = [];
        for (let i = 0; i < selectedShip.size; i++) {
            positions.push({
                row: row + (orientation === 'vertical' ? i : 0),
                col: col + (orientation === 'horizontal' ? i : 0)
            });
        }
        const currentGrid = setupPlayer === 'player1' ? player1Grid : player2Grid;
        const isValid = canPlaceShip(currentGrid, selectedShip, row, col, orientation);
        setPlacementPreview({ positions, isValid });
    };

    const handleGridClickSetup = (row: number, col: number) => {
        if (!selectedShip || !placementPreview?.isValid) {
            setStatusMessage("Cannot place ship here. Try another location.");
            return;
        }

        const newGrid = (setupPlayer === 'player1' ? player1Grid : player2Grid).map(r => [...r]);
        const newShips = [...(setupPlayer === 'player1' ? player1Ships : player2Ships)];

        const positions = [];
        for (let i = 0; i < selectedShip.size; i++) {
            const r = row + (orientation === 'vertical' ? i : 0);
            const c = col + (orientation === 'horizontal' ? i : 0);
            newGrid[r][c] = CellState.Ship;
            positions.push({ row: r, col: c });
        }

        newShips.push({ ...selectedShip, positions, sunk: false });

        if (setupPlayer === 'player1') {
            setPlayer1Grid(newGrid);
            setPlayer1Ships(newShips);
        } else {
            setPlayer2Grid(newGrid);
            setPlayer2Ships(newShips);
        }

        const remainingShips = shipsToPlace.filter(s => s.name !== selectedShip.name);
        setShipsToPlace(remainingShips);
        setSelectedShip(remainingShips[0] || null);
        setPlacementPreview(null);
    };
    
    const handleReady = () => {
        if (gameMode === GameMode.PvP && setupPlayer === 'player1') {
            setSetupPlayer('player2');
            setShipsToPlace(SHIPS);
            setSelectedShip(SHIPS[0]);
            setStatusMessage("Player 2, place your ships.");
        } else {
             if (gameMode === GameMode.PvAI) {
                const aiShips = placeShipsRandomly();
                setPlayer2Ships(aiShips);
                const aiGrid = createEmptyGrid();
                aiShips.forEach(ship => ship.positions.forEach(p => aiGrid[p.row][p.col] = CellState.Ship));
                setPlayer2Grid(aiGrid);
            }
            setGamePhase(GamePhase.Playing);
            setStatusMessage("Battle begins! Player 1's turn.");
        }
    };

    const handleFire = (row: number, col: number) => {
        if (gamePhase !== GamePhase.Playing) return;

        const isP1Turn = currentPlayer === 'player1';
        const targetGrid = isP1Turn ? player2Grid : player1Grid;
        const targetShips = isP1Turn ? player2Ships : player1Ships;
        const setTargetGrid = isP1Turn ? setPlayer2Grid : setPlayer1Grid;
        const setTargetShips = isP1Turn ? setPlayer2Ships : setPlayer1Ships;

        if (targetGrid[row][col] === CellState.Hit || targetGrid[row][col] === CellState.Miss) {
            setStatusMessage("You've already fired there! Try another cell.");
            return;
        }

        const newGrid = targetGrid.map(r => [...r]);
        const isHit = targetGrid[row][col] === CellState.Ship;

        if (isHit) {
            newGrid[row][col] = CellState.Hit;
            setStatusMessage(`A direct hit! ${isP1Turn ? "Player 1" : "Player 2"} fires again.`);

            const updatedShips = targetShips.map(ship => {
                const hitPos = ship.positions.find(p => p.row === row && p.col === col);
                if (hitPos) {
                    const allHit = ship.positions.every(p => newGrid[p.row][p.col] === CellState.Hit);
                    if (allHit) {
                        setStatusMessage(`You sunk their ${ship.name}!`);
                        ship.positions.forEach(p => newGrid[p.row][p.col] = CellState.Sunk);
                        return { ...ship, sunk: true };
                    }
                }
                return ship;
            });
            setTargetShips(updatedShips);

            if (updatedShips.every(s => s.sunk)) {
                setWinner(currentPlayer);
                setGamePhase(GamePhase.GameOver);
                setStatusMessage(`${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'} wins!`);
                return;
            }
        } else {
            newGrid[row][col] = CellState.Miss;
            setStatusMessage("It's a miss.");
            setCurrentPlayer(isP1Turn ? 'player2' : 'player1');
        }

        setTargetGrid(newGrid);
    };

    useEffect(() => {
        if (gamePhase === GamePhase.Playing && currentPlayer === 'player2' && gameMode === GameMode.PvAI && !winner) {
            const aiTurn = async () => {
                setAiIsThinking(true);
                setStatusMessage("AI is calculating its next move...");
                
                const shotGrid = player1Grid.map(row => row.map(cell => {
                    if (cell === CellState.Hit || cell === CellState.Sunk) return 'H';
                    if (cell === CellState.Miss) return 'M';
                    return '.';
                }));

                // Add a delay to simulate thinking
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const { row, col } = await getAIMove(shotGrid);
                
                setAiIsThinking(false);
                handleFire(row, col);
            };
            aiTurn();
        } else if (gamePhase === GamePhase.Playing && !winner) {
            setStatusMessage(`It's ${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn.`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPlayer, gamePhase, gameMode, winner]);
    
    const renderSetup = () => {
        const currentPlacingPlayerName = (gameMode === 'pvai' || setupPlayer === 'player1') ? "Player 1" : "Player 2";
        
        return (
            <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex flex-col items-center gap-4">
                     <h2 className="text-2xl font-bold text-center">{currentPlacingPlayerName}, place your ships</h2>
                     <p className="text-slate-400 text-center">{statusMessage}</p>
                     <GameGrid
                        grid={setupPlayer === 'player1' ? player1Grid : player2Grid}
                        onCellClick={handleGridClickSetup}
                        onCellHover={handleGridHover}
                        isPlayerGrid={true}
                        placementPreview={placementPreview}
                    />
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 w-full max-w-xs">
                    <h3 className="text-xl font-semibold">Your Fleet</h3>
                    {shipsToPlace.map(ship => (
                        <button
                            key={ship.name}
                            onClick={() => setSelectedShip(ship)}
                            className={`w-full p-2 rounded text-left transition-all ${ship.color} ${selectedShip?.name === ship.name ? 'ring-2 ring-yellow-400 scale-105' : 'opacity-70 hover:opacity-100'}`}
                        >
                            {ship.name} ({ship.size})
                        </button>
                    ))}
                    <div className="flex items-center gap-4 mt-4">
                        <button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-transform transform hover:rotate-90">
                            <RotateIcon className="w-6 h-6"/>
                        </button>
                        <span className="text-slate-300 capitalize">{orientation}</span>
                    </div>

                    {shipsToPlace.length === 0 && (
                        <button onClick={handleReady} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                           {gameMode === GameMode.PvP && setupPlayer === 'player1' ? 'Player 2 Ready' : 'Start Battle'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGame = () => {
        const isP1Turn = currentPlayer === 'player1';
        return (
            <div className="flex flex-col items-center gap-6">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold">{statusMessage}</h2>
                    {aiIsThinking && <p className="text-yellow-400 animate-pulse">AI is thinking...</p>}
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-xl font-semibold">Your Fleet</h3>
                        <GameGrid grid={player1Grid} onCellClick={() => {}} isPlayerGrid={true} disabled={true}/>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-xl font-semibold">Enemy Waters</h3>
                        <GameGrid grid={player2Grid} onCellClick={handleFire} isPlayerGrid={false} disabled={!isP1Turn || aiIsThinking || winner !== null}/>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderModeSelection = () => (
         <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">AI Battleship Arena</h1>
            <p className="text-slate-300 mb-12 max-w-2xl mx-auto">{statusMessage}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button onClick={() => handleModeSelect(GameMode.PvAI)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105">
                    Player vs AI
                </button>
                <button onClick={() => handleModeSelect(GameMode.PvP)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105">
                    Player vs Player
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
             <GameOverModal winner={winner === 'player1' ? 'Player 1' : winner === 'player2' && gameMode === GameMode.PvP ? 'Player 2' : winner ? 'The AI' : null} onPlayAgain={resetGame} />
            
             {gameMode === GameMode.None && renderModeSelection()}
             {gameMode !== GameMode.None && gamePhase === GamePhase.Setup && renderSetup()}
             {gameMode !== GameMode.None && gamePhase === GamePhase.Playing && renderGame()}

        </div>
    );
};

// Redefine GameGrid with the onCellHover prop
const OriginalGameGrid = GameGrid;
const PatchedGameGrid = (props: React.ComponentProps<typeof OriginalGameGrid> & { onCellHover?: (row: number, col: number) => void }) => {
    const { onCellHover, ...rest } = props;
    const handleMouseOver = (row: number, col: number) => {
        if(onCellHover) onCellHover(row, col);
    };

    return (
        <div onMouseLeave={() => handleMouseOver(-1,-1)}>
            {/* The actual grid rendering logic doesn't easily support per-cell mouseover from here without modification.
                This is a structural limitation of the current GameGrid. For simplicity, the hover logic in App will drive the preview.
                The onMouseLeave on the wrapper is a key part of this.
            */}
             <div className="bg-slate-800/50 p-2 rounded-lg shadow-lg">
                <div className="grid grid-cols-10 gap-1">
                    {props.grid.map((row, rowIndex) =>
                        row.map((cellState, colIndex) => {
                            const isPreview = props.placementPreview?.positions.some(p => p.row === rowIndex && p.col === colIndex) ?? false;
                             const baseStyle = "w-8 h-8 md:w-10 md:h-10 border border-slate-700 flex items-center justify-center transition-colors duration-200";
                            let style = "";
                            let content: React.ReactNode = null;
                            
                             if (isPreview) {
                                style = props.placementPreview?.isValid ? 'bg-green-500/50' : 'bg-red-500/50';
                            } else {
                                switch (cellState) {
                                    case CellState.Ship: style = props.isPlayerGrid ? 'bg-slate-500' : 'bg-slate-800'; break;
                                    case CellState.Hit: style = 'bg-red-700'; content = <div className="w-3 h-3 rounded-full bg-yellow-300 animate-pulse"></div>; break;
                                    case CellState.Miss: style = 'bg-blue-900/70'; content = <div className="w-2 h-2 rounded-full bg-slate-400"></div>; break;
                                    case CellState.Sunk: style = 'bg-slate-950'; content = <div className="text-red-500 font-bold text-xl">X</div>; break;
                                    default: style = 'bg-slate-800';
                                }
                            }
                            if(!props.disabled && !isPreview) style += ' hover:bg-slate-700';

                            return <div key={`${rowIndex}-${colIndex}`} className={`${baseStyle} ${style}`} 
                                onClick={() => !props.disabled && props.onCellClick(rowIndex, colIndex)}
                                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}>
                                    {content}
                                </div>
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
// Use a local variable to prevent re-declaration issues with the original GameGrid
const GameGridWithHover = PatchedGameGrid;
// The app will now use the patched version which accepts onCellHover
App.prototype.renderSetup = function() {
    const originalRenderSetup = this.renderSetup;
    // ... custom render logic here if needed, or just replace the component used
    const currentPlacingPlayerName = (this.state.gameMode === 'pvai' || this.state.setupPlayer === 'player1') ? "Player 1" : "Player 2";
    
    return (
        <div className="flex flex-col lg:flex-row gap-8 items-center animate-fade-in">
            <div className="flex flex-col items-center gap-4">
                 <h2 className="text-2xl font-bold text-center">{currentPlacingPlayerName}, place your ships</h2>
                 <p className="text-slate-400 text-center">{this.state.statusMessage}</p>
                 <GameGrid
                    grid={this.state.setupPlayer === 'player1' ? this.state.player1Grid : this.state.player2Grid}
                    onCellClick={this.handleGridClickSetup}
                    isPlayerGrid={true}
                    placementPreview={this.state.placementPreview}
                    onCellHover={this.handleGridHover}
                />
            </div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 w-full max-w-xs">
                <h3 className="text-xl font-semibold">Your Fleet</h3>
                {this.state.shipsToPlace.map((ship: Ship) => (
                    <button
                        key={ship.name}
                        onClick={() => this.setState({selectedShip: ship})}
                        className={`w-full p-2 rounded text-left transition-all ${ship.color} ${this.state.selectedShip?.name === ship.name ? 'ring-2 ring-yellow-400 scale-105 shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                    >
                        {ship.name} ({ship.size})
                    </button>
                ))}
                <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => this.setState({orientation: this.state.orientation === 'horizontal' ? 'vertical' : 'horizontal'})} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-transform transform hover:rotate-90">
                        <RotateIcon className="w-6 h-6"/>
                    </button>
                    <span className="text-slate-300 capitalize">{this.state.orientation}</span>
                </div>

                {this.state.shipsToPlace.length === 0 && (
                    <button onClick={this.handleReady} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 animate-pulse">
                       {this.state.gameMode === GameMode.PvP && this.state.setupPlayer === 'player1' ? 'Player 2 Ready' : 'Start Battle'}
                    </button>
                )}
            </div>
        </div>
    );
};


export default App;
