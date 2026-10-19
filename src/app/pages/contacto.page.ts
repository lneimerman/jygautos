import { Component } from '@angular/core';
import { WHATSAPP_DISPLAY, whatsappLink } from '../site.config';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  template: `
    <section class="page prose">
      <h1>Contacto</h1>
      <p>Escribinos por WhatsApp o consultá por redes.</p>

      <dl class="contact-list">
        <div>
          <dt>WhatsApp</dt>
          <dd><a [href]="wa" target="_blank" rel="noopener">{{ display }}</a></dd>
        </div>
        <div>
          <dt>Dirección</dt>
          <dd><a href="https://www.google.com/maps/search/?api=1&query=Lacarra+1531+CABA" target="_blank" rel="noopener">Lacarra 1531, CABA</a></dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd><a href="https://www.instagram.com/jygautosymas" target="_blank" rel="noopener">&#64;jygautosymas</a></dd>
        </div>
      </dl>
    </section>
  `,
})
export class ContactoPage {
  protected readonly wa = whatsappLink('Hola, quiero hacer una consulta');
  protected readonly display = WHATSAPP_DISPLAY;
}
