import { Component, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  // app.scss define los estilos globales del sitio (.card, .btn, .page, body, etc.).
  // Sin esto Angular los limita al template del componente raiz y las paginas del router quedan sin estilo.
  encapsulation: ViewEncapsulation.None,
})
export class App {
  protected readonly title = signal('JYG Autos y Más');
  // Si existe public/logo.png se usa como marca; si no, se muestra la marca de texto.
  protected readonly logoOk = signal(true);
}
