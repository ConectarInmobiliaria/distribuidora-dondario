import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function SellerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Panel de Control — Vendedor</h2>
        <button className="btn btn-outline-secondary" onClick={onLogout}>
          Cerrar sesión ({user.name} - {user.roles.join(', ')})
        </button>
      </div>
      <ul className="list-group mt-3">
        <li className="list-group-item">
          <Link to="/clients">Mis Clientes</Link>
        </li>
        <li className="list-group-item">
          <Link to="/sales">Crear Pedido</Link>
        </li>
        <li className="list-group-item">
          <Link to="/clients">Mis Clientes</Link>
        </li>
        <li className="list-group-item">
  <Link to="/sales">Mis Ventas</Link>
</li>
<li className="list-group-item">
  <Link to="/closures">Cierre de Caja</Link>
</li>
      </ul>
    </div>
  );
}
