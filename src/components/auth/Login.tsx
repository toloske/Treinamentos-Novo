import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import logo from '../../assets/logo.png';
import type { Driver } from '../../services/dataService';

export const Login: React.FC<{ onLogin: (d: Driver) => void }> = ({ onLogin }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (val: string) => {
    return val.replace(/\D/g, '').slice(0, 11);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Very basic hash simulation for frontend, in real app use bcrypt/backend
      const pseudoHash = btoa(password);
      const driver = await dataService.getDriverByCredentials(cpf, pseudoHash);
      
      if (driver) {
        onLogin(driver);
      } else {
        setError('CPF ou senha inválidos.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full min-h-[400px]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-lg p-3">
            <img src={logo} alt="Logo da Empresa" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso do Motorista</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Digite seu CPF e senha para acessar os treinamentos.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CPF (apenas números)</label>
            <input 
              type="text" 
              required
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="00011122233"
              maxLength={11}
              inputMode="numeric"
              pattern="\d{11}"
              title="Digite exatamente 11 números"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || cpf.length < 11 || password.length < 4}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          Primeiro acesso? <Link to="/register" className="text-primary font-medium hover:underline">Crie sua conta</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
