# Pruebas de Orbe

Pruebas automáticas que abren `index.html` en Chromium (Playwright), simulando un iPhone 15, con los datos de ejemplo de `datos.js`.

## Cómo correrlas

Necesitas Node y Playwright con Chromium. En las sesiones en la nube de Claude Code ya vienen instalados.

Correr todas:

```bash
bash tests/run.sh
```

Correr solo algunas:

```bash
bash tests/run.sh c sum
```

Cada prueba imprime ✓ o «✗ FALLA», y al final se ven los errores de la página. Las capturas se guardan en `tests/out/`, que no se sube al repositorio.

## Qué prueba cada una

| Archivo | Qué revisa |
|---|---|
| `kbnota.test.js` | Con el teclado abierto, la hoja de Nuevo movimiento sube y el monto y la nota quedan a la vista |
| `c.test.js` | Nuevo movimiento: fichas de Cuenta, Fecha y Nota, número que salta y guardado |
| `bigsave.test.js` | Pago, transferencia, ahorro y meta se guardan con el monto grande |
| `sum.test.js` | La píldora «este mes» despliega u oculta el resumen y se recuerda |
| `notrend.test.js` | Modos del gráfico de Inicio: mes, 30 días y sin gráfico |
| `hero.test.js` | Total de Inicio y «≈ $» debajo |
| `kb.test.js` | Relleno detrás del teclado (el teclado se simula) |
| `tone.test.js` | Tonos del color de la app; arcoíris en Orbe; nada de color en blanco y negro |
| `orb3d.test.js` | Gestos de los dos orbes: girar de lado y desplazar en vertical |
| `dot.test.js` | Centro en punto de los orbes, que crece al elegir |
| `gchart.test.js` | Tarjetas y gráficos de cada meta |
| `catgrp.test.js` | Selector de categorías por grupos y buscador |
| `new.test.js` | Montos rápidos en plantillas, inicio de sesión y Apple Pay |
| `onbtrend.test.js` | Paso de bienvenida para elegir el gráfico |
| `ai.test.js` | Resumen con IA |
| `nav.test.js` | Flechas de cambio de mes centradas |

## Ojo

- **No reemplazan probar en el iPhone:** el teclado, los gestos y Safari se comportan distinto.
- **Fallas falsas:** si la máquina va lenta, alguna prueba de tiempos (por ejemplo, «se recuerda tras recargar» en `sum`) puede fallar. Córrela sola antes de buscar un error.
- **Si cambias algo a propósito**, actualiza la prueba que lo revisa.
