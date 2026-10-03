import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../core/services/sesion.service';
import { EstadoVacioComponent } from '../shared/components/estado-vacio.component';

@Component({
  selector: 'app-no-encontrada',
  imports: [EstadoVacioComponent],
  template: `<div class="page narrow-page">
    <app-estado-vacio icono="search_off" titulo="Página no encontrada" texto="La página que buscas no existe o ya no está disponible."
      accion="Ir al inicio" (accionar)="irInicio()" />
  </div>`,
})
export class NoEncontradaPage {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  protected irInicio(): void {
    this.router.navigateByUrl(this.sesion.inicioDe());
  }
}
