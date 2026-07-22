'use strict';

var Validaciones = (function () {

  var LARGO_MINIMO_NOMBRE = 3;
  var LARGO_MINIMO_MENSAJE = 5;
  var PATRON_ALFANUMERICO = /^[a-zA-Z0-9\s]+$/;
  var PATRON_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validarNombre(nombre) {
    if (nombre.length < LARGO_MINIMO_NOMBRE) {
      return false;
    }
    return true;
  }

  function validarNombreContacto(nombre) {
    if (nombre.length < LARGO_MINIMO_NOMBRE) {
      return false;
    }
    return PATRON_ALFANUMERICO.test(nombre);
  }

  function validarMail(mail) {
    return PATRON_MAIL.test(mail);
  }

  function validarMensaje(mensaje) {
    return mensaje.length > LARGO_MINIMO_MENSAJE;
  }

  return {
    validarNombre: validarNombre,
    validarNombreContacto: validarNombreContacto,
    validarMail: validarMail,
    validarMensaje: validarMensaje
  };

})();
