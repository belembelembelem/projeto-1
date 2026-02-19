

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

let cnv;
let imagensFinal = [] // copia das imagens originais do jogador
let finalArte = false
let finalIndex = 0
let escolhaFinal = false
let imagensOriginais = []

function preload() {
    imagens.push(loadImage("data/img1.jpg"))
    imagens.push(loadImage("data/img2.jpg"))
    imagens.push(loadImage("data/img3.jpg"))
    imagens.push(loadImage("data/img4.jpg"))
    imagens.push(loadImage("data/img5.jpg"))
    imagens.push(loadImage("data/img6.jpg"))

    imagensOriginais = [...imagens] //criar a cópia de segurança das imagens iniciais 
}

function setup() //configurar o jogo inicial
{

    puzzlesDisponiveis = [...imagens]
    criarPuzzle()
    criarPecas()
    // escolher a primeira imagem, espalhar as peças 

    tempoInicio = millis()
    tempoRestante = tempoTotal
    //iniciar o cronómetro

    botaoProximo = select("#proximoPuzzle")
    botaoProximo.mousePressed(proximoPuzzle)

}


function draw() {
    background(20);

    if (finalArte) // ae o jogo já acabou, para aqui e não da mais
    {
        mostrarGaleriaFinal()
        return
    }

    if (!imagemAtual) return
    // ae ainda não houver imagem carregada esperar


    let tempoDecorrido = (millis() - tempoInicio) / 1000
    // calcular quantos segundos passaram desde que o puzzle começou
    tempoRestante = max(0, tempoTotal - floor(tempoDecorrido))
    // subtrair o tempo passado ao tempo total e garantir que não vai abaixo de 0


    // Desenhar peças
    for (let p of pecas) {
        if (!p.placed) // se a peça ainda não foi encaixada no sítio certo 
        {
            if (tempoRestante <= tempoCritico) // se faltarem menos de 10 segundos 
            {
                p.x += random(-1, 1) // isto faz a peça tremer no eixo x
                p.y += random(-1, 1) //  aui no eixo y
                p.alpha = map(tempoRestante, 0, tempoCritico, 50, 255) // faz a opacidade baixar á medida  o tempo acaba
            } else {
                p.alpha = 255;  // garantir q se houver tempo, a peça fica normal
            }
        }
        push() // guarda as configurações de ações dos puzzlesno momento
        tint(255, p.alpha); // filtro de cor e transparencia a partir de agora, tudo o que desenhar vai ter a transparencia defenida transparência. o  p.alpha diminui quando o tempo está a acabar no map a peça começa a "desvanecer" e a ficar transparente.

        image(
            imagemAtual, p.x, p.y, tamanhoPecaX, tamanhoPecaY, p.imgX, p.imgY, tamanhoPecaX, tamanhoPecaY
        );
        // image é super importante
        // pega na imagem original e desenha apenas um pedaço na posição onde a peça está no ecrã 
        pop(); // Restaura as configurações para a próxima peça, para esquecer o tint
    }

    // Atualizar info atraves do html
    select("#cronometro").html(`Tempo: ${tempoRestante}s`)
    select("#memorias").html(`Memórias salvas: ${memoriasSalvas}`)

    if (puzzleFalhado) {
        background(0, 200); // Escurece o ecrã com um preto transparente
        fill(255); //cor texto fica branca 
        textAlign(CENTER, CENTER);
        textSize(28);
        text("Falhaste este puzzle.\nClica para tentar o próximo.", width / 2, height / 2)
        return; // aui para o desenho para o jogador não poder mexer mais nas peças
    }
    verificarPuzzleCompleto()  //chamar a função q vê se todas as peças estão encaixadas
    // quando o tempo acaba 
    if (tempoRestante <= 0 && !puzzleCompleto && !puzzleFalhado) {
        puzzleFalhado = true; // só aqui é que se sabe se ue perdeu até la ainda nao, aqui é ue ativa o estado de derrota
    }
}


