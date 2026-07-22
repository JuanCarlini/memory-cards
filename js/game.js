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

  // variables de puntajes
  var puntaje = 0;
  var dificultadActual = 'facil';
  var segundosTranscurridos = 0;
  var intervaloTiempo = null;
  var temporizadorActivo = false;

  var PUNTOS_POR_ACIERTO = { facil: 10, medio: 15, dificil: 20 };
  var PENALIZACION_ERROR = 2;

  var paresEncontrados = 0;
  var totalPares = 0;

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
  }

  // funciones de temporizador
  function iniciarTemporizador() {
    if (temporizadorActivo) { return; } // ya está corriendo, no lo reiniciamos con cada clic
    temporizadorActivo = true;
    intervaloTiempo = setInterval(function () {
      segundosTranscurridos++;
      mostrarTiempo();
    }, 1000);
  }
  function detenerTemporizador() {
    clearInterval(intervaloTiempo);
    temporizadorActivo = false;
  }

  function mostrarTiempo() {
    document.getElementById('tiempo').textContent = 'Tiempo: ' + segundosTranscurridos;
  }

  // funciones de puntaje

  function sumarEncontradas() {
    var puntos = PUNTOS_POR_ACIERTO[dificultadActual] || PUNTOS_POR_ACIERTO.facil;
    puntaje += puntos;
    mostrarPuntaje();
  }

  function restarError() {
    puntaje -= PENALIZACION_ERROR;
    if (puntaje < 0) { puntaje = 0; } // no puede haber puntaje menor a 0
    mostrarPuntaje();
  }

  function mostrarPuntaje() {
    document.getElementById('puntaje').textContent = 'Puntaje: ' + puntaje;
  }

  // funciones de manejo de cartas

  function manejarClickCarta(carta) {
    if (bloqueado || carta === primeraCarta || carta.className.indexOf('mostrada') !== -1) // se chekea si la carta es la primera, si l acarta ya esta mostrada o si el tablero esta bloqueado, si es asi, ignora el click
      { return; }                                                 // idenxOf, chekea si la palabra mostrada esta dentro del className de la carta, si es asi, significa que la carta ya fue mostrada y no se puede hacer click sobre ella

    iniciarTemporizador(); // inicia el temporizador si no estaba activo

    revelarCarta(carta);

    if (!primeraCarta) {
      primeraCarta = carta;
      return;
    }

    segundaCarta = carta;
    bloqueado = true;

    if (primeraCarta.getAttribute('data-valor') === segundaCarta.getAttribute('data-valor')) {
      sumarEncontradas();
      marcarEncontrada();
    } else {
      restarError();
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
    
    paresEncontrados++;
    if (paresEncontrados === totalPares) {
      finalizarJuego();
    }
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

  function finalizarJuego() {
    detenerTemporizador();
    var mensaje = document.getElementById('mensaje-victoria');
    mensaje.textContent = 'Ganaste! puntos: ' + puntaje + ' - Tiempo: ' + segundosTranscurridos + 's'; // armamos mensaje ejemplo Ganaste! puntos: 50 - Tiempo: 30s
    document.getElementById('modal-victoria').classList.remove('oculto');
  }

  function iniciarJuego() {
    var dificultad = document.getElementById('dificultad').value; // obtener el valor del select de dificultad

    dificultadActual = dificultad;
    totalPares = Niveles[dificultadActual] || Niveles.facil;
    paresEncontrados = 0;

    primeraCarta = null;
    segundaCarta = null;
    bloqueado = false;

    puntaje = 0;
    segundosTranscurridos = 0;

    document.getElementById('modal-victoria').classList.add('oculto');
    detenerTemporizador();
    mostrarPuntaje();
    mostrarTiempo();

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
