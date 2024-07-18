// Element references
const grid = document.getElementById('grid');
const pieces = document.getElementById('pieces');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const countdownElement = document.getElementById('countdown');

let timer;
let time = 120; // 2 minutes in seconds
let score = 0;
let piecesPlaced = 0;
let touchPiece = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let initialTouchPosition = { left: 0, top: 0 };

const totalPieces = 12;
const rows = 3;
const cols = 4;

// Initialize the game
function init() {
  createGrid();
  loadRandomImage();
}

// Create grid cells
function createGrid() {
  for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    cell.dataset.index = i;
    cell.ondrop = handleDrop;
    cell.ondragover = allowDrop;
    cell.ondragenter = handleDragEnter;
    cell.ondragleave = handleDragLeave;
    cell.ontouchend = handleDrop;
    grid.appendChild(cell);
  }
}

// Load a random local image and start pre-game countdown
function loadRandomImage() {
  const images = ['assets/citizen_watch.jpg', 'assets/images.jpeg', 'assets/samsung.jpg'];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  showImageBeforeSplit(randomImage);
}

// Show image before splitting it into pieces
function showImageBeforeSplit(imageSrc) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    const imgDiv = document.createElement('div');
    imgDiv.id = 'preview-image';
    imgDiv.style.backgroundImage = `url(${imageSrc})`;

    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();
    imgDiv.style.width = `${gridRect.width}px`;
    imgDiv.style.height = `${gridRect.height}px`;
    imgDiv.style.top = `${gridRect.top}px`;
    imgDiv.style.left = `${gridRect.left}px`;
    imgDiv.style.position = 'absolute';

    document.body.appendChild(imgDiv);

    let countdown = 3;
    countdownElement.textContent = countdown;
    countdownElement.style.display = 'block';
    const countdownInterval = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;
      if (countdown === 0) {
        clearInterval(countdownInterval);
        countdownElement.style.display = 'none';
        imgDiv.remove();
        createPieces(imageSrc);
        startGame();
      }
    }, 1000);
  };
}

// Create puzzle pieces from the image
function createPieces(imageSrc) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;

    const indices = [...Array(totalPieces).keys()];
    shuffle(indices);

    indices.forEach(index => {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.draggable = true;
      piece.ondragstart = handleDragStart;
      piece.ondragend = handleDragEnd;
      piece.ontouchstart = handleTouchStart;
      piece.ontouchmove = handleTouchMove;
      piece.ontouchend = handleTouchEnd;
      piece.dataset.index = index;

      const canvas = document.createElement('canvas');
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;
      const ctx = canvas.getContext('2d');

      const col = index % cols;
      const row = Math.floor(index / cols);
      ctx.drawImage(img, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);

      piece.appendChild(canvas);

      piece.style.position = 'absolute';
      piece.style.left = `${Math.random() * (pieces.clientWidth - pieceWidth)}px`;
      piece.style.top = `${Math.random() * (pieces.clientHeight - pieceHeight)}px`;

      pieces.appendChild(piece);
    });
  };
}

// Shuffle the array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Drag and Drop functions
function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.index);
  event.target.classList.add('dragging');
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');
}

function allowDrop(event) {
  event.preventDefault();
}

function handleDragEnter(event) {
  event.preventDefault();
  event.target.style.border = '2px dashed #000';
}

function handleDragLeave(event) {
  event.target.style.border = '1px solid gray';
}

// Show modal and reset game after closing
function showModal(message) {
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementsByClassName('close')[0];
  const modalButton = document.getElementById('modal-button');
  modal.querySelector('h2').textContent = message;

  modal.style.display = 'block';

  closeBtn.onclick = function() {
    modal.style.display = 'none';
    resetGame();
  };

  modalButton.onclick = function() {
    modal.style.display = 'none';
    resetGame();
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      resetGame();
    }
  };
}

