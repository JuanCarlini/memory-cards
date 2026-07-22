'use strict';

var Validaciones = (function () {

  var LARGO_MINIMO_NOMBRE = 3;
  var LARGO_MINIMO_MENSAJE = 5;
  var REGEX_ALFANUMERICO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
  var REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validarNombre(nombre) {
    if (nombre.length < LARGO_MINIMO_NOMBRE) {
      return false;
    }
    return true;
  }

  function validarNombreContacto(nombre) {
    if (nombre.length === 0) {
      return false;
    }
    return REGEX_ALFANUMERICO.test(nombre);
  }

  function validarMail(mail) {
    return REGEX_MAIL.test(mail);
  }

  function validarMensaje(mensaje) {
    if (mensaje.length <= LARGO_MINIMO_MENSAJE) {
      return false;
    }
    return true;
  }

  return {
    validarNombre: validarNombre,
    validarNombreContacto: validarNombreContacto,
    validarMail: validarMail,
    validarMensaje: validarMensaje
  };

})();
