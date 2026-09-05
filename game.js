const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let width = 0;
let height = 0;

function updateSize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
}

updateSize();
window.addEventListener("resize", updateSize);


// ==============================
// GAME STATE
// ==============================

let score = 0;
let gameSpeed = 3;
let frame = 0;
let gameOver = false;
let restartTimer = 0;


// ==============================
// PLAYER
// ==============================

const player = {
    x: 0,
    y: 0,
    size: 14,
    targetX: 0,
    speed: 0.12
};

function resetPlayer() {
    player.x = width / 2;
    player.y = height - 45;
    player.targetX = player.x;
}

resetPlayer();


// ==============================
// OBSTACLES
// ==============================

let obstacles = [];

function createObstacle() {
    const size = Math.random() * 18 + 12;

    obstacles.push({
        x: Math.random() * (width - size),
        y: -size,
        size: size,
        speed: gameSpeed + Math.random() * 2,
        color: Math.random() > 0.5
            ? "#a855f7"
            : "#ec4899"
    });
}


// ==============================
// AI AUTOPLAY
// ==============================

function updateAI() {

    const dangerDistance = 120;

    let danger = obstacles.find(obstacle =>
        obstacle.y > player.y - dangerDistance &&
        obstacle.y < player.y + player.size &&
        obstacle.x < player.x + player.size + 30 &&
        obstacle.x + obstacle.size > player.x - 30
    );

    if (danger) {

        if (danger.x < player.x) {
            player.targetX = Math.min(
                width - player.size,
                player.x + 100 + Math.random() * 80
            );
        } else {
            player.targetX = Math.max(
                player.size,
                player.x - 100 - Math.random() * 80
            );
        }

    } else if (Math.random() < 0.015) {

        player.targetX =
            width * 0.2 +
            Math.random() * width * 0.6;
    }
}


// ==============================
// UPDATE
// ==============================

function update() {

    if (gameOver) {

        restartTimer--;

        if (restartTimer <= 0) {
            restartGame();
        }

        return;
    }

    frame++;

    score += 0.1;

    gameSpeed += 0.0005;


    // Spawn obstacles

    const spawnRate =
        Math.max(
            18,
            55 - Math.floor(score / 20)
        );

    if (frame % spawnRate === 0) {
        createObstacle();
    }


    // AI

    updateAI();

    player.x +=
        (player.targetX - player.x) *
        player.speed;


    // Keep player inside field

    player.x = Math.max(
        player.size,
        Math.min(width - player.size, player.x)
    );


    // Update obstacles

    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
    });

    obstacles =
        obstacles.filter(
            obstacle => obstacle.y < height + 40
        );


    // Collision

    for (const obstacle of obstacles) {

        const padding = 3;

        if (
            player.x - player.size / 2 <
                obstacle.x + obstacle.size - padding &&
            player.x + player.size / 2 >
                obstacle.x + padding &&
            player.y - player.size / 2 <
                obstacle.y + obstacle.size - padding &&
            player.y + player.size / 2 >
                obstacle.y + padding
        ) {
            gameOver = true;
            restartTimer = 90;
        }
    }


    scoreElement.textContent =
        Math.floor(score)
            .toString()
            .padStart(4, "0");
}


// ==============================
// DRAW
// ==============================

function drawPlayer() {

    ctx.save();

    ctx.translate(player.x, player.y);

    ctx.rotate(Math.PI);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#22d3ee";

    ctx.fillStyle = "#22d3ee";

    ctx.beginPath();

    ctx.moveTo(0, -player.size);
    ctx.lineTo(player.size / 1.5, player.size);
    ctx.lineTo(-player.size / 1.5, player.size);

    ctx.closePath();

    ctx.fill();

    ctx.restore();
}


function drawObstacle(obstacle) {

    ctx.save();

    ctx.shadowBlur = 14;
    ctx.shadowColor = obstacle.color;

    ctx.fillStyle = obstacle.color;

    ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.size,
        obstacle.size
    );

    ctx.restore();
}


function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    obstacles.forEach(drawObstacle);

    drawPlayer();


    // Game over flash

    if (gameOver) {

        ctx.fillStyle =
            "rgba(236, 72, 153, 0.12)";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );
    }
}


// ==============================
// RESTART
// ==============================

function restartGame() {

    obstacles = [];

    score = 0;

    gameSpeed = 3;

    frame = 0;

    gameOver = false;

    resetPlayer();
}


// ==============================
// GAME LOOP
// ==============================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
