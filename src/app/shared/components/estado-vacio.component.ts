import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Estado vacío reutilizable con acción opcional. */
@Component({
  selector: 'app-estado-vacio',
  imports: [MatIconModule],
  template: `<div [class]="compacto() ? 'empty-state compact' : 'empty-state card'" [attr.role]="rol()">
    <span><mat-icon class="icon icon-lg">{{ icono() }}</mat-icon></span>
    <h2>{{ titulo() }}</h2>
    <p>{{ texto() }}</p>
    @if (accion()) {
      <button type="button" class="btn btn-secondary" (click)="accionar.emit()">{{ accion() }}</button>
    }
    <ng-content />
  </div>`,
})
export class EstadoVacioComponent {
  readonly icono = input('info');
  readonly titulo = input.required<string>();
  readonly texto = input('');
  readonly accion = input<string>();
  readonly compacto = input(false);
  readonly rol = input<string | null>(null);
  readonly accionar = output<void>();
}
