document.addEventListener('DOMContentLoaded', () => {
    const playerBoardEl = document.getElementById('player-board');
    const opponentBoardEl = document.getElementById('opponent-board');
    const opponentBoardContainer = document.getElementById('opponent-board-container');
    const gameStatusEl = document.getElementById('game-status');
    const turnInfoEl = document.getElementById('turn-info');
    const startGameBtn = document.getElementById('start-game');
    const shipPlacementContainer = document.getElementById('ship-placement');
    const shipItems = document.querySelectorAll('.ship-item');
    const rotateShipBtn = document.getElementById('rotate-ship');
    const resetPlacementBtn = document.getElementById('reset-placement');
    const invitationLinkContainer = document.getElementById('invitation-link');
    const gameLinkInput = document.getElementById('game-link');

    const gridSize = 10;
    let ws;
    let selectedShip = null;
    let shipOrientation = 'horizontal';
    let playerShips = [];

    function createGrid(boardElement) {
        boardElement.innerHTML = '';
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = i;
            boardElement.appendChild(cell);
        }
    }

    function init() {
        createGrid(playerBoardEl);
        createGrid(opponentBoardEl);
        setupShipPlacement();
    }

    function setupShipPlacement() {
        shipItems.forEach(ship => {
            ship.addEventListener('click', () => {
                if (ship.classList.contains('placed')) return;
                if (selectedShip) {
                    selectedShip.classList.remove('selected');
                }
                selectedShip = ship;
                selectedShip.classList.add('selected');
            });
        });

        rotateShipBtn.addEventListener('click', () => {
            shipOrientation = shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        });

        playerBoardEl.addEventListener('mouseover', (e) => {
            if (!selectedShip || !e.target.classList.contains('grid-cell')) return;
            const length = parseInt(selectedShip.dataset.length);
            const index = parseInt(e.target.dataset.index);
            highlightCells(index, length, shipOrientation);
        });

        playerBoardEl.addEventListener('mouseout', () => {
            clearHighlights();
        });

        playerBoardEl.addEventListener('click', (e) => {
            if (!selectedShip || !e.target.classList.contains('grid-cell')) return;
            const length = parseInt(selectedShip.dataset.length);
            const index = parseInt(e.target.dataset.index);
            placeShip(index, length, shipOrientation);
        });

        resetPlacementBtn.addEventListener('click', resetShipPlacement);

        startGameBtn.addEventListener('click', () => {
            shipPlacementContainer.style.display = 'none';
            opponentBoardContainer.style.display = 'block';
            invitationLinkContainer.style.display = 'block';
            gameStatusEl.textContent = 'Waiting for opponent...';
            // Generate and display invitation link
            const gameId = Math.random().toString(36).substring(2, 15);
            gameLinkInput.value = `${window.location.href}?game=${gameId}`;
            // Connect to WebSocket server
            // connectToServer(gameId);
        });
    }

    function highlightCells(start, length, orientation) {
        clearHighlights();
        const cells = getCells(start, length, orientation);
        if (cells) {
            cells.forEach(cell => cell.style.backgroundColor = 'var(--cell-hover-bg)');
        }
    }

    function clearHighlights() {
        const cells = playerBoardEl.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            if (!cell.classList.contains('ship')) {
                cell.style.backgroundColor = '';
            }
        });
    }

    function getCells(start, length, orientation) {
        const cells = [];
        const row = Math.floor(start / gridSize);
        const col = start % gridSize;

        for (let i = 0; i < length; i++) {
            let currentCell;
            if (orientation === 'horizontal') {
                if (col + i >= gridSize) return null; // Out of bounds
                currentCell = playerBoardEl.querySelector(`[data-index='${start + i}']`);
            } else { // vertical
                if (row + i >= gridSize) return null; // Out of bounds
                currentCell = playerBoardEl.querySelector(`[data-index='${start + i * gridSize}']`);
            }
            if (currentCell.classList.contains('ship')) return null; // Overlapping
            cells.push(currentCell);
        }
        return cells;
    }

    function placeShip(start, length, orientation) {
        const cells = getCells(start, length, orientation);
        if (cells) {
            cells.forEach(cell => cell.classList.add('ship'));
            playerShips.push({ start, length, orientation });
            selectedShip.classList.add('placed');
            selectedShip.classList.remove('selected');
            selectedShip = null;

            if (playerShips.length === shipItems.length) {
                startGameBtn.disabled = false;
                gameStatusEl.textContent = 'All ships placed. Ready to start!';
            }
        }
    }

    function resetShipPlacement() {
        playerShips = [];
        const cells = playerBoardEl.querySelectorAll('.grid-cell');
        cells.forEach(cell => cell.classList.remove('ship'));
        shipItems.forEach(ship => ship.classList.remove('placed', 'selected'));
        startGameBtn.disabled = true;
        gameStatusEl.textContent = 'Place your ships!';
    }

    init();
});