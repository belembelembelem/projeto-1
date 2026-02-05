let imagens = [];
let imagemAtual;
let pecas = [];
let linhas = 4;
let colunas = 4;
let tamanhoPecaX, tamanhoPecaY;
let pecaArrastada = null;

let tempoTotal = 120;
let tempoInicio;
let tempoRestante;
let memoriasSalvas = 0;
let puzzleCompleto = false;
let puzzleFalhado = false;
let puzzlesDisponiveis = [];

let tempoCritico = 10;
let botaoProximo;

let cnv;
let imagensFinal = []; // copia das imagens originais do jogador
let finalArte = false;
let finalIndex = 0;
let escolhaFinal = false;

function preload() {
    imagens.push(loadImage("data/img1.jpg"));
    imagens.push(loadImage("data/img2.jpg"));
    imagens.push(loadImage("data/img3.jpg"));
    imagens.push(loadImage("data/img4.jpg"));
    imagens.push(loadImage("data/img5.jpg"));
    imagens.push(loadImage("data/img6.jpg"));
}

function setup() {
    puzzlesDisponiveis = [...imagens];

    criarPuzzle();
    criarPecas();

    tempoInicio = millis();
    tempoRestante = tempoTotal;

    botaoProximo = select("#proximoPuzzle");
    botaoProximo.mousePressed(proximoPuzzle);
}

function draw() {
    background(20);

    if (finalArte) {
        return; // final será tratado em HTML
    }

    if (!imagemAtual) return;

    let tempoDecorrido = (millis() - tempoInicio) / 1000;
    tempoRestante = max(0, tempoTotal - floor(tempoDecorrido));

    // Desenhar peças
    for (let p of pecas) {
        if (!p.placed) {
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

    // Atualizar info
    select("#cronometro").html(`Tempo: ${tempoRestante}s`);
    select("#memorias").html(`Memórias salvas: ${memoriasSalvas}`);

    if (puzzleFalhado) {
        background(0, 200);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(28);
        text("Falhaste este puzzle.\nClica para tentar o próximo.", width / 2, height / 2);
        return;
    }

    verificarPuzzleCompleto();

    // Se tempo acabou
    if (tempoRestante <= 0 && !puzzleCompleto && !puzzleFalhado) {
        puzzleFalhado = true;
    }
}

function criarPuzzle() {
    if (puzzlesDisponiveis.length === 0) return;

    let index = floor(random(puzzlesDisponiveis.length));
    imagemAtual = puzzlesDisponiveis.splice(index, 1)[0];

    let canvasLargura = windowWidth * 0.6;
    let canvasAltura = windowHeight * 0.6;
    let escala = min(canvasLargura / imagemAtual.width, canvasAltura / imagemAtual.height);

    let novaLargura = imagemAtual.width * escala;
    let novaAltura = imagemAtual.height * escala;

    if (cnv) cnv.remove();
    cnv = createCanvas(novaLargura, novaAltura);
    cnv.parent("gameContainer");

    imagemAtual.resize(novaLargura, novaAltura);

    tamanhoPecaX = imagemAtual.width / colunas;
    tamanhoPecaY = imagemAtual.height / linhas;

    let imgRef = select("#imagemReferencia");
    imgRef.attribute("src", imagemAtual.canvas.toDataURL());
}

function criarPecas() {
    pecas = [];
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            let px, py;
            do {
                px = random(0, width - tamanhoPecaX);
                py = random(0, height - tamanhoPecaY);
            } while (dist(px, py, x * tamanhoPecaX, y * tamanhoPecaY) < 50);
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
    if (finalArte) return;

    if (puzzleFalhado) {
        proximoPuzzle();
        return;
    }

    for (let i = pecas.length - 1; i >= 0; i--) {
        let p = pecas[i];
        if (mouseX > p.x && mouseX < p.x + tamanhoPecaX && mouseY > p.y && mouseY < p.y + tamanhoPecaY) {
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
        let d = dist(pecaArrastada.x, pecaArrastada.y, pecaArrastada.correctX, pecaArrastada.correctY);
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

        // Guardar uma única vez a imagem completada
        if (!imagensFinal.includes(imagemAtual)) {
            imagensFinal.push(imagemAtual.get());
        }

        setTimeout(proximoPuzzle, 1500);
    }
}

function proximoPuzzle() {
    if (puzzlesDisponiveis.length === 0) {
        finalizarJogo();
        return;
    }
    criarPuzzle();
    criarPecas();
    tempoInicio = millis();
    tempoRestante = tempoTotal;
    puzzleCompleto = false;
    puzzleFalhado = false;
}


function finalizarJogo() {
    noLoop();

    if (cnv) cnv.hide();
    document.getElementById("imagemReferencia").style.display = "none";
    document.getElementById("cronometro").style.display = "none";
    document.getElementById("memorias").style.display = "none";
    document.getElementById("proximoPuzzle").style.display = "none";

    // Mostrar div do final
    document.getElementById("telaFinal").style.display = "block";

    // Adicionar listener para botão 
    document.getElementById("verMemorias").onclick = () => mostrarMemorias();
}

function mostrarMemorias() {
    const container = document.getElementById("conteudoMemorias");
    container.innerHTML = `<h2>Memórias salvas: ${memoriasSalvas} / ${imagensFinal.length}</h2>`;

    for (let i = 0; i < imagensFinal.length; i++) {
        let img = document.createElement("img");
        img.src = imagensFinal[i].canvas.toDataURL();
        img.style.maxWidth = "200px";
        img.style.margin = "10px";

        let p = document.createElement("p");
        p.textContent = i < memoriasSalvas ? "Completada" : "Falhada";
        p.style.opacity = "0.8";

        container.appendChild(img);
        container.appendChild(p);
    }

    // Adicionar escolha final
    let escolhaP = document.createElement("p");
    escolhaP.textContent = "O que queres fazer com estas memórias?";
    container.appendChild(escolhaP);

    const botoes = ["Rouba-las", "Doa-las", "Guardar"];
    botoes.forEach(op => {
        let btn = document.createElement("button");
        btn.textContent = op;
        btn.onclick = () => escolha(op);
        container.appendChild(btn);
    });

    // esconder botão para não clicar de novo
    document.getElementById("verMemorias").style.display = "none";
}

function escolha(opcao) {
    const container = document.getElementById("conteudoMemorias");
    container.innerHTML = `<h2>Escolheste: ${opcao}</h2><p>Obrigado por participar.</p>`;
}
