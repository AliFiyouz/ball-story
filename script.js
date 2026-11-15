// ===== Ball Story — بازی گرفتن توپ =====

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// عناصر HUD
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const livesEl = document.querySelector("#lives");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayText = document.querySelector("#overlay-text");
const startBtn = document.querySelector("#start-btn");

// سبد بازیکن
const basket = { w: 90, h: 16, x: W / 2 - 45, y: H - 40, speed: 7 };

// توپ‌ها
let balls = [];
let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("ballStoryBest")) || 0;
let running = false;
let spawnTimer = 0;
let spawnInterval = 80;      // هر چند فریم یک توپ (کمتر = سریع‌تر)
let keys = { left: false, right: false };

bestEl.textContent = best;

// ساخت یک توپ تصادفی
function spawnBall() {
  const r = 12 + Math.random() * 8;
  balls.push({
    x: r + Math.random() * (W - 2 * r),
    y: -r,
    r,
    vy: 2 + Math.random() * 2 + score * 0.02, // با افزایش امتیاز سریع‌تر
    color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`,
  });
}

// به‌روزرسانی وضعیت بازی
function update() {
  // حرکت سبد با کیبورد
  if (keys.left) basket.x -= basket.speed;
  if (keys.right) basket.x += basket.speed;
  basket.x = Math.max(0, Math.min(W - basket.w, basket.x));

  // ساخت توپ‌های جدید
  if (++spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnBall();
  }

  // حرکت و برخورد توپ‌ها
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.y += b.vy;

    // گرفته‌شدن توسط سبد
    const caught =
      b.y + b.r >= basket.y &&
      b.y - b.r <= basket.y + basket.h &&
      b.x >= basket.x &&
      b.x <= basket.x + basket.w;

    if (caught) {
      balls.splice(i, 1);
      score++;
      scoreEl.textContent = score;
      // هر ۵ امتیاز کمی سخت‌تر
      if (score % 5 === 0 && spawnInterval > 35) spawnInterval -= 4;
      continue;
    }

    // افتادن از پایین = از دست‌دادن جان
    if (b.y - b.r > H) {
      balls.splice(i, 1);
      loseLife();
    }
  }
}

function loseLife() {
  lives--;
  livesEl.textContent = "❤".repeat(lives) || "—";
  if (lives <= 0) gameOver();
}

// رسم صحنه
function draw() {
  ctx.clearRect(0, 0, W, H);

  // توپ‌ها
  balls.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    // نور کوچک روی توپ
    ctx.beginPath();
    ctx.arc(b.x - b.r / 3, b.y - b.r / 3, b.r / 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
  });

  // سبد
  ctx.fillStyle = "#ffd369";
  ctx.beginPath();
  ctx.roundRect(basket.x, basket.y, basket.w, basket.h, 8);
  ctx.fill();
}

// حلقه‌ی اصلی بازی
function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

// شروع / ری‌استارت
function startGame() {
  balls = [];
  score = 0;
  lives = 3;
  spawnInterval = 80;
  spawnTimer = 0;
  basket.x = W / 2 - basket.w / 2;
  scoreEl.textContent = "0";
  livesEl.textContent = "❤❤❤";
  overlay.classList.add("hidden");
  running = true;
  loop();
}

// پایان بازی
function gameOver() {
  running = false;
  if (score > best) {
    best = score;
    localStorage.setItem("ballStoryBest", best);
    bestEl.textContent = best;
  }
  overlayTitle.textContent = "باختی! 💥";
  overlayText.textContent = `امتیاز تو: ${score}  —  رکورد: ${best}`;
  startBtn.textContent = "دوباره بازی کن";
  overlay.classList.remove("hidden");
}

// ===== کنترل‌ها =====
startBtn.addEventListener("click", startGame);

// ماوس: سبد مرکزش دنبال نشانگر می‌رود
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const mx = (e.clientX - rect.left) * scaleX;
  basket.x = Math.max(0, Math.min(W - basket.w, mx - basket.w / 2));
});

// لمسی (موبایل)
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const mx = (e.touches[0].clientX - rect.left) * scaleX;
  basket.x = Math.max(0, Math.min(W - basket.w, mx - basket.w / 2));
}, { passive: false });

// کیبورد
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});
