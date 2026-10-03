import { Injectable } from '@angular/core';
import { FECHA_REFERENCIA } from '../data/datos-simulados';
import { aFecha, aIso } from '../utils/fechas';

/**
 * Reloj del prototipo. Fija el "hoy" en una fecha de referencia para que
 * la demostración sea siempre igual, y avanza con el tiempo real
 * transcurrido desde que se abrió la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class RelojService {
  private readonly inicio = Date.now();
  readonly hoy = FECHA_REFERENCIA;

  ahora(): string {
    const f = aFecha(FECHA_REFERENCIA);
    f.setTime(f.getTime() + (Date.now() - this.inicio));
    return aIso(f);
  }
}
