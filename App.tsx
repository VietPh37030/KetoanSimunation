import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, InterviewItem } from './types';
import LandingPage from './components/LandingPage';
import SetupForm from './components/SetupForm';
import InterviewSession from './components/InterviewSession';
import ReportPage from './components/ReportPage';

function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<InterviewItem[]>([]);

  // Simple persisted state check (in a real app, use localStorage more robustly)
  useEffect(() => {
    // Check if user has an unfinished session? (omitted for simplicity of demo)
  }, []);

  const handleStart = () => {
    setView(AppView.SETUP);
  };

  const handleSetupComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setView(AppView.INTERVIEW);
  };

  const handleInterviewFinish = (finalHistory: InterviewItem[]) => {
    setHistory(finalHistory);
    setView(AppView.REPORT);
  };

  const handleRestart = () => {
    setHistory([]);
    setView(AppView.SETUP);
  };

  return (
    <div className="antialiased font-sans text-slate-900">
      {view === AppView.LANDING && (
        <LandingPage onStart={handleStart} />
      )}

      {view === AppView.SETUP && (
        <SetupForm onComplete={handleSetupComplete} />
      )}

      {view === AppView.INTERVIEW && userProfile && (
        <InterviewSession 
          userProfile={userProfile} 
          onFinish={handleInterviewFinish} 
        />
      )}

      {view === AppView.REPORT && userProfile && (
        <ReportPage 
          history={history} 
          userProfile={userProfile}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;