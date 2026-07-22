'use strict';

var Validaciones = (function () {

  var LARGO_MINIMO_NOMBRE = 3;
  var LARGO_MINIMO_MENSAJE = 5;
  var REGEX_ALFANUMERICO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
  var REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // nombre del jugador para arrancar una partida: solo pide un largo minimo
  function validarNombre(nombre) {
    if (nombre.length < LARGO_MINIMO_NOMBRE) {
      return false;
    }
    return true;
  }

  // nombre del formulario de contacto: no puede estar vacio y tiene que ser alfanumerico
  // (letras, numeros y espacios nomas, nada de simbolos raros)
  function validarNombreContacto(nombre) {
    if (nombre.length === 0) {
      return false;
    }
    return REGEX_ALFANUMERICO.test(nombre);
  }

  // formato basico de mail: algo@algo.algo. no es perfecto pero alcanza para el TP
  function validarMail(mail) {
    return REGEX_MAIL.test(mail);
  }

  // el mensaje de contacto tiene que tener mas de 5 caracteres
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
