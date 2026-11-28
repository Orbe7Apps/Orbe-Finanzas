# Orbe · contexto del proyecto

Léelo al empezar cualquier sesión nueva. Las reglas de diseño y de trabajo están en [`ESTILO.md`](ESTILO.md).

## Qué es

**Orbe** (Orbe Finanzas) es una app de finanzas personales para el teléfono. Se instala como PWA desde Safari en el iPhone, que es donde la usa y prueba el dueño. Sirve para:

- Cuentas en varias monedas: USD, Bs, EUR y USDT, con tasas del BCV y otras.
- Movimientos (gastos e ingresos), transferencias y plantillas.
- Pagos y cobros programados, metas de ahorro y metas compartidas.
- Ahorro automático («Bóveda»), cuadrar con el banco, resumen con IA y atajos de Siri y Apple Pay.

## Cómo está hecha

- **Un solo archivo:** `index.html` (unas 15.000 líneas), con HTML, CSS y JS sin frameworks ni compilación. Se edita directo.
- **PWA:**
  - `manifest.webmanifest`, `sw.js` (caché `orbe-v2`, pide primero a la red) e `icons/`.
- **Datos:**
  - Se guardan en el teléfono, en `localStorage`, clave `gastos-v1`. Lo que se guarda lo arma `save()`, que toma una lista fija de campos de `state`; al agregar un dato nuevo hay que sumarlo ahí y en la carga.
  - Con «?demo» la app abre con datos de ejemplo en la clave `gastos-demo`, sin nube.
- **Nube (opcional):** Supabase, proyecto **a-fuego**, tabla `orbe_data`. Ver `supabase/LEEME.md`. También está la función `supabase/functions/borrar-cuenta`.
- **Orbe Negocios** (otra app, en diseño): `negocios/PLAN.md` y `negocios/ESTILO.md`.

### Piezas clave dentro de `index.html`

- **`makeOrb(cfg)`:** el orbe 3D en canvas, uno solo para los dos orbes de la app.
  - Lo usan Cuentas en Inicio (`#acc-sum`) y Metas en Ahorro (`#go-sum`).
  - La configuración común está en `orbCfg()`, y la guía es el orbe de Inicio.
  - Empieza plano. Al girarlo con el dedo pasa a 3D, y con doble toque en un espacio vacío vuelve a la vista plana.
  - Deslizar en vertical siempre desplaza la página, y mientras la página se desplaza el orbe no se redibuja.
  - El centro es un punto que late; al elegir un anillo crece y muestra su monto.
- **`drawTrend()`:** gráfico de Inicio. `state.trendMode` puede ser `"mes"`, `"30d"` o `"none"`; el valor por defecto es `"none"`, y el modo se elige al empezar y en Ajustes.
  - La píldora «este mes» (`#bal-delta`) despliega u oculta Ingresos, Gastos y Ahorrado.
  - Ese estado queda en `state.sumOpen`.
  - Sin gráfico, la píldora va bajo el total; con gráfico, centrada debajo del gráfico.
- **Colores por tono:** `tone()`, `toneTable()` y `TONE_STEP`.
  - Con un color de app distinto de Orbe (azul, verde, rosa o naranja), las categorías, cuentas y metas se ven en 11 tonos de ese color. El matiz casi no cambia; varían la luz y la saturación.
  - En Orbe se ve el arcoíris original, y en blanco y negro no hay color.
- **Nuevo movimiento:**
  - El monto es grande y da un salto al escribir (`amtPop`).
  - Debajo hay tres fichas: Cuenta, Fecha y Nota (`msUpd`, `msOpen`). Cuenta y Nota se despliegan; Fecha abre el calendario.
  - Las subcategorías están ocultas, pero se conservan al editar un movimiento.
- **Demás hojas con monto** (pago y cobro, ahorro, metas, transferir, aportes, cuadrar, plantilla, Binance Earn):
  - Mismo estilo: monto grande arriba, divisa debajo y fecha en una ficha.
  - Lo hacen las funciones `big()` y `dateChip()`, que solo reordenan y visten los campos; la lógica de cada hoja es la misma.
