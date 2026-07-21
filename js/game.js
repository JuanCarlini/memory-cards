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

  // variables de estado 
  var primeraCarta = null;
  var segundaCarta = null;
  var bloqueado = false;

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
      carta.addEventListener('click', function () {
        manejarClickCarta(this);
      });
      contenedor.appendChild(carta); // insertar div dentro del tablero
    }

    function manejarClickCarta(carta) {
        if (bloqueado || carta === primeraCarta || carta.className.indexOf('mostrada') !== -1) // se chekea si la carta es la primera, si l acarta ya esta mostrada o si el tablero esta bloqueado, si es asi, ignora el click
            { return; }                                                 // idenxOf, chekea si la palabra mostrada esta dentro del className de la carta, si es asi, significa que la carta ya fue mostrada y no se puede hacer click sobre ella
        
        revelarCarta(carta);

        if (!primeraCarta){
            primeraCarta = carta;
            return;
        } 

        segundaCarta = carta;
        bloqueado = true;

        if (primeraCarta.getAttribute('data-valor') === segundaCarta.getAttribute('data-valor')) {
            marcarEncontrada();
        } else {
            setTimeout(ocultarCartas, 800); //esperamos un rato antes de ocultar las cartas de nuevo
        }
            

    }

    function revelarCarta(carta) {
        carta.textContent = carta.getAttribute('data-valor');
        carta.className = 'carta mostrada';
    } 

    function marcarEncontrada() {
        primeraCarta.className = 'carta mostrada';
        segundaCarta.className = 'carta mostrada';
        resetearCartas();
    }

    function ocultarCartas() {
        primeraCarta.textContent = '';
        segundaCarta.textContent = '';
        primeraCarta.className = 'carta';
        segundaCarta.className = 'carta';
        resetearCartas();
    }

    function resetearCartas() {
        primeraCarta = null;
        segundaCarta = null;
        bloqueado = false;
    }
  }

  function iniciarJuego() {
    var dificultad = document.getElementById('dificultad').value; // obtener el valor del select de dificultad

    primeraCarta = null;
    segundaCarta = null;
    bloqueado = false;

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
