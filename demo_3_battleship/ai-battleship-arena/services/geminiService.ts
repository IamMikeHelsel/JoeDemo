
import { GoogleGenAI, Type } from "@google/genai";
import { GRID_SIZE } from "../constants";

const generatePrompt = (shotGrid: string[][]): string => {
  const gridString = shotGrid.map(row => row.join(' ')).join('\n');
  return `
You are a strategic AI playing a game of Battleship. Your goal is to sink all the opponent's ships by choosing the best cell to fire at. The grid is ${GRID_SIZE}x${GRID_SIZE}. Your previous shots are represented on this grid:
- '.' means you haven't shot there yet.
- 'M' means you shot and missed.
- 'H' means you shot and hit a ship.

Current Grid State:
${gridString}

Based on this grid, determine the most logical next coordinate to fire at. If you have a hit ('H') that is not part of a fully sunk ship, you should prioritize firing at adjacent cells (up, down, left, right). If there are no active hits, choose a strategic location to search for new ships. Avoid cells you have already fired at ('H' or 'M').

Provide your answer as a JSON object with 'row' and 'col' keys, representing the 0-indexed coordinates of your next shot. Example: {"row": 3, "col": 4}
  `;
};

const getRandomValidMove = (shotGrid: string[][]): { row: number; col: number } => {
  const validMoves: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (shotGrid[r][c] === '.') {
        validMoves.push({ row: r, col: c });
      }
    }
  }
  if (validMoves.length === 0) return { row: 0, col: 0 }; // Should not happen in a normal game
  return validMoves[Math.floor(Math.random() * validMoves.length)];
};

export const getAIMove = async (shotGrid: string[][]): Promise<{ row: number; col: number }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = generatePrompt(shotGrid);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER },
            col: { type: Type.INTEGER },
          },
          required: ["row", "col"],
        },
        temperature: 0.5,
      }
    });

    const move = JSON.parse(response.text);

    if (typeof move.row === 'number' && typeof move.col === 'number' && shotGrid[move.row]?.[move.col] === '.') {
        return move;
    }
    // Fallback if AI returns an invalid or already-shot coordinate
    return getRandomValidMove(shotGrid);

  } catch (error) {
    console.error("Gemini API call failed, falling back to random move.", error);
    return getRandomValidMove(shotGrid);
  }
};