- **Selector de categorías por grupos:** `catGroupsHtml()` con buscador. Lo usan Nuevo movimiento y el editor de plantillas.
- **Montos rápidos:** solo al usar una plantilla (`rap` en la plantilla).
- **Teclado:** `#kb-fill` pinta lo que queda detrás del teclado translúcido del iPhone.
  - Con el teclado abierto, la hoja abierta sube entera encima de él, sin encogerse, para no perder su estilo (clase `kb-up` en `<html>`, variables `--kb` y `--kbt`); si es más alta que el espacio, lo de arriba queda fuera de la pantalla. Sube junto con el teclado: empieza al tocar el campo, con la altura que tuvo el teclado la vez anterior (`orbe-kbh` en `localStorage`), y hoja y contenido se mueven en un solo gesto (`glide()`, 0,42 s, curva de las hojas). Al cerrar el teclado baja igual. El campo activo se desplaza para quedar a la vista sobre el botón de abajo, también al escribir. Mientras se escribe en una hoja, la página queda quieta (`hold()`): si el iPhone la desplaza por su cuenta para mostrar el campo, se deshace, porque ese desplazamiento se sumaba al de la hoja y el campo se perdía arriba. Si el teclado no avisa en un segundo, la hoja vuelve a su lugar. Si la hoja se cierra con el teclado abierto (al guardar o deslizarla), baja desde donde está (`drop()`), sin saltar la altura del teclado. La hoja de IA y la de la nube tienen su propio arreglo.
- **Apple Pay:** `?guardar=1&gasto=…&comercio=…` anota el gasto solo, con «Deshacer». La guía está en el atajo de Siri.

## Repositorio y ramas

- **Repositorio:** `Gllm57/misgastos`. GitHub avisa que se movió a **`Orbe7Apps/Orbe-Finanzas`**: los envíos todavía funcionan con la dirección vieja, pero conviene actualizar el remoto con `git remote set-url origin https://github.com/Orbe7Apps/Orbe-Finanzas.git`.
- **`main`:** la versión principal. La web de Orbe Apps abre la demo en `/Orbe-Finanzas/?demo`, así que la app pública sale de GitHub Pages de `Orbe7Apps/Orbe-Finanzas`. Comprobar en GitHub → Settings → Pages que la rama sea `main`.
- **`multi-pais`:** se mantiene idéntica a `main` en `index.html`. Siempre se une `main` hacia `multi-pais`.
- **`orbe-venezuela`:** versión vieja, solo para Venezuela, con 115 cambios propios que no están en `main`. No se toca.
- **Ramas `claude/…`:** ramas de trabajo de cada sesión.

### Cómo se publica un cambio

1. Commit en la rama de trabajo.
2. Push de la rama.
3. Llevar el cambio a `main` sin commit de unión (fast-forward) y hacer push.
4. Unir `main` en `multi-pais` y hacer push.
5. Revisar que no queden diferencias: `git diff --quiet main multi-pais -- index.html`.

## Pruebas

Están en `tests/` y se corren en Chromium con Playwright. Ver [`tests/LEEME.md`](../tests/LEEME.md). Lo que pasan no prueba el comportamiento en el iPhone real: gestos, teclado y Safari hay que verlos en el teléfono.

## Decisiones tomadas

- Un solo `index.html`, sin frameworks; todo en español.
- **Inicio:**
  - Por defecto, «Sin gráfico» (el total grande). Al empezar, la persona elige el modo viendo cómo se vería cada uno.
  - Ingresos, Gastos y Ahorrado ocultos por defecto; se despliegan con la píldora, en todos los modos.
  - El «≈ $» va debajo del total, no al lado.
