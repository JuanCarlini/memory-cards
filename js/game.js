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

  var Racha = {
    consecutivoDosSeguidas: 2,
    consecutivoMaximasSeguidas: 3,
  }

  // variables de estado
  var primeraCarta = null;
  var segundaCarta = null;

  var consecutivasEncontradas = 0;
  var consecutivasErradas = 0;

  var bloqueado = false;

  // variables de puntajes
  var puntaje = 0;
  var dificultadActual = 'facil';
  var nombreJugador = '';
  var segundosTranscurridos = 0;
  var intervaloTiempo = null;
  var temporizadorActivo = false;

  var PUNTOS_POR_ACIERTO = 100;
  var BONO_VICTORIA = 300;
  var PENALIZACION_ERROR = { facil: 10, medio: 20, dificil: 30 };

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

  function obtenerMultiplicadorRacha(consecutivas) {
    if (consecutivas >= Racha.consecutivoMaximasSeguidas) { return Racha.consecutivoMaximasSeguidas; }
    if (consecutivas >= Racha.consecutivoDosSeguidas) { return Racha.consecutivoDosSeguidas; }
    return 1;
  }

  function sumarEncontradas() {
    consecutivasEncontradas++;
    consecutivasErradas = 0; // un acierto corta cualquier racha de errores

    var multiplicador = obtenerMultiplicadorRacha(consecutivasEncontradas);
    puntaje += PUNTOS_POR_ACIERTO * multiplicador;
    mostrarPuntaje();
  }

  function restarError() {
    consecutivasErradas++;
    consecutivasEncontradas = 0; // un error corta cualquier racha de aciertos

    var multiplicador = obtenerMultiplicadorRacha(consecutivasErradas);
    var penalizacionBase = PENALIZACION_ERROR[dificultadActual] || PENALIZACION_ERROR.facil;
    puntaje -= penalizacionBase * multiplicador;
    if (puntaje < 0) { puntaje = 0; } // no puede haber puntaje menor a 0
    mostrarPuntaje();
  }

  function sumarBonoVictoria() {
    puntaje += BONO_VICTORIA;
    mostrarPuntaje();
  }

  function restarSegundosTranscurridos() {
    puntaje -= segundosTranscurridos; //restamos los segundos transcurridos, pero validamos que no sea menor a 0
    if (puntaje < 0) { puntaje = 0; }
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
    sumarBonoVictoria();
    restarSegundosTranscurridos();

    var mensaje = document.getElementById('mensaje-victoria');
    // ahora el mensaje incluye jugador y nivel, antes solo mostraba puntos y tiempo
    mensaje.textContent = nombreJugador + ' ganó jugando en nivel ' + dificultadActual +
      '! Puntos: ' + puntaje + ' - Tiempo: ' + segundosTranscurridos + 's';
    document.getElementById('modal-victoria').classList.remove('oculto');
  }

  function iniciarJuego(nombre) {
    var dificultad = document.getElementById('dificultad').value; // obtener el valor del select de dificultad

    if (nombre) {
      nombreJugador = nombre; // solo lo pisamos si vino un nombre nuevo (al reiniciar se mantiene el mismo)
    }

    dificultadActual = dificultad;
    totalPares = Niveles[dificultadActual] || Niveles.facil;
    paresEncontrados = 0;

    primeraCarta = null;
    segundaCarta = null;

    consecutivasEncontradas = 0;
    consecutivasErradas = 0;

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

  return {
    iniciarJuego: iniciarJuego
  }; // expone iniciarJuego

})();
