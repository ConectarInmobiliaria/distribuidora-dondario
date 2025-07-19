// frontend/src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  getProducts, createProduct, updateProduct, deleteProduct
} from '../services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '', unitPrice: 0, bundleSize: 1, bundleDiscountPct: 0
    }
  });

  const load = async () => setProducts((await getProducts()).data);
  useEffect(() => { load(); }, []);

  const onSubmit = async form => {
    if (form.id) await updateProduct(form.id, form);
    else await createProduct(form);
    reset({ name: '', unitPrice: 0, bundleSize: 1, bundleDiscountPct: 0 });
    load();
  };

  const onEdit = p => reset({
    id: p.id, name: p.name,
    unitPrice: p.unitPrice,
    bundleSize: p.bundleSize,
    bundleDiscountPct: p.bundleDiscountPct
  });
  const onDelete = id => {
    if (window.confirm('Borrar producto?')) deleteProduct(id).then(load);
  };

  return (
    <div className="container mt-4">
      <h3>Productos</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nombre</label>
            <input {...register('name', { required: true })} className="form-control" />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Precio Unidad</label>
            <input type="number" step="0.01" {...register('unitPrice', { valueAsNumber: true })} className="form-control" />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Cantidad por Bulto</label>
            <input type="number" {...register('bundleSize', { valueAsNumber: true })} className="form-control" />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">% Descuento Bulto</label>
            <input type="number" step="0.1" {...register('bundleDiscountPct', { valueAsNumber: true })} className="form-control" />
          </div>
        </div>
        <button className="btn btn-success">Guardar Producto</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>SKU</th><th>Nombre</th><th>Unidad ($)</th>
            <th>Bulto</th><th>% Desc.</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.unitPrice.toFixed(2)}</td>
              <td>{p.bundleSize}</td>
              <td>{p.bundleDiscountPct}%</td>
              <td>
                <button onClick={() => onEdit(p)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(p.id)} className="btn btn-sm btn-danger">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
