<canvas id="game-canvas" width="800" height="600"></canvas>
<div id="score">0</div>
<div id="high-score">0</div>
<div id="powerup-status">Power-up: none</div>
<script>
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');
  const powerupEl = document.getElementById('powerup-status');

  const W = canvas.width;
  const H = canvas.height;

  // --- State ---
  const keys = {};
  let mouse = { x: W / 2, y: H / 2 };
  let bullets = [];
  let enemies = [];
  let particles = [];
  let boss = null;
  let lastEnemy = 0;
  let score = 0;
  let running = false;
  let power = null;
  let powerTimer = 0;
  let shootCooldown = 0;
  let elapsed = 0;
  let shake = 0;

  const highScore = Number(localStorage.getItem('veylein-highscore') || 0);
  highScoreEl.textContent = highScore;

  const player = { x: W / 2, y: H / 2, size: 26, speed: 4, angle: 0, color: '#ff8bd4' };

  // --- Helpers ---
  const rnd = (min, max) => Math.random() * (max - min) + min;

  const addParticles = (x, y, color, count=8) => {
    for (let i=0; i<count; i++) {
      particles.push({
        type: 'spark',
        x, y,
        vx: rnd(-2,2),
        vy: rnd(-2,2),
        life: 30,
        color
      });
    }
  };

  // --- Enemy ---
  const spawnEnemy = () => {
    const size = rnd(16,30);
    const edge = Math.random() < 0.5 ? 'x':'y';
    const pos = edge==='x'
      ? { x: Math.random()<0.5 ? -size : W+size, y: rnd(0,H) }
      : { x: rnd(0,W), y: Math.random()<0.5 ? -size : H+size };
    const speed = rnd(1.2,2.4) + Math.min(elapsed/30000,3); // scaling speed
    enemies.push({ ...pos, size, speed, color:'#86f0ff' });
  };

  const spawnPowerup = () => {
    if (Math.random()<0.5) return;
    const type = Math.random()<0.5 ? 'sword' : 'laser';
    particles.push({
      type: 'power',
      power: type,
      x: rnd(60, W-60),
      y: rnd(60, H-60),
      size: 10,
      life: 1200,
      color: type==='sword' ? '#ffd166':'#86f0ff'
    });
  };

  // --- Shooting ---
  const shoot = () => {
    const speed = power==='laser' ? 10 : 8;
    const vx = Math.cos(player.angle) * speed;
    const vy = Math.sin(player.angle) * speed;
    bullets.push({
      x: player.x, y: player.y, vx, vy,
      size: power==='laser' ? 6 : 5,
      color: power==='laser' ? '#86f0ff':'#ff8bd4',
      pierce: power==='laser'
    });
  };

  // --- Update ---
  const update = (dt) => {
    if (!running) return;
    elapsed += dt;

    // --- Player movement ---
    const dx = (keys['d']?1:0) - (keys['a']?1:0);
    const dy = (keys['s']?1:0) - (keys['w']?1:0);
    const len = Math.hypot(dx,dy)||1;
    player.x = Math.max(player.size, Math.min(W-player.size, player.x + (dx/len)*player.speed));
    player.y = Math.max(player.size, Math.min(H-player.size, player.y + (dy/len)*player.speed));

    // --- Aim ---
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    // --- Shooting ---
    shootCooldown -= dt;
    if ((keys['shoot'] || keys[' ']) && shootCooldown<=0) {
      shoot();
      shootCooldown = power==='laser' ? 120 : 220;
    }

    // --- Enemy spawning ---
    lastEnemy -= dt;
    if (lastEnemy <=0) {
      spawnEnemy();
      lastEnemy = Math.max(350 - Math.min(elapsed/30000,3)*120, 90);
      if (Math.random()<0.2) spawnPowerup();
    }

    // --- Enemy movement ---
    enemies.forEach(e=>{
      const vx = player.x - e.x;
      const vy = player.y - e.y;
      const l = Math.hypot(vx,vy)||1;
      e.x += (vx/l)*e.speed;
      e.y += (vy/l)*e.speed;
    });

    // --- Bullets ---
    bullets = bullets.filter(b=>{
      b.x += b.vx; b.y += b.vy;
      return b.x>-20 && b.x<W+20 && b.y>-20 && b.y<H+20;
    });

    // --- Bullet collisions ---
    bullets = bullets.filter(b=>{
      let alive = true;
      enemies = enemies.filter(e=>{
        const hit = Math.hypot(b.x-e.x, b.y-e.y) < b.size+e.size;
        if(hit){
          addParticles(e.x,e.y,e.color);
          score+=1; scoreEl.textContent=score;
          shake = 6;
          if(!b.pierce) alive=false;
          return false;
        }
        return true;
      });
      if(boss && Math.hypot(b.x-boss.x, b.y-boss.y)<boss.size){
        boss.hp--;
        if(!b.pierce) alive=false;
        if(boss.hp<=0){ addParticles(boss.x,boss.y,boss.color,40); score+=25; boss=null; }
      }
      return alive;
    });

    // --- Player collisions ---
    enemies.forEach(e=>{
      if(Math.hypot(player.x-e.x,player.y-e.y)<player.size+e.size) reset();
    });
    if(boss && Math.hypot(player.x-boss.x,player.y-boss.y)<player.size+boss.size) reset();

    // --- Particles & powerups ---
    particles = particles.filter(p=>{
      p.life-=dt;
      if(p.type==='spark'){ p.x+=p.vx; p.y+=p.vy; }
      if(p.type==='power' && Math.hypot(player.x-p.x,player.y-p.y)<player.size+10){
        power = p.power; powerTimer=6000;
        powerupEl.textContent = `Power-up: ${power==='sword'?'Mulan Sword arc':'AI Laser pierce'}`;
        return false;
      }
      return p.life>0;
    });

    // --- Power effects ---
    if(power){
      powerTimer-=dt;
      if(power==='sword'){
        enemies = enemies.filter(e=>{
          if(Math.hypot(player.x-e.x,player.y-e.y)<player.size+40){
            addParticles(e.x,e.y,'#ffd166');
            score+=1; scoreEl.textContent=score;
            return false;
          }
          return true;
        });
      }
      if(powerTimer<=0){ power=null; powerupEl.textContent='Power-up: none'; }
    }

    // --- Boss spawning ---
    if(!boss && elapsed>45000 && Math.floor(elapsed)%45000<dt){
      const difficulty = Math.min(elapsed/30000,3);
      boss = { x:W/2, y:-80, size:80, hp:50+difficulty*20, maxHp:50+difficulty*20, speed:1.2, color:'#ff4d6d' };
    }
    if(boss){
      const vx = player.x - boss.x;
      const vy = player.y - boss.y;
      const l = Math.hypot(vx,vy)||1;
      boss.x += (vx/l)*boss.speed;
      boss.y += (vy/l)*boss.speed;
    }
  };

  // --- Draw ---
  const draw = () => {
    ctx.save();
    ctx.clearRect(0,0,W,H);
    ctx.translate(rnd(-shake,shake),rnd(-shake,shake));
    shake *= 0.9;

    // Background grid
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Player
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle=player.color;
    ctx.beginPath();
    ctx.roundRect(-player.size/2,-player.size/2,player.size,player.size,6);
    ctx.fill();
    ctx.restore();

    // Bullets
    bullets.forEach(b=>{
      ctx.fillStyle=b.color;
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
      ctx.fill();
    });

    // Enemies
    enemies.forEach(e=>{
      ctx.fillStyle=e.color;
      ctx.beginPath();
      ctx.roundRect(e.x-e.size/2,e.y-e.size/2,e.size,e.size,4);
      ctx.fill();
    });

    // Boss
    if(boss){
      ctx.fillStyle=boss.color;
      ctx.beginPath();
      ctx.arc(boss.x,boss.y,boss.size,0,Math.PI*2);
      ctx.fill();
      // HP bar
      ctx.fillStyle='#000'; ctx.fillRect(boss.x-40,boss.y-boss.size-20,80,6);
      ctx.fillStyle='#ff8bd4'; ctx.fillRect(boss.x-40,boss.y-boss.size-20,80*(boss.hp/boss.maxHp),6);
    }

    // Particles
    particles.forEach(p=>{
      if(p.type==='spark'){ ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,3,3);}
      if(p.type==='power'){
        ctx.strokeStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,12,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=p.color+'99'; ctx.fillRect(p.x-6,p.y-6,12,12);
      }
    });

    ctx.restore();
  };

  // --- Loop ---
  let last=0;
  const loop = (t)=>{
    const dt=t-last; last=t;
    update(dt);
    draw();
    if(running) requestAnimationFrame(loop);
  };

  // --- Reset ---
  const reset = ()=>{
    if(score>highScore){ localStorage.setItem('veylein-highscore',score); highScoreEl.textContent=score; }
    score=0; scoreEl.textContent=score;
    bullets=[]; enemies=[]; particles=[]; boss=null;
    power=null; powerupEl.textContent='Power-up: none';
    elapsed=0; shake=0;
  };

  // --- Controls ---
  canvas.addEventListener('mousemove', (e)=>{
    const rect=canvas.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;
    mouse.y=e.clientY-rect.top;
  });
  canvas.addEventListener('mousedown', ()=>keys['shoot']=true);
  canvas.addEventListener('mouseup', ()=>keys['shoot']=false);

  window.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
  window.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);

  window.startShooter=()=>{
    if(running) return;
    running=true; reset();
    last=performance.now();
    requestAnimationFrame(loop);
  };
  window.stopShooter=()=>{ running=false; };
})();
</script>
