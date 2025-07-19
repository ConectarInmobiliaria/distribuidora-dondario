import React, { forwardRef } from 'react';

const RemitoPrint = forwardRef(({ sale }, ref) => {
  const { client, seller, items, date, id } = sale;
  return (
    <div ref={ref} style={{ padding: '20px', fontSize: '12px' }}>
      <h4>Remito # {id}</h4>
      <p><strong>Fecha:</strong> {new Date(date).toLocaleDateString()}</p>
      <p><strong>Cliente:</strong> {client.firstName} {client.lastName}</p>
      <p><strong>Vendedor:</strong> {seller.firstName} {seller.lastName}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000' }}>SKU</th>
            <th style={{ border: '1px solid #000' }}>Producto</th>
            <th style={{ border: '1px solid #000' }}>Bultos</th>
            <th style={{ border: '1px solid #000' }}>Unidades</th>
            <th style={{ border: '1px solid #000' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td style={{ border: '1px solid #000' }}>{it.product.sku}</td>
              <td style={{ border: '1px solid #000' }}>{it.product.name}</td>
              <td style={{ border: '1px solid #000' }}>{it.bundleQty}</td>
              <td style={{ border: '1px solid #000' }}>{it.unitQty}</td>
              <td style={{ border: '1px solid #000' }}>${it.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ textAlign: 'right', marginTop: '10px' }}><strong>Total: </strong>${sale.total.toFixed(2)}</p>
    </div>
  );
});

export default RemitoPrint;
