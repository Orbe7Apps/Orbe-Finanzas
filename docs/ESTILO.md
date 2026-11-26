# Orbe · reglas de diseño y de trabajo

Reglas que pidió el dueño a lo largo del desarrollo. Los colores, la letra y las formas en detalle están en [`../negocios/ESTILO.md`](../negocios/ESTILO.md). Ante la duda, copia lo que ya existe en `index.html`.

## Diseño

- **Minimalista:** que nada abrume. Menos botones a la vista; lo secundario va detrás de un toque, como en las fichas de Cuenta, Fecha y Nota.
- **Que no pierda estilo:** cuando se simplifica, no debe verse pobre. Se mantienen los colores, las fichas redondeadas y las animaciones de Orbe.
- **Sin cambios drásticos:** se prefiere mejorar lo que hay a rehacer la pantalla, y no esconder lo importante. Las categorías, por ejemplo, siempre a la vista.
- **Animaciones sutiles y con sentido:**
  - Los números ruedan o dan un pequeño salto al cambiar.
  - Los paneles se despliegan con la altura animada.
  - Siempre se respeta `prefers-reduced-motion`.
- **Sin líneas horizontales finas** como separadores.
- **Blanco y negro (mono):** ningún elemento con color, ni siquiera los selectores de color, que en ese modo se ocultan.
- **Paletas:**
  - En el tema Orbe se ve el arcoíris.
  - Con otro color de app, todo se ve en tonos de ese mismo color: nada de azul en la paleta verde ni de morado en la azul.
- **Centrado:** flechas, círculos e íconos bien centrados. En el iPhone los caracteres como ‹ › se descentran, así que se dibujan con SVG.
- **Monto:** grande, arriba y centrado en las hojas. La divisa va debajo y la fecha en una ficha.
- **Textos:**
  - Sin leyendas que expliquen lo obvio; por ejemplo, «Montos rápidos (opcional)» sin más texto.
  - En la app, español claro y cercano.
- **Pensado para el iPhone:**
  - Campos de 16 px, para que no haga zoom.
  - El teclado no debe dejar ver el fondo.
  - En los orbes, deslizar en vertical siempre desplaza la página.

## Forma de trabajo

- **Responder en español, corto y concreto.**
- **Primero maqueta, después «aplícalo»:**
  - Para cambios de diseño, el dueño pide una maqueta con opciones A, B y C y elige una.
  - Las maquetas se publican como artifact.
  - Mejor si son capturas de la app real con el cambio, para que se vea el estilo verdadero.
  - Recomendar una opción, sin largas explicaciones.
- **Probar antes de decir que está listo:**
  - Correr las pruebas de `tests/` y tomar capturas en claro, oscuro y blanco y negro.
  - Decir siempre que se probó en el simulador (Chromium) y no en el iPhone.
- **Publicar cada cambio** como se explica en `CONTEXTO.md`: rama de trabajo → `main` sin commit de unión → `multi-pais`, y comprobar que no quedan diferencias.
- **Commits:** mensajes en español que describen el cambio para el usuario. No poner nombres de modelo en commits, código ni documentos.
- **Sin pull requests** salvo que el dueño los pida.
- **Mantener lo que funciona:** al rediseñar una hoja, conservar todas sus funciones y datos (por ejemplo, las subcategorías ocultas se conservan al editar).
- **No inventar:** si algo no se pudo comprobar (el teclado real, los gestos en Safari), decirlo.
