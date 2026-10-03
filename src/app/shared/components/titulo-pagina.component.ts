import { Component, input } from '@angular/core';

@Component({
  selector: 'app-titulo-pagina',
  template: `<div class="page-title">
    <span class="eyebrow">{{ antetitulo() }}</span>
    <h1>{{ titulo() }}</h1>
    @if (texto()) { <p>{{ texto() }}</p> }
  </div>`,
  host: { style: 'display: contents' },
})
export class TituloPaginaComponent {
  readonly antetitulo = input('');
  readonly titulo = input.required<string>();
  readonly texto = input('');
}
