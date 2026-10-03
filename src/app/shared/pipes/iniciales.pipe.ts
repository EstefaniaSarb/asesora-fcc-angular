import { Pipe, PipeTransform } from '@angular/core';
import { iniciales } from '../../core/utils/fechas';

/** Obtiene las iniciales de un nombre: "Daniela Hernández" → "DH". */
@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string | undefined | null): string {
    return nombre ? iniciales(nombre) : '';
  }
}
