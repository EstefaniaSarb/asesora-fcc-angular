import { Pipe, PipeTransform } from '@angular/core';
import { FormatoFecha, formatearFecha } from '../../core/utils/fechas';

/**
 * Formatea fechas ISO en español de México.
 * Uso: {{ solicitud.fechaHora | fechaAsesoria }} → "lun 12 oct, 10:00 h"
 *      {{ solicitud.fechaHora | fechaAsesoria: 'dia' }} → "12"
 */
@Pipe({ name: 'fechaAsesoria' })
export class FechaAsesoriaPipe implements PipeTransform {
  transform(valor: string | undefined | null, formato: FormatoFecha = 'completa'): string {
    return formatearFecha(valor, formato);
  }
}
