import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async data => {
    try {
      await login(data.email, data.password);
      nav('/dashboard');
    } catch {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-3">
      {/* Logo */}
      <img
        src="/logo.webp"
        alt="Logo"
        style={{ width: '120px', height: 'auto', marginBottom: '20px' }}
      />

      {/* Card con formulario */}
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              {...register('email')}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3 position-relative">
            <label className="form-label">Contraseña</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="form-control"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
