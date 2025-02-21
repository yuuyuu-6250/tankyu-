// HTML5 Canvas を使用して pygame のゲームを JavaScript に変換

// キャンバスの設定
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const screenWidth = 800;
const screenHeight = 600;
canvas.width = screenWidth;
canvas.height = screenHeight;

// 色の定義
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const RED = "#FF0000";
const GREEN = "#00FF00";

// レーンの設定
const laneWidth = screenWidth / 4;
const lanes = Array.from({ length: 4 }, (_, i) => laneWidth * i);

// ノートの設定
const noteWidth = laneWidth;
const noteHeight = 30; // ノートの高さ
const noteSpeed = 5;
const notes = { 0: [], 1: [], 2: [], 3: [] };
const minDistanceBetweenNotes = 100;

// スコアと判定ラインの設定
let score = 0;
let judgmentResult = "";
const judgmentLineY = screenHeight - 100;
const perfectMargin = 5;
const greatMargin = 10;
const goodMargin = 20;

// 一時停止フラグ
let paused = false;
let gameStarted = false; // ゲーム開始フラグ

// キー対応表
const keyMap = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };

// ゲームリセット
function resetGame() {
    for (let i in notes) {
        notes[i] = [];
    }
    score = 0;
    judgmentResult = "";
}

// ノート生成関数
function generateNote() {
    if (Math.random() < 0.02) { // ノート生成確率
        const laneIndex = Math.floor(Math.random() * 4);
        if (
            notes[laneIndex].length === 0 ||
            notes[laneIndex][notes[laneIndex].length - 1].y > minDistanceBetweenNotes
        ) {
            notes[laneIndex].push({ x: lanes[laneIndex], y: -noteHeight });
        }
    }
}

// ノート更新関数
function updateNotes() {
    for (let lane in notes) {
        for (let note of notes[lane]) {
            note.y += noteSpeed;
        }
        notes[lane] = notes[lane].filter(note => note.y <= screenHeight);
    }
}

// 描画関数
function draw() {
    // 背景を白でクリア
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // レーンの描画
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    for (let lane of lanes) {
        ctx.beginPath();
        ctx.moveTo(lane, 0);
        ctx.lineTo(lane, screenHeight);
        ctx.stroke();
    }

    // 判定ラインの描画
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, judgmentLineY);
    ctx.lineTo(screenWidth, judgmentLineY);
    ctx.stroke();

    // ノートの描画
    for (let lane in notes) {
        for (let note of notes[lane]) {
            ctx.fillStyle = RED;
            ctx.fillRect(note.x, note.y, noteWidth, noteHeight);
        }
    }

    // スコアと判定結果の描画
    ctx.fillStyle = BLACK;
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
    if (judgmentResult) {
        ctx.fillText(judgmentResult, screenWidth / 2 - 50, judgmentLineY - 50);
    }

    // 一時停止中のメッセージ表示
    if (paused) {
        ctx.font = "48px Arial";
        const pauseText = "Paused";
        const restartText = "Press R to Restart";
        ctx.fillText(pauseText, screenWidth / 2 - ctx.measureText(pauseText).width / 2, screenHeight / 2 - 40);
        ctx.fillText(restartText, screenWidth / 2 - ctx.measureText(restartText).width / 2, screenHeight / 2 + 40);
    }
}

// 判定処理
function handleKeyPress(keyCode) {
    if (keyMap[keyCode] !== undefined && !paused) {
        const keyIndex = keyMap[keyCode];
        for (let i in notes[keyIndex]) {
            const noteCenterY =
                notes[keyIndex][i].y + noteHeight / 2;

            if (
                judgmentLineY - perfectMargin <= noteCenterY &&
                noteCenterY <= judgmentLineY + perfectMargin
            ) {
                notes[keyIndex].splice(i, 1);
                score++;
                judgmentResult = "Perfect";
                return;
            } else if (
                judgmentLineY - greatMargin <= noteCenterY &&
                noteCenterY <= judgmentLineY + greatMargin
            ) {
                notes[keyIndex].splice(i, 1);
                score++;
                judgmentResult = "Great";
                return;
            } else if (
                judgmentLineY - goodMargin <= noteCenterY &&
                noteCenterY <= judgmentLineY + goodMargin
            ) {
                notes[keyIndex].splice(i, 1);
                score++;
                judgmentResult = "Good";
                return;
            } else {
                judgmentResult = "Miss";
            }
        }
    }
}

// キーボードイベントリスナー
document.addEventListener("keydown", event => {
    if (event.code === "Escape") {
        paused = !paused; // エスケープキーで一時停止/再開を切り替え
    } else if (paused && event.code === "KeyR") { // リスタート処理
        resetGame();
        paused = false;
    } else if (!paused) {
        handleKeyPress(event.code);
    }
});

// タッチイベントリスナー
canvas.addEventListener("touchstart", event => {
    if (!paused) {
        const touch = event.touches[0];
        const touchX = touch.clientX;
        const laneIndex = Math.floor(touchX / laneWidth);
        handleTouch(laneIndex);
    }
});

function handleTouch(laneIndex) {
    for (let i in notes[laneIndex]) {
        const noteCenterY = notes[laneIndex][i].y + noteHeight / 2;

        if (
            judgmentLineY - perfectMargin <= noteCenterY &&
            noteCenterY <= judgmentLineY + perfectMargin
        ) {
            notes[laneIndex].splice(i, 1);
            score++;
            judgmentResult = "Perfect";
            return;
        } else if (
            judgmentLineY - greatMargin <= noteCenterY &&
            noteCenterY <= judgmentLineY + greatMargin
        ) {
            notes[laneIndex].splice(i, 1);
            score++;
            judgmentResult = "Great";
            return;
        } else if (
            judgmentLineY - goodMargin <= noteCenterY &&
            noteCenterY <= judgmentLineY + goodMargin
        ) {
            notes[laneIndex].splice(i, 1);
            score++;
            judgmentResult = "Good";
            return;
        } else {
            judgmentResult = "Miss";
        }
    }
}

// スタートボタンのクリックイベントリスナー
document.getElementById("startButton").addEventListener("click", () => {
    gameStarted = true;
    document.getElementById("startButton").style.display = "none"; // スタートボタンを非表示にする
    gameLoop();
});

// メインループ
function gameLoop() {
    if (gameStarted && !paused) {
        generateNote();
        updateNotes();
    }
    
    draw();
    
    requestAnimationFrame(gameLoop);
}
