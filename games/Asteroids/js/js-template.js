const FPS = 30; // frames por segundo
const FRICTION = 0.7;
const GAME_LIVES = 3; // numero inciante de vidas
const LASER_DIST = 0.6; //distância máxima que o laser pode percorrer como uma fração da largura da tela
const LASER_EXPLODE_DUR = 0.1; // duração da explosão dos lasers em segundos
const LASER_MAX = 10; // número máximo de lasers na tela ao mesmo tempo
const LASER_SPD = 500; // velocidade dos lasers em pixels por segundo
const ROID_JAG = 0.4; // irregularidade dos asteróides (0 = none, 1 = lots)
const ROID_PTS_LGE = 20; // pontos marcados para um grande asteróide
const ROID_PTS_MED = 50; // pontos marcados para um asteróide médio
const ROID_PTS_SML = 100; // pontos marcados para um asteróide pequeno
const ROID_NUM = 3; // número inicial de asteróides
const ROID_SIZE = 100; // tamanho inicial dos asteróides em pixels
const ROID_SPD = 50; // velocidade inicial máxima de asteróides em pixels por segundo
const ROID_VERT = 10; // número médio de vértices em cada asteróide
const SAVE_KEY_SCORE = "highscore"; // salvar chave para armazenamento local de pontuação mais alta
const SHIP_BLINK_DUR = 0.1; // duração em segundos de uma única piscada durante a invisibilidade da nave
const SHIP_EXPLODE_DUR = 0.3; // duração da explosão do navio em segundos
const SHIP_INV_DUR = 3; // duração da invisibilidade do navio em segundos
const SHIP_SIZE = 30; // altura da nave em pixels
const SHIP_THRUST = 5; // aceleraçãpo da nave em px por segundos
const SHIP_TURN_SPD = 360; // velocidade de rotação em graus por segundo
const SHOW_BOUNDING = false; // mostrar ou ocultar o limite de colisão
const SHOW_CENTRE_DOT = false; //mostrar ou ocultar o ponto central do nave
const MUSIC_ON = true;
const SOUND_ON = true;
const TEXT_FADE_TIME = 2.5;
const TEXT_SIZE = 40;

const spanPlayer = document.querySelector('.player');

window.onload = () => {
    spanPlayer.innerHTML = localStorage.getItem('player');
}

