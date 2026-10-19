import { Component } from '@angular/core';

@Component({
  selector: 'app-empresa-page',
  standalone: true,
  template: `
    <section class="page prose">
      <h1>Sobre la empresa</h1>
      <p>
        En <strong>JYG Autos y Más</strong> compramos, vendemos y tomamos en consignación autos, motos, cuatriciclos y trailers, para que
        encuentres tu próximo vehículo de forma transparente y segura.
      </p>

      <h2>Consignación</h2>
      <p>
        Si querés vender tu vehículo y no tenés tiempo, nos encargamos nosotros: lo publicamos, atendemos a los
        interesados y coordinamos la operación. Consultanos.
      </p>

      <h2>También hacemos arreglos</h2>
      <p>
        Hacemos arreglos y puesta a punto. Si querés dejar tu auto listo para vender o para el uso diario,
        escribinos y coordinamos.
      </p>
    </section>
  `,
})
export class EmpresaPage {}
