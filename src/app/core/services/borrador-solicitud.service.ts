import { Injectable, computed, signal } from '@angular/core';
import { Adjunto, Modalidad } from '../models';

/**
 * Borrador de la solicitud que el estudiante arma paso a paso:
 * docente → horario → detalles → confirmación.
 * Vive en un servicio para que el dato sobreviva al cambiar de pantalla.
 */
@Injectable({ providedIn: 'root' })
export class BorradorSolicitudService {
  readonly materia = signal('');
  readonly profesorId = signal('');
  readonly fechaHora = signal('');
  readonly tema = signal('');
  readonly descripcion = signal('');
  readonly modalidad = signal<Modalidad | ''>('');
  readonly adjunto = signal<Adjunto | undefined>(undefined);

  /** Se puede capturar el detalle solo si ya hay docente y horario. */
  readonly listoParaDetalles = computed(() => !!this.profesorId() && !!this.fechaHora());

  iniciar(profesorId: string, materia: string, tema = ''): void {
    if (this.profesorId() !== profesorId) this.fechaHora.set('');
    this.profesorId.set(profesorId);
    this.materia.set(materia);
    if (tema) this.tema.set(tema);
  }

  limpiar(): void {
    this.materia.set('');
    this.profesorId.set('');
    this.fechaHora.set('');
    this.tema.set('');
    this.descripcion.set('');
    this.modalidad.set('');
    this.adjunto.set(undefined);
  }
}
