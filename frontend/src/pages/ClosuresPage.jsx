import { useState, useEffect, useContext } from 'react';
import { createClosure, getClosures } from '../services/closureService';
import { AuthContext } from '../AuthContext';

export default function ClosuresPage() {
  const { user } = useContext(AuthContext);
  const [closures, setClosures] = useState([]);

  const load = async () => setClosures((await getClosures()).data);
  useEffect(() => { load(); }, []);

  const onClose = async () => {
    const scope = user.roles.includes('admin') 
      ? window.prompt('Scope? "global" or "seller"', 'seller') 
      : 'seller';
    await createClosure(scope);
    load();
  };

  return (
    <div className="container mt-4">
      <h3>Cierre de Caja</h3>
      <button className="btn btn-primary mb-3" onClick={onClose}>
        Generar Cierre ({user.roles.includes('admin') ? 'global/seller' : 'seller'})
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Usuario</th><th>Fecha</th>
            <th>Ventas</th><th>Devoluciones</th><th>Neto</th><th>Comisión</th>
          </tr>
        </thead>
        <tbody>
          {closures.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.user.name}</td>
              <td>{new Date(c.date).toLocaleString()}</td>
              <td>${c.totalSales.toFixed(2)}</td>
              <td>${c.totalReturns.toFixed(2)}</td>
              <td>${c.totalAmount.toFixed(2)}</td>
              <td>${c.totalCommission.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