function criarPuzzle() {
    if (puzzlesDisponiveis.length === 0) return
    // se não houver mais imagens na lista, parar a função

    let index = floor(random(puzzlesDisponiveis.length))
    // escolher um número random das imagens que restam
    imagemAtual = puzzlesDisponiveis.splice(index, 1)[0]
    // o splice tira a imagem da lista  para nao se repetir e guarda a na variavel imagem atual 

    // calcular escala com base na janela
    let canvasLargura = windowWidth * 0.6
    let canvasAltura = windowHeight * 0.6
    let escala = min(canvasLargura / imagemAtual.width, canvasAltura / imagemAtual.height)

    // defenir o novo tamanho da imagem com base nessa escala
    let novaLargura = imagemAtual.width * escala
    let novaAltura = imagemAtual.height * escala

    // recriar canvas
    if (cnv) cnv.remove()
    cnv = createCanvas(novaLargura, novaAltura)
    cnv.parent("gameContainer")

    // Redimensiona a imagem para o tamanho calculado
    imagemAtual = imagemAtual.get()
    imagemAtual.resize(novaLargura, novaAltura)

    tamanhoPecaX = imagemAtual.width / colunas
    tamanhoPecaY = imagemAtual.height / linhas
    // dividir a largura e altura pelo número de colunas e linhas para saber o tamanho de cada peça


    //atualizar imagem referencia
    let imgRef = select("#imagemReferencia");
    imgRef.attribute("src", imagemAtual.canvas.toDataURL())
}






function criarPecas() {
    pecas = [];  // limpar a lista de peças antiga


    // criar a grelha, ciclo para percorrer as linhas e colunas
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            let px, py;

            do {
                px = random(0, width - tamanhoPecaX);
                py = random(0, height - tamanhoPecaY);
            } while (dist(px, py, x * tamanhoPecaX, y * tamanhoPecaY) < 50)

            // do while é um ciclo que corre pelo menos uma vez para baralhar as peças
            // O dist < 50 garante que nenhuma peça comece logo em cima do lugar certo.


            // criar o objeto da peça com todas as suas informações
            let p = {
                x: px, // posição atual do x
                y: py, // Y
                correctX: x * tamanhoPecaX, // destino final peça x
                correctY: y * tamanhoPecaY, // Y
                imgX: x * tamanhoPecaX, // coordenada do recorte na imagem original
                imgY: y * tamanhoPecaY,
                placed: false, // diz que a peça ainda não está no sítio certo
                alpha: 255  // defenir a opacidade inicial como visível
            };

            pecas.push(p)
            // adicionar esta peça à lista de peças do jogo
        }
    }
}


function mousePressed() {
    if (finalArte) return
    // se o jogo acabou não faz nada

    if (puzzleFalhado) {
        proximoPuzzle()
        return
    } // se perder clicar pro proximo puzzle

    for (let i = pecas.length - 1; i >= 0; i--)  // percorrer as peças do fim para o início para o rato pegar na de cima
    {
        let p = pecas[i]     // verificar se o rato está em cima dessa peça específica
        if (mouseX > p.x && mouseX < p.x + tamanhoPecaX && mouseY > p.y && mouseY < p.y + tamanhoPecaY) {
            pecaArrastada = p // segura a peça para a arrastar
            break // saí do loop para não pegar em varias ao mesmo tempo
        }
    }
}

function mouseDragged() {
    // se houver uma peça selecionada e ainda nao estiver no local certo 
    if (pecaArrastada && !pecaArrastada.placed) {
        // centrar a peça na posição do rato enquanto a moves 
        pecaArrastada.x = mouseX - tamanhoPecaX / 2
        pecaArrastada.y = mouseY - tamanhoPecaY / 2
    }
}

function mouseReleased() {
    if (pecaArrastada)   // Só age se houver uma peça a ser movida
    {
        let d = dist(pecaArrastada.x, pecaArrastada.y, pecaArrastada.correctX, pecaArrastada.correctY)
        // calcula a distância (em píxeis) entre a posição atual da peça e a posição correta dela
        if (d < 20) {
            pecaArrastada.x = pecaArrastada.correctX  // se tiver a menos de 20px ncaixa no X exato
            pecaArrastada.y = pecaArrastada.correctY // y
            pecaArrastada.placed = true // Marca como colocada no sitio certo
        }
        pecaArrastada = null // Larga a peça deixa de estar agarrada ao rato
    }
}

// Verificar se todas as peças estão nos seus lugares
function verificarPuzzleCompleto() {
    // se o puzzle ainda não foi dado como ganho e todas (.every) as peças têm 'placed' como true
    if (!puzzleCompleto && pecas.every(p => p.placed)) {
        puzzleCompleto = true;
        //aumenta o contador das vitórias
        memoriasSalvas++

        // Guardar uma única vez a imagem completada, o get cria copia estatica da imagem inteira 
        if (!imagensFinal.includes(imagemAtual)) {
            imagensFinal.push(imagemAtual.get())
        }

        setTimeout(proximoPuzzle, 1500)
    }
}


