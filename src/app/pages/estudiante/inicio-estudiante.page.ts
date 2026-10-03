import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ESTADOS_ACTIVOS } from '../../core/models';
import { CatalogoService } from '../../core/services/catalogo.service';
import { RelojService } from '../../core/services/reloj.service';
import { SesionService } from '../../core/services/sesion.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { ChipEstadoComponent } from '../../shared/components/chip-estado.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

/** P1. Inicio del estudiante. */
@Component({
  selector: 'app-inicio-estudiante',
  imports: [FormsModule, RouterLink, MatIconModule, ChipEstadoComponent, EstadoVacioComponent, FechaAsesoriaPipe],
  templateUrl: './inicio-estudiante.page.html',
})
export class InicioEstudiantePage {
  private readonly router = inject(Router);
  private readonly solicitudes = inject(SolicitudService);
  protected readonly catalogo = inject(CatalogoService);
  protected readonly sesion = inject(SesionService);
  protected readonly reloj = inject(RelojService);

  protected readonly busqueda = signal('');
  protected readonly sugerencias = ['Recursividad', 'Punteros en C', 'Normalización'];
  protected readonly nombreCorto = this.sesion.estudiante.nombre.split(' ')[0];

  protected readonly proxima = computed(() =>
    this.solicitudes
      .delEstudiante()
      .filter((s) => s.estado === 'Confirmada' && s.fechaHora >= this.reloj.hoy.slice(0, 10))
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0],
  );

  protected readonly activas = computed(() => this.solicitudes.delEstudiante().filter((s) => ESTADOS_ACTIVOS.includes(s.estado)));

  protected readonly profesorDe = (id: string) => this.catalogo.profesorPorId(id)?.nombre ?? '';

  protected buscar(termino = this.busqueda()): void {
    const q = termino.trim();
    if (!q) {
      this.router.navigate(['/estudiante/materias']);
      return;
    }
    this.router.navigate(['/estudiante/profesores'], { queryParams: { q } });
  }
}
