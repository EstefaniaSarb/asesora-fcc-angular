import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ESTADOS_ACTIVOS, ESTADOS_FINALES, EstadoSolicitud } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { ChipEstadoComponent } from '../../shared/components/chip-estado.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

type Pestana = 'Todas' | 'Activas' | 'Historial';

/** P6. Mis solicitudes (lista). */
@Component({
  selector: 'app-mis-solicitudes',
  imports: [RouterLink, MatIconModule, ChipEstadoComponent, EstadoVacioComponent, TituloPaginaComponent, FechaAsesoriaPipe],
  templateUrl: './mis-solicitudes.page.html',
})
export class MisSolicitudesPage {
  private readonly solicitudes = inject(SolicitudService);
  private readonly catalogo = inject(CatalogoService);

  protected readonly pestanas: Pestana[] = ['Todas', 'Activas', 'Historial'];
  protected readonly pestana = signal<Pestana>('Todas');

  private readonly estadosDe: Record<Pestana, EstadoSolicitud[] | null> = {
    Todas: null, Activas: ESTADOS_ACTIVOS, Historial: ESTADOS_FINALES,
  };

  protected cuantas(p: Pestana): number {
    const e = this.estadosDe[p];
    return this.solicitudes.delEstudiante().filter((s) => !e || e.includes(s.estado)).length;
  }

  protected readonly visibles = computed(() => {
    const e = this.estadosDe[this.pestana()];
    return this.solicitudes.delEstudiante().filter((s) => !e || e.includes(s.estado));
  });

  protected profesorDe(id: string): string {
    return this.catalogo.profesorPorId(id)?.nombre ?? '';
  }
}
