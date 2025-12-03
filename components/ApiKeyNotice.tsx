import React, { useEffect, useState } from 'react';
import { KeyRound, EyeOff, RefreshCw } from 'lucide-react';
import Button from './Button';
import { configureRuntimeApiKey, clearRuntimeApiKey, isApiKeyConfigured } from '../services/geminiService';

interface Props {
  onConfigured?: () => void;
  openSignal?: number;
}

const ApiKeyNotice: React.FC<Props> = ({ onConfigured, openSignal }) => {
  const [apiKey, setApiKey] = useState('');
  const [configured, setConfigured] = useState(isApiKeyConfigured());
  const [expanded, setExpanded] = useState(!configured);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setConfigured(isApiKeyConfigured());
  }, []);

  useEffect(() => {
    if (typeof openSignal === 'number') {
      setExpanded(true);
    }
  }, [openSignal]);

  useEffect(() => {
    if (!configured) {
      setExpanded(true);
    }
  }, [configured]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey.trim()) {
      setStatusMessage('Vui lòng nhập API Key.');
      return;
    }

    configureRuntimeApiKey(apiKey);
    setApiKey('');
    setConfigured(true);
    setExpanded(false);
    setStatusMessage('API Key đã được lưu trên trình duyệt này.');
    onConfigured?.();
  };

  const handleReset = () => {
    clearRuntimeApiKey();
    setConfigured(false);
    setApiKey('');
    setStatusMessage('API Key đã được xoá.');
    onConfigured?.();
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full z-50">
      {expanded ? (
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Cấu hình Gemini API Key</h3>
              <p className="text-xs text-slate-500 mt-1">
                API Key chỉ được lưu trên trình duyệt hiện tại (localStorage). Triển khai production vẫn nên đặt biến môi trường <code>VITE_API_KEY</code>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nhập API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!apiKey.trim()}>
                Lưu API Key
              </Button>
              {configured && (
                <Button type="button" variant="outline" onClick={handleReset} className="flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  Xoá
                </Button>
              )}
            </div>
          </form>

          {statusMessage && (
            <p className="text-xs text-slate-500 leading-relaxed">{statusMessage}</p>
          )}

          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            onClick={() => setExpanded(false)}
          >
            <EyeOff className="w-4 h-4" />Ẩn thông báo
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          onClick={() => setExpanded(true)}
        >
          <span className="text-sm font-semibold">
            {configured ? 'API Key đã cấu hình' : 'Thiếu API Key'}
          </span>
          <KeyRound className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ApiKeyNotice;
