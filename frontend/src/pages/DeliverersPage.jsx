import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  getDeliverers, createDeliverer, updateDeliverer, deleteDeliverer
} from '../services/delivererService';

export default function DeliverersPage() {
  const [list, setList] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { firstName: '', lastName: '', phone: '', vehicle: '' }
  });

  const load = async () => setList((await getDeliverers()).data);
  useEffect(() => { load(); }, []);

  const onSubmit = async data => {
    if (data.id) await updateDeliverer(data.id, data);
    else await createDeliverer(data);
    reset({ firstName: '', lastName: '', phone: '', vehicle: '' });
    load();
  };

  const onEdit = d => reset(d);
  const onDelete = id => {
    if (window.confirm('Borrar repartidor?')) deleteDeliverer(id).then(load);
  };

  return (
    <div className="container mt-4">
      <h3>Repartidores</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />
        {['firstName','lastName','phone','vehicle'].map(f => (
          <div className="mb-3" key={f}>
            <label className="form-label">{f}</label>
            <input {...register(f, { required: true })} className="form-control" />
          </div>
        ))}
        <button className="btn btn-success">Guardar</button>
      </form>
      <table className="table">
        <thead>
          <tr><th>Nombre</th><th>Teléfono</th><th>Vehículo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {list.map(d => (
            <tr key={d.id}>
              <td>{d.firstName} {d.lastName}</td>
              <td>{d.phone}</td>
              <td>{d.vehicle}</td>
              <td>
                <button onClick={() => onEdit(d)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(d.id)} className="btn btn-sm btn-danger">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
