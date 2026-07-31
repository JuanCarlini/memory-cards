'use strict';

// modulo de sonidos. en vez de bajar archivos de audio de internet (que siempre tiene el tema
// de los derechos y de que se corte el link) armamos los sonidos con el Web Audio API, osea
// que el navegador genera el "beep" al toque, sin depender de ningun archivo externo
var Sonidos = (function () {

  var activos = true; // si esta en false no suena nada, lo cambia alternarActivos()
  var contextoAudio = null; // se crea recien la primera vez que hace falta un sonido

  // devuelve el AudioContext, creandolo si todavia no existe. hay que hacerlo asi (perezoso)
  // porque chrome no deja arrancar audio antes de que el usuario haga click en algo de la pagina
  function obtenerContexto() {
    if (!contextoAudio) {
      contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    return contextoAudio;
  }

  // reproduce un tono simple (una nota) con la frecuencia y duracion que le pasemos
  function reproducirTono(frecuencia, duracionMs) {
    var contexto, oscilador, volumen;

    if (!activos) {
      return;
    }

    contexto = obtenerContexto();
    oscilador = contexto.createOscillator();
    volumen = contexto.createGain();

    oscilador.type = 'sine';
    oscilador.frequency.value = frecuencia;
    volumen.gain.value = 0.15; // volumen bajito para que no moleste

    oscilador.connect(volumen);
    volumen.connect(contexto.destination);

    oscilador.start();
    oscilador.stop(contexto.currentTime + duracionMs / 1000);
  }

  // sonidito cortito y agudo para cuando se da vuelta una carta
  function sonarSeleccionar() {
    reproducirTono(440, 100);
  }

  // dos notas cortas ascendentes para cuando encuentran un par
  function sonarAcierto() {
    reproducirTono(523, 120);
    setTimeout(function () {
      reproducirTono(659, 150);
    }, 120);
  }

  // tono grave y mas largo para cuando se equivocan
  function sonarError() {
    reproducirTono(180, 250);
  }

  // arpegio de 3 notas para cuando ganan la partida
  function sonarVictoria() {
    reproducirTono(523, 150);
    setTimeout(function () {
      reproducirTono(659, 150);
    }, 150);
    setTimeout(function () {
      reproducirTono(784, 300);
    }, 300);
  }

  // prende o apaga los sonidos y devuelve como quedo, lo usa main.js para el boton
  function alternarActivos() {
    activos = !activos;
    return activos;
  }

  return {
    sonarSeleccionar: sonarSeleccionar,
    sonarAcierto: sonarAcierto,
    sonarError: sonarError,
    sonarVictoria: sonarVictoria,
    alternarActivos: alternarActivos
  };

})();
