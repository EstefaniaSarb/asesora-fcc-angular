import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CatalogoService } from '../../core/services/catalogo.service';
import { normalizar } from '../../core/utils/fechas';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { MigasPanComponent } from '../../shared/components/migas-pan.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';

/** P2. Selección de materia o tema. */
@Component({
  selector: 'app-materias',
  imports: [FormsModule, RouterLink, MatIconModule, EstadoVacioComponent, MigasPanComponent, TituloPaginaComponent],
  templateUrl: './materias.page.html',
})
export class MateriasPage {
  protected readonly catalogo = inject(CatalogoService);
  protected readonly busqueda = signal('');
  protected readonly area = signal('Todas');

  protected readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda());
    return this.catalogo.materias.filter(
      (m) => (this.area() === 'Todas' || m.area === this.area()) && normalizar(m.nombre).includes(q),
    );
  });

  /** Si lo escrito no es una materia, se ofrece buscarlo como tema. */
  protected readonly esTema = computed(() => this.busqueda().trim().length > 2 && this.filtradas().length === 0);

  protected limpiar(): void {
    this.busqueda.set('');
    this.area.set('Todas');
  }
}
