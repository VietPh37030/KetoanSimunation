import React, { useState } from 'react';
import { UserProfile } from '../types';
import Button from './Button';
import { UserCircle, Target, Award } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const SetupForm: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<UserProfile['experienceLevel']>('Intern');
  const [target, setTarget] = useState('');
  const [confidence, setConfidence] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && target) {
      onComplete({
        name,
        experienceLevel: level,
        targetRole: target,
        confidence,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UserCircle className="w-6 h-6 mr-2" /> Hồ sơ ứng viên
          </h2>
          <p className="text-blue-100 text-sm mt-1">Thông tin này giúp AI tùy chỉnh câu hỏi phù hợp với bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vị trí ứng tuyển</label>
            <div className="relative">
              <Target className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ví dụ: Kế toán thuế, Thực tập sinh..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cấp độ kinh nghiệm</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Intern', 'Fresher', 'Junior'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium border ${
                    level === lvl
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
              <span>Mức độ tự tin hiện tại</span>
              <span className="text-blue-600 font-bold">{confidence}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Lo lắng</span>
              <span>Rất tự tin</span>
            </div>
          </div>

          <Button type="submit" className="w-full py-3 text-lg mt-4">
            Vào phòng phỏng vấn
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;