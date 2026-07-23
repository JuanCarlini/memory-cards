'use strict';

// maneja el modal del ranking: dibuja la tabla con los resultados guardados, el orden
// elegido, y el borrado del historial con su propio modal de confirmacion (nada de confirm())
document.addEventListener('DOMContentLoaded', function () {
  var btnRanking = document.getElementById('btn-ranking');
  var btnVerRankingVictoria = document.getElementById('btn-ver-ranking-victoria'); // el que esta adentro del modal de victoria
  var modalRanking = document.getElementById('modal-ranking');
  var btnCerrarRanking = document.getElementById('btn-cerrar-ranking');
  var selectOrden = document.getElementById('orden-ranking');
  var tabla = document.getElementById('tabla-ranking');
  var cuerpoTabla = document.getElementById('cuerpo-tabla-ranking');
  var rankingVacio = document.getElementById('ranking-vacio');
  var btnBorrarRanking = document.getElementById('btn-borrar-ranking');
  var modalConfirmarBorrado = document.getElementById('modal-confirmar-borrado');
  var btnConfirmarBorrado = document.getElementById('btn-confirmar-borrado');
  var btnCancelarBorrado = document.getElementById('btn-cancelar-borrado');

  var NOMBRES_NIVEL = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };

  // pasa los segundos totales a formato "m:ss", mas facil de leer que un numero suelto
  function formatearDuracion(segundos) {
    var minutos = Math.floor(segundos / 60);
    var segundosRestantes = segundos % 60;
    if (segundosRestantes < 10) {
      segundosRestantes = '0' + segundosRestantes;
    }
    return minutos + ':' + segundosRestantes;
  }

  // arma la fila <tr> de un resultado. usamos textContent en vez de innerHTML para no
  // meter el nombre del jugador directo como html (por las dudas que pongan algo raro)
  function crearFila(resultado) {
    var fila = document.createElement('tr');
    var valores = [
      resultado.nombre,
      resultado.puntaje,
      NOMBRES_NIVEL[resultado.nivel] || resultado.nivel,
      resultado.intentos,
      resultado.errores,
      formatearDuracion(resultado.duracionSegundos),
      new Date(resultado.fecha).toLocaleString()
    ];
    var i, celda;

    for (i = 0; i < valores.length; i++) {
      celda = document.createElement('td');
      celda.textContent = valores[i];
      fila.appendChild(celda);
    }

    return fila;
  }

  // vuelve a dibujar toda la tabla con los datos mas actualizados, ordenados
  // segun lo que este elegido en el select
  function dibujarRanking() {
    var resultados = Storage.obtenerResultados();
    var ordenados = Storage.ordenarResultados(resultados, selectOrden.value);
    var i;

    cuerpoTabla.innerHTML = ''; // limpiamos la tabla antes de volver a dibujarla

    if (ordenados.length === 0) {
      tabla.classList.add('oculto');
      rankingVacio.classList.remove('oculto');
      return;
    }

    tabla.classList.remove('oculto');
    rankingVacio.classList.add('oculto');

    for (i = 0; i < ordenados.length; i++) {
      cuerpoTabla.appendChild(crearFila(ordenados[i]));
    }
  }

  // abre el modal del ranking, ya dibujado con los datos mas recientes
  function abrirRanking() {
    dibujarRanking();
    modalRanking.classList.remove('oculto');
  }

  // cierra el modal del ranking
  function cerrarRanking() {
    modalRanking.classList.add('oculto');
  }

  // en vez de usar el confirm() del navegador, abrimos nuestro propio modal para preguntar
  function pedirConfirmacionBorrado() {
    modalConfirmarBorrado.classList.remove('oculto');
  }

  // confirmaron que quieren borrar: borramos de verdad y refrescamos la tabla
  function confirmarBorrado() {
    Storage.borrarResultados();
    modalConfirmarBorrado.classList.add('oculto');
    dibujarRanking();
  }

  // se arrepintieron: cerramos el modal de confirmacion sin tocar el historial
  function cancelarBorrado() {
    modalConfirmarBorrado.classList.add('oculto');
  }

  btnRanking.addEventListener('click', abrirRanking);
  btnVerRankingVictoria.addEventListener('click', abrirRanking); // asi se puede ver el ranking sin tener que reiniciar primero
  btnCerrarRanking.addEventListener('click', cerrarRanking);
  selectOrden.addEventListener('change', dibujarRanking);
  btnBorrarRanking.addEventListener('click', pedirConfirmacionBorrado);
  btnConfirmarBorrado.addEventListener('click', confirmarBorrado);
  btnCancelarBorrado.addEventListener('click', cancelarBorrado);
});