// Drop function update
function handleDrop(event) {
  event.preventDefault();
  event.target.style.border = '1px solid gray';
  const pieceIndex = event.dataTransfer ? event.dataTransfer.getData('text/plain') : touchPiece.dataset.index;
  const targetIndex = event.target.dataset.index;

  if (event.target.classList.contains('grid-cell') && !event.target.hasChildNodes()) {
    const piece = document.querySelector(`.piece[data-index="${pieceIndex}"]`);
    if (parseInt(pieceIndex) === parseInt(targetIndex)) {
      piece.style.position = 'static';
      event.target.appendChild(piece);
      piecesPlaced++;
      score += 10;
      scoreElement.textContent = `SCORE: ${score}`;
      if (piecesPlaced === totalPieces) {
        clearInterval(timer);
        setTimeout(() => {
          showModal('Congratulations! You completed the puzzle.');
        }, 500);
      }
    } else {
      piece.style.left = `${initialTouchPosition.left}px`;
      piece.style.top = `${initialTouchPosition.top}px`;
    }
  }
}

// Display the completed image
function displayCompletedImage() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    cell.style.border = 'none';
  });

  setTimeout(() => {
    grid.style.border = 'none';
  }, 500);
}

// Start the game timer and handle game over
function startGame() {
  startTimer();
}

function startTimer() {
  timerElement.textContent = `TIME: 02:00`;
  timer = setInterval(() => {
    time--;
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    timerElement.textContent = `TIME: ${minutes}:${seconds}`;

    if (time <= 0) {
      clearInterval(timer);
      showModal('Game Over! Try again.');
    }
  }, 1000);
}

// Reset the game
function resetGame() {
  // Clear the grid and pieces
  grid.innerHTML = '';
  pieces.innerHTML = '';

  // Reset variables
  time = 120; // 2 minutes in seconds
  score = 0;
  piecesPlaced = 0;

  // Update score and timer elements
  scoreElement.textContent = `SCORE: ${score}`;
  timerElement.textContent = `TIME: 02:00`;

  // Reinitialize the game
  init();
}

// Touch event handlers
function handleTouchStart(event) {
  touchPiece = event.target;
  const touch = event.touches[0];
  touchOffsetX = touch.clientX - touchPiece.getBoundingClientRect().left;
  touchOffsetY = touch.clientY - touchPiece.getBoundingClientRect().top;
  initialTouchPosition = {
    left: parseFloat(touchPiece.style.left),
    top: parseFloat(touchPiece.style.top),
  };
  touchPiece.classList.add('dragging');
}

function handleTouchMove(event) {
  if (touchPiece) {
    const touch = event.touches[0];
    touchPiece.style.left = `${touch.clientX - touchOffsetX}px`;
    touchPiece.style.top = `${touch.clientY - touchOffsetY}px`;
    touchPiece.style.position = 'absolute'; // Ensure the piece follows the touch
  }
}

function handleTouchEnd(event) {
  if (touchPiece) {
    touchPiece.classList.remove('dragging');
    checkPiecePlacement(touchPiece);
    touchPiece = null;
  }
}

// Check if the piece is placed correctly
function checkPiecePlacement(piece) {
  const index = piece.dataset.index;
  const cells = document.querySelectorAll('.grid-cell');
  let placed = false;

  cells.forEach(cell => {
    const cellIndex = cell.dataset.index;
    const cellRect = cell.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();

    if (cellIndex === index &&
      pieceRect.left >= cellRect.left &&
      pieceRect.top >= cellRect.top &&
      pieceRect.right <= cellRect.right &&
      pieceRect.bottom <= cellRect.bottom) {

      piece.style.position = 'static';
      piece.style.transform = 'none';
      cell.appendChild(piece);
      piecesPlaced++;
      score += 10;
      scoreElement.textContent = `SCORE: ${score}`;
      placed = true;
      if (piecesPlaced === totalPieces) {
        clearInterval(timer);
        setTimeout(() => {
          showModal('Congratulations! You completed the puzzle.');
        }, 500);
      }
    }
  });

  if (!placed) {
    // Reset piece position if not correctly placed
    piece.style.left = `${initialTouchPosition.left}px`;
    piece.style.top = `${initialTouchPosition.top}px`;
  }
}

init();
