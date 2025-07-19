import React, { forwardRef } from 'react';

const HojaRutaPrint = forwardRef(({ batch }, ref) => {
  const { deliverer, items, date, description } = batch;
  return (
    <div ref={ref} style={{ padding: '20px', fontSize: '12px' }}>
      <h4>Hoja de Ruta — Lote #{batch.id}</h4>
      <p><strong>Repartidor:</strong> {deliverer.firstName} {deliverer.lastName}</p>
      <p><strong>Fecha:</strong> {new Date(date).toLocaleDateString()}</p>
      {description && <p><strong>Descripción:</strong> {description}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000' }}>Venta #</th>
            <th style={{ border: '1px solid #000' }}>Cliente</th>
            <th style={{ border: '1px solid #000' }}>Dirección</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td style={{ border: '1px solid #000' }}>{it.sale.id}</td>
              <td style={{ border: '1px solid #000' }}>
                {it.sale.client.firstName} {it.sale.client.lastName}
              </td>
              <td style={{ border: '1px solid #000' }}>{it.sale.client.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default HojaRutaPrint;
