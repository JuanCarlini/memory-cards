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

  var historialConsecutivasEncontradas = 0;
  var historialConsecutivasErradas = 0;

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
  var intentos = 0;
  var errores = 0;

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

  // calcula el multiplicador de puntos segun la racha de aciertos o errores seguidos
  function obtenerMultiplicadorRacha(consecutivas) {
    if (consecutivas >= Racha.consecutivoMaximasSeguidas) { return Racha.consecutivoMaximasSeguidas; }
    if (consecutivas >= Racha.consecutivoDosSeguidas) { return Racha.consecutivoDosSeguidas; }
    return 1;
  }

  // suma los puntos de un acierto, multiplicados segun la racha de aciertos seguidos
  function sumarEncontradas() {
    consecutivasEncontradas++;
    historialConsecutivasEncontradas++;
    consecutivasErradas = 0; // un acierto corta cualquier racha de errores

    var multiplicador = obtenerMultiplicadorRacha(consecutivasEncontradas);
    puntaje += PUNTOS_POR_ACIERTO * multiplicador;
    mostrarPuntaje();
    Sonidos.sonarAcierto();
  }

  // resta la penalizacion por error (varia segun la dificultad y la racha de errores),
  // sin dejar que el puntaje quede negativo
  function restarError() {
    consecutivasErradas++;
    historialConsecutivasErradas++;
    consecutivasEncontradas = 0; // un error corta cualquier racha de aciertos

    var multiplicador = obtenerMultiplicadorRacha(consecutivasErradas);
    var penalizacionBase = PENALIZACION_ERROR[dificultadActual] || PENALIZACION_ERROR.facil;
    puntaje -= penalizacionBase * multiplicador;
    if (puntaje < 0) { puntaje = 0; } // no puede haber puntaje menor a 0
    mostrarPuntaje();
    Sonidos.sonarError();
  }

  // bono fijo por terminar la partida
  function sumarBonoVictoria() {
    puntaje += BONO_VICTORIA;
    mostrarPuntaje();
  }

  // bono extra si terminaron rapido
  function sumarBonoTiempo() {
    if (segundosTranscurridos < 20) {
      puntaje += 1000;
    }
    else if (segundosTranscurridos < 30) {
      puntaje += 500;
    }
    mostrarPuntaje();
  }

  // bono si ganaron sin gastar de mas en intentos
  function sumarBonoPorIntentos() {
    var intentosMaximosParaBono = totalPares + 2; // usamos la cantidad de pares del nivel actual y agregamos un margen

    if (intentos <= intentosMaximosParaBono) {
      puntaje += 500; // si el jugador gana con menos intentos se le da un bono
    }
    mostrarPuntaje();
  }

  // penalizacion segun el tiempo total que tardaron
  function restarSegundosTranscurridos() {
    puntaje -= segundosTranscurridos; //restamos los segundos transcurridos, pero validamos que no sea menor a 0
    if (puntaje < 0) { puntaje = 0; }
  }

  // pinta el puntaje actual en pantalla
  function mostrarPuntaje() {
    document.getElementById('puntaje').textContent = 'Puntaje: ' + puntaje;
  }

  // pinta la cantidad de intentos en pantalla
  function mostrarIntentos() {
    document.getElementById('intentos').textContent = 'Intentos: ' + intentos;
  }

  // pinta la cantidad de errores en pantalla
  function mostrarErrores() {
    document.getElementById('errores').textContent = 'Errores: ' + errores;
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

    intentos++; // cada vez que se comparan dos cartas cuenta como un intento, acierte o no
    mostrarIntentos();

    if (primeraCarta.getAttribute('data-valor') === segundaCarta.getAttribute('data-valor')) {
      sumarEncontradas();
      marcarEncontrada();
    } else {
      errores++;
      mostrarErrores();
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

  // se llama cuando ya se encontraron todos los pares: para el reloj, suma los bonos finales,
  // arma el mensaje con los datos de la partida, la guarda en el ranking y muestra el modal
  function finalizarJuego() {
    detenerTemporizador();
    sumarBonoVictoria();
    restarSegundosTranscurridos();
    sumarBonoTiempo();
    sumarBonoPorIntentos();

    historialConsecutivasEncontradas = 0;
    historialConsecutivasErradas = 0;

    var mensaje = document.getElementById('mensaje-victoria');
    mensaje.textContent = nombreJugador + ' ganó jugando en nivel ' + dificultadActual +
      '! Puntos: ' + puntaje + ' - Intentos: ' + intentos + ' - Errores: ' + errores +
      ' - Tiempo: ' + segundosTranscurridos + 's';
    document.getElementById('modal-victoria').classList.remove('oculto');
    Sonidos.sonarVictoria();

    // guardamos esta partida en el historial del ranking (localStorage)
    Storage.guardarResultado({
      nombre: nombreJugador,
      puntaje: puntaje,
      nivel: dificultadActual,
      intentos: intentos,
      errores: errores,
      duracionSegundos: segundosTranscurridos,
      fecha: new Date().toISOString()
    });
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

    consecutivasEncontradas = 0;
    consecutivasErradas = 0;
    historialConsecutivasEncontradas = 0;
    historialConsecutivasErradas = 0;

    bloqueado = false;

    puntaje = 0;
    segundosTranscurridos = 0;
    intentos = 0;
    errores = 0;

    document.getElementById('modal-victoria').classList.add('oculto');
    detenerTemporizador();
    mostrarPuntaje();
    mostrarTiempo();
    mostrarIntentos();
    mostrarErrores();

    var mazo = obtenerMazo(dificultad);
    mostrarTablero(mazo);
  }

  return {
    iniciarJuego: iniciarJuego,
    hayCartasSuficientes: hayCartasSuficientes
  }; // expone iniciarJuego y el chequeo de cartas suficientes, para usarlos desde main.js

})();
