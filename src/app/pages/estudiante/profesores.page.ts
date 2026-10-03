import { Component, TemplateRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { Modalidad, Profesor } from '../../core/models';
import { BorradorSolicitudService } from '../../core/services/borrador-solicitud.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { capitalizar } from '../../core/utils/fechas';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { MigasPanComponent } from '../../shared/components/migas-pan.component';
import { TarjetaProfesorComponent } from '../../shared/components/tarjeta-profesor.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';

interface Resultado {
  profesor: Profesor;
  proximo?: string;
}

/** P3. Profesores disponibles para la materia o tema buscado (?q=). */
@Component({
  selector: 'app-profesores',
  imports: [NgTemplateOutlet, FormsModule, RouterLink, MatIconModule, MatBottomSheetModule, EstadoVacioComponent, MigasPanComponent, TarjetaProfesorComponent, TituloPaginaComponent],
  templateUrl: './profesores.page.html',
})
export class ProfesoresPage {
  private readonly catalogo = inject(CatalogoService);
  private readonly disponibilidad = inject(DisponibilidadService);
  private readonly borrador = inject(BorradorSolicitudService);
  private readonly router = inject(Router);
  private readonly bottomSheet = inject(MatBottomSheet);

  /** Término buscado: llega del parámetro de consulta ?q= gracias a withComponentInputBinding. */
  readonly q = input('', { transform: (v: string | undefined) => v ?? '' });

  protected readonly modalidad = signal<'Todas' | Modalidad>('Todas');
  protected readonly soloHoy = signal(false);
  protected readonly estaSemana = signal(false);
  protected readonly orden = signal<'proximo' | 'nombre'>('proximo');
  protected readonly modalidades: ('Todas' | Modalidad)[] = ['Todas', 'Presencial', 'En línea'];

  private readonly plantillaFiltros = viewChild.required<TemplateRef<unknown>>('filtros');

  protected readonly titulo = computed(() => capitalizar(this.q()) || 'Todos los docentes');
  protected readonly delTemaTexto = computed(() => {
    const n = this.delTema().length;
    return `${n} ${n === 1 ? 'docente disponible' : 'docentes disponibles'} para tu búsqueda`;
  });

  /** Profesores que atienden el tema, con su próximo horario libre. */
  private readonly delTema = computed<Resultado[]>(() =>
    this.catalogo.profesores
      .filter((p) => this.catalogo.atiende(p, this.q()))
      .map((p) => ({ profesor: p, proximo: this.disponibilidad.proximoLibre(p) })),
  );

  protected readonly resultados = computed(() => {
    let lista = this.delTema().filter((r) => this.modalidad() === 'Todas' || r.profesor.modalidades.includes(this.modalidad() as Modalidad));
    if (this.soloHoy()) lista = lista.filter((r) => r.proximo && this.disponibilidad.esHoy(r.proximo));
    if (this.estaSemana()) lista = lista.filter((r) => r.proximo && this.disponibilidad.esEstaSemana(r.proximo));
    return [...lista].sort((a, b) =>
      this.orden() === 'nombre'
        ? a.profesor.nombre.localeCompare(b.profesor.nombre, 'es')
        : (a.proximo ?? '9999').localeCompare(b.proximo ?? '9999'),
    );
  });

  protected readonly filtrosActivos = computed(
    () => (this.modalidad() !== 'Todas' ? 1 : 0) + (this.soloHoy() ? 1 : 0) + (this.estaSemana() ? 1 : 0),
  );

  protected limpiarFiltros(): void {
    this.modalidad.set('Todas');
    this.soloHoy.set(false);
    this.estaSemana.set(false);
  }

  protected abrirFiltros(): void {
    this.bottomSheet.open(this.plantillaFiltros(), { panelClass: 'filtros-sheet', ariaLabel: 'Filtros de búsqueda' });
  }

  protected cerrarFiltros(): void {
    this.bottomSheet.dismiss();
  }

  protected elegir(r: Resultado): void {
    const materia = this.catalogo.materiaParaSolicitud(r.profesor, this.q());
    const tema = this.catalogo.materiaPorNombre(this.q()) ? '' : capitalizar(this.q().trim());
    this.borrador.iniciar(r.profesor.id, materia, tema);
    this.router.navigate(['/estudiante/profesores', r.profesor.id, 'disponibilidad'], { queryParams: { q: this.q() || null } });
  }
}
