import React, { useEffect, useState } from 'react';
import { InterviewItem, ReportData, UserProfile, InterviewRound } from '../types';
import { generateReport } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Button from './Button';
import { Download, Home } from 'lucide-react';

interface Props {
  history: InterviewItem[];
  userProfile: UserProfile;
  onRestart: () => void;
}

const ReportPage: React.FC<Props> = ({ history, userProfile, onRestart }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await generateReport(history, userProfile);
        setReport(data);
      } catch (error) {
        console.error("Report gen error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800">Đang tổng hợp kết quả...</h2>
        <p className="text-slate-500">AI đang phân tích hiệu suất 3 vòng thi của bạn.</p>
      </div>
    );
  }

  if (!report) return <div className="p-10 text-center">Lỗi tạo báo cáo.</div>;

  const roundData = [
    { name: 'Nhân sự', score: report.roundScores.HR },
    { name: 'Chuyên môn', score: report.roundScores.TECHNICAL },
    { name: 'Tình huống', score: report.roundScores.SITUATION },
  ];

  const skillData = [
    { subject: 'Kiến thức', A: report.techSkillsAverage, fullMark: 10 },
    { subject: 'Thái độ', A: report.softSkillsAverage, fullMark: 10 },
    { subject: 'Logic', A: (report.techSkillsAverage + report.softSkillsAverage)/2, fullMark: 10 },
    { subject: 'Tự tin', A: userProfile.confidence, fullMark: 10 }, // Compare with initial
    { subject: 'Trình bày', A: report.softSkillsAverage, fullMark: 10 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center">
           <div>
             <h1 className="text-3xl font-bold text-slate-800">Kết Quả Phỏng Vấn</h1>
             <p className="text-slate-500 mt-1">Ứng viên: {userProfile.name} | Vị trí: {userProfile.targetRole}</p>
           </div>
           <div className="mt-4 md:mt-0 text-center">
             <div className="text-sm text-slate-500 uppercase font-semibold">Điểm Tổng Quát</div>
             <div className="text-5xl font-extrabold text-blue-600">{report.overallScore}<span className="text-2xl text-slate-300">/10</span></div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Round Scores */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Điểm số theo vòng</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Radar */}
           <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Biểu đồ kỹ năng</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar name="Bạn" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Text Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tổng kết từ AI</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line mb-6">
              {report.summary}
            </p>
            <h4 className="font-bold text-slate-800 mb-2">Kế hoạch cải thiện:</h4>
            <ul className="space-y-2">
              {report.improvementPlan.map((item, idx) => (
                <li key={idx} className="flex items-start bg-slate-50 p-3 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-center space-y-4">
             <div className="text-center p-6 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2">Lời khuyên sự nghiệp</h4>
                <p className="text-sm text-blue-700">
                  {report.overallScore > 7.5 ? "Bạn đã sẵn sàng cho vị trí thực tế!" : "Cần ôn tập thêm về chuẩn mực kế toán và sự tự tin."}
                </p>
             </div>
             <Button variant="outline" className="w-full" onClick={() => window.print()}>
               <Download className="w-4 h-4 mr-2" /> Xuất PDF
             </Button>
             <Button variant="primary" className="w-full" onClick={onRestart}>
               <Home className="w-4 h-4 mr-2" /> Phỏng vấn lại
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;