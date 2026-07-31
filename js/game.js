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

  var temporizadorOcultar = null; // guarda el id del setTimeout que tapa las cartas, para poder cancelarlo si reinician a mitad de camino

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

  // arma el mazo completo para la dificultad elegida: agarra solo los paises que hacen
  // falta, los duplica para tener los pares, y devuelve todo ya mezclado
  function obtenerMazo(dificultad) {
    var cantidadCartas = Niveles[dificultad] || Niveles.facil;
    var paisesUtilizados = paisesBase.slice(0, cantidadCartas);
    var mazo = paisesUtilizados.concat(paisesUtilizados);

    // esto en teoria nunca puede pasar porque siempre duplicamos el mismo array,
    // pero el profe pide chequear que la cantidad de cartas sea par asi que lo dejamos
    if (mazo.length % 2 !== 0) {
      mazo.pop();
    }

    return mezclarCartas(mazo);
  }

  // chequea que tengamos suficientes paises cargados para armar los pares del nivel elegido
  // (hoy con los 3 niveles fijos nunca falla, pero si mañana agregan un nivel mas grande sin
  // cargar mas paises, esto frena el inicio en vez de que el tablero quede raro/incompleto)
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

  // dibuja las cartas del mazo en el tablero. crea un div por carta, todavia boca abajo,
  // y le engancha el click para poder jugarla
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

  // funciones de temporizador

  // arranca el cronometro, sumando un segundo por intervalo. si ya estaba corriendo no hace nada
  function iniciarTemporizador() {
    if (temporizadorActivo) { return; }
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
    consecutivasErradas = 0;

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
    consecutivasEncontradas = 0;

    var multiplicador = obtenerMultiplicadorRacha(consecutivasErradas);
    var penalizacionBase = PENALIZACION_ERROR[dificultadActual] || PENALIZACION_ERROR.facil;
    puntaje -= penalizacionBase * multiplicador;
    if (puntaje < 0) { puntaje = 0; }
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
    } else if (segundosTranscurridos < 30) {
      puntaje += 500;
    }
    mostrarPuntaje();
  }

  // bono si ganaron sin gastar de mas en intentos
  function sumarBonoPorIntentos() {
    var intentosMaximosParaBono = totalPares + 2;
    if (intentos <= intentosMaximosParaBono) {
      puntaje += 500;
    }
    mostrarPuntaje();
  }

  // penalizacion segun el tiempo total que tardaron
  function restarSegundosTranscurridos() {
    puntaje -= segundosTranscurridos;
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

  function mostrarPares() {
    document.getElementById('pares').textContent = 'Pares: ' + paresEncontrados + '/' + totalPares;
  }

  // funciones de manejo de cartas

  // se dispara con cada click en una carta. corta rapido si no corresponde jugarla, sino
  // la revela y, si ya habia otra carta dada vuelta, compara las dos para ver si es un par
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

    intentos++; // cada vez que se comparan dos cartas cuenta como un intento, acierte o no
    mostrarIntentos();

    if (primeraCarta.getAttribute('data-valor') === segundaCarta.getAttribute('data-valor')) {
      sumarEncontradas();
      marcarEncontrada();
    } else {
      errores++;
      mostrarErrores();
      restarError();
      marcarError();
      temporizadorOcultar = setTimeout(ocultarCartas, 800); //esperamos un rato antes de ocultar las cartas de nuevo
    }
  }

  // muestra la cara frontal (la bandera) dando vuelta la carta
  function revelarCarta(carta) {
    carta.classList.add('volteada');
    Sonidos.sonarSeleccionar();
  }

  function marcarError() {
    primeraCarta.classList.add('error');
    segundaCarta.classList.add('error');
  }

  // deja las dos cartas del par definitivamente boca arriba y fija (no se vuelven a tapar),
  // suma el par encontrado y si ya estan todos los pares, termina el juego
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

  // vuelve a tapar las dos cartas que no hicieron par (se llama despues del setTimeout)
  function ocultarCartas() {
    primeraCarta.classList.remove('volteada', 'error');
    segundaCarta.classList.remove('volteada', 'error');
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
    var dificultad = document.getElementById('dificultad').value;

    if (nombre) {
      nombreJugador = nombre;
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
