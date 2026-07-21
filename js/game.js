'use strict';

var Juego = (function() {

    // Array de Banderas
    var cartasBase = [
    '🇦🇷', '🇧🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹', '🇵🇹', '🇺🇾',
    '🇬🇧', '🇳🇱', '🇧🇪', '🇭🇷', '🇲🇽', '🇺🇸', '🇨🇦', '🇯🇵',
    '🇰🇷', '🇲🇦'
  ];

  // Función para mezclar las cartas
  function mezclarCartas(tablero) {
    var i, j, temp;
    for (i = tablero.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = tablero[i];
      tablero[i] = tablero[j];
      tablero[j] = temp;
    }
    return tablero;
  }

  return {
    mezclarCartas: mezclarCartas
    };

})();

// Diccionario de niveles de dificultad
var Niveles = {
    facil: 8,
    medio: 10,
    dificil: 18
}


