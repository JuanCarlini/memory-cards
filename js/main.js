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
    // reemplazar chequeo inline por Validaciones.validarNombre cuando esté listo
    var nombre = document.getElementById('nombre-jugador').value.trim();
    if (nombre.length < 3) {
      mostrarError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }
    errorInicio.classList.add('oculto');
    return true;
  }

  formInicio.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (!iniciarPartida()) { return; }
    pantallainicio.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    // pasar nombre del jugador a Juego.iniciarJuego() cuando se le pueda pasar a la funcion
    Juego.iniciarJuego();
  });

  btnReiniciar.addEventListener('click', Juego.iniciarJuego);

  btnJugarDeNuevo.addEventListener('click', Juego.iniciarJuego);
});
