'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var formInicio = document.getElementById('form-inicio');
  var errorInicio = document.getElementById('error-inicio');
  var pantallainicio = document.getElementById('pantalla-inicio');
  var pantallaJuego = document.getElementById('pantalla-juego');
  var btnReiniciar = document.getElementById('btn-reiniciar');
  var btnJugarDeNuevo = document.getElementById('btn-jugar-de-nuevo');
  var btnCambiarJugador = document.getElementById('btn-cambiar-jugador');

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

    if (!Juego.hayCartasSuficientes(dificultad)) {
      mostrarError('No hay suficientes cartas cargadas para este nivel.');
      return false;
    }

    errorInicio.classList.add('oculto');
    return true;
  }

  function manejarReinicio() {
    Juego.iniciarJuego();
  }

  function volverAInicio() {
    Juego.detenerJuego();
    pantallaJuego.classList.add('oculto');
    pantallainicio.classList.remove('oculto');
  }

  formInicio.addEventListener('submit', function (evento) {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    evento.preventDefault();
    if (!iniciarPartida()) { return; }
    pantallainicio.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    Juego.iniciarJuego(nombre);
  });

  btnReiniciar.addEventListener('click', manejarReinicio);
  btnJugarDeNuevo.addEventListener('click', manejarReinicio);
  btnCambiarJugador.addEventListener('click', volverAInicio);
});
