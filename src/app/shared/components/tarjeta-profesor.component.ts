import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Profesor } from '../../core/models';
import { textoModalidades } from '../../core/utils/fechas';
import { FechaAsesoriaPipe } from '../pipes/fecha-asesoria.pipe';

@Component({
  selector: 'app-tarjeta-profesor',
  imports: [MatIconModule, FechaAsesoriaPipe],
  template: `<article class="professor-card">
    <div class="avatar avatar-large" [class]="'avatar avatar-large ' + profesor().color" aria-hidden="true">{{ profesor().iniciales }}</div>
    <div class="professor-info">
      <h3>{{ profesor().nombre }}</h3>
      <p class="muted">{{ profesor().materias.join(' · ') }}</p>
      <div class="tags">@for (t of profesor().temas; track t) { <span>{{ t }}</span> }</div>
      <div class="professor-meta">
        <span><mat-icon class="icon icon-sm">{{ profesor().modalidades.length > 1 ? 'devices' : (profesor().modalidades[0] === 'Presencial' ? 'meeting_room' : 'videocam') }}</mat-icon>{{ modalidadTexto() }}</span>
        <span><mat-icon class="icon icon-sm">location_on</mat-icon>{{ profesor().ubicacion }}</span>
      </div>
    </div>
    <div [class]="proximo() ? 'availability' : 'availability unavailable'">
      <span class="eyebrow"><mat-icon class="icon icon-sm">{{ proximo() ? 'event_available' : 'event_busy' }}</mat-icon>Próximo horario libre</span>
      <strong>{{ proximo() ? (proximo() | fechaAsesoria) : 'Sin disponibilidad próxima' }}</strong>
      <button type="button" class="btn btn-primary" [disabled]="!proximo()" (click)="seleccionar.emit()">
        {{ proximo() ? 'Ver disponibilidad' : 'Sin horarios' }}
      </button>
    </div>
  </article>`,
})
export class TarjetaProfesorComponent {
  readonly profesor = input.required<Profesor>();
  readonly proximo = input<string | undefined>();
  readonly seleccionar = output<void>();

  modalidadTexto(): string {
    return textoModalidades(this.profesor().modalidades);
  }
}
