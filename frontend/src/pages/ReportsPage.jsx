import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getSalesReport, getTopProductsReport, getCommissionsReport
} from '../services/reportService';

export default function ReportsPage() {
  const { register, handleSubmit } = useForm({ defaultValues: { from: '', to: '', top: 10 } });
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);

  const onSubmit = async ({ from, to, top }) => {
    const params = { from, to, top };
    setSales((await getSalesReport(params)).data);
    setProducts((await getTopProductsReport(params)).data);
    setCommissions((await getCommissionsReport(params)).data);
  };

  return (
    <div className="container mt-4">
      <h3>Reportes</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="row g-3 mb-4">
        <div className="col-md-3">
          <label>Desde</label>
          <input type="date" {...register('from')} className="form-control" />
        </div>
        <div className="col-md-3">
          <label>Hasta</label>
          <input type="date" {...register('to')} className="form-control" />
        </div>
        <div className="col-md-2">
          <label>Top Productos</label>
          <input type="number" {...register('top')} className="form-control" />
        </div>
        <div className="col-md-2 align-self-end">
          <button className="btn btn-primary w-100">Generar</button>
        </div>
      </form>

      <h5>Ventas</h5>
      <table className="table table-sm">
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.client.firstName} {s.client.lastName}</td>
              <td>{s.seller.firstName} {s.seller.lastName}</td>
              <td>${s.total.toFixed(2)}</td>
              <td>{new Date(s.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5>Top Productos</h5>
      <table className="table table-sm">
        <thead><tr><th>SKU</th><th>Producto</th><th>Unidades</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.sku}>
              <td>{p.sku}</td><td>{p.name}</td><td>{p.totalUnits}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5>Comisiones</h5>
      <table className="table table-sm">
        <thead><tr><th>Vendedor</th><th>Ventas</th><th>Comisión</th></tr></thead>
        <tbody>
          {commissions.map(c => (
            <tr key={c.sellerId}>
              <td>{c.name}</td>
              <td>${c.totalSales.toFixed(2)}</td>
              <td>${c.commission.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
