import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Driver } from '../../services/dataService';

export const Register: React.FC<{ onRegister: (d: Driver) => void }> = ({ onRegister }) => {
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (val: string) => {
    return val.replace(/\D/g, '').slice(0, 11);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (cpf.length !== 11) {
      setError('CPF inválido. Digite 11 números.');
      return;
    }

    setLoading(true);
    try {
      // Check if CPF already exists
      const existing = await dataService.getDriverByCpf(cpf);
      if (existing) {
        setError('Este CPF já está cadastrado.');
        setLoading(false);
        return;
      }

      const pseudoHash = btoa(password);
      const driver = await dataService.createDriver(cpf, name, pseudoHash, email);
      onRegister(driver);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Criar Conta</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Preencha seus dados para iniciar o onboarding.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João da Silva"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail (Opcional)</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
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
              placeholder="Crie uma senha forte"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || cpf.length < 11 || password.length < 4 || name.length < 3}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors flex items-center justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar e Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          Já tem conta? <Link to="/" className="text-primary font-medium hover:underline">Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
