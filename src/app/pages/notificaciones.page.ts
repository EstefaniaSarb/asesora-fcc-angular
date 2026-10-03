import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Notificacion } from '../core/models';
import { NotificacionService } from '../core/services/notificacion.service';
import { SesionService } from '../core/services/sesion.service';
import { EstadoVacioComponent } from '../shared/components/estado-vacio.component';
import { MigasPanComponent } from '../shared/components/migas-pan.component';
import { TituloPaginaComponent } from '../shared/components/titulo-pagina.component';
import { FechaAsesoriaPipe } from '../shared/pipes/fecha-asesoria.pipe';

/** P10. Centro de notificaciones (ambos roles). */
@Component({
  selector: 'app-notificaciones',
  imports: [MatIconModule, MatTooltipModule, EstadoVacioComponent, MigasPanComponent, TituloPaginaComponent, FechaAsesoriaPipe],
  templateUrl: './notificaciones.page.html',
})
export class NotificacionesPage {
  private readonly servicio = inject(NotificacionService);
  private readonly router = inject(Router);
  protected readonly sesion = inject(SesionService);

  protected readonly filtro = signal<'Todas' | 'No leídas'>('Todas');
  protected readonly filtros: ('Todas' | 'No leídas')[] = ['Todas', 'No leídas'];
  protected readonly iconos = { solicitud: 'person_add', estado: 'published_with_changes', recordatorio: 'alarm' };

  protected readonly delRol = computed(() => {
    this.servicio.notificaciones(); // dependencia explícita del signal
    return this.servicio.delRol(this.sesion.rol());
  });
  protected readonly noLeidas = computed(() => this.delRol().filter((n) => !n.leida).length);
  protected readonly visibles = computed(() => this.delRol().filter((n) => this.filtro() === 'Todas' || !n.leida));

  protected abrir(n: Notificacion): void {
    this.servicio.marcarLeida(n.id);
    this.router.navigateByUrl(n.destino);
  }

  protected alternar(n: Notificacion): void {
    this.servicio.marcarLeida(n.id, !n.leida);
  }

  protected marcarTodas(): void {
    this.servicio.marcarTodas(this.sesion.rol()!);
  }
}
