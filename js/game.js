'use strict';

var Juego = (function () {

  // Array de banderas
  var cartasBase = [
    '🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹', '🇵🇹', '🇺🇾',
    '🇬🇧', '🇳🇱', '🇧🇪', '🇭🇷', '🇲🇽', '🇺🇸', '🇨🇦', '🇯🇵',
    '🇰🇷', '🇲🇦'
  ];

  // Diccionario de niveles de dificultad
  var Niveles = {
    facil: 8,
    medio: 10,
    dificil: 18
  };

  // Función para mezclar las cartas
  function mezclarCartas(mazo) {
    var i, j, temp;
    for (i = mazo.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = mazo[i];
      mazo[i] = mazo[j];
      mazo[j] = temp;
    }
    return mazo;
  }

  function obtenerMazo(dificultad) {
    var cantidadCartas = Niveles[dificultad] || Niveles.facil; // Valor por defecto facil
    var banderasUtilizadas = cartasBase.slice(0, cantidadCartas);
    var mazo = banderasUtilizadas.concat(banderasUtilizadas); // Duplicar las cartas para tener los pares
    return mezclarCartas(mazo);
  }

  function mostrarTablero(mazo) {
    var contenedor = document.getElementById('tablero'); // busca el tablero donde van a estar las cartas
    var i, carta;
    contenedor.innerHTML = ''; // limpia el tablero
    for (i = 0; i < mazo.length; i++) {
      carta = document.createElement('div');
      carta.className = 'carta';
      carta.setAttribute('data-valor', mazo[i]);
      contenedor.appendChild(carta); // insertar div dentro del tablero
    }
  }

  function iniciarJuego() {
    var dificultad = document.getElementById('dificultad').value; // obtener el valor del select de dificultad
    var mazo = obtenerMazo(dificultad);
    mostrarTablero(mazo);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // espera que el HTML esté completamente cargado antes de tocar el DOM
    document.getElementById('btn-reiniciar').addEventListener('click', iniciarJuego);
    iniciarJuego();
  });

  return {
    iniciarJuego: iniciarJuego
  }; // expone iniciarJuego 

})();