/** @type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// configurar efeitos sonoros
var fxExplode = new Sound("sounds/explode.m4a");
var fxHit = new Sound("sounds/hit.m4a", 5);
var fxLaser = new Sound("sounds/laser.m4a", 5, 0.5);
var fxThrust = new Sound("sounds/thrust.m4a");

// configurar a msc
var music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");
var roidsLeft, roidsTotal;

// configurando os paramentros do jogo
var level, lives, roids, score, scoreHigh, ship, text, textAlpha;
newGame();

// configurar manipuladores de eventos
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// confgurango o loop game
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    roidsTotal = (ROID_NUM + level) * 7;
    roidsLeft = roidsTotal;
    var x, y;
    for (var i = 0; i < ROID_NUM + level; i++) {
        //localização aleatória de asteróides (sem tocar na nave espacial)
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 2)));
    }
}

function destroyAsteroid(index) {
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    // divida o asteróide em dois, se necessário
    if (r == Math.ceil(ROID_SIZE / 2)) { // grande
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
        score += ROID_PTS_LGE;
    } else if (r == Math.ceil(ROID_SIZE / 4)) { // medio
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
        score += ROID_PTS_MED;
    } else {
        score += ROID_PTS_SML;
    }

    // melhor/maior score
    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    // destruindo o asteroide
    roids.splice(index, 1);
    fxHit.play();

    // calcule a proporção de asteróides restantes para determinar o ritmo da música
    roidsLeft--;
    music.setAsteroidRatio(roidsLeft / roidsTotal);

    //inicando novo level qnd kbar os asteroides
    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, colour = "white") {
    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nariz da nave
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo( // traseira esquerda
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // traseira direita
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
    fxExplode.play();
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function keyDown(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) {
        return;
    }

    switch (ev.keyCode) {
        case 32: // barra de espaço (disparar laser)
            shootLaser();
            break;
        case 37: // left arrow (rodar a nvae p esquerda)
            ship.rot = SHIP_TURN_SPD / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (direcionar q lado a nave vai)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rodar a nave p direita)
            ship.rot = -SHIP_TURN_SPD / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) {
        return;
    }

    switch (ev.keyCode) {
        case 32: // barra de espaço (permite atirar novamente)
            ship.canShoot = true;
            break;
        case 37: // left arrow (parar de girar p esquerda)
            ship.rot = 0;
            break;
        case 38: // up arrow (para de pulsionar)
            ship.thrusting = false;
            break;
        case 39: // right arrow (para de girar p direita)
            ship.rot = 0;
            break;
    }
}

function newAsteroid(x, y, r) {
    var lvlMult = 1 + 0.1 * level;
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2, // in radians
        r: r,
        offs: [],
        vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2)
    };

    // preencher a matriz de deslocamentos
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
    }

    return roid;
}

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();

    // pegando o ultimo score alto no local storage
    var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }

    newLevel();
}

function newLevel() {
    music.setAsteroidRatio(1);
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        a: 90 / 180 * Math.PI, // convert to radians
        r: SHIP_SIZE / 2,
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        dead: false,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    // criando lasers
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ // from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
        fxLaser.play();
    }

    // evitar mais disparos
    ship.canShoot = false;
}

function Music(srcLow, srcHigh) {
    this.soundLow = new Audio(srcLow);
    this.soundHigh = new Audio(srcHigh);
    this.low = true;
    this.tempo = 1.0;
    this.beatTime = 0; // frames restantes até a próxima batida

    this.play = function () {
        if (MUSIC_ON) {
            if (this.low) {
                this.soundLow.play();
            } else {
                this.soundHigh.play();
            }
            this.low = !this.low;
        }
    }

    this.setAsteroidRatio = function (ratio) {
        this.tempo = 1.0 - 0.75 * (1.0 - ratio);
    }

    this.tick = function () {
        if (this.beatTime == 0) {
            this.play();
            this.beatTime = Math.ceil(this.tempo * FPS);
        } else {
            this.beatTime--;
        }
    }
}

function Sound(src, maxStreams = 1, vol = 1.0) {
    this.streamNum = 0;
    this.streams = [];
    for (var i = 0; i < maxStreams; i++) {
        this.streams.push(new Audio(src));
        this.streams[i].volume = vol;
    }

    this.play = function () {
        if (SOUND_ON) {
            this.streamNum = (this.streamNum + 1) % maxStreams;
            this.streams[this.streamNum].play();
        }
    }

    this.stop = function () {
        this.streams[this.streamNum].pause();
        this.streams[this.streamNum].currentTime = 0;
    }
}

function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;


    music.tick();

    // desenhando o espaço
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // desenhando os asteroides
    var a, r, x, y, offs, vert;
    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;

        // pegando as propiedades dos asteroides
        a = roids[i].a;
        r = roids[i].r;
        x = roids[i].x;
        y = roids[i].y;
        offs = roids[i].offs;
        vert = roids[i].vert;

        // desenhe o caminho
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        // desenhando os polignos
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // mostrar o círculo de colisão do asteroide
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // pulsionando a nave
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
        fxThrust.play();

        // desenhando o foguinho pulsionador
        if (!exploding && blinkOn) {
            ctx.fillStyle = "red";
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( // lado esquerdo
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo( // centro (atras da nave)
                ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo( // lado direito
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        //empurre o nave e aplicando a fricção (desacelere o nave quando não estiver empurrando)
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
        fxThrust.stop();
    }

    // desenhando a nave triangular
    if (!exploding) {
        if (blinkOn && !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);
        }

        // psicando
        if (ship.blinkNum > 0) {

            // reduzindo o tempo de piscar
            ship.blinkTime--;

            // reduzindo o numero de pisques
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        // deshando a explosao com diversas camadas de cores
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

    //mostrando a explosao 
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // mostrar o ponto central da nave
    if (SHOW_CENTRE_DOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // desenhando os lasers
    for (var i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // desenhando a explosao
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // desenhando o texto do jogo
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        // apos a frase, iniciar novo jogo
        newGame();
    }

    // desenhando as vidas
    var lifeColour;
    for (var i = 0; i < lives; i++) {
        lifeColour = exploding && i == lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
    }

    // score
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

    // melhor score
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
    ctx.fillText("BEST " + scoreHigh, canv.width / 2, SHIP_SIZE);

    // detectando quando os lasers atingem o asteroide
    var ax, ay, ar, lx, ly;
    for (var i = roids.length - 1; i >= 0; i--) {

        // pegue as propriedades do asteróide
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        for (var j = ship.lasers.length - 1; j >= 0; j--) {

            // pegue as propriedades do laser
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detectando os 'acertos'
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                // destruindo o asteroide e atvando a explosao do laser
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }
    }

    // verifique se há colisões de asteróides (quando não estiver explodindo)
    if (!exploding) {

        // verifique apenas quando não estiver piscando
        if (ship.blinkNum == 0 && !ship.dead) {
            for (var i = 0; i < roids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }

        // rodando a nave
        ship.a += ship.rot;

        // movendo a nave
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        // reduzindo o tempo de explosao
        ship.explodeTime--;

        // reinicie a nave depois que a explosão terminar
        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // lindadno com a borda da tela
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }

    // movendo os lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {

        // verifique a distância percorrida
        if (ship.lasers[i].dist > LASER_DIST * canv.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // lindando com as explosoes
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destruir o laser depois que a duração acabar
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            // movendo o laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            // calculando a distancia perocrrida
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // lidando com a borda da tela
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canv.width;
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canv.height;
        } else if (ship.lasers[i].y > canv.height) {
            ship.lasers[i].y = 0;
        }
    }

    // movendo os asteroids
    for (var i = 0; i < roids.length; i++) {
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

        // lindando com os asteroides e bordas da tela ---- deixando ele passar a bbordar e reaparecer respectivamente do outro lado.
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r;
        } else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r;
        } else if (roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r
        }
    }
}