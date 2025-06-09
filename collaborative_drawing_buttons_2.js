let brushImages = [];
let brushThumbs = [];
let currentBrush = 0;
const totalBrushes = 30;
let db;

function preload() {
  for (let i = 0; i < totalBrushes; i++) {
    brushImages[i] = loadImage(`brush${i + 1}.jpg`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  imageMode(CENTER);
  textFont('Arial');
  textSize(16);
  fill(0);
  noStroke();

  setupFirebase();
  createBrushButtons();
  setupClearButton();
  setupSaveButton();
}

function setupFirebase() {
  const firebaseConfig = {
  apiKey: "AIzaSyDpF9o590GcpkogURGXm623c3XyyDWLhk8",
  authDomain: "collaborative-drawing-7a87f.firebaseapp.com",
  projectId: "collaborative-drawing-7a87f",
  storageBucket: "collaborative-drawing-7a87f.firebasestorage.app",
  messagingSenderId: "56438623336",
  appId: "1:56438623336:web:c506509f1b442043377fdd",
  measurementId: "G-S0VWNP664F"
};

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();

  // Draw incoming strokes
  db.ref("strokes").on("child_added", (data) => {
    const s = data.val();
    drawFromData(s);
  });

  // Clear when database is cleared
  db.ref("strokes").on("value", (snapshot) => {
    if (!snapshot.exists()) {
      clearCanvas();
    }
  });
}

function draw() {
  if (mouseIsPressed) {
    let img = brushImages[currentBrush];
    let size = random(20, 60);
    image(img, mouseX, mouseY, size, size);

    const stroke = {
      x: mouseX,
      y: mouseY,
      brush: currentBrush,
      size: size,
      timestamp: Date.now()
    };
    db.ref("strokes").push(stroke);
  }

  drawInstructions();
}

function drawInstructions() {
  fill(255, 255, 255, 200);
  rect(10, height - 40, 300, 30);
  fill(0);
  text(`Current Brush: ${currentBrush + 1}`, 20, height - 20);
}

function drawFromData(s) {
  let img = brushImages[s.brush];
  image(img, s.x, s.y, s.size, s.size);
}

function createBrushButtons() {
  const panel = document.getElementById("brush-panel");

  for (let i = 0; i < totalBrushes; i++) {
    let imgEl = document.createElement("img");
    imgEl.src = `brush${i + 1}.jpg`;
    imgEl.className = "brush-thumb";
    if (i === currentBrush) imgEl.classList.add("active");

    imgEl.onclick = () => {
      currentBrush = i;
      updateActiveButton();
    };

    brushThumbs.push(imgEl);
    panel.appendChild(imgEl);
  }
}

function updateActiveButton() {
  brushThumbs.forEach((el, index) => {
    if (index === currentBrush) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

function setupClearButton() {
  const clearBtn = document.getElementById("clearBtn");
  clearBtn.onclick = () => {
    const confirmClear = confirm("Are you sure you want to clear the entire drawing?");
    if (confirmClear) {
      db.ref("strokes").remove();
    }
  };
}

function clearCanvas() {
  clear();
  background(255);
}

function setupSaveButton() {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.onclick = () => {
    saveCanvas("collaborative_drawing", "png");
  };
}
