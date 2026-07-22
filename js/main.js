'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var formInicio = document.getElementById('form-inicio');
  var errorInicio = document.getElementById('error-inicio');
  var pantallainicio = document.getElementById('pantalla-inicio');
  var pantallaJuego = document.getElementById('pantalla-juego');
  var btnReiniciar = document.getElementById('btn-reiniciar');
  var btnJugarDeNuevo = document.getElementById('btn-jugar-de-nuevo');
  var btnSonido = document.getElementById('btn-sonido');

  function mostrarError(mensaje) {
    errorInicio.textContent = mensaje;
    errorInicio.classList.remove('oculto');
  }

  function iniciarPartida() {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    var dificultad = document.getElementById('dificultad').value;

    if (!Validaciones.validarNombre(nombre)) {
      mostrarError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }

    // chequeo extra por si algun dia agregan un nivel sin cargar suficientes banderas
    if (!Juego.hayCartasSuficientes(dificultad)) {
      mostrarError('No hay suficientes cartas cargadas para este nivel.');
      return false;
    }

    errorInicio.classList.add('oculto');
    return true;
  }

  formInicio.addEventListener('submit', function (evento) {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    evento.preventDefault();
    if (!iniciarPartida()) { return; }
    pantallainicio.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    Juego.iniciarJuego(nombre);
  });

  function manejarReinicio() {
    Juego.iniciarJuego();
  }

  btnReiniciar.addEventListener('click', manejarReinicio);

  btnJugarDeNuevo.addEventListener('click', manejarReinicio);

  // prende/apaga los sonidos y actualiza el texto del boton para que se vea el estado actual
  btnSonido.addEventListener('click', function () {
    var activos = Sonidos.alternarActivos();
    btnSonido.textContent = activos ? '🔊 Sonido activado' : '🔇 Sonido desactivado';
  });
});
