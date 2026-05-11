import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, ChevronRight, ChevronLeft, HelpCircle, AlertCircle } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Driver, Module } from '../../services/dataService';

const PDF_MAPPING: Record<string, string[]> = {
  'operacao': [
    '01_seguranca.pdf',
    '02_visitas.pdf',
    '03_pnr.pdf',
    '04_apoio.pdf',
    '05_carregamento.pdf',
    '06_yms.pdf',
    '07_finalizacao.pdf'
  ],
  'seguranca': [
    '01_nr6_epi.pdf',
    '02_excesso_velocidade.pdf',
    '03_boas_praticas.pdf',
    '04_carga_descarga.pdf',
    '05_telemetria.pdf'
  ]
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUIZ_MAPPING: Record<string, QuizQuestion[]> = {
  'operacao': [
    { id: 1, question: 'Durante o processo de finalização e prestação de contas, o que é exigido do motorista?', options: ['Apenas informar verbalmente que a entrega foi feita', 'Entrega dos canhotos assinados, sem rasuras, carimbados e baixados no sistema', 'Deixar os documentos no veículo para a próxima viagem', 'Apenas assinar a folha de ponto'], correctIndex: 1 },
    { id: 2, question: 'Qual o papel do YMS na operação logística?', options: ['Controlar o consumo de combustível da frota', 'Rastrear o veículo durante toda a rodovia', 'Gerenciar de forma inteligente o fluxo e o pátio de veículos', 'Calcular o valor do frete a ser pago'], correctIndex: 2 },
    { id: 3, question: 'Durante o carregamento, de quem é a responsabilidade de acompanhar a carga, garantir a distribuição de peso e amarrá-la corretamente?', options: ['Exclusiva da equipe de armazém', 'Do cliente final que vai receber a mercadoria', 'Do porteiro da unidade', 'Do motorista, garantindo a segurança para a viagem'], correctIndex: 3 }
  ],
  'seguranca': [
    { id: 1, question: 'Segundo a NR6 e nossas políticas, qual a verdadeira importância do uso de EPIs?', options: ['Proteger a saúde e integridade física do trabalhador em áreas de risco', 'Apenas cumprir uma formalidade burocrática', 'Melhorar a estética do uniforme da empresa', 'Evitar que a roupa pessoal se suje'], correctIndex: 0 },
    { id: 2, question: 'Por que o uso da telemetria é fundamental na prevenção de acidentes?', options: ['Aumenta a potência do motor do veículo', 'Permite monitorar excessos de velocidade, frenagens bruscas e comportamentos de risco', 'Serve apenas para o controle financeiro de pedágios', 'Substitui a necessidade de habilitação profissional'], correctIndex: 1 },
    { id: 3, question: 'Durante o processo de carga e descarga, qual é a postura de segurança recomendada?', options: ['Deixar o veículo ligado e desengatado para agilizar a saída', 'Isolar a área, calçar o veículo, usar EPIs apropriados e manter distância de cargas suspensas', 'Ficar debaixo da carga para ajudar a segurá-la', 'Dormir na cabine enquanto o caminhão é carregado sem travas'], correctIndex: 1 }
  ]
};

const formatPdfName = (filename: string) => {
  if (!filename) return '';
  const noExt = filename.replace('.pdf', '');
  const parts = noExt.split('_');
  if (parts.length > 1 && !isNaN(parseInt(parts[0]))) {
    const num = parseInt(parts[0], 10);
    const text = parts.slice(1).join(' ');
    // capitalize first letter
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    return `${num}. ${capitalized}`;
  }
  return noExt;
};

const ModuleViewer: React.FC<{ driver: Driver }> = ({ driver }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  const pdfs = id ? PDF_MAPPING[id] || [] : [];
  const currentPdf = pdfs[currentPdfIndex];
  const quizQuestions = id ? QUIZ_MAPPING[id] || [] : [];

  useEffect(() => {
    const fetchModule = async () => {
      if (!id) return;
      try {
        const mods = await dataService.getModules();
        const found = mods.find(m => m.id === id);
        if (found) {
          setModule(found);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id, navigate]);

  const handlePdfChange = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPdfIndex(newIndex);
      setIsTransitioning(false);
    }, 300); // 300ms transition
  };

  const goToNext = () => {
    if (currentPdfIndex < pdfs.length - 1) {
      handlePdfChange(currentPdfIndex + 1);
    } else if (quizQuestions.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowQuiz(true);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToPrev = () => {
    if (showQuiz) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowQuiz(false);
        setQuizSubmitted(false);
        setIsTransitioning(false);
      }, 300);
    } else if (currentPdfIndex > 0) {
      handlePdfChange(currentPdfIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (!module) return;
    setSaving(true);
    try {
      await dataService.markModuleCompleted(driver.id, module.id);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Erro ao marcar como concluído.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuizSubmit = () => {
    const allAnswered = quizQuestions.every(q => quizAnswers[q.id] !== undefined);
    if (!allAnswered) {
      alert('Por favor, responda todas as questões antes de concluir.');
      return;
    }
    setQuizSubmitted(true);
  };

  const isQuizPassed = () => {
    if (!quizSubmitted) return false;
    return quizQuestions.every(q => quizAnswers[q.id] === q.correctIndex);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-2xl p-4 border border-slate-200 border-b-0 flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{module.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
              {showQuiz ? 'Avaliação de Conhecimento' : `Parte ${currentPdfIndex + 1} de ${pdfs.length} • ${formatPdfName(currentPdf)}`}
            </p>
          </div>
        </div>
        
        {showQuiz && quizSubmitted && isQuizPassed() && (
          <button
            onClick={handleComplete}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 shadow-md shadow-green-600/20 flex-shrink-0"
          >
            {saving ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <CheckCircle className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Concluir Módulo</span>
            <span className="sm:hidden">Concluir</span>
          </button>
        )}
      </div>

      {/* Main content Area */}
      <div className="flex-1 bg-slate-800 border-x border-slate-200 relative overflow-hidden">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-700 z-10">
           <div 
             className="h-full bg-primary transition-all duration-500 ease-out" 
             style={{ width: `${showQuiz ? 100 : ((currentPdfIndex) / (pdfs.length + (quizQuestions.length > 0 ? 0 : -1))) * 100}%` }}
           ></div>
        </div>

        <div className={`w-full h-full transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {!showQuiz ? (
            pdfs.length > 0 ? (
              <iframe 
                src={`/pdfs/${module.folder_name}/${currentPdf}#toolbar=0`}
                className="w-full h-full border-0 bg-white"
                title={`PDF ${currentPdf}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 flex-col p-6 text-center">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>Nenhum material encontrado para este módulo.</p>
              </div>
            )
          ) : (
            /* Quiz Interface */
            <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-800 p-4 sm:p-6 md:p-10 relative">
               <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Verificação de Aprendizado</h2>
                        <p className="text-sm sm:text-base text-slate-500">Responda as questões abaixo para concluir o módulo.</p>
                     </div>
                  </div>

                  {quizSubmitted && !isQuizPassed() && (
                     <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                           <p className="font-bold">Atenção!</p>
                           <p className="text-sm">Algumas respostas estão incorretas. Revise o material ou tente novamente as questões.</p>
                        </div>
                     </div>
                  )}

                  {quizSubmitted && isQuizPassed() && (
                     <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-700">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                           <p className="font-bold">Parabéns!</p>
                           <p className="text-sm">Você acertou todas as questões. Pode concluir o módulo no topo da tela.</p>
                        </div>
                     </div>
                  )}

                  <div className="space-y-8">
                     {quizQuestions.map((q, i) => (
                        <div key={q.id} className="space-y-4">
                           <h3 className="font-bold text-base sm:text-lg text-slate-700">
                              <span className="text-primary mr-2">{i + 1}.</span> 
                              {q.question}
                           </h3>
                           <div className="space-y-3">
                              {q.options.map((opt, oIdx) => {
                                 const isSelected = quizAnswers[q.id] === oIdx;
                                 let stateClass = "border-slate-200 hover:border-primary/50 hover:bg-slate-50 text-slate-700 cursor-pointer";
                                 
                                 if (isSelected) {
                                    stateClass = "border-primary bg-primary/5 text-primary-dark font-medium shadow-sm ring-1 ring-primary/20";
                                 }

                                 if (quizSubmitted) {
                                    stateClass = "border-slate-200 text-slate-500 cursor-default opacity-60";
                                    if (isSelected && q.correctIndex !== oIdx) {
                                       stateClass = "border-rose-500 bg-rose-50 text-rose-700 font-medium ring-1 ring-rose-500/20";
                                    }
                                    if (q.correctIndex === oIdx) {
                                       stateClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-500/50 shadow-sm opacity-100 z-10 relative";
                                    }
                                 }

                                 return (
                                    <div 
                                       key={oIdx}
                                       onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                       className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${stateClass} flex items-center justify-between group text-sm sm:text-base`}
                                    >
                                       <span>{opt}</span>
                                       {quizSubmitted && q.correctIndex === oIdx && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>

                  {!quizSubmitted && (
                     <div className="mt-10 pt-6 border-t border-slate-100">
                        <button 
                           onClick={handleQuizSubmit}
                           className="w-full py-3 sm:py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-sm sm:text-base"
                        >
                           Enviar Respostas
                        </button>
                     </div>
                  )}

                  {quizSubmitted && !isQuizPassed() && (
                     <div className="mt-10 pt-6 border-t border-slate-100">
                        <button 
                           onClick={() => setQuizSubmitted(false)}
                           className="w-full py-3 sm:py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 text-sm sm:text-base"
                        >
                           Tentar Novamente
                        </button>
                     </div>
                  )}
               </div>
               {/* Bottom padding for scrolling */}
               <div className="h-12 w-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white rounded-b-2xl p-3 sm:p-4 border border-slate-200 border-t-0 flex items-center justify-between z-10 shadow-sm relative">
        <button
          onClick={goToPrev}
          disabled={currentPdfIndex === 0 && !showQuiz}
          className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{showQuiz ? 'Voltar aos Materiais' : 'Anterior'}</span>
        </button>
        
        {!showQuiz ? (
          <button
            onClick={goToNext}
            className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center space-x-1 sm:space-x-2 active:scale-95 text-sm sm:text-base"
          >
            <span>{currentPdfIndex === pdfs.length - 1 ? 'Fazer Avaliação' : 'Próximo'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-4 sm:px-6 py-2 text-slate-400 text-xs sm:text-sm font-bold flex items-center text-center">
             Finalize o teste acima
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleViewer;
