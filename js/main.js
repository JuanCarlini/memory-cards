'use strict';

// este archivo es el que inicializa todo: espera a que cargue el html, engancha los
// listeners de los botones/formulario, y llama a las funciones de Juego/Validaciones/Sonidos
document.addEventListener('DOMContentLoaded', function () {
  var formInicio = document.getElementById('form-inicio');
  var errorInicio = document.getElementById('error-inicio');
  var pantallainicio = document.getElementById('pantalla-inicio');
  var pantallaJuego = document.getElementById('pantalla-juego');
  var btnReiniciar = document.getElementById('btn-reiniciar');
  var btnJugarDeNuevo = document.getElementById('btn-jugar-de-nuevo');
  var btnSonido = document.getElementById('btn-sonido');

  // muestra el mensaje de error de la pantalla de inicio (sin usar alert)
  function mostrarError(mensaje) {
    errorInicio.textContent = mensaje;
    errorInicio.classList.remove('oculto');
  }

  // valida el nombre y la dificultad elegida antes de dejar arrancar la partida.
  // si algo esta mal, muestra el error y devuelve false para frenar el submit
  function iniciarPartida() {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    var dificultad = document.getElementById('dificultad').value;

    if (!Validaciones.validarNombre(nombre)) {
      mostrarError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }

    // chequeo extra por si algun dia agregan un nivel sin cargar suficientes banderas
    if (!Juego.hayCartasSuficientes(dificultad)) {
      mostrarError('No hay suficientes cartas cargadas para este nivel.');
      return false;
    }

    errorInicio.classList.add('oculto');
    return true;
  }

  // cuando mandan el formulario de inicio: si esta todo bien, esconde la pantalla de
  // inicio, muestra la del juego y arranca la partida
  formInicio.addEventListener('submit', function (evento) {
    var nombre = document.getElementById('nombre-jugador').value.trim();
    evento.preventDefault();
    if (!iniciarPartida()) { return; }
    pantallainicio.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    Juego.iniciarJuego(nombre);
  });

  // ojo: no podemos enganchar Juego.iniciarJuego directo en el addEventListener, porque el
  // click le pasaria el evento como si fuera el nombre del jugador y lo pisaria mal
  // (esto nos paso probando: el nombre quedaba como "[object PointerEvent]")
  function reiniciarPartida() {
    Juego.iniciarJuego();
  }

  // el boton de reiniciar y el de "jugar de nuevo" del modal hacen exactamente lo mismo:
  // vuelven a armar el tablero sin pedir el nombre otra vez
  btnReiniciar.addEventListener('click', reiniciarPartida);
  btnJugarDeNuevo.addEventListener('click', reiniciarPartida);

  // prende/apaga los sonidos y actualiza el texto del boton para que se vea el estado actual
  btnSonido.addEventListener('click', function () {
    var activos = Sonidos.alternarActivos();
    btnSonido.textContent = activos ? '🔊 Sonido activado' : '🔇 Sonido desactivado';
  });
});
