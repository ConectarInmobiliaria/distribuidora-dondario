// frontend/src/pages/SellersPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  getSellers, createSeller, updateSeller, deleteSeller
} from '../services/sellerService';
import { getZones } from '../services/zoneService';

/** Checkbox de zonas */
function ZonesCheckboxes({ zoneList, register }) {
  return (
    <div>
      {zoneList.map(z => (
        <div className="form-check" key={z.id}>
          <input
            type="checkbox"
            value={z.id}
            {...register('zoneIds')}
            className="form-check-input"
            id={`zone-${z.id}`}
          />
          <label htmlFor={`zone-${z.id}`} className="form-check-label">
            {z.name}
          </label>
        </div>
      ))}
    </div>
  );
}

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [zones, setZones] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: '', lastName: '', dni: '', email: '',
      phone: '', commission: 0, password: '', zoneIds: []
    }
  });

  const load = async () => setSellers((await getSellers()).data);
  const loadZones = async () => setZones((await getZones()).data);

  useEffect(() => { load(); loadZones(); }, []);

  const onSubmit = async form => {
    if (form.id) await updateSeller(form.id, form);
    else await createSeller(form);
    reset();
    load();
  };

  const onEdit = s => reset({
    id: s.id, firstName: s.firstName, lastName: s.lastName,
    dni: s.dni, email: s.email, phone: s.phone,
    commission: s.commission, password: '', zoneIds: s.zoneSellers.map(zs => zs.zoneId)
  });
  const onDelete = id => { if (window.confirm('Borrar vendedor?')) deleteSeller(id).then(load); };

  return (
    <div className="container mt-4">
      <h3>Vendedores</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />

        <div className="row">
          {['firstName','lastName','dni','email','phone','commission','password'].map(field => (
            <div className="col-md-4 mb-3" key={field}>
              <label className="form-label">{field}</label>
              <input
                type={field==='password' ? 'password' : 'text'}
                step={field==='commission' ? '0.01' : undefined}
                {...register(field, { required: field!=='phone' })}
                className="form-control"
              />
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label className="form-label">Zonas asignadas</label>
          <ZonesCheckboxes zoneList={zones} register={register} />
        </div>

        <button type="submit" className="btn btn-success">Guardar Vendedor</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>Nombre</th><th>DNI</th><th>Email</th><th>Comisión</th><th>Zonas</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {sellers.map(s => (
            <tr key={s.id}>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.dni}</td>
              <td>{s.email}</td>
              <td>{s.commission}%</td>
              <td>{s.zoneSellers.map(zs => zs.zone.name).join(', ')}</td>
              <td>
                <button onClick={() => onEdit(s)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(s.id)} className="btn btn-sm btn-danger">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
