import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, KeyRound, Search, ArrowLeft, Loader2, Lock, RefreshCcw } from 'lucide-react';
import { dataService } from '../../services/dataService';
import logo from '../../assets/logo.png';
import type { Driver, Module, Progress } from '../../services/dataService';
import CertificateGenerator from '../training/CertificateGenerator';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [allProgress, setAllProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Password reset modal state
  const [resetDriver, setResetDriver] = useState<Driver | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('admin_token');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === 'admin123') {
      localStorage.setItem('admin_token', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
      fetchData();
    } else {
      setAuthError(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversData, modulesData, progressData] = await Promise.all([
        dataService.getAllDrivers(),
        dataService.getModules(),
        dataService.getAllProgress()
      ]);
      setDrivers(driversData);
      setModules(modulesData);
      setAllProgress(progressData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecycling = async (driver: Driver) => {
    const driverProgressRows = allProgress.filter(p => p.driver_id === driver.id && p.status === 'completed');
    
    if (driverProgressRows.length === 0) {
      alert('Este motorista ainda não concluiu nenhum treinamento para realizar reciclagem.');
      return;
    }

    const confirmMessage = `Deseja realmente iniciar a reciclagem para ${driver.name}?\n\nIsso irá:\n1. Resetar o progresso atual.\n2. Marcar o certificado como "Reciclagem".\n3. Salvar a data de conclusão atual como treinamento anterior.`;
    
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      // Find the latest completion date
      const dates = driverProgressRows.map(p => p.completed_at ? new Date(p.completed_at).getTime() : 0);
      const latestDate = new Date(Math.max(...dates)).toISOString();
      
      await dataService.triggerRecycling(driver.id, latestDate);
      alert('Reciclagem iniciada com sucesso!');
      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao iniciar reciclagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetDriver || newPassword.length < 4) return;
    
    setResetting(true);
    try {
      const pseudoHash = btoa(newPassword);
      await dataService.updateDriverPassword(resetDriver.id, pseudoHash);
      alert(`Senha de ${resetDriver.name} alterada com sucesso!`);
      setResetDriver(null);
      setNewPassword('');
    } catch (error) {
      console.error(error);
      alert('Erro ao alterar a senha.');
    } finally {
      setResetting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-lg p-3 mx-auto mb-6">
            <img src={logo} alt="Logo da Empresa" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-center text-slate-500 mb-8">Área exclusiva para administradores.</p>
          
          <form onSubmit={handleAdminLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className={`pl-10 pr-4 py-3 border rounded-xl w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white ${authError ? 'border-red-300 ring-red-100' : 'border-slate-200'}`}
                  placeholder="Digite a senha master"
                  required
                />
              </div>
              {authError && <p className="text-red-500 text-sm mt-2">Senha incorreta.</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20"
            >
              Entrar
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-4 py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="bg-slate-900 p-1.5 rounded-lg mr-3 shadow-sm flex items-center justify-center">
                <img src={logo} alt="Logo da Empresa" className="w-6 h-6 object-contain" />
              </div>
              Painel Administrativo
            </h1>
            <p className="text-slate-500 mt-1">Gerenciamento de acessos e certificados do Onboarding.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-slate-400" />
            Motoristas Cadastrados
          </h2>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-3 px-6 font-medium">Nome Completo</th>
                <th className="py-3 px-6 font-medium">CPF</th>
                <th className="py-3 px-6 font-medium">Progresso</th>
                <th className="py-3 px-6 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando motoristas...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Nenhum motorista encontrado.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(d => {
                  const driverProgress = allProgress.filter(p => p.driver_id === d.id && p.status === 'completed').length;
                  const totalModules = modules.length;
                  const isFinished = totalModules > 0 && driverProgress === totalModules;
                  const percentage = totalModules > 0 ? Math.round((driverProgress / totalModules) * 100) : 0;

                  return (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-800">{d.name}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">{d.cpf}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 max-w-[120px] bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${isFinished ? 'bg-green-500' : 'bg-primary'}`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${isFinished ? 'text-green-600' : 'text-slate-500'}`}>
                            {driverProgress}/{totalModules}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <button 
                            onClick={() => setResetDriver(d)}
                            title="Redefinir Senha"
                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button 
                            onClick={() => handleRecycling(d)}
                            title="Iniciar Reciclagem"
                            className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${d.is_recycling ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                          >
                            <RefreshCcw className={`w-4 h-4 ${d.is_recycling ? 'animate-spin-slow' : ''}`} />
                          </button>
                          
                          {isFinished && (
                            <CertificateGenerator driver={d} modules={modules} compact={true} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Redefinir Senha</h3>
              <p className="text-slate-500 text-sm mb-6">
                Digite a nova senha para o motorista <strong className="text-slate-700">{resetDriver.name}</strong>.
              </p>
              
              <form onSubmit={handleResetPassword}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                
                <div className="flex space-x-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => { setResetDriver(null); setNewPassword(''); }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={resetting || newPassword.length < 4}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    Confirmar Alteração
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
