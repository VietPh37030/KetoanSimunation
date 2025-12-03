import React, { useState, useEffect, useRef } from 'react';
import { InterviewRound, UserProfile, NPC, Question, Evaluation, InterviewItem } from '../types';
import { NPC_ROSTER, ROUND_TITLES } from '../constants';
import { generateQuestions, evaluateAnswer } from '../services/geminiService';
import Button from './Button';
import { Send, Activity, ChevronDown, ChevronUp, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  onFinish: (history: InterviewItem[]) => void;
}

const InterviewSession: React.FC<Props> = ({ userProfile, onFinish }) => {
  // State
  const [currentRound, setCurrentRound] = useState<InterviewRound>(InterviewRound.HR);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [npc, setNpc] = useState<NPC | null>(null);
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<InterviewItem[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  
  // NPC Interaction State
  const [showNpcDetails, setShowNpcDetails] = useState(false);
  const [npcStatus, setNpcStatus] = useState<string>('ready'); // ready, listening, thinking, speaking
  const [npcEmotion, setNpcEmotion] = useState<string | null>(null); // e.g., Impressed, Neutral

  // Setup round
  useEffect(() => {
    initRound(currentRound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  // Update NPC Status based on user interaction
  useEffect(() => {
    if (evaluating) {
      setNpcStatus('thinking');
    } else if (answer.length > 0) {
      setNpcStatus('listening');
    } else {
      setNpcStatus('ready');
    }
  }, [answer, evaluating]);

  const initRound = async (round: InterviewRound) => {
    setLoading(true);
    setLoadingText(`Đang kết nối với phòng ${round}...`);
    setShowNpcDetails(false); // Reset detail view on new round
    
    // Select Random NPC
    const potentialNPCs = NPC_ROSTER[round];
    const selectedNPC = potentialNPCs[Math.floor(Math.random() * potentialNPCs.length)];
    setNpc(selectedNPC);

    try {
      // Generate Questions via AI
      const questions = await generateQuestions(round, userProfile, selectedNPC.personality);
      setRoundQuestions(questions);
      setCurrentQIndex(0);
      setCurrentEvaluation(null);
      setAnswer('');
      setNpcStatus('ready');
      setNpcEmotion(null);
    } catch (error) {
      console.error("Failed to init round", error);
      alert("Lỗi kết nối AI. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !npc) return;

    setEvaluating(true);
    // Humanize: Add a slight artificial delay to simulate reading
    setLoadingText(`${npc.name} đang đọc câu trả lời của bạn...`);
    
    try {
      const currentQ = roundQuestions[currentQIndex];
      // Pass NPC context for emotion generation
      const result = await evaluateAnswer(currentQ, answer, userProfile, { 
        name: npc.name, 
        personality: npc.personality 
      });
      
      setCurrentEvaluation(result);
      setNpcStatus('speaking');
      if (result.npcEmotion) {
        setNpcEmotion(result.npcEmotion);
      }
      
      // Save to history
      const newItem: InterviewItem = {
        question: currentQ,
        userAnswer: answer,
        evaluation: result,
        npcId: npc.id
      };
      setHistory(prev => [...prev, newItem]);

    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setCurrentEvaluation(null);
    setNpcStatus('ready');
    setNpcEmotion(null);
    
    if (currentQIndex + 1 < roundQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
    } 
    // If it was the last question, the UI would have shown the "Next Round" button instead
  };

  const handleNextRound = () => {
    if (currentRound === InterviewRound.HR) setCurrentRound(InterviewRound.TECHNICAL);
    else if (currentRound === InterviewRound.TECHNICAL) setCurrentRound(InterviewRound.SITUATION);
    else {
      // Finished all rounds
      onFinish(history);
    }
  };

  // Helper to get human-readable status
  const getStatusText = () => {
    if (!npc) return 'Đang kết nối...';
    
    if (npcEmotion && currentEvaluation) {
      return `${npc.name} cảm thấy ${npcEmotion.toLowerCase()} về câu trả lời của bạn.`;
    }

    switch (npcStatus) {
      case 'listening': 
        return `${npc.name} đang chăm chú lắng nghe từng lời của bạn...`;
      case 'thinking': 
        return `${npc.name} đang cân nhắc kỹ lưỡng câu trả lời...`;
      case 'speaking': 
        return `${npc.name} đang chia sẻ nhận xét chi tiết...`;
      default: 
        return `${npc.name} đang chờ tín hiệu từ bạn...`;
    }
  };

  // Helper for emotion emoji
  const getEmotionEmoji = () => {
    if (!npcEmotion) return null;
    const lower = npcEmotion.toLowerCase();
    if (lower.includes('impressed') || lower.includes('happy') || lower.includes('satisfied')) return '🤩';
    if (lower.includes('skeptical') || lower.includes('confused') || lower.includes('worried')) return '🤨';
    if (lower.includes('disappointed') || lower.includes('sad') || lower.includes('angry')) return '😞';
    return '🙂';
  };

  // Helper for dynamic avatar styling
  const getAvatarClasses = () => {
    let classes = "w-24 h-24 rounded-full mx-auto border-4 shadow-md object-cover transition-all duration-700 ease-in-out relative z-10 ";
    
    // Border color logic
    if (npcEmotion?.toLowerCase().includes('impressed')) {
      classes += 'border-green-300 ';
    } else if (npcEmotion?.toLowerCase().includes('disappointed')) {
      classes += 'border-red-300 ';
    } else {
      classes += 'border-white ';
    }

    // Dynamic Animations
    if (npcStatus === 'thinking') {
       classes += 'scale-95 opacity-90 grayscale-[0.3] '; 
    } else if (npcStatus === 'speaking') {
       classes += 'scale-105 shadow-xl shadow-blue-200/50 ';
    } else {
       classes += 'scale-100 ';
    }

    // Emotion Overlay transform
    if (npcEmotion?.toLowerCase().includes('impressed')) {
       classes += 'shadow-green-200 shadow-xl -rotate-2 ';
    } else if (npcEmotion?.toLowerCase().includes('disappointed')) {
       classes += 'grayscale-[0.6] rotate-2 ';
    }

    return classes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 animate-pulse font-medium">{loadingText || "Đang chuẩn bị..."}</p>
      </div>
    );
  }

  const isLastQuestion = currentQIndex === roundQuestions.length - 1;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{ROUND_TITLES[currentRound]}</h2>
          <div className="flex gap-1 mt-1">
            {roundQuestions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  idx < currentQIndex ? 'bg-green-500' : 
                  idx === currentQIndex ? 'bg-blue-600 w-12' : 'bg-slate-300'
                }`} 
              />
            ))}
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-500 uppercase font-semibold">Ứng viên</div>
          <div className="font-bold text-slate-800">{userProfile.name}</div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 flex-1 h-full">
        
        {/* Left Panel: NPC Card */}
        <div className="md:w-1/3 space-y-4">
          {npc && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
              {/* NPC Header */}
              <div className={`p-6 text-center relative bg-gradient-to-b transition-colors duration-1000 ${
                npcEmotion?.toLowerCase().includes('impressed') ? 'from-green-50 to-white' : 
                npcEmotion?.toLowerCase().includes('disappointed') ? 'from-red-50 to-white' : 
                'from-blue-50 to-white'
              }`}>
                <div className="relative inline-block group">
                  {/* Activity Ring */}
                  {(npcStatus === 'speaking' || npcStatus === 'thinking') && (
                    <div className={`absolute -inset-1 rounded-full opacity-75 animate-ping ${
                       npcStatus === 'speaking' ? 'bg-blue-100' : 'bg-yellow-50'
                    }`}></div>
                  )}

                  <img 
                    src={npc.avatar} 
                    alt={npc.name} 
                    className={getAvatarClasses()} 
                  />
                  
                  {/* Status Indicator (Bottom Right of Avatar) */}
                  <div className={`absolute bottom-1 right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transition-all duration-500 bg-white shadow-sm z-20 ${
                    npcEmotion ? 'scale-110' : ''
                  }`}>
                     <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      npcStatus === 'thinking' ? 'bg-yellow-400 animate-ping' : 
                      npcStatus === 'listening' ? 'bg-blue-500' : 'bg-green-500'
                     }`} />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-center gap-2">
                  <h3 className="font-bold text-lg text-slate-800">{npc.name}</h3>
                  
                  {/* Emotion Visual Indicator Next to Name */}
                  {npcEmotion && (
                    <span 
                      className="text-xl filter drop-shadow-sm animate-in zoom-in duration-300 cursor-help transform hover:scale-125 transition-transform" 
                      title={`Feeling: ${npcEmotion}`}
                    >
                      {getEmotionEmoji()}
                    </span>
                  )}

                  {/* Subtle Personality Hint Tooltip */}
                  <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-40 bg-slate-800 text-white text-xs p-2 rounded z-10 text-center shadow-lg">
                      Tính cách: {npc.traits[0]}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </div>

                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-1">{npc.role}</p>
                
                {/* Status Text */}
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 ${
                  npcEmotion ? 'bg-indigo-100 text-indigo-700 scale-105' :
                  npcStatus === 'listening' ? 'bg-blue-100 text-blue-700' :
                  npcStatus === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <Activity className={`w-3 h-3 mr-1.5 ${npcStatus !== 'ready' && !npcEmotion ? 'animate-pulse' : ''}`} />
                  {getStatusText()}
                </div>
              </div>

              {/* Collapsible Details */}
              <div className="border-t border-slate-100">
                 <button
                  onClick={() => setShowNpcDetails(!showNpcDetails)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium">Hồ sơ người phỏng vấn</span>
                  {showNpcDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showNpcDetails && (
                <div className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2">
                   <div className="mb-3">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phong cách</p>
                     <p className="text-sm text-slate-700 italic leading-relaxed">"{npc.personality}"</p>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase mb-2">Đặc điểm</p>
                     <div className="flex flex-wrap gap-2">
                        {npc.traits.map((trait, i) => (
                          <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">
                            {trait}
                          </span>
                        ))}
                     </div>
                   </div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <h4 className="font-bold flex items-center mb-2">
              <Info className="w-4 h-4 mr-2" /> Mẹo phỏng vấn
            </h4>
            <p className="opacity-90 leading-relaxed">
              Hãy trả lời ngắn gọn, đúng trọng tâm. Sử dụng phương pháp STAR (Situation, Task, Action, Result) nếu được hỏi về tình huống.
            </p>
          </div>
        </div>

        {/* Right Panel: Chat/Question */}
        <div className="md:w-2/3 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           
           {/* Question Area */}
           <div className="p-6 bg-blue-600 text-white relative overflow-hidden flex-shrink-0">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
             <div className="relative z-10">
               <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-semibold mb-3 backdrop-blur-sm border border-white/10">
                 CÂU HỎI {currentQIndex + 1}/{roundQuestions.length}
               </span>
               <h3 className="text-xl md:text-2xl font-bold leading-relaxed">
                 {roundQuestions[currentQIndex]?.text || "..."}
               </h3>
             </div>
           </div>

           {/* Interaction Area */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
             
             {/* If evaluated, show feedback */}
             {currentEvaluation && (
               <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                      currentEvaluation.score >= 7 ? 'bg-green-500' : 
                      currentEvaluation.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {currentEvaluation.score}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Đánh giá từ AI</div>
                      <div className="text-xs text-slate-500">Dựa trên độ chính xác & kỹ năng mềm</div>
                    </div>
                 </div>
                 
                 <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-700">Điểm mạnh: </span>
                        <span className="text-slate-600">{currentEvaluation.strengths.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-700">Cần cải thiện: </span>
                        <span className="text-slate-600">{currentEvaluation.weaknesses.join(', ')}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg mt-2 border border-slate-100">
                      <span className="font-semibold text-slate-700 block mb-1">Gợi ý trả lời:</span>
                      <p className="text-slate-600 italic">"{currentEvaluation.betterAnswer}"</p>
                    </div>
                 </div>
               </div>
             )}

             {/* Input Area: Visibile if not yet evaluated */}
             {!currentEvaluation && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                 <textarea
                   className="w-full p-4 h-48 md:h-64 resize-none outline-none text-slate-900 bg-white placeholder:text-slate-400"
                   placeholder="Nhập câu trả lời của bạn tại đây..."
                   value={answer}
                   onChange={(e) => setAnswer(e.target.value)}
                   disabled={evaluating}
                 ></textarea>
                 <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                   <div className="flex items-center gap-2">
                      {answer.length > 0 && <span>{answer.length} ký tự</span>}
                      {evaluating && <span className="animate-pulse text-blue-500">Đang chấm điểm...</span>}
                   </div>
                   <Button 
                     onClick={handleSubmitAnswer} 
                     disabled={!answer.trim() || evaluating}
                     className="px-6"
                     isLoading={evaluating}
                   >
                     Gửi câu trả lời <Send className="ml-2 w-4 h-4" />
                   </Button>
                 </div>
               </div>
             )}

             {/* Next Actions */}
             {currentEvaluation && (
               <div className="flex justify-end pt-4">
                 {isLastQuestion ? (
                   <Button onClick={handleNextRound} variant="primary" className="px-8">
                     Tiếp tục sang vòng sau
                   </Button>
                 ) : (
                   <Button onClick={handleNextQuestion} variant="secondary">
                     Câu hỏi tiếp theo
                   </Button>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;