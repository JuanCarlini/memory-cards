'use strict';

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn-reiniciar').addEventListener('click', Juego.iniciarJuego);
  document.getElementById('dificultad').addEventListener('change', Juego.iniciarJuego);
  Juego.iniciarJuego();
});
