:root {
  --glass-bg: rgba(255,255,255,0.05);
  --glass-border: rgba(255,255,255,0.18);
  --gradient-start: #00fff0;
  --gradient-end: #ff00ff;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', sans-serif;
  background: #0a0a0a;
  color: #fff;
  overflow-x: hidden;
}

canvas#gradient-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
}

.container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding: 50px 20px;
  justify-content: center;
}

.card {
  flex: 1 1 320px;
  max-width: 520px;
  padding: 30px;
  border-radius: 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px) saturate(160%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.55);
  transition: 0.35s ease;
}

.card:hover {
  transform: translateY(-10px);
  border-color: rgba(255,0,255,0.4);
  box-shadow: 0 20px 55px rgba(255,0,255,0.35), 0 12px 45px rgba(0,255,255,0.3);
}

.profile-img {
  width: 160px;
  border-radius: 50%;
  display: block;
  margin: 0 auto 22px;
  border: 4px solid rgba(0,255,255,0.7);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.07) rotate(2deg);
  box-shadow: 0 0 22px var(--gradient-start), 0 0 32px var(--gradient-end);
}

.links {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
}

.links a {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.15);
  color: inherit;
  font-weight: 500;
  transition: 0.3s ease;
}

.links a:hover {
  transform: scale(1.06);
  box-shadow: 0 0 14px var(--gradient-start), 0 0 22px var(--gradient-end);
}

.links img {
  width: 32px;
  border-radius: 6px;
}

h2 {
  font-family: 'Orbitron', sans-serif;
  color: var(--gradient-start);
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.gradient-text {
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

button#changeGradient {
  padding: 10px 18px;
  margin-top: 12px;
  border-radius: 12px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
  border: none;
  color: #0a0a0a;
  transition: 0.3s ease;
}

button#changeGradient:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 900px) {
  .container {
    flex-direction: column;
    align-items: center;
  }
  .links {
    grid-template-columns: repeat(auto-fill, minmax(120px,1fr));
  }
}
