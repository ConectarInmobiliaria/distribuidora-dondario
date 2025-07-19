// frontend/src/pages/ClientsPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import {
  getClients, createClient, updateClient, deleteClient
} from '../services/clientService';
import { getZones } from '../services/zoneService';
import { AuthContext } from '../AuthContext';

export default function ClientsPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user.roles.includes('admin');

  const [clients, setClients] = useState([]);
  const [zones, setZones] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: '', lastName: '', companyName: '',
      cuit: '', address: '', phone: '',
      wantsInvoice: false, zoneId: isAdmin ? '' : undefined,
      sellerId: isAdmin ? '' : undefined
    }
  });

  const load = async () => setClients((await getClients()).data);
  const loadZones = async () => setZones((await getZones()).data);
  useEffect(() => { load(); loadZones(); }, []);

  const onSubmit = async form => {
    await (form.id
      ? updateClient(form.id, form)
      : createClient(form)
    );
    reset();
    load();
  };

  const onEdit = c => reset({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    companyName: c.companyName,
    cuit: c.cuit,
    address: c.address,
    phone: c.phone,
    wantsInvoice: c.wantsInvoice,
    zoneId: c.zoneId,
    sellerId: c.sellerId
  });
  const onDelete = id => { if (window.confirm('Borrar cliente?')) deleteClient(id).then(load); };

  return (
    <div className="container mt-4">
      <h3>Clientes</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />
        <div className="row">
          {['firstName','lastName','companyName','cuit','address','phone'].map(field => (
            <div className="col-md-4 mb-3" key={field}>
              <label className="form-label">{field}</label>
              <input
                {...register(field, { required: field==='cuit' })}
                className="form-control"
              />
            </div>
          ))}
          <div className="col-md-2 mb-3">
            <label className="form-label">Factura</label>
            <input type="checkbox" {...register('wantsInvoice')} className="form-check-input" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Zona</label>
            <select {...register('zoneId', { required: true })} className="form-select">
              <option value="">Seleccione</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div className="col-md-4 mb-3">
              <label className="form-label">Vendedor</label>
              <input type="number" {...register('sellerId', { required: true })} className="form-control" />
            </div>
          )}
        </div>
        <button className="btn btn-success">Guardar Cliente</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th><th>Cuit</th><th>Zona</th><th>Vendedor</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.firstName} {c.lastName}</td>
              <td>{c.cuit}</td>
              <td>{c.zone.name}</td>
              <td>{c.seller.firstName} {c.seller.lastName}</td>
              <td>
                <button onClick={() => onEdit(c)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(c.id)} className="btn btn-sm btn-danger">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
