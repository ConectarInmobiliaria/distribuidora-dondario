import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Panel de Control — Administrador</h2>
        <button className="btn btn-outline-secondary" onClick={onLogout}>
          Cerrar sesión ({user.name} - {user.roles.join(', ')})
        </button>
      </div>
      <ul className="list-group mt-3">
        <li className="list-group-item">
          <Link to="/zones">Gestión de Zonas</Link>
        </li>
        <li className="list-group-item">
          <Link to="/sellers">Gestión de Vendedores</Link>
        </li>
        <li className="list-group-item">
  <Link to="/deliverers">Gestión de Repartidores</Link>
</li>
         <li className="list-group-item">
          <Link to="/clients">Gestión de Clientes</Link>
        </li>
        <li className="list-group-item">
          <Link to="/products">Gestión de Productos</Link>
        </li>
        <li className="list-group-item">
  <Link to="/sales">Gestión de Ventas</Link>

</li>
<li className="list-group-item">
  <Link to="/batches">Gestión de Lotes</Link>
</li>
<li className="list-group-item">
  <Link to="/closures">Cierre de Caja</Link>
</li>
<li className="list-group-item">
  <Link to="/reports">Reportes</Link>
</li>
      </ul>
       
    </div>
  );
}
