import { Component } from '@angular/core';

/** Esqueleto de carga mientras se descarga una pantalla diferida. */
@Component({
  selector: 'app-carga',
  template: `<div class="page" role="status" aria-label="Cargando contenido">
    <div class="skeleton sk-title"></div>
    <div class="skeleton sk-subtitle"></div>
    <div class="skeleton-grid">
      @for (n of [1, 2, 3]; track n) {
        <div class="card skeleton-card">
          <div class="skeleton sk-avatar"></div>
          <div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div><div class="skeleton sk-line"></div></div>
        </div>
      }
    </div>
    <span class="sr-only">Cargando…</span>
  </div>`,
})
export class CargaComponent {}
