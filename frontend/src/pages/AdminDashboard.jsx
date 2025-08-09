// frontend/src/pages/AdminDashboard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Card, Row, Col, Button } from 'react-bootstrap';
import {
  BoxSeam,
  PeopleFill,
  Shop,
  ClipboardData,
  Truck,
  CashStack,
  BarChart,
  Layers,
  GeoAlt
} from 'react-bootstrap-icons';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/login');
  };

  const sections = [
    { to: '/zones', label: 'Gestión de Zonas', icon: <GeoAlt size={32} /> },
    { to: '/sellers', label: 'Gestión de Vendedores', icon: <PeopleFill size={32} /> },
    { to: '/deliverers', label: 'Gestión de Repartidores', icon: <Truck size={32} /> },
    { to: '/clients', label: 'Gestión de Clientes', icon: <PeopleFill size={32} /> },
    { to: '/products', label: 'Gestión de Productos', icon: <BoxSeam size={32} /> },
    { to: '/sales', label: 'Gestión de Ventas', icon: <Shop size={32} /> },
    { to: '/batches', label: 'Gestión de Lotes', icon: <Layers size={32} /> },
    { to: '/closures', label: 'Cierre de Caja', icon: <CashStack size={32} /> },
    { to: '/reports', label: 'Reportes', icon: <BarChart size={32} /> }
  ];

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Control — Administrador</h2>
        <Button variant="outline-secondary" onClick={onLogout}>
          Cerrar sesión ({user.name} - {user.roles.join(', ')})
        </Button>
      </div>

      {/* Cards Grid */}
      <Row xs={1} sm={2} md={3} lg={3} className="g-4">
        {sections.map((sec, idx) => (
          <Col key={idx}>
            <Card className="h-100 text-center shadow-sm border-0">
              <Card.Body>
                <div className="mb-3 text-primary">{sec.icon}</div>
                <Card.Title>{sec.label}</Card.Title>
                <Link className="btn btn-primary mt-2" to={sec.to}>
                  Ir
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
