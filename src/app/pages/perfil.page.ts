import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { textoModalidades } from '../core/utils/fechas';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AvisoService } from '../core/services/aviso.service';
import { CatalogoService } from '../core/services/catalogo.service';
import { SesionService } from '../core/services/sesion.service';
import { MigasPanComponent } from '../shared/components/migas-pan.component';
import { TituloPaginaComponent } from '../shared/components/titulo-pagina.component';
import { InicialesPipe } from '../shared/pipes/iniciales.pipe';

/** P11. Perfil y preferencias (ambos roles). */
@Component({
  selector: 'app-perfil',
  imports: [FormsModule, MatIconModule, MatSlideToggleModule, MigasPanComponent, TituloPaginaComponent, InicialesPipe],
  templateUrl: './perfil.page.html',
})
export class PerfilPage {
  protected readonly modalidades = textoModalidades;
  private readonly aviso = inject(AvisoService);
  private readonly catalogo = inject(CatalogoService);
  protected readonly sesion = inject(SesionService);

  protected readonly avisosApp = signal(true);
  protected readonly avisosCorreo = signal(true);
  protected readonly anticipacion = signal('24 horas antes');

  /** Materias y temas del profesor, derivados del catálogo. */
  protected readonly docencia = computed(() =>
    this.sesion.profesor.materias.map((nombre) => ({
      materia: this.catalogo.materiaPorNombre(nombre)!,
      temas: this.sesion.profesor.temas,
    })),
  );

  protected guardar(): void {
    this.aviso.exito('Preferencias guardadas correctamente.');
  }
}