function proximoPuzzle() {
    // verifica se ainda há puzzles por fazer na lista se não houver mais puzzles na lista, acaba o jogo
    if (puzzlesDisponiveis.length === 0) {
        finalizarJogo()
        return
    }

    criarPuzzle() // gera nova lógica de grelha
    criarPecas() // gera as peças físicas

    tempoInicio = millis() //renicia o cronometro
    tempoRestante = tempoTotal

    puzzleCompleto = false
    puzzleFalhado = false
}



// Esconder o jogo e mostra o ecrã de resultados
function finalizarJogo() {
    noLoop(); // congelar o jogo no sketch de p5

    if (cnv) cnv.hide();
    select("#imagemReferencia").hide()
    select("#cronometro").hide()
    select("#memorias").hide()
    select("#proximoPuzzle").hide()

    //  mostrar o div do final 
    select('#telaFinal').show()
    //  ligar botao ver aqui
    let btnVer = select('#verMemorias')
    btnVer.show()
    btnVer.mousePressed(mostrarMemorias)

}


// galeria final de imagens e escolhas
function mostrarMemorias() {
    const container = select('#conteudoMemorias')
    container.html("") // limpar tudo 

    // esconder textos iniciais
    let mensagens = selectAll(".msg-fim")
    mensagens[0].hide()
    mensagens[1].hide()
    select('#verMemorias').hide()

    let titulo = createElement('h2', `Memórias salvas: ${memoriasSalvas} / ${imagensFinal.length}`)
    titulo.parent(container)

    for (let i = 0; i < imagensFinal.length; i++) {
        // criar a imagem a partir do canvas da memória, converte a imagem interna do p5 para um formato que o navegador entende 
        let img = createImg(imagensFinal[i].canvas.toDataURL(), 'memoria')
        img.style('max-width', '200px')
        img.style('margin', '10px')
        img.parent(container) // anexa ao container


        // adicionar legenda 
        let status = i < memoriasSalvas ? "Completada" : "Falhada"
        let p = createP(status)
        p.style('opacity', '0.8')
        p.parent(container)
    }

    let escolhaP = createP("O que queres fazer com o resto das memórias?")
    escolhaP.parent(container);


    const botoes = ["Rouba-las para ti", "Doa-las a museus", "Tentar de novo"]
    botoes.forEach(op => {
        let btn = createButton(op)
        btn.parent(container)
        btn.mousePressed(() => escolha(op))
    })

    // esconder o botão inicial 
    select('#verMemorias').hide()
}


// Feedback final da escolha do jogador
function escolha(opcao) {

    const container = select('#conteudoMemorias')
    container.html("")

    if (opcao === "Rouba-las para ti") {

        container.html(`
            <h2>Escolheste: Roubá-las!</h2>
            <p>Guardaste as memórias só para ti, escondidas do resto do mundo.</p>
        `)

    }
    else if (opcao === "Doa-las a museus") {

        container.html(`
            <h2>Escolheste: Doar!</h2>
            <p>O mundo inteiro agora pode apreciar estas memórias.</p>
        `)

    }
    else if (opcao === "Tentar de novo") {

        reiniciarJogo()
        return
    }

    let btnVoltar = createButton("Voltar ao Início")
    btnVoltar.parent(container)
    btnVoltar.mousePressed(reiniciarJogo)
}



function reiniciarJogo() {
    // limpar as listas de progresso
    memoriasSalvas = 0
    imagensFinal = []

    // repor a lista de puzzles a partir da cópia de segurança
    puzzlesDisponiveis = [...imagensOriginais]

    // resetar estados
    puzzleCompleto = false
    puzzleFalhado = false
    finalArte = false
    pecaArrastada = null

    // mostrar os elementos que tinha escondido no finalizarJogo
    if (cnv) cnv.show()
    select("#cronometro").show()
    select("#memorias").show()
    select('#verMemorias').show()
    select("#imagemReferencia").show()
    select("#proximoPuzzle").show()
    select('#telaFinal').hide()// Garante que o botão de ver memórias reaparece na próxima vez
    select('#conteudoMemorias').html("");// limpa a galeria de imagens anterior

    mensagens = selectAll(".msg-fim")
    mensagens[0].show()
    mensagens[1].show()
    select('#verMemorias').show()

    if (cnv) cnv.show()
    // criar novo puzzle do zero
    criarPuzzle()
    criarPecas()

    // reiniciar tempo 
    tempoInicio = millis()
    tempoRestante = tempoTotal

    //  ligar o loop pra garantir que o jogo corre
    loop()
}
