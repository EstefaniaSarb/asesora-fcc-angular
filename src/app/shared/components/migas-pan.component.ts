import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface Miga {
  etiqueta: string;
  ruta?: string;
  consulta?: Record<string, string>;
}

/** Migas de pan navegables; la última indica la página actual. */
@Component({
  selector: 'app-migas-pan',
  imports: [RouterLink, MatIconModule],
  template: `<nav class="breadcrumb" aria-label="Migas de pan">
    @for (miga of migas(); track $index; let ultima = $last; let primera = $first) {
      <span>
        @if (!primera) { <mat-icon class="icon icon-sm">chevron_right</mat-icon> }
        @if (miga.ruta && !ultima) {
          <a [routerLink]="miga.ruta" [queryParams]="miga.consulta">{{ miga.etiqueta }}</a>
        } @else {
          <span class="actual" [attr.aria-current]="ultima ? 'page' : null">{{ miga.etiqueta }}</span>
        }
      </span>
    }
  </nav>`,
})
export class MigasPanComponent {
  readonly migas = input.required<Miga[]>();
}
