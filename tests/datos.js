function data() {
  const it = []; let n = 0; const add = (cat, monto, fecha) => it.push({ id: 'd' + (n++), tipo: 'gasto', cat, monto, moneda: 'USD', fecha, cuenta: 2, nota: '' });
  it.push({ id: 'i1', tipo: 'ingreso', cat: 'Sueldo', monto: 900, moneda: 'USD', fecha: '2026-10-01', cuenta: 2 }, { id: 'i2', tipo: 'ingreso', cat: 'Sueldo', monto: 900, moneda: 'USD', fecha: '2026-11-01', cuenta: 2 });
  const oct = { 'Alimentación': 180, 'Restaurantes': 70, 'Transporte': 45, 'Servicios': 60, 'Suscripciones': 22, 'Salud': 30, 'Ropa': 55, 'Hogar': 25 };
  const nov = { 'Alimentación': 62.4, 'Restaurantes': 38.5, 'Transporte': 12, 'Servicios': 41.2, 'Suscripciones': 21.98, 'Salud': 8.5, 'Ropa': 0, 'Hogar': 14.3, 'Mascotas': 9 };
  Object.entries(oct).forEach(([c, v]) => { add(c, v * 0.6, '2026-10-08'); add(c, v * 0.4, '2026-10-20'); });
  Object.entries(nov).forEach(([c, v]) => { if (v) { add(c, v * 0.7, '2026-11-02'); add(c, v * 0.3, '2026-11-05'); } });
  return { onb: true, theme: 'light', msumSeen: '2026-10', backupAt: Date.now(), rate: 230, rateDate: '2026-11-06', rateEur: 268, rateUsdt: 312, accounts: [{ id: 2, nombre: 'Binance', moneda: 'USD', saldo: 1500, creado: '2026-09-01', cuadre: '2026-11-05' }], items: it, limits: { 'Alimentación': 150, 'Restaurantes': 60, 'Servicios': 50 } };
}
module.exports = data;
