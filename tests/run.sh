#!/usr/bin/env bash
# Corre todas las pruebas de Orbe en Chromium (Playwright) y resume cuántas fallan.
# Uso: bash tests/run.sh          (todas)
#      bash tests/run.sh sum c    (solo tests/sum.test.js y tests/c.test.js)
cd "$(dirname "$0")"
list=("$@"); [ ${#list[@]} -eq 0 ] && list=($(ls *.test.js | sed 's/\.test\.js$//'))
fails=0
for t in "${list[@]}"; do
  echo "── $t"
  out=$(timeout 600 node "$t.test.js" 2>&1); echo "$out" | grep -E "✓|✗|FALLA|errores|Error" | cut -c1-200
  echo "$out" | grep -q "FALLA\|Error:" && fails=$((fails+1))
done
echo; echo "Pruebas con fallas: $fails de ${#list[@]}"
