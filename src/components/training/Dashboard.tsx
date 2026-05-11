import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Driver, Module, Progress } from '../../services/dataService';
import CertificateGenerator from './CertificateGenerator';

const Dashboard: React.FC<{ driver: Driver }> = ({ driver }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mods, progs] = await Promise.all([
          dataService.getModules(),
          dataService.getProgress(driver.id)
        ]);
        setModules(mods);
        setProgress(progs);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driver]);

  const getModuleStatus = (modId: string) => {
    const p = progress.find(p => p.module_id === modId);
    return p ? p.status : 'not_started';
  };

  const completedModulesCount = progress.filter(p => p.status === 'completed').length;
  const allCompleted = modules.length > 0 && completedModulesCount === modules.length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Olá, {driver.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao seu painel de onboarding e treinamentos.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Progresso</div>
            <div className="text-lg font-bold text-slate-800">
              {completedModulesCount} de {modules.length} concluídos
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => {
          const status = getModuleStatus(mod.id);
          const isCompleted = status === 'completed';
          
          return (
            <div key={mod.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                {isCompleted ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Concluído</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pendente</span>
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">{mod.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">{mod.description}</p>
              
              <button
                onClick={() => navigate(`/module/${mod.id}`)}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex justify-center items-center ${
                  isCompleted 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isCompleted ? 'Revisar Treinamento' : 'Iniciar Treinamento'}
              </button>
            </div>
          );
        })}
      </div>

      {allCompleted && (
        <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Parabéns! Você concluiu tudo.</h2>
          <p className="text-green-700 mb-6 max-w-lg mx-auto">
            Você completou todos os módulos de onboarding obrigatórios. Seu certificado já está disponível.
          </p>
          <CertificateGenerator driver={driver} modules={modules} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
