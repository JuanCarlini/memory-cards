'use strict';

// modulo que guarda y lee el historial de partidas usando el localStorage del navegador
var Storage = (function () {

  var CLAVE_RANKING = 'memotestRanking';

  // lee el ranking guardado. si todavia no jugaron ninguna partida, devuelve un array vacio
  function obtenerResultados() {
    var datosGuardados = localStorage.getItem(CLAVE_RANKING);
    if (!datosGuardados) {
      return [];
    }
    return JSON.parse(datosGuardados);
  }

  // agrega un resultado nuevo al final del historial y lo guarda de nuevo en el localStorage
  function guardarResultado(resultado) {
    var resultados = obtenerResultados();
    resultados.push(resultado);
    localStorage.setItem(CLAVE_RANKING, JSON.stringify(resultados));
  }

  // borra todo el historial de partidas
  function borrarResultados() {
    localStorage.removeItem(CLAVE_RANKING);
  }

  // le pone un numero a cada nivel para poder compararlos al ordenar (dificil pesa mas)
  function valorNivel(nivel) {
    var valores = { facil: 1, medio: 2, dificil: 3 };
    return valores[nivel] || 0;
  }

  // devuelve una copia del array de resultados, ordenada segun el criterio elegido.
  // usamos una copia para no revolver el array original que esta guardado
  function ordenarResultados(resultados, criterio) {
    var copia = resultados.slice();

    copia.sort(function (a, b) {
      if (criterio === 'fecha') {
        return new Date(b.fecha) - new Date(a.fecha); // la mas reciente primero
      }
      if (criterio === 'duracion') {
        return a.duracionSegundos - b.duracionSegundos; // la mas rapida primero
      }
      if (criterio === 'nivel') {
        return valorNivel(b.nivel) - valorNivel(a.nivel); // el nivel mas dificil primero
      }
      return b.puntaje - a.puntaje; // orden por defecto: mas puntos primero
    });

    return copia;
  }

  return {
    obtenerResultados: obtenerResultados,
    guardarResultado: guardarResultado,
    borrarResultados: borrarResultados,
    ordenarResultados: ordenarResultados
  };

})();
