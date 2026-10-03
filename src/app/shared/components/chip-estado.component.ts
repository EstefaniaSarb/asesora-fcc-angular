import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EstadoSolicitud } from '../../core/models';

const ICONOS: Record<EstadoSolicitud, string> = {
  Pendiente: 'schedule',
  Confirmada: 'check_circle',
  'Reprogramación propuesta': 'event_repeat',
  Rechazada: 'cancel',
  Cancelada: 'block',
  Completada: 'task_alt',
  Inasistencia: 'person_off',
};

/** Chip de estado: siempre ícono + texto, nunca solo color (WCAG 1.4.1). */
@Component({
  selector: 'app-chip-estado',
  imports: [MatIconModule],
  template: `<span class="status" [class]="'status status-' + clase()">
    <mat-icon class="icon icon-sm">{{ icono() }}</mat-icon>{{ estado() }}
  </span>`,
  host: { style: 'display: contents' },
})
export class ChipEstadoComponent {
  readonly estado = input.required<EstadoSolicitud>();
  protected readonly icono = computed(() => ICONOS[this.estado()]);
  protected readonly clase = computed(() => this.estado().toLowerCase().replaceAll(' ', '-'));
}
