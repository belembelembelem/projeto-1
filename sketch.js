let img;
let pieces = [];
let rows = 4;
let cols = 4;
let pieceSize;
let draggingPiece = null;
let startTime;

function preload() {
    img = loadImage("imagem.jpg");
}

function setup() {
    createCanvas(400, 400);
    pieceSize = width / cols;
    startTime = millis();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let px = x * pieceSize;
            let py = y * pieceSize;

            pieces.push({
                x: random(width - pieceSize),
                y: random(height - pieceSize),
                correctX: px,
                correctY: py,
                imgX: px,
                imgY: py,
                placed: false,
                alpha: 255
            });
        }
    }
}

function draw() {
    background(20);

    let elapsed = millis() - startTime;


    for (let p of pieces) {
        if (!p.placed) {
            p.alpha = map(elapsed, 0, 30000, 255, 50);
        }

        push();
        tint(255, p.alpha);
        image(
            img,
            p.x,
            p.y,
            pieceSize,
            pieceSize,
            p.imgX,
            p.imgY,
            pieceSize,
            pieceSize
        );
        pop();

        if (elapsed > 15000 && !p.placed) {
            p.x += random(-0.3, 0.3);
            p.y += random(-0.3, 0.3);
        }
    }

    if (elapsed > 20000) {
        fill(0, 100);
        rect(0, 0, width, height);
    }
}

function mousePressed() {
    for (let p of pieces) {
        if (
            mouseX > p.x &&
            mouseX < p.x + pieceSize &&
            mouseY > p.y &&
            mouseY < p.y + pieceSize
        ) {
            draggingPiece = p;
            break;
        }
    }
}

function mouseDragged() {
    if (draggingPiece && !draggingPiece.placed) {
        draggingPiece.x = mouseX - pieceSize / 2;
        draggingPiece.y = mouseY - pieceSize / 2;
    }
}

function mouseReleased() {
    if (draggingPiece) {
        let d = dist(
            draggingPiece.x,
            draggingPiece.y,
            draggingPiece.correctX,
            draggingPiece.correctY
        );

        if (d < 20) {
            draggingPiece.x = draggingPiece.correctX;
            draggingPiece.y = draggingPiece.correctY;
            draggingPiece.placed = true;
        }

        draggingPiece = null;
    }
}

