'use strict';

var Validaciones = (function () {

  var LARGO_MINIMO_NOMBRE = 3;

  function validarNombre(nombre) {
    if (nombre.length < LARGO_MINIMO_NOMBRE) {
      return false;
    }
    return true;
  }

  return {
    validarNombre: validarNombre
  };

})();
