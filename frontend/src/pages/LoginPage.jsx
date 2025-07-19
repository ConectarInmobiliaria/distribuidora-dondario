import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const onSubmit = async data => {
    try {
      await login(data.email, data.password);
      nav('/dashboard');
    } catch {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label>Email</label>
          <input {...register('email')} className="form-control" />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" {...register('password')} className="form-control" />
        </div>
        <button className="btn btn-primary">Entrar</button>
      </form>
    </div>
  );
}
