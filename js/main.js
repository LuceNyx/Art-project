/* =========================================================================
   PUNTO DE ENTRADA · Integrante 1
   Importa e inicia el módulo de cada integrante.
   Este archivo ya está completo: NO debería necesitar cambios.
   Cada módulo se inicia por separado: si uno falla, los demás siguen.
   ========================================================================= */

import { iniciarNavegacion } from './navegacion.js'; // Integrante 1
import { iniciarCotidiano } from './cotidiano.js';   // Integrante 2
import { iniciarVirtual } from './virtual.js';       // Integrante 3
import { iniciarEfectos } from './efectos.js';       // Integrante 4
import { iniciarEstado } from './estado.js';         // Integrante 4

const modulos = [
  ['navegación', iniciarNavegacion],
  ['cotidiano', iniciarCotidiano],
  ['virtual', iniciarVirtual],
  ['efectos', iniciarEfectos],
  ['estado', iniciarEstado],
];

for (const [nombre, iniciar] of modulos) {
  try {
    iniciar();
  } catch (error) {
    console.error(`[Escapismo] Error al iniciar el módulo "${nombre}":`, error);
  }
}
