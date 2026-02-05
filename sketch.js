
let imagens = []
let imagemAtual
let pecas = []
let linhas = 4
let colunas = 4
let tamanhoPecaX, tamanhoPecaY
let pecaArrastada = null

let tempoTotal = 120
let tempoInicio
let tempoRestante
let memoriasSalvas = 0
let puzzleCompleto = false

let puzzleFalhado = false

let puzzlesDisponiveis = []

let tempoCritico = 10
let botaoProximo

let maxLargura, maxAltura, escala, canvasAltura, canvasLargura, cnv

function preload() {
    imagens.push(loadImage("data/img1.jpg"))
    imagens.push(loadImage("data/img2.jpg"))
    imagens.push(loadImage("data/img3.jpg"))
    imagens.push(loadImage("data/img4.jpg"))
    imagens.push(loadImage("data/img5.jpg"))
    imagens.push(loadImage("data/img6.jpg"))



}

function setup() {

    puzzlesDisponiveis = [...imagens]

    criarPuzzle()
    criarPecas()

    tempoInicio = millis()
    tempoRestante = tempoTotal

    botaoProximo = select("#proximoPuzzle")
    botaoProximo.mousePressed(proximoPuzzle)
}

function draw() {
    background(20)

    if (!imagemAtual) return

    let tempoDecorrido = (millis() - tempoInicio) / 1000;
    tempoRestante = max(0, tempoTotal - floor(tempoDecorrido))

    // Desenhar peças
    for (let p of pecas) {
        if (!p.placed) {
            // Últimos 10s: abanar + fade
            if (tempoRestante <= tempoCritico) {
                p.x += random(-1, 1)
                p.y += random(-1, 1)
                p.alpha = map(tempoRestante, 0, tempoCritico, 50, 255)
            } else {
                p.alpha = 255
            }
        }

        push()
        tint(255, p.alpha)
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
        pop()
    }

    // Atualizar tempo
    select("#cronometro").html(`Tempo: ${tempoRestante}s`)
    select("#memorias").html(`Memórias salvas: ${memoriasSalvas}`)


    if (puzzleFalhado) {
        background(0, 200)

        fill(255)
        textAlign(CENTER, CENTER)
        textSize(28)
        text("Falhaste este puzzle.\nClica para tentar o próximo.", width / 2, height / 2)

        return
    }

    verificarPuzzleCompleto()

    // Se o tempo acabou
    if (tempoRestante <= 0 && !puzzleCompleto && !puzzleFalhado) {
        puzzleFalhado = true
    }

}



function criarPuzzle() {
    if (puzzlesDisponiveis.length === 0) {
        return
    }
    // o splice é para remover da lista imagem ja passada 
    let index = floor(random(puzzlesDisponiveis.length))
    imagemAtual = puzzlesDisponiveis.splice(index, 1)[0]

    // área fixa para todos os puzzles
    canvasLargura = windowWidth * 0.6
    canvasAltura = windowHeight * 0.6

    escala = min(
        canvasLargura / imagemAtual.width,
        canvasAltura / imagemAtual.height
    )

    let novaLargura = imagemAtual.width * escala
    let novaAltura = imagemAtual.height * escala

    cnv = createCanvas(novaLargura, novaAltura)
    cnv.parent("gameContainer")

    imagemAtual.resize(novaLargura, novaAltura)

    tamanhoPecaX = imagemAtual.width / colunas
    tamanhoPecaY = imagemAtual.height / linhas

    let imgRef = select("#imagemReferencia")
    imgRef.attribute("src", imagemAtual.canvas.toDataURL())

}


function criarPecas() {
    pecas = [];

    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {

            let px, py;

            // garantir que a peça não nasce já no sítio correto
            do {
                px = random(0, width - tamanhoPecaX);
                py = random(0, height - tamanhoPecaY);
            } while (
                dist(px, py, x * tamanhoPecaX, y * tamanhoPecaY) < 50
            );

            pecas.push({
                x: px,
                y: py,
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

    if (puzzleFalhado) {
        proximoPuzzle()
        return
    }

    for (let i = pecas.length - 1; i >= 0; i--) {
        let p = pecas[i]
        if (
            mouseX > p.x &&
            mouseX < p.x + tamanhoPecaX &&
            mouseY > p.y &&
            mouseY < p.y + tamanhoPecaY
        ) {
            pecaArrastada = p
            break;
        }
    }
}

function mouseDragged() {
    if (pecaArrastada && !pecaArrastada.placed) {
        pecaArrastada.x = mouseX - tamanhoPecaX / 2
        pecaArrastada.y = mouseY - tamanhoPecaY / 2
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
            pecaArrastada.x = pecaArrastada.correctX
            pecaArrastada.y = pecaArrastada.correctY
            pecaArrastada.placed = true
        }

        pecaArrastada = null
    }
}

function verificarPuzzleCompleto() {
    if (!puzzleCompleto && pecas.every(p => p.placed)) {
        puzzleCompleto = true
        memoriasSalvas++

        push()
        fill(0, 180)
        rect(0, 0, width, height)
        fill(255)
        textAlign(CENTER, CENTER)
        textSize(32)
        text("Memória salva!", width / 2, height / 2)
        pop()

        // Avançar automaticamente
        setTimeout(proximoPuzzle, 1500)
    }
}

function proximoPuzzle() {
    if (puzzlesDisponiveis.length === 0) {
        background(0)
        fill(255)
        textAlign(CENTER, CENTER)
        textSize(28)
        text("Terminaste o jogo, vamos ver quantas memorias salvaste!", width / 2, height / 2)
        noLoop()
        return
    }

    criarPuzzle()
    criarPecas();

    tempoInicio = millis()
    tempoRestante = tempoTotal
    puzzleCompleto = false
    puzzleFalhado = false

}
