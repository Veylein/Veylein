// Main interactions: entrance transition and game reveal
const entrance = document.getElementById('entrance');
const main = document.getElementById('main');
const egg = document.querySelector('.easter-egg');
const gamePanel = document.getElementById('game-panel');
const closeGameBtn = document.getElementById('close-game');

entrance.addEventListener('click', () => {
  entrance.classList.add('hidden');
  main.classList.remove('hidden');
});

egg.addEventListener('click', () => {
  gamePanel.classList.remove('hidden');
  window.startShooter?.();
});

closeGameBtn.addEventListener('click', () => {
  gamePanel.classList.add('hidden');
  window.stopShooter?.();
});
