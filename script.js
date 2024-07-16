// Element references
const grid = document.getElementById('grid');
const pieces = document.getElementById('pieces');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

let timer;
let time = 0;
let score = 0;
let piecesPlaced = 0;

const totalPieces = 12;
const rows = 3;
const cols = 4;

// Initialize the game
function init() {
  createGrid();
  createPieces('assets/samsung.jpg');
  startTimer();
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
    grid.appendChild(cell);
  }
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
      piece.dataset.index = index;

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');

      const col = index % cols;
      const row = Math.floor(index / cols);
      ctx.drawImage(img, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);

      piece.appendChild(canvas);

      piece.style.position = 'absolute';
      piece.style.left = `${Math.random() * (pieces.clientWidth - 100)}px`;
      piece.style.top = `${Math.random() * (pieces.clientHeight - 100)}px`;

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

function showModal() {
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementsByClassName('close')[0];
  const modalButton = document.getElementById('modal-button');

  modal.style.display = 'block';

  closeBtn.onclick = function() {
    modal.style.display = 'none';
    displayCompletedImage();
  };

  modalButton.onclick = function() {
    modal.style.display = 'none';
    displayCompletedImage();
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      displayCompletedImage();
    }
  };
}

// Drop function update
function handleDrop(event) {
  event.preventDefault();
  event.target.style.border = '1px solid gray';
  const pieceIndex = event.dataTransfer.getData('text/plain');
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
          showModal();
        }, 500);
      }
    } else {
      pieces.appendChild(piece);
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

// Start the timer
function startTimer() {
  timer = setInterval(() => {
    time++;
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    timerElement.textContent = `TIME: ${minutes}:${seconds}`;
  }, 1000);
}

init();
