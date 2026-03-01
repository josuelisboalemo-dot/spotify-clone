// Pegando referências do HTML
const simulationArea = document.getElementById('simulationArea');
const tornadoBtn = document.getElementById('tornadoBtn');
const meteorBtn = document.getElementById('meteorBtn');

// Função para criar um tornado
tornadoBtn.addEventListener('click', () => {
  const tornado = document.createElement('div');
  tornado.classList.add('tornado');

  // Posicionamento horizontal aleatório dentro da área
  tornado.style.left = Math.random() * (simulationArea.clientWidth - 50) + 'px';

  // Adiciona tornado na tela
  simulationArea.appendChild(tornado);

  // Remove tornado depois de 5 segundos
  setTimeout(() => tornado.remove(), 5000);
});

// Função para criar um meteoro
meteorBtn.addEventListener('click', () => {
  const meteor = document.createElement('div');
  meteor.classList.add('meteor');

  // Posição horizontal aleatória
  meteor.style.left = Math.random() * (simulationArea.clientWidth - 30) + 'px';

  // Adiciona meteoro na tela
  simulationArea.appendChild(meteor);

  // Remove meteoro após o fim da animação
  meteor.addEventListener('animationend', () => meteor.remove());
});