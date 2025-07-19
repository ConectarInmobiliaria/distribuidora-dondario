import React, { forwardRef } from 'react';

const CargaPrint = forwardRef(({ batch }, ref) => {
  const productMap = {};

  batch.items.forEach(it => {
    it.sale.items.forEach(si => {
      const key = si.productId;
      if (!productMap[key]) {
        productMap[key] = {
          sku: si.product.sku,
          name: si.product.name,
          totalBundles: 0,
          totalUnits: 0
        };
      }
      productMap[key].totalBundles += si.bundleQty;
      productMap[key].totalUnits += si.unitQty;
    });
  });

  const resumen = Object.values(productMap);

  return (
    <div ref={ref} style={{ padding: '20px', fontSize: '12px' }}>
      <h4>Composición de Carga — Lote #{batch.id}</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000' }}>SKU</th>
            <th style={{ border: '1px solid #000' }}>Producto</th>
            <th style={{ border: '1px solid #000' }}>Bultos Totales</th>
            <th style={{ border: '1px solid #000' }}>Unidades Totales</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((r, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #000' }}>{r.sku}</td>
              <td style={{ border: '1px solid #000' }}>{r.name}</td>
              <td style={{ border: '1px solid #000' }}>{r.totalBundles}</td>
              <td style={{ border: '1px solid #000' }}>{r.totalUnits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default CargaPrint;
