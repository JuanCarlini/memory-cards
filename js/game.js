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
  var nombreJugador = '';
  var segundosTranscurridos = 0;
  var intervaloTiempo = null;
  var temporizadorActivo = false;

  var PUNTOS_POR_ACIERTO = { facil: 10, medio: 15, dificil: 20 };
  var PENALIZACION_ERROR = 2;

  var paresEncontrados = 0;
  var totalPares = 0;

  var temporizadorOcultar = null; // guarda el id del setTimeout que tapa las cartas, para poder cancelarlo si reinician a mitad de camino

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

  // arma el mazo completo para la dificultad elegida: agarra solo las banderas que hacen
  // falta, las duplica para tener los pares, y devuelve todo ya mezclado
  function obtenerMazo(dificultad) {
    var cantidadCartas = Niveles[dificultad] || Niveles.facil; // Valor por defecto facil
    var banderasUtilizadas = cartasBase.slice(0, cantidadCartas);
    var mazo = banderasUtilizadas.concat(banderasUtilizadas); // Duplicar las cartas para tener los pares

    // esto en teoria nunca puede pasar porque siempre duplicamos el mismo array,
    // pero el profe pide chequear que la cantidad de cartas sea par asi que lo dejamos
    if (mazo.length % 2 !== 0) {
      mazo.pop();
    }

    return mezclarCartas(mazo);
  }

  // chequea que tengamos suficientes banderas cargadas para armar los pares del nivel elegido
  // (hoy con los 3 niveles fijos nunca falla, pero si mañana agregan un nivel mas grande sin
  // cargar mas banderas, esto frena el inicio en vez de que el tablero quede raro/incompleto)
  function hayCartasSuficientes(dificultad) {
    var cantidadNecesaria = Niveles[dificultad] || Niveles.facil;
    return cantidadNecesaria <= cartasBase.length;
  }

  // dibuja las cartas del mazo en el tablero. crea un div por carta, todavia boca abajo
  // (sin texto), y le engancha el click para poder jugarla
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

  // arranca el cronometro, sumando un segundo por intervalo. si ya estaba corriendo no hace nada
  function iniciarTemporizador() {
    if (temporizadorActivo) { return; } // ya está corriendo, no lo reiniciamos con cada clic
    temporizadorActivo = true;
    intervaloTiempo = setInterval(function () {
      segundosTranscurridos++;
      mostrarTiempo();
    }, 1000);
  }

  // frena el cronometro (se usa al ganar y tambien al reiniciar)
  function detenerTemporizador() {
    clearInterval(intervaloTiempo);
    temporizadorActivo = false;
  }

  // pinta el tiempo transcurrido en pantalla
  function mostrarTiempo() {
    document.getElementById('tiempo').textContent = 'Tiempo: ' + segundosTranscurridos;
  }

  // funciones de puntaje

  // suma los puntos de un acierto (varian segun la dificultad) y actualiza la pantalla
  function sumarEncontradas() {
    var puntos = PUNTOS_POR_ACIERTO[dificultadActual] || PUNTOS_POR_ACIERTO.facil;
    puntaje += puntos;
    mostrarPuntaje();
    Sonidos.sonarAcierto();
  }

  // resta la penalizacion por error, sin dejar que el puntaje quede negativo
  function restarError() {
    puntaje -= PENALIZACION_ERROR;
    if (puntaje < 0) { puntaje = 0; } // no puede haber puntaje menor a 0
    mostrarPuntaje();
    Sonidos.sonarError();
  }

  // pinta el puntaje actual en pantalla
  function mostrarPuntaje() {
    document.getElementById('puntaje').textContent = 'Puntaje: ' + puntaje;
  }

  // funciones de manejo de cartas

  // se dispara con cada click en una carta. corta rapido si no corresponde jugarla, sino
  // la revela y, si ya habia otra carta dada vuelta, compara las dos para ver si es un par
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
      temporizadorOcultar = setTimeout(ocultarCartas, 800); //esperamos un rato antes de ocultar las cartas de nuevo
    }
  }

  // muestra el valor de la carta (la banderita) y le pone la clase para que quede boca arriba
  function revelarCarta(carta) {
    carta.textContent = carta.getAttribute('data-valor');
    carta.className = 'carta mostrada';
    Sonidos.sonarSeleccionar();
  }

  // deja las dos cartas del par definitivamente boca arriba y fija (no se vuelven a tapar),
  // suma el par encontrado y si ya estan todos los pares, termina el juego
  function marcarEncontrada() {
    primeraCarta.className = 'carta mostrada';
    segundaCarta.className = 'carta mostrada';

    paresEncontrados++;
    if (paresEncontrados === totalPares) {
      finalizarJuego();
    }
    resetearCartas();
  }

  // vuelve a tapar las dos cartas que no hicieron par (se llama despues del setTimeout)
  function ocultarCartas() {
    primeraCarta.textContent = '';
    segundaCarta.textContent = '';
    primeraCarta.className = 'carta';
    segundaCarta.className = 'carta';
    resetearCartas();
  }

  // limpia las variables del turno actual para poder arrancar el siguiente
  function resetearCartas() {
    primeraCarta = null;
    segundaCarta = null;
    bloqueado = false;
    temporizadorOcultar = null; // ya se uso o ya lo cancelamos, no queda nada pendiente
  }

  // se llama cuando ya se encontraron todos los pares: para el reloj, arma el mensaje
  // final con los datos de la partida y muestra el modal de victoria
  function finalizarJuego() {
    detenerTemporizador();
    var mensaje = document.getElementById('mensaje-victoria');
    // ahora el mensaje incluye jugador y nivel, antes solo mostraba puntos y tiempo
    mensaje.textContent = nombreJugador + ' ganó jugando en nivel ' + dificultadActual +
      '! Puntos: ' + puntaje + ' - Tiempo: ' + segundosTranscurridos + 's';
    document.getElementById('modal-victoria').classList.remove('oculto');
    Sonidos.sonarVictoria();
  }

  // arranca (o reinicia) una partida: deja todo en cero y arma un tablero nuevo para la
  // dificultad elegida. si le pasan un nombre nuevo lo guarda, sino sigue con el que ya habia
  function iniciarJuego(nombre) {
    var dificultad = document.getElementById('dificultad').value; // obtener el valor del select de dificultad

    if (nombre) {
      nombreJugador = nombre; // solo lo pisamos si vino un nombre nuevo (al reiniciar se mantiene el mismo)
    }

    // si reinician justo cuando dos cartas erroneas estaban esperando para taparse, hay que
    // cancelar ese setTimeout viejo, sino termina ejecutandose sobre cartas que ya no existen
    // en el tablero nuevo y tira error (probado a proposito, pasaba antes de este chequeo)
    if (temporizadorOcultar) {
      clearTimeout(temporizadorOcultar);
      temporizadorOcultar = null;
    }

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

  return {
    iniciarJuego: iniciarJuego,
    hayCartasSuficientes: hayCartasSuficientes
  }; // expone iniciarJuego y el chequeo de cartas suficientes, para usarlos desde main.js

})();
