'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var formContacto = document.getElementById('form-contacto');
  var campoNombre = document.getElementById('nombre-contacto');
  var campoMail = document.getElementById('mail-contacto');
  var campoMensaje = document.getElementById('mensaje-contacto');
  var errorNombre = document.getElementById('error-nombre-contacto');
  var errorMail = document.getElementById('error-mail-contacto');
  var errorMensaje = document.getElementById('error-mensaje-contacto');
  var MAIL_DESTINO = 'juanandrescarlini@gmail.com';

  function mostrarError(elementoError, mensaje) {
    elementoError.textContent = mensaje;
    elementoError.classList.remove('oculto');
  }

  function ocultarError(elementoError) {
    elementoError.classList.add('oculto');
  }

  function validarFormulario() {
    var esValido = true;

    if (Validaciones.validarNombreContacto(campoNombre.value.trim())) {
      ocultarError(errorNombre);
    } else {
      mostrarError(errorNombre, 'El nombre debe ser alfanumérico y tener al menos 3 caracteres.');
      esValido = false;
    }

    if (Validaciones.validarMail(campoMail.value.trim())) {
      ocultarError(errorMail);
    } else {
      mostrarError(errorMail, 'Ingresá un mail válido.');
      esValido = false;
    }

    if (Validaciones.validarMensaje(campoMensaje.value.trim())) {
      ocultarError(errorMensaje);
    } else {
      mostrarError(errorMensaje, 'El mensaje debe tener más de 5 caracteres.');
      esValido = false;
    }

    return esValido;
  }

  function enviarContacto(evento) {
    var asunto, cuerpo;
    evento.preventDefault();
    if (!validarFormulario()) { return; }

    asunto = 'Contacto desde Memotest Mundial 2026';
    cuerpo = 'Nombre: ' + campoNombre.value.trim() +
      '\nMail: ' + campoMail.value.trim() +
      '\n\n' + campoMensaje.value.trim();
    window.location.href = 'mailto:' + MAIL_DESTINO +
      '?subject=' + encodeURIComponent(asunto) +
      '&body=' + encodeURIComponent(cuerpo);
  }

  formContacto.addEventListener('submit', enviarContacto);
});
