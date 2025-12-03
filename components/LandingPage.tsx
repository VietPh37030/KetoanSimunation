import React from 'react';
import { TrendingUp, ArrowRight, KeyRound } from 'lucide-react';
import Button from './Button';

interface Props {
  onStart: () => void;
  apiReady: boolean;
  onRequestApiKey: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart, apiReady, onRequestApiKey }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-800">Kế Toán Ảo</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 py-12">
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            Phiên bản Beta 1.0
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            Nâng cao kỹ năng phỏng vấn <span className="text-blue-600">Kế toán chuyên nghiệp</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Trải nghiệm 3 vòng phỏng vấn giả lập với AI: Nhân sự, Chuyên môn và Tình huống. 
            Nhận phản hồi tức thì và báo cáo chi tiết để tự tin chinh phục nhà tuyển dụng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={onStart} className="text-lg px-8 py-3 h-auto" disabled={!apiReady}>
              Bắt đầu phỏng vấn ngay <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onRequestApiKey}
              className="text-sm h-auto px-5 py-3 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Cấu hình API Key
            </Button>
          </div>

          {!apiReady && (
            <p className="text-sm text-red-500/90">
              Chưa tìm thấy API Key. Nhấn "Cấu hình API Key" để nhập khóa Gemini trước khi bắt đầu.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
            <div>
              <h3 className="font-bold text-2xl text-slate-800">3+</h3>
              <p className="text-sm text-slate-500">Vòng thi chuẩn</p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-800">AI</h3>
              <p className="text-sm text-slate-500">Chấm điểm 24/7</p>
            </div>
             <div>
              <h3 className="font-bold text-2xl text-slate-800">100%</h3>
              <p className="text-sm text-slate-500">Miễn phí</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <img src="https://picsum.photos/seed/tech1/100/100" className="w-12 h-12 rounded-full border-2 border-blue-100" alt="Interviewer" />
              <div>
                <div className="font-semibold text-slate-800">Ms. Thu Hà</div>
                <div className="text-xs text-slate-500">Kế toán trưởng</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg mb-4 text-slate-700 text-sm italic">
              "Em hãy trình bày quy trình hạch toán chi phí trả trước theo chuẩn mực kế toán Việt Nam?"
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-2/3 mb-2">
               <div className="h-full bg-blue-500 w-1/2 animate-pulse"></div>
            </div>
            <div className="text-xs text-slate-400">Đang phân tích câu trả lời...</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;