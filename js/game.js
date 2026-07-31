'use strict';

var Juego = (function () {

  var paisesBase = [
    { id: 'argentina', nombre: 'Argentina' },
    { id: 'brasil', nombre: 'Brasil' },
    { id: 'francia', nombre: 'Francia' },
    { id: 'alemania', nombre: 'Alemania' },
    { id: 'espana', nombre: 'España' },
    { id: 'italia', nombre: 'Italia' },
    { id: 'portugal', nombre: 'Portugal' },
    { id: 'uruguay', nombre: 'Uruguay' },
    { id: 'reino-unido', nombre: 'Reino Unido' },
    { id: 'paises-bajos', nombre: 'Países Bajos' },
    { id: 'belgica', nombre: 'Bélgica' },
    { id: 'croacia', nombre: 'Croacia' },
    { id: 'mexico', nombre: 'México' },
    { id: 'estados-unidos', nombre: 'Estados Unidos' },
    { id: 'canada', nombre: 'Canadá' },
    { id: 'japon', nombre: 'Japón' },
    { id: 'corea-del-sur', nombre: 'Corea del Sur' },
    { id: 'marruecos', nombre: 'Marruecos' }
  ];

  var Niveles = {
    facil: 8,
    medio: 10,
    dificil: 18
  };

  var Racha = {
    consecutivoDosSeguidas: 2,
    consecutivoMaximasSeguidas: 3
  };

  var primeraCarta = null;
  var segundaCarta = null;

  var consecutivasEncontradas = 0;
  var consecutivasErradas = 0;

  var historialConsecutivasEncontradas = 0;
  var historialConsecutivasErradas = 0;

  var bloqueado = false;

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

  var temporizadorOcultar = null;

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
    var cantidadCartas = Niveles[dificultad] || Niveles.facil;
    var paisesUtilizados = paisesBase.slice(0, cantidadCartas);
    var mazo = paisesUtilizados.concat(paisesUtilizados);

    if (mazo.length % 2 !== 0) {
      mazo.pop();
    }

    return mezclarCartas(mazo);
  }

  function hayCartasSuficientes(dificultad) {
    var cantidadNecesaria = Niveles[dificultad] || Niveles.facil;
    return cantidadNecesaria <= paisesBase.length;
  }

  function crearCaraDorso() {
    var cara = document.createElement('div');
    cara.className = 'carta-cara carta-dorso';
    return cara;
  }

  function crearCaraFrente(pais) {
    var cara = document.createElement('div');
    var imagen = document.createElement('img');
    cara.className = 'carta-cara carta-frente';
    imagen.src = 'assets/images/flags/' + pais.id + '.svg';
    imagen.alt = 'Bandera de ' + pais.nombre;
    cara.appendChild(imagen);
    return cara;
  }

  function mostrarTablero(mazo) {
    var contenedor = document.getElementById('tablero');
    var i, carta;
    contenedor.setAttribute('data-nivel', dificultadActual);
    contenedor.innerHTML = '';
    for (i = 0; i < mazo.length; i++) {
      carta = document.createElement('div');
      carta.className = 'carta';
      carta.setAttribute('data-valor', mazo[i].id);
      carta.appendChild(crearCaraDorso());
      carta.appendChild(crearCaraFrente(mazo[i]));
      carta.addEventListener('click', function () {
        manejarClickCarta(this);
      });
      contenedor.appendChild(carta);
    }
  }

  function iniciarTemporizador() {
    if (temporizadorActivo) { return; }
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

  function obtenerMultiplicadorRacha(consecutivas) {
    if (consecutivas >= Racha.consecutivoMaximasSeguidas) { return Racha.consecutivoMaximasSeguidas; }
    if (consecutivas >= Racha.consecutivoDosSeguidas) { return Racha.consecutivoDosSeguidas; }
    return 1;
  }

  function sumarEncontradas() {
    consecutivasEncontradas++;
    historialConsecutivasEncontradas++;
    consecutivasErradas = 0;

    var multiplicador = obtenerMultiplicadorRacha(consecutivasEncontradas);
    puntaje += PUNTOS_POR_ACIERTO * multiplicador;
    mostrarPuntaje();
  }

  function restarError() {
    consecutivasErradas++;
    historialConsecutivasErradas++;
    consecutivasEncontradas = 0;

    var multiplicador = obtenerMultiplicadorRacha(consecutivasErradas);
    var penalizacionBase = PENALIZACION_ERROR[dificultadActual] || PENALIZACION_ERROR.facil;
    puntaje -= penalizacionBase * multiplicador;
    if (puntaje < 0) { puntaje = 0; }
    mostrarPuntaje();
  }

  function sumarBonoVictoria() {
    puntaje += BONO_VICTORIA;
    mostrarPuntaje();
  }

  function sumarBonoTiempo() {
    if (segundosTranscurridos < 20) {
      puntaje += 1000;
    } else if (segundosTranscurridos < 30) {
      puntaje += 500;
    }
    mostrarPuntaje();
  }

  function sumarBonoPorIntentos() {
    var intentosMaximosParaBono = totalPares + 2;
    if (intentos <= intentosMaximosParaBono) {
      puntaje += 500;
    }
    mostrarPuntaje();
  }

  function restarSegundosTranscurridos() {
    puntaje -= segundosTranscurridos;
    if (puntaje < 0) { puntaje = 0; }
  }

  function mostrarPuntaje() {
    document.getElementById('puntaje').textContent = 'Puntaje: ' + puntaje;
  }

  function mostrarIntentos() {
    document.getElementById('intentos').textContent = 'Intentos: ' + intentos;
  }

  function mostrarErrores() {
    document.getElementById('errores').textContent = 'Errores: ' + errores;
  }

  function mostrarPares() {
    document.getElementById('pares').textContent = 'Pares: ' + paresEncontrados + '/' + totalPares;
  }

  function manejarClickCarta(carta) {
    if (bloqueado || carta === primeraCarta || carta.classList.contains('volteada')) {
      return;
    }

    iniciarTemporizador();
    revelarCarta(carta);

    if (!primeraCarta) {
      primeraCarta = carta;
      return;
    }

    segundaCarta = carta;
    bloqueado = true;

    intentos++;
    mostrarIntentos();

    if (primeraCarta.getAttribute('data-valor') === segundaCarta.getAttribute('data-valor')) {
      sumarEncontradas();
      marcarEncontrada();
    } else {
      errores++;
      mostrarErrores();
      restarError();
      marcarError();
      temporizadorOcultar = setTimeout(ocultarCartas, 800);
    }
  }

  function revelarCarta(carta) {
    carta.classList.add('volteada');
  }

  function marcarError() {
    primeraCarta.classList.add('error');
    segundaCarta.classList.add('error');
  }

  function marcarEncontrada() {
    primeraCarta.classList.add('encontrada');
    segundaCarta.classList.add('encontrada');

    paresEncontrados++;
    mostrarPares();
    if (paresEncontrados === totalPares) {
      finalizarJuego();
    }

    resetearCartas();
  }

  function ocultarCartas() {
    primeraCarta.classList.remove('volteada', 'error');
    segundaCarta.classList.remove('volteada', 'error');
    resetearCartas();
  }

  function resetearCartas() {
    primeraCarta = null;
    segundaCarta = null;
    bloqueado = false;
    temporizadorOcultar = null;
  }

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
  }

  function iniciarJuego(nombre) {
    var dificultad = document.getElementById('dificultad').value;

    if (nombre) {
      nombreJugador = nombre;
    }

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
    mostrarPares();

    var mazo = obtenerMazo(dificultad);
    mostrarTablero(mazo);
  }

  return {
    iniciarJuego: iniciarJuego,
    hayCartasSuficientes: hayCartasSuficientes,
    detenerJuego: detenerTemporizador
  };

})();
