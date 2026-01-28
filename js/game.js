// Lightweight canvas shooter with pastel/glitch flavor
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');
  const powerupEl = document.getElementById('powerup-status');

  const W = canvas.width;
  const H = canvas.height;

  const keys = {};
  let bullets = [];
  let enemies = [];
  let particles = [];
  let lastEnemy = 0;
  let score = 0;
  let running = false;
  let power = null;
  let powerTimer = 0;

  const highScore = Number(localStorage.getItem('veylein-highscore') || 0);
  highScoreEl.textContent = highScore;

  const player = { x: W / 2, y: H / 2, size: 26, speed: 4, color: '#ff8bd4' };

  const rnd = (min, max) => Math.random() * (max - min) + min;

  const spawnEnemy = () => {
    const size = rnd(16, 30);
    const edge = Math.random() < 0.5 ? 'x' : 'y';
    const pos = edge === 'x'
      ? { x: Math.random() < 0.5 ? -size : W + size, y: rnd(0, H) }
      : { x: rnd(0, W), y: Math.random() < 0.5 ? -size : H + size };
    enemies.push({ ...pos, size, speed: rnd(1.2, 2.4), color: '#86f0ff' });
  };

  const spawnPowerup = () => {
    if (Math.random() < 0.5) return;
    const type = Math.random() < 0.5 ? 'sword' : 'laser';
    particles.push({
      type: 'power',
      power: type,
      x: rnd(60, W - 60),
      y: rnd(60, H - 60),
      size: 10,
      life: 1200,
      color: type === 'sword' ? '#ffd166' : '#86f0ff',
    });
  };

  const addParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      particles.push({
        type: 'spark',
        x,
        y,
        vx: rnd(-2, 2),
        vy: rnd(-2, 2),
        life: 30,
        color,
      });
    }
  };

  const shoot = () => {
    if (power === 'laser') {
      bullets.push({ x: player.x, y: player.y, vx: 0, vy: -8, size: 6, color: '#86f0ff', pierce: true });
      bullets.push({ x: player.x, y: player.y, vx: 0, vy: 8, size: 6, color: '#86f0ff', pierce: true });
    } else {
      bullets.push({ x: player.x, y: player.y, vx: 0, vy: -7, size: 5, color: '#ff8bd4' });
    }
  };

  let shootCooldown = 0;

  const update = (dt) => {
    if (!running) return;

    // Movement
    const dx = (keys['arrowright'] ? 1 : 0) - (keys['arrowleft'] ? 1 : 0);
    const dy = (keys['arrowdown'] ? 1 : 0) - (keys['arrowup'] ? 1 : 0);
    const len = Math.hypot(dx, dy) || 1;
    player.x = Math.min(W - player.size, Math.max(player.size, player.x + (dx / len) * player.speed));
    player.y = Math.min(H - player.size, Math.max(player.size, player.y + (dy / len) * player.speed));

    // Shooting
    shootCooldown -= dt;
    if (keys['x'] && shootCooldown <= 0) {
      shoot();
      shootCooldown = power === 'laser' ? 120 : 260;
    }

    // Enemies
    lastEnemy -= dt;
    if (lastEnemy <= 0) {
      spawnEnemy();
      lastEnemy = Math.max(350 - score * 2, 120);
      if (Math.random() < 0.2) spawnPowerup();
    }

    enemies.forEach((e) => {
      const vx = player.x - e.x;
      const vy = player.y - e.y;
      const l = Math.hypot(vx, vy) || 1;
      e.x += (vx / l) * e.speed;
      e.y += (vy / l) * e.speed;
    });

    // Bullets
    bullets = bullets.filter((b) => {
      b.x += b.vx;
      b.y += b.vy;
      return b.x > -20 && b.x < W + 20 && b.y > -20 && b.y < H + 20;
    });

    // Collisions: bullets vs enemies
    bullets = bullets.filter((b) => {
      let alive = true;
      enemies = enemies.filter((e) => {
        const hit = Math.hypot(b.x - e.x, b.y - e.y) < b.size + e.size;
        if (hit) {
          addParticles(e.x, e.y, e.color);
          score += 1;
          scoreEl.textContent = score;
          if (!b.pierce) alive = false;
          return false;
        }
        return true;
      });
      return alive;
    });

    // Player collision
    enemies.forEach((e) => {
      if (Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) reset();
    });

    // Powerups / particles
    particles = particles.filter((p) => {
      p.life -= dt;
      if (p.type === 'spark') {
        p.x += p.vx;
        p.y += p.vy;
      }
      if (p.type === 'power') {
        if (Math.hypot(player.x - p.x, player.y - p.y) < player.size + 10) {
          power = p.power;
          powerTimer = 6000;
          powerupEl.textContent = `Power-up: ${power === 'sword' ? 'Mulan Sword arc' : 'AI Laser pierce'}`;
          return false;
        }
      }
      return p.life > 0;
    });

    // Power effect
    if (power) {
      powerTimer -= dt;
      if (power === 'sword') {
        // Sweep arc damage
        enemies = enemies.filter((e) => {
          const hit = Math.hypot(player.x - e.x, player.y - e.y) < player.size + 40;
          if (hit) {
            addParticles(e.x, e.y, '#ffd166');
            score += 1;
            scoreEl.textContent = score;
            return false;
          }
          return true;
        });
      }
      if (powerTimer <= 0) {
        power = null;
        powerupEl.textContent = 'Power-up: none';
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size, 6);
    ctx.fill();

    // Bullets
    bullets.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    enemies.forEach((e) => {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.roundRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size, 4);
      ctx.fill();
    });

    // Particles
    particles.forEach((p) => {
      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
      if (p.type === 'power') {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = p.color + '99';
        ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
      }
    });
  };

  let last = 0;
  const loop = (t) => {
    const dt = t - last;
    last = t;
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
  };

  const reset = () => {
    if (score > highScore) {
      localStorage.setItem('veylein-highscore', score);
      highScoreEl.textContent = score;
    }
    score = 0;
    scoreEl.textContent = score;
    enemies = [];
    bullets = [];
    particles = [];
    power = null;
    powerupEl.textContent = 'Power-up: none';
  };

  window.startShooter = () => {
    if (running) return;
    running = true;
    reset();
    last = performance.now();
    requestAnimationFrame(loop);
  };

  window.stopShooter = () => { running = false; };

  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });
})();
