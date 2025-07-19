/* eslint-disable no-restricted-globals */
// frontend/src/pages/ZonesPage.jsx
import { useState, useEffect } from 'react';
import { getZones, createZone, updateZone, deleteZone } from '../services/zoneService';
import { useForm } from 'react-hook-form';

/** Días disponibles */
const WEEKDAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', daysToVisit: [] }
  });

  const load = async () => {
    const { data } = await getZones();
    setZones(data);
  };
  useEffect(() => { load(); }, []);

  const onSubmit = async form => {
    const payload = { name: form.name, daysToVisit: form.daysToVisit };
    if (form.id) {
      await updateZone(form.id, payload);
    } else {
      await createZone(payload);
    }
    reset({ name: '', daysToVisit: [] });
    load();
  };

  const onEdit = z => reset({ id: z.id, name: z.name, daysToVisit: z.daysToVisit });
  const onDelete = id => { if (window.confirm('¿Borrar esta zona?')) deleteZone(id).then(load); };

  return (
    <div className="container mt-4">
      <h3>Zonas</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input type="hidden" {...register('id')} />
        <div className="mb-3">
          <label className="form-label">Nombre de la zona</label>
          <input {...register('name', { required: true })} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Días de visita</label>
          <div>
            {WEEKDAYS.map(day => (
              <div className="form-check form-check-inline" key={day}>
                <input
                  type="checkbox"
                  value={day}
                  {...register('daysToVisit')}
                  className="form-check-input"
                  id={`day-${day}`}
                />
                <label htmlFor={`day-${day}`} className="form-check-label">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-success">Guardar Zona</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>Nombre</th><th>Días</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {zones.map(z => (
            <tr key={z.id}>
              <td>{z.name}</td>
              <td>{z.daysToVisit.join(', ')}</td>
              <td>
                <button onClick={() => onEdit(z)} className="btn btn-sm btn-primary me-2">✎</button>
                <button onClick={() => onDelete(z.id)} className="btn btn-sm btn-danger">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
