import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Rol } from '../../core/models';
import { SesionService } from '../../core/services/sesion.service';

/** P0. Acceso institucional con selección de rol (solo para el prototipo). */
@Component({
  selector: 'app-acceso',
  imports: [MatIconModule],
  templateUrl: './acceso.page.html',
})
export class AccesoPage {
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly rol = signal<Rol>(this.sesion.rol() ?? 'estudiante');

  protected ingresar(): void {
    this.sesion.iniciar(this.rol());
    this.router.navigateByUrl(this.sesion.inicioDe(this.rol()));
  }
}
