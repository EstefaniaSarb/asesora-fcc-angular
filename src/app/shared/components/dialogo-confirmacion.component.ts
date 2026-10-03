import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Solicitud } from '../../core/models';
import { FechaAsesoriaPipe } from '../pipes/fecha-asesoria.pipe';

export type TipoConfirmacion = 'cancelar' | 'rechazar' | 'reprogramar' | 'completar' | 'inasistencia';

export interface DatosConfirmacion {
  tipo: TipoConfirmacion;
  solicitud: Solicitud;
  /** Horarios libres del docente (solo para reprogramar). */
  horariosLibres?: string[];
}

export interface ResultadoConfirmacion {
  motivo?: string;
  horario?: string;
}

const TEXTOS: Record<TipoConfirmacion, { titulo: string; descripcion: string; boton: string; icono: string; destructiva: boolean }> = {
  cancelar: {
    titulo: '¿Cancelar esta solicitud?', boton: 'Sí, cancelar solicitud', icono: 'warning', destructiva: true,
    descripcion: 'El horario se liberará y el docente será notificado. Esta acción no se puede deshacer.',
  },
  rechazar: {
    titulo: 'Rechazar solicitud', boton: 'Confirmar rechazo', icono: 'warning', destructiva: true,
    descripcion: 'Indique un motivo claro para que el estudiante sepa cómo continuar.',
  },
  reprogramar: {
    titulo: 'Proponer otro horario', boton: 'Enviar propuesta', icono: 'event_repeat', destructiva: false,
    descripcion: 'La solicitud quedará en espera hasta que el estudiante acepte o rechace el cambio.',
  },
  completar: {
    titulo: '¿Marcar la asesoría como completada?', boton: 'Sí, marcar completada', icono: 'task_alt', destructiva: false,
    descripcion: 'La solicitud pasará al historial y el estudiante recibirá una notificación.',
  },
  inasistencia: {
    titulo: 'Registrar inasistencia', boton: 'Confirmar inasistencia', icono: 'person_off', destructiva: true,
    descripcion: 'Confirme que el estudiante no se presentó. Esta información quedará en el historial.',
  },
};

/**
 * Diálogo de confirmación (MatDialog) para acciones que cambian el estado.
 * Devuelve el motivo o el horario elegido; si se cierra, devuelve undefined.
 */
@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [FormsModule, MatIconModule, FechaAsesoriaPipe],
  template: `<div class="modal" role="document">
    <button type="button" class="modal-close" aria-label="Cerrar" (click)="ref.close()"><mat-icon class="icon">close</mat-icon></button>
    <span [class]="t.destructiva ? 'modal-icon danger' : 'modal-icon'"><mat-icon class="icon icon-lg">{{ t.icono }}</mat-icon></span>
    <h2 id="dialogo-titulo">{{ t.titulo }}</h2>
    <p>{{ t.descripcion }}</p>
    <p class="muted"><strong>{{ datos.solicitud.folio }}</strong> · {{ datos.solicitud.tema }} · {{ datos.solicitud.fechaHora | fechaAsesoria }}</p>

    @if (datos.tipo === 'rechazar') {
      <div class="field" [class.field-error]="intento() && !valido()">
        <label for="motivo">Motivo del rechazo <span aria-hidden="true">*</span></label>
        <textarea id="motivo" rows="3" [ngModel]="motivo()" (ngModelChange)="motivo.set($event)"
          placeholder="Ej. El tema no corresponde a mis materias; le sugiero buscar a la Dra. Navarro."></textarea>
        @if (intento() && !valido()) {
          <span class="error-message" role="alert"><mat-icon class="icon icon-sm">error</mat-icon>Escriba un motivo de al menos 10 caracteres.</span>
        }
      </div>
    }

    @if (datos.tipo === 'reprogramar') {
      <div class="field" [class.field-error]="intento() && !valido()">
        <label for="horario">Nuevo horario <span aria-hidden="true">*</span></label>
        <select id="horario" [ngModel]="horario()" (ngModelChange)="horario.set($event)">
          <option value="" disabled>Seleccione uno de sus horarios libres</option>
          @for (h of datos.horariosLibres ?? []; track h) {
            <option [value]="h">{{ h | fechaAsesoria }}</option>
          }
        </select>
        <small>Solo se muestran horarios libres de su agenda.</small>
        @if (intento() && !valido()) {
          <span class="error-message" role="alert"><mat-icon class="icon icon-sm">error</mat-icon>Seleccione un horario.</span>
        }
      </div>
    }

    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" (click)="ref.close()">Volver</button>
      <button type="button" [class]="t.destructiva ? 'btn btn-danger' : 'btn btn-primary'" (click)="confirmar()">{{ t.boton }}</button>
    </div>
  </div>`,
})
export class DialogoConfirmacionComponent {
  protected readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<DialogoConfirmacionComponent, ResultadoConfirmacion>>(MatDialogRef);
  protected readonly t = TEXTOS[this.datos.tipo];

  protected readonly motivo = signal('');
  protected readonly horario = signal('');
  protected readonly intento = signal(false);

  protected readonly valido = computed(() => {
    if (this.datos.tipo === 'rechazar') return this.motivo().trim().length >= 10;
    if (this.datos.tipo === 'reprogramar') return !!this.horario();
    return true;
  });

  protected confirmar(): void {
    this.intento.set(true);
    if (!this.valido()) return;
    this.ref.close({ motivo: this.motivo().trim(), horario: this.horario() });
  }
}
