'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var MAIL_DESTINO = 'ramagohlke@gmail.com'; // TODO: cambiar por el mail que quiera usar el grupo
  var formContacto = document.getElementById('form-contacto');
  var errorContacto = document.getElementById('error-contacto');

  function mostrarError(mensaje) {
    errorContacto.textContent = mensaje;
    errorContacto.classList.remove('oculto');
  }

  function validarFormulario(nombre, mail, mensaje) {
    if (!Validaciones.validarNombreContacto(nombre)) {
      mostrarError('El nombre debe ser alfanumérico.');
      return false;
    }
    if (!Validaciones.validarMail(mail)) {
      mostrarError('Ingresá un mail válido.');
      return false;
    }
    if (!Validaciones.validarMensaje(mensaje)) {
      mostrarError('El mensaje debe tener más de 5 caracteres.');
      return false;
    }
    errorContacto.classList.add('oculto');
    return true;
  }

  function enviarMail(nombre, mail, mensaje) {
    var asunto = 'Contacto desde Memotest Mundial 2026 - ' + nombre;
    var cuerpo = 'Nombre: ' + nombre + '\nMail: ' + mail + '\nMensaje: ' + mensaje;
    window.location.href = 'mailto:' + MAIL_DESTINO + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  }

  formContacto.addEventListener('submit', function (evento) {
    var nombre = document.getElementById('nombre-contacto').value.trim();
    var mail = document.getElementById('mail-contacto').value.trim();
    var mensaje = document.getElementById('mensaje-contacto').value.trim();

    evento.preventDefault();

    if (!validarFormulario(nombre, mail, mensaje)) {
      return;
    }

    enviarMail(nombre, mail, mensaje);
  });
});
