'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var btnTema = document.getElementById('btn-tema');
  var CLAVE_TEMA = 'memotest-tema';

  function aplicarTemaGuardado() {
    var temaGuardado = localStorage.getItem(CLAVE_TEMA);
    if (temaGuardado === 'oscuro') {
      document.body.classList.add('tema-oscuro');
      btnTema.textContent = 'Modo claro';
    }
  }

  function alternarTema() {
    var esOscuro = document.body.classList.toggle('tema-oscuro');
    btnTema.textContent = esOscuro ? 'Modo claro' : 'Modo oscuro';
    localStorage.setItem(CLAVE_TEMA, esOscuro ? 'oscuro' : 'claro');
  }

  btnTema.addEventListener('click', alternarTema);
  aplicarTemaGuardado();
});
