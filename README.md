# Memotest Mundial 2026

Juego de memoria (memotest) con temática del Mundial de fútbol 2026: hay que encontrar los pares de banderas de países ocultas en el tablero.

Jugalo acá: **https://juancarlini.github.io/memory-cards/**

## Temática

Cartas con las banderas reales de 18 países participantes del Mundial 2026 (Argentina, Brasil, Francia, Alemania, España, Italia, Portugal, Uruguay, Reino Unido, Países Bajos, Bélgica, Croacia, México, Estados Unidos, Canadá, Japón, Corea del Sur y Marruecos).

## Cómo se juega

1. Ingresá tu nombre (mínimo 3 caracteres) y elegí un nivel de dificultad.
2. El tablero se arma con las cartas boca abajo, mezcladas al azar.
3. Hacé click en dos cartas por turno para revelarlas.
   - Si coinciden, quedan descubiertas y suman puntos.
   - Si no coinciden, se vuelven a tapar después de un instante y se resta puntaje.
4. La partida termina cuando se encuentran todos los pares del tablero.
5. Se puede reiniciar la partida o volver a elegir jugador/nivel en cualquier momento, sin recargar la página.

### Niveles de dificultad

| Nivel | Tablero | Cartas | Pares |
|---|---|---|---|
| Fácil | 4x4 | 16 | 8 |
| Medio | 4x5 | 20 | 10 |
| Difícil | 6x6 | 36 | 18 |

A mayor dificultad, mayor penalización por cada error.

## Sistema de puntaje

- **Par correcto:** +100 puntos, multiplicados según la racha de aciertos seguidos (x2 a partir del segundo acierto seguido, x3 a partir del tercero).
- **Error:** se resta una penalización según el nivel (10 / 20 / 30 puntos en fácil / medio / difícil), también multiplicada si hay racha de errores seguidos.
- **Bonus por terminar la partida:** +300 puntos.
- **Bonus por velocidad:** +1000 puntos si se termina en menos de 20 segundos, +500 si se termina en menos de 30.
- **Bonus por pocos intentos:** +500 puntos si se gana usando pocos intentos de más respecto a la cantidad de pares del nivel.
- **Penalización por tiempo:** se resta 1 punto por cada segundo transcurrido.
- El puntaje nunca baja de 0.

## Funcionalidades

- 3 niveles de dificultad con validación de nombre y de dificultad antes de arrancar.
- Tablero generado dinámicamente, con las cartas mezcladas en cada partida.
- Animación de flip 3D en las cartas, con estado visual distinto para carta seleccionada, par encontrado y error.
- Contadores en vivo de puntaje, tiempo, intentos, errores y pares encontrados.
- Botones para reiniciar la partida o cambiar de jugador/nivel sin recargar la página.
- Ranking de partidas guardado en el navegador (LocalStorage), ordenable por puntaje, fecha, duración o nivel, con opción de borrar el historial (confirmación con modal propio).
- Sonidos generados por código (sin archivos de audio externos), con opción para activar o desactivar.
- Modo claro / oscuro, con la preferencia guardada en el navegador.
- Página de contacto con formulario validado (nombre, mail, mensaje) que abre el cliente de mail del usuario.
- Diseño responsive (desktop, tablet y mobile).

## Integrantes

- Juan Carlini
- Marco Semino
- Ramiro Gohlke

## Repositorio

https://github.com/JuanCarlini/memory-cards
