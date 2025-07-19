// frontend/src/pages/SalesPage.jsx
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { getSales, createSale, deleteSale, returnSaleItem } from '../services/saleService';
import { getClients } from '../services/clientService';
import { getProducts } from '../services/productService';
import { Link } from 'react-router-dom';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { clientId: '', items: [{ productId: '', bundleQty: 0, unitQty: 0 }] }
  });
  const { fields, append, remove } = useFieldArray({ name: 'items', control });

  const load = async () => setSales((await getSales()).data);
  const loadClients = async () => setClients((await getClients()).data);
  const loadProducts = async () => setProducts((await getProducts()).data);

  useEffect(() => { load(); loadClients(); loadProducts(); }, []);

  const onSubmit = async data => {
    await createSale({
      clientId: Number(data.clientId),
      items: data.items.map(it => ({
        productId: Number(it.productId),
        bundleQty: Number(it.bundleQty),
        unitQty: Number(it.unitQty)
      }))
    });
    reset();
    load();
  };

  const onDelete = id => { if (window.confirm('Eliminar venta?')) deleteSale(id).then(load); };
  const onReturn = async (item) => {
    const qty = parseInt(prompt('Cantidad a devolver:', '0'), 10);
    if (qty > 0) {
      await returnSaleItem(item.id, qty);
      load();
    }
  };

  return (
    <div className="container mt-4">
      <h3>Ventas</h3>

      {/* Formulario de nueva venta */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-5">
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Cliente</label>
            <select {...register('clientId', { required: true })} className="form-select">
              <option value="">Seleccione</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} — {c.companyName || 'Particular'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h5>Items</h5>
        {fields.map((field, idx) => (
          <div className="row align-items-end mb-2" key={field.id}>
            <div className="col-md-4">
              <label>Producto</label>
              <select
                {...register(`items.${idx}.productId`, { required: true })}
                className="form-select"
              >
                <option value="">Seleccione</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label>Bultos</label>
              <input type="number" {...register(`items.${idx}.bundleQty`)} className="form-control" />
            </div>
            <div className="col-md-2">
              <label>Unidades</label>
              <input type="number" {...register(`items.${idx}.unitQty`)} className="form-control" />
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-danger" onClick={() => remove(idx)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={() => append({ productId: '', bundleQty: 0, unitQty: 0 })}>
          + Agregar Item
        </button>
        <div>
          <button type="submit" className="btn btn-primary">Crear Venta</button>
        </div>
      </form>

      {/* Listado de ventas */}
      {sales.map(s => (
        <div key={s.id} className="mb-5">
          <h5>Venta #{s.id} — <small>{new Date(s.date).toLocaleString()}</small></h5>
          <p>Cliente: {s.client.firstName} {s.client.lastName}</p>
          <p>Vendedor: {s.seller.firstName} {s.seller.lastName}</p>
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th><th>Producto</th><th>Bultos</th><th>Unidades</th><th>Devueltas</th><th>Subtotal</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {s.items.map(it => (
                <tr key={it.id}>
                  <td>{it.product.sku}</td>
                  <td>{it.product.name}</td>
                  <td>{it.bundleQty}</td>
                  <td>{it.unitQty}</td>
                  <td>{it.returnedQty || 0}</td>
                  <td>${it.subtotal.toFixed(2)}</td>
                  <td>
                    <button onClick={() => onReturn(it)} className="btn btn-sm btn-warning">
                      Devolver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-end"><strong>Total:</strong> ${s.total.toFixed(2)}{' '}
            <Link to={`/print/remito/${s.id}`} className="btn btn-sm btn-secondary ms-2">Remito</Link>
            <button onClick={() => onDelete(s.id)} className="btn btn-sm btn-danger ms-2">🗑</button>
          </p>
        </div>
      ))}
    </div>
  );
}
