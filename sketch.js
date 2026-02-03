
let imagens = [];
let imagemAtual;
let pecas = [];
let linhas = 4;
let colunas = 4;
let tamanhoPecaX, tamanhoPecaY;
let pecaArrastada = null;

let tempoTotal = 90;
let tempoInicio;
let tempoRestante;
let memoriasSalvas = 0;
let puzzleCompleto = false;

let tempoCritico = 10;
let botaoProximo;

function preload() {
    imagens.push(loadImage("data/img1.jpg"));
    imagens.push(loadImage("data/img2.jpg"));
    imagens.push(loadImage("data/img3.jpg"));
}

function setup() {
    imagemAtual = random(imagens);

    let maxLargura = windowWidth * 0.9;
    let maxAltura = windowHeight * 0.7;
    let escala = min(maxLargura / imagemAtual.width, maxAltura / imagemAtual.height, 1);
    let canvasLargura = imagemAtual.width * escala;
    let canvasAltura = imagemAtual.height * escala;

    let cnv = createCanvas(canvasLargura, canvasAltura);
    cnv.parent("gameContainer");

    // Redimensionar imagem para caber no canvas
    imagemAtual.resize(canvasLargura, canvasAltura);

    tamanhoPecaX = imagemAtual.width / colunas;
    tamanhoPecaY = imagemAtual.height / linhas;

    tempoInicio = millis();
    tempoRestante = tempoTotal;

    criarPecas();

    botaoProximo = select("#proximoPuzzle");
    botaoProximo.mousePressed(proximoPuzzle);
}

function draw() {
    background(20);

    if (!imagemAtual) return;

    let tempoDecorrido = (millis() - tempoInicio) / 1000;
    tempoRestante = max(0, tempoTotal - floor(tempoDecorrido));

    // Desenhar peças
    for (let p of pecas) {
        if (!p.placed) {
            // Últimos 10s: abanar + fade
            if (tempoRestante <= tempoCritico) {
                p.x += random(-1, 1);
                p.y += random(-1, 1);
                p.alpha = map(tempoRestante, 0, tempoCritico, 50, 255);
            } else {
                p.alpha = 255;
            }
        }

        push();
        tint(255, p.alpha);
        image(
            imagemAtual,
            p.x,
            p.y,
            tamanhoPecaX,
            tamanhoPecaY,
            p.imgX,
            p.imgY,
            tamanhoPecaX,
            tamanhoPecaY
        );
        pop();
    }

    // Atualizar tempo
    select("#cronometro").html(`Tempo: ${tempoRestante}s`);
    select("#memorias").html(`Memórias salvas: ${memoriasSalvas}`);


    verificarPuzzleCompleto();

    // Se o tempo acabou
    if (tempoRestante <= 0 && !puzzleCompleto) {
        puzzleCompleto = true;
        for (let p of pecas) {
            p.alpha = 50;
        }
    }
}

function criarPecas() {
    pecas = [];
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            pecas.push({
                x: random(width - tamanhoPecaX),
                y: random(height - tamanhoPecaY),
                correctX: x * tamanhoPecaX,
                correctY: y * tamanhoPecaY,
                imgX: x * tamanhoPecaX,
                imgY: y * tamanhoPecaY,
                placed: false,
                alpha: 255
            });
        }
    }
}

function mousePressed() {
    for (let i = pecas.length - 1; i >= 0; i--) {
        let p = pecas[i];
        if (
            mouseX > p.x &&
            mouseX < p.x + tamanhoPecaX &&
            mouseY > p.y &&
            mouseY < p.y + tamanhoPecaY
        ) {
            pecaArrastada = p;
            break;
        }
    }
}

function mouseDragged() {
    if (pecaArrastada && !pecaArrastada.placed) {
        pecaArrastada.x = mouseX - tamanhoPecaX / 2;
        pecaArrastada.y = mouseY - tamanhoPecaY / 2;
    }
}

function mouseReleased() {
    if (pecaArrastada) {
        let d = dist(
            pecaArrastada.x,
            pecaArrastada.y,
            pecaArrastada.correctX,
            pecaArrastada.correctY
        );

        if (d < 20) {
            pecaArrastada.x = pecaArrastada.correctX;
            pecaArrastada.y = pecaArrastada.correctY;
            pecaArrastada.placed = true;
        }

        pecaArrastada = null;
    }
}

function verificarPuzzleCompleto() {
    if (!puzzleCompleto && pecas.every(p => p.placed)) {
        puzzleCompleto = true;
        memoriasSalvas++;

        push();
        fill(0, 180);
        rect(0, 0, width, height);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(32);
        text("Memória salva!", width / 2, height / 2);
        pop();

        // Avançar automaticamente
        setTimeout(proximoPuzzle, 1500);
    }
}

function proximoPuzzle() {
    imagemAtual = random(imagens);
    // Redimensionar para o canvas existente
    imagemAtual.resize(width, height);

    tamanhoPecaX = imagemAtual.width / colunas;
    tamanhoPecaY = imagemAtual.height / linhas;

    criarPecas();

    tempoInicio = millis();
    tempoRestante = tempoTotal;
    puzzleCompleto = false;
}
