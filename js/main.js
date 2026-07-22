'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var formInicio = document.getElementById('form-inicio');
  var errorInicio = document.getElementById('error-inicio');
  var pantallainicio = document.getElementById('pantalla-inicio');
  var pantallaJuego = document.getElementById('pantalla-juego');
  var btnReiniciar = document.getElementById('btn-reiniciar');
  var btnJugarDeNuevo = document.getElementById('btn-jugar-de-nuevo');

  function mostrarError(mensaje) {
    errorInicio.textContent = mensaje;
    errorInicio.classList.remove('oculto');
  }

  function iniciarPartida() {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    if (!Validaciones.validarNombre(nombre)) {
      mostrarError('El nombre debe tener al menos 3 caracteres.');
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
});
