// frontend/src/pages/DeliveryBatchesPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getDeliverers } from '../services/delivererService';
import { getSales } from '../services/saleService';
import {
  getBatches, createBatch, updateBatch, deleteBatch
} from '../services/deliveryBatchService';
import { Link } from 'react-router-dom';

export default function DeliveryBatchesPage() {
  const [deliverers, setDeliverers] = useState([]);
  const [sales, setSales] = useState([]);
  const [batches, setBatches] = useState([]);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { delivererId: '', date: '', description: '', saleIds: [] }
  });

  const load = async () => setBatches((await getBatches()).data);
  const loadDeliverers = async () => setDeliverers((await getDeliverers()).data);
  const loadSales = async () => {
    const all = (await getSales()).data;
    const assigned = new Set(
      (await getBatches()).data
        .flatMap(b => b.items.map(it => it.saleId))
    );
    setSales(all.filter(s => !assigned.has(s.id)));
  };

  useEffect(() => {
    load(); loadDeliverers(); loadSales();
  }, []);

  const onSubmit = async form => {
    const payload = {
      delivererId: Number(form.delivererId),
      date: form.date,
      description: form.description,
      saleIds: form.saleIds.map(Number)
    };
    if (form.id) await updateBatch(form.id, payload);
    else await createBatch(payload);
    reset({ delivererId:'', date:'', description:'', saleIds:[] });
    load(); loadSales();
  };

  const onEdit = b => reset({
    id: b.id,
    delivererId: b.delivererId,
    date: b.date.slice(0,16),
    description: b.description || '',
    saleIds: b.items.map(it => it.saleId)
  });
  const onDelete = id => {
    if (window.confirm('Borrar lote?')) deleteBatch(id).then(() => { load(); loadSales(); });
  };

  return (
    <div className="container mt-4">
      <h3>Lotes de Reparto</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Repartidor</label>
            <select {...register('delivererId',{required:true})} className="form-select">
              <option value="">Seleccione</option>
              {deliverers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.firstName} {d.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label>Fecha y hora</label>
            <input type="datetime-local" {...register('date',{required:true})} className="form-control"/>
          </div>
          <div className="col-md-4">
            <label>Descripción</label>
            <input {...register('description')} className="form-control" />
          </div>
        </div>

        <div className="mb-3">
          <label>Ventas a asignar</label>
          <div className="row">
            {sales.map(s => (
              <div className="col-md-3 form-check" key={s.id}>
                <input
                  type="checkbox"
                  value={s.id}
                  {...register('saleIds')}
                  className="form-check-input"
                  id={`sale-${s.id}`}
                />
                <label htmlFor={`sale-${s.id}`} className="form-check-label">
                  #{s.id} {s.client.firstName} {s.client.lastName} (${s.total.toFixed(2)})
                </label>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-success">Guardar Lote</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Repartidor</th><th>Fecha</th><th>Ventas</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.deliverer.firstName} {b.deliverer.lastName}</td>
              <td>{new Date(b.date).toLocaleString()}</td>
              <td>{b.items.length}</td>
              <td>
                <button onClick={() => onEdit(b)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(b.id)} className="btn btn-sm btn-danger">🗑</button>
                <Link to={`/print/rutas/${b.id}`} className="btn btn-sm btn-secondary ms-2">Ruta</Link>
                <Link to={`/print/carga/${b.id}`} className="btn btn-sm btn-secondary ms-2">Carga</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}