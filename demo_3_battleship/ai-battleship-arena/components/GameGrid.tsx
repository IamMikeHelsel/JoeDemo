
import React from 'react';
import { Grid, CellState, Orientation, Ship } from '../types';
import { GRID_SIZE } from '../constants';
import { FireIcon, WaterIcon, SkullIcon } from './Icons';

interface GameGridProps {
  grid: Grid;
  onCellClick: (row: number, col: number) => void;
  isPlayerGrid: boolean;
  disabled?: boolean;
  placementPreview?: {
    positions: { row: number; col: number }[];
    isValid: boolean;
  } | null;
}

const Cell = React.memo(({ state, isPlayerGrid, isPreview, isPreviewValid, onClick }: {
    state: CellState;
    isPlayerGrid: boolean;
    isPreview: boolean;
    isPreviewValid: boolean;
    onClick: () => void;
}) => {
    const baseStyle = "w-8 h-8 md:w-10 md:h-10 border border-slate-700 flex items-center justify-center transition-colors duration-200";
    let style = "";
    let content: React.ReactNode = null;

    if (isPreview) {
        style = isPreviewValid ? 'bg-green-500/50' : 'bg-red-500/50';
    } else {
        switch (state) {
            case CellState.Ship:
                style = isPlayerGrid ? 'bg-slate-500' : 'bg-slate-800';
                break;
            case CellState.Hit:
                style = 'bg-red-700 animate-pulse';
                content = <FireIcon className="w-6 h-6 text-yellow-300" />;
                break;
            case CellState.Miss:
                style = 'bg-blue-900/70';
                content = <WaterIcon className="w-5 h-5 text-slate-400" />;
                break;
            case CellState.Sunk:
                style = 'bg-slate-950';
                content = <SkullIcon className="w-6 h-6 text-red-500" />;
                break;
            case CellState.Empty:
            default:
                style = 'bg-slate-800 hover:bg-slate-700';
                break;
        }
    }
    
    return <div className={`${baseStyle} ${style}`} onClick={onClick}>{content}</div>;
});

export const GameGrid: React.FC<GameGridProps> = ({ grid, onCellClick, isPlayerGrid, disabled = false, placementPreview }) => {
    return (
        <div className="bg-slate-800/50 p-2 rounded-lg shadow-lg" onMouseLeave={() => placementPreview && onCellClick(-1, -1)}>
            <div className="grid grid-cols-10 gap-1">
                {grid.map((row, rowIndex) =>
                    row.map((cellState, colIndex) => {
                        const isPreview = placementPreview?.positions.some(p => p.row === rowIndex && p.col === colIndex) ?? false;
                        return (
                          <Cell
                            key={`${rowIndex}-${colIndex}`}
                            state={cellState}
                            isPlayerGrid={isPlayerGrid}
                            isPreview={isPreview}
                            isPreviewValid={placementPreview?.isValid ?? false}
                            onClick={() => !disabled && onCellClick(rowIndex, colIndex)}
                          />
                        );
                    })
                )}
            </div>
        </div>
    );
};
