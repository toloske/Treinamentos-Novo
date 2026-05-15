import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, ChevronRight, ChevronLeft, HelpCircle, AlertCircle, ExternalLink } from 'lucide-react';
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
    { id: 1, question: 'Qual é a ordem correta sugerida para contar os pacotes na gaiola e transferi-los para o veículo?', options: ['Começar pela parte de baixo para liberar espaço', 'Contar primeiro a parte de cima, depois a do meio e por fim a de baixo', 'Contar e organizar no carro ao mesmo tempo para ganhar velocidade', 'Contar apenas o que couber no veículo na primeira viagem'], correctIndex: 1 },
    { id: 2, question: 'Qual é o limite de velocidade permitido para veículos dentro do pátio do SVC?', options: ['20 km/h', '15 km/h', '10 km/h', '5 km/h'], correctIndex: 3 },
    { id: 3, question: 'O que significa o indicador PNR na operação?', options: ['Pedido No Recinto', 'Pacote Não Recebido', 'Procedimento de Nova Rota', 'Pacote Novamente Roteirizado'], correctIndex: 1 },
    { id: 4, question: 'Qual é a meta de tempo (YMS) para realizar todo o carregamento e liberar a vaga?', options: ['Até 10 minutos', 'Até 30 minutos', 'Até 60 minutos', 'Não existe meta de tempo definida'], correctIndex: 1 },
    { id: 5, question: 'O que define uma "Visita Fantasma" nas métricas de experiência do comprador?', options: ['Quando o motorista esquece o pacote no pátio', 'Quando o cliente não é encontrado no endereço', 'Atualizar o status de insucesso sem estar perto do local de entrega', 'Quando o pacote é entregue para um vizinho sem autorização'], correctIndex: 2 },
    { id: 6, question: 'Ao estacionar na doca para carregar, onde o motorista deve deixar a chave do veículo?', options: ['No bolso do uniforme por segurança', 'Na ignição com o motor desligado', 'Entregar ao responsável do local ou deixá-la no para-brisa', 'Escondida embaixo do banco'], correctIndex: 2 },
    { id: 7, question: 'No procedimento de "APOIO" (ajudar em uma rota existente), qual é a regra de ouro sobre os pacotes?', options: ['Bipar todos os pacotes antes de sair', 'NUNCA bipar o pacote', 'Bipar apenas os pacotes que forem entregues por último', 'Bipar apenas se o motorista principal autorizar'], correctIndex: 1 },
    { id: 8, question: 'Se o aplicativo solicitar uma Palavra-Chave (Senha) e o cliente não a possuir, o que deve ser feito?', options: ['Deixar o pacote com o cliente e pedir para ele ligar depois', 'Tentar adivinhar a senha por até 10 vezes', 'Em hipótese alguma deixar o pacote; marcar como "Não pude entregar"', 'Entregar para um vizinho que saiba a senha do cliente'], correctIndex: 2 },
    { id: 9, question: 'Qual é a regra de segurança sobre o uso de celular (telemóvel) no pátio do SVC?', options: ['Uso livre para falar com o dispatcher', 'Proibido usar enquanto dirige ou caminha pelo pátio', 'Permitido apenas se estiver usando fones de ouvido comuns', 'Permitido apenas dentro do veículo estacionado com motor ligado'], correctIndex: 1 },
    { id: 10, question: 'O que fazer se identificar um barulho estranho dentro de uma caixa durante a inspeção 360°?', options: ['Carregar assim mesmo se a caixa estiver bonita por fora', 'Abrir a caixa para ver o que tem dentro', 'Verificar se indica avaria e solicitar retirada da rota ou reembalagem', 'Chacoalhar a caixa com força para ver se o barulho para'], correctIndex: 2 }
  ],
  'seguranca': [
    { id: 1, question: 'De acordo com a NR 6, o que é considerado um EPI (Equipamento de Proteção Individual)?', options: ['Qualquer ferramenta usada para agilizar o trabalho', 'Um dispositivo de uso coletivo para proteger a equipe', 'Um dispositivo ou produto de uso individual destinado a proteger contra riscos ocupacionais', 'O uniforme padrão da empresa, independentemente da função'], correctIndex: 2 },
    { id: 2, question: 'Qual é uma das responsabilidades da organização (empresa) em relação aos EPIs?', options: ['Cobrar pelo fornecimento de cada equipamento', 'Fornecer o EPI adequado gratuitamente e em perfeito estado', 'Pedir para o motorista comprar seu próprio calçado de segurança', 'Exigir o uso do EPI apenas em dias de chuva'], correctIndex: 1 },
    { id: 3, question: 'Sobre o excesso de velocidade, o que os estudos indicam sobre a severidade dos acidentes?', options: ['A velocidade não influencia na gravidade da batida', 'Um aumento de apenas 8 km/h pode elevar em até 8% o número de mortes', 'O cinto de segurança anula todos os riscos de alta velocidade', 'Correr mais ajuda a evitar acidentes por passar mais rápido pelos perigos'], correctIndex: 1 },
    { id: 4, question: 'Qual é o primeiro passo sugerido nas "Boas Práticas" para se preparar contra riscos no transporte?', options: ['Comprar um veículo novo', 'Fazer um mapeamento de riscos para identificar pontos de falha', 'Contratar mais ajudantes', 'Aumentar a velocidade das entregas'], correctIndex: 1 },
    { id: 5, question: 'Na organização da carga, onde devem ser colocados os pacotes mais pesados?', options: ['No topo da pilha para facilitar a retirada', 'Na parte inferior (chão) do veículo', 'No banco do passageiro para equilibrar o peso', 'Pendurados nas laterais do baú'], correctIndex: 1 },
    { id: 6, question: 'O que são os "Pictogramas" encontrados nas caixas de mercadorias?', options: ['Adesivos decorativos com a marca do cliente', 'Códigos de barras para leitura no aplicativo', 'Símbolos gráficos que comunicam instruções universais de manuseio e armazenamento', 'Etiquetas que indicam o preço do produto'], correctIndex: 2 },
    { id: 7, question: 'Qual é a recomendação correta para o transporte de Televisores (TVs) na rota?', options: ['Transportar deitada para não cair', 'Empilhar outros pacotes pesados por cima da caixa', 'Colocar na lateral, amarrada para não se mover, e nunca carregar deitada', 'Colocar sempre junto com latas de tinta para economizar espaço'], correctIndex: 2 },
    { id: 8, question: 'O sistema de Telemetria Veicular monitora quais comportamentos do motorista em tempo real?', options: ['Apenas a localização por GPS', 'Velocidade, frenagens bruscas e consumo de combustível', 'O que o motorista está ouvindo no rádio', 'A temperatura externa do ambiente'], correctIndex: 1 },
    { id: 9, question: 'Ao ligar o veículo, quanto tempo é recomendado esperar para que o óleo lubrifique o motor completamente?', options: ['Não precisa esperar, pode sair imediatamente', 'Esperar de 20 a 30 segundos após ligar', 'Esperar pelo menos 10 minutos em marcha lenta', 'Esperar o motor atingir 100°C'], correctIndex: 1 },
    { id: 10, question: 'Qual é a regra sobre o uso de celular (telemóvel) ao volante, segundo o treinamento de segurança?', options: ['Permitido apenas para ver o mapa da rota', 'Permitido se for uma ligação rápida do dispatcher', 'Não utilizar o celular ao volante em hipótese alguma', 'Permitido apenas em estradas de terra'], correctIndex: 2 }
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

// --- PDF Slide Viewer Component ---
const PdfSlideViewer: React.FC<{ url: string }> = ({ url }) => {
  const [pdf, setPdf] = React.useState<any>(null);
  const [pageNum, setPageNum] = React.useState(1);
  const [numPages, setNumPages] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<any>(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setPageNum(1);

    const loadPdf = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error('PDF.js not loaded');

        const loadingTask = pdfjsLib.getDocument(url);
        const loadedPdf = await loadingTask.promise;
        
        if (isMounted) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Erro ao carregar o documento. Verifique sua conexão.');
          setLoading(false);
          console.error(err);
        }
      }
    };

    loadPdf();
    return () => { isMounted = false; };
  }, [url]);

  const renderPage = React.useCallback(async (num: number) => {
    if (!pdf || !canvasRef.current) return;

    try {
      // Cancel previous render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdf.getPage(num);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Calculate scale based on container width
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth * 2) / unscaledViewport.width; // 2x for retina/sharpness
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Render error:', err);
      }
    }
  }, [pdf]);

  React.useEffect(() => {
    if (pdf) {
      renderPage(pageNum);
    }
  }, [pdf, pageNum, renderPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-white space-y-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-sm font-medium animate-pulse">Carregando slides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-white p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden select-none">
      {/* Slide Navigation Header */}
      <div className="bg-slate-800 border-b border-white/10 p-2 flex items-center justify-between z-20 shadow-lg">
        <button 
          onClick={() => setPageNum(p => Math.max(1, p - 1))}
          disabled={pageNum <= 1}
          className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-20 transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Anterior</span>
        </button>

        <div className="flex flex-col items-center">
           <span className="text-xs font-black text-white tracking-widest uppercase">Slide</span>
           <span className="text-lg font-black text-primary leading-none">{pageNum} <span className="text-white/30 text-sm">/ {numPages}</span></span>
        </div>

        <button 
          onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
          disabled={pageNum >= numPages}
          className="flex items-center space-x-2 px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl disabled:opacity-20 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="text-xs font-bold hidden sm:inline">Próximo</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Content Area */}
      <div className="flex-1 overflow-auto bg-slate-900 flex items-start justify-center p-2 sm:p-4 custom-scrollbar">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>
      </div>

      {/* Swipe/Scroll Indicator (Mobile) */}
      {numPages > 1 && pageNum === 1 && (
        <div className="sm:hidden absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold border border-white/10 animate-bounce pointer-events-none">
           USE OS BOTÕES ACIMA PARA PASSAR
        </div>
      )}
    </div>
  );
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
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuizQuestion[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  const pdfs = id ? PDF_MAPPING[id] || [] : [];
  const currentPdf = pdfs[currentPdfIndex];
  const quizQuestions = randomizedQuestions;

  useEffect(() => {
    if (id && QUIZ_MAPPING[id]) {
      const shuffled = [...QUIZ_MAPPING[id]]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3); // Now displaying exactly 3 questions per session
      setRandomizedQuestions(shuffled);
    }
  }, [id]);

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
    // Scroll content area back to top
    const contentArea = document.getElementById('pdf-container');
    if (contentArea) contentArea.scrollTop = 0;
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
    // Scroll content area back to top
    const contentArea = document.getElementById('pdf-container');
    if (contentArea) contentArea.scrollTop = 0;
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
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate leading-tight">{module.title}</h1>
            <p className="text-[10px] sm:text-sm text-slate-500 font-medium truncate uppercase tracking-wider">
              {showQuiz ? 'Avaliação de Conhecimento' : `Parte ${currentPdfIndex + 1} de ${pdfs.length} • ${formatPdfName(currentPdf)}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!showQuiz && (
             <a 
               href={`/pdfs/${module.folder_name}/${currentPdf}`}
               target="_blank"
               rel="noopener noreferrer"
               className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors sm:hidden"
               title="Ver PDF em tela cheia"
             >
               <ExternalLink className="w-5 h-5" />
             </a>
          )}
          
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
      </div>

      {/* Main content Area */}
      <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 z-10">
           <div 
             className="h-full bg-primary transition-all duration-500 ease-out" 
             style={{ width: `${showQuiz ? 100 : ((currentPdfIndex) / (pdfs.length)) * 100}%` }}
           ></div>
        </div>

        <div className={`flex-1 w-full h-full transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'} flex flex-col`}>
          {!showQuiz ? (
            pdfs.length > 0 ? (
              <div id="pdf-container" className="flex-1 flex flex-col bg-slate-800 relative overflow-hidden">
                <PdfSlideViewer url={`/pdfs/${module.folder_name}/${currentPdf}`} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 flex-col p-6 text-center bg-white">
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
      <div className="bg-white p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between z-10 relative">
        <button
          onClick={goToPrev}
          disabled={currentPdfIndex === 0 && !showQuiz}
          className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{showQuiz ? 'Voltar aos Materiais' : 'Conteúdo Anterior'}</span>
          <span className="sm:hidden">{showQuiz ? 'Voltar' : 'Anterior'}</span>
        </button>
        
        {!showQuiz ? (
          <button
            onClick={goToNext}
            className="px-4 sm:px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center space-x-1 sm:space-x-2 active:scale-95 text-sm sm:text-base"
          >
            <span>{currentPdfIndex === pdfs.length - 1 ? 'Fazer Avaliação' : 'Próximo Tema'}</span>
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