- **Orbes:** el de Metas usa la misma configuración que el de Inicio. Los arcos se dibujan como curvas continuas, porque Safari dibujaba mal los tramos cortos.
- **Nuevo movimiento:** se eligió la opción C de la maqueta, con fichas de Cuenta, Fecha y Nota. Se quitaron las subcategorías y el campo grande de nota.
- **Montos rápidos:** solo en plantillas, con el título «Montos rápidos (opcional)» y sin texto de explicación.
- **Colores:** el arcoíris solo en el tema Orbe; en los otros colores, tonos del mismo color, y en blanco y negro, nada de color.
- **Subida de la hoja con el teclado:** se eligió la opción B de la maqueta, «Junto al teclado» (sin esperar al teclado ni saltar). La primera vez, sin altura recordada, sube cuando el teclado avisa.
- **Pantalla de carga:** se eligió la opción A de la maqueta, «Órbitas»: cada anillo gira a su ritmo (el del medio al revés) y el punto central late con un halo relleno. Sin barra de carga. En blanco y negro el anillo interior usa `--sp3`, que pasa a `--ink`.
- **Flechas de cambio de mes:** dibujadas con máscara SVG, no con los caracteres ‹ ›, que en el iPhone quedaban descentrados.
- **Inicio de sesión:** el correo se pasa a minúsculas y la contraseña no se escribe con mayúscula automática.

## Pendiente

- **Revisión de animaciones (28-11-2026):** se midieron cuadro a cuadro en el simulador (`tests/anim.test.js`) la carga, las hojas, el teclado, la fila nueva del Historial y las pestañas, en claro, oscuro y blanco y negro. Se arreglaron dos fallos: la hoja daba un tirón hacia atrás al empezar a subir o bajar con el teclado, y al guardar con el teclado abierto saltaba de golpe hacia abajo. Falta confirmarlo en el iPhone.

- **Cuentas compartidas con otra persona:**
  - Propuesta: invitar con un código; las dos personas ven el saldo y los movimientos, y cada movimiento muestra quién lo anotó.
  - Falta que el dueño decida si las dos pueden anotar o solo una.
  - Necesita backend en Supabase. No hay nada hecho.
- **Hojas aún sin el estilo de monto grande:** el retiro de la Bóveda (`fzr-monto`), que se arma en el momento.
- **Teclado del iPhone (28-11-2026):** el dueño vio que al agregar un movimiento toda la página subía de más y el campo se perdía arriba. Se arregló dejando la página quieta mientras se escribe en una hoja; falta confirmarlo en el teléfono.
- **Teclado del iPhone:** el dueño confirmó en el teléfono (27-11-2026) que la hoja sube bien junto con el teclado al escribir la nota. Falta confirmar en las demás hojas que no se ve el fondo detrás (`#kb-fill`).
- **Orbe de Metas en el iPhone:** el dueño dijo que no se movía igual que el de Inicio. Ya comparten configuración, pero en el simulador no se encontró la diferencia de movimiento; confirmar en el teléfono.
- **Lista vieja de pendientes:** comisiones bancarias automáticas, correos propios con Resend (necesita dominio), legal y contacto, tableta y computadora, Asesor y regla «Sobrante del mes». Venía del antiguo `PENDIENTES.md` (ya borrado); se copia abajo.

### Pendientes anteriores

- **Atajo de Siri:** el iPhone abre el enlace en Safari, que guarda los datos aparte. Para que el gasto llegue a la app instalada, la persona debe iniciar sesión en los dos.
- **Correos propios con Resend:** necesita dominio; ver `supabase/LEEME.md`.
- **Legal:**
  - Correo de contacto en la política de privacidad y en los términos.
  - Activar «Leaked password protection» en Supabase.
  - Revisión de un abogado: referido de Binance y metas compartidas.
- **Supabase:** poner la dirección pública en Site URL y Redirect URLs.
- **Diseño en tableta y computadora:**
  - Barra de abajo con ancho máximo.
  - «+» y ✦ junto al contenido.
  - Banderas de países como imágenes, porque en Windows se ven como letras.
- **Comisiones automáticas, en este orden:**
  1. Comisión fija por cuenta.
  2. Resumen de comisiones.
  3. Comisión por operación, con interruptor «Sin comisión esta vez».
- **Ahorro forzoso:**
  - Falta la pestaña Asesor y la regla «Sobrante del mes» (apartar el 50 % de lo no gastado).
  - Falta el recordatorio con la app cerrada, que necesita un servidor de notificaciones.

## Siguiente paso

1. El dueño prueba en el iPhone tres cosas: el teclado en las hojas, el orbe de Metas y la nueva hoja «Nuevo movimiento».
2. Decidir cómo funcionan las cuentas compartidas (quién puede anotar) y hacer primero una maqueta.
3. Pasar el retiro de la Bóveda al estilo de monto grande.
