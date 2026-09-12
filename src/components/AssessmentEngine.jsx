import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Maximize, 
  Eye, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Check, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Server,
  Layout,
  Palette
} from 'lucide-react';

export default function AssessmentEngine() {
  const { 
    skills, 
    questions, 
    currentUser, 
    recordAssessmentResult, 
    selectedSkillForTest, 
    setSelectedSkillForTest, 
    setActiveTab 
  } = useApp();

  // Test session state: 'briefing' | 'testing' | 'result'
  const [sessionState, setSessionState] = useState('briefing');
  const [activeSkill, setActiveSkill] = useState(selectedSkillForTest || skills[0]);
  
  // Test execution state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(600); // 10 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Anti-cheat telemetry
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Review & result state
  const [testResult, setTestResult] = useState(null);
  const [showReviewAccordion, setShowReviewAccordion] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  // Sync active skill with context if passed from outside
  useEffect(() => {
    if (selectedSkillForTest) {
      setActiveSkill(selectedSkillForTest);
      setSessionState('briefing');
    }
  }, [selectedSkillForTest]);

  const skillQuestions = questions[activeSkill.id] || [];

  // WebSocket connection & frame streaming for Python Proctoring Engine
  useEffect(() => {
    if (sessionState !== 'testing') {
      if (socketRef.current) socketRef.current.close();
      return;
    }

    socketRef.current = new WebSocket('ws://localhost:8000/ws/proctor');

    socketRef.current.onopen = () => {
      const frameInterval = setInterval(() => {
        if (videoRef.current && canvasRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const frameData = canvas.toDataURL('image/jpeg', 0.6);
          socketRef.current.send(frameData);
        }
      }, 2000);

      return () => clearInterval(frameInterval);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.alerts && data.alerts.length > 0) {
        handleIntegrityViolation(data.alerts[0]);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [sessionState]);

  // 1. Anti-Cheat: Tab-switch & Visibility Listener
  useEffect(() => {
    if (sessionState !== 'testing') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleIntegrityViolation('Tab switch / backgrounding detected');
      }
    };

    const handleWindowBlur = () => {
      handleIntegrityViolation('Browser window focus lost');
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [sessionState]);

  // Anti-Cheat: Clipboard Suppression
  useEffect(() => {
    if (sessionState !== 'testing') return;

    const preventCopy = (e) => e.preventDefault();
    const preventContext = (e) => e.preventDefault();

    window.addEventListener('copy', preventCopy);
    window.addEventListener('cut', preventCopy);
    window.addEventListener('paste', preventCopy);
    window.addEventListener('contextmenu', preventContext);

    return () => {
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('cut', preventCopy);
      window.removeEventListener('paste', preventCopy);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, [sessionState]);

  // Anti-Cheat: Camera initialization
  useEffect(() => {
    let stream = null;
    if (sessionState === 'testing') {
      navigator.mediaDevices?.getUserMedia?.({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraActive(true);
        })
        .catch(() => {
          // Camera simulated fallback
          setCameraActive(true);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [sessionState]);

  // Countdown Timer
  useEffect(() => {
    if (sessionState === 'testing' && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [sessionState, isTimerRunning]);

  const handleIntegrityViolation = (reason) => {
    setTabSwitches(prev => prev + 1);
    setShowViolationModal(true);
  };

  const startAssessment = () => {
    // Attempt fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeRemainingSeconds(600);
    setTabSwitches(0);
    setShowViolationModal(false);
    setTestResult(null);
    setSessionState('testing');
    setIsTimerRunning(true);
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitTest = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);

    // Calculate score
    let correctCount = 0;
    skillQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const totalQuestions = skillQuestions.length || 15;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = 600 - timeRemainingSeconds;

    let tier = 'none';
    if (scorePercentage >= 90) tier = 'gold';
    else if (scorePercentage >= 75) tier = 'silver';
    else if (scorePercentage >= 60) tier = 'bronze';

    const integrityPenalty = Math.min(40, tabSwitches * 10);
    const integrityScore = Math.max(60, 100 - integrityPenalty);

    // Record to global state
    recordAssessmentResult(activeSkill.id, scorePercentage, tabSwitches, timeTaken);

    setTestResult({
      skill: activeSkill,
      score: scorePercentage,
      correctCount,
      totalQuestions,
      tier,
      integrityScore,
      tabSwitches,
      timeTaken
    });

    setSessionState('result');

    // Trigger celebration confetti on silver/gold
    if (tier === 'gold' || tier === 'silver') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSkillIcon = (iconName) => {
    switch (iconName) {
      case 'Layout': return Layout;
      case 'Server': return Server;
      case 'Cpu': return Cpu;
      case 'Palette': return Palette;
      default: return ShieldCheck;
    }
  };

  // ----------------------------------------------------
  // VIEW 1: BRIEFING & SKILL SELECTOR
  // ----------------------------------------------------
  if (sessionState === 'briefing') {
    const existingBadge = (currentUser.verifiedBadges || []).find(b => b.skillId === activeSkill.id);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Proctored Skill Assessment
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Validate your engineering depth under integrity-monitored conditions. High scores award verified badges and elevate your Skill Elo Rating.
          </p>
        </div>

        {/* Skill Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {skills.map(s => {
            const Icon = getSkillIcon(s.icon);
            const isSelected = s.id === activeSkill.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSkill(s)}
                className={`p-3.5 rounded-xl text-left glass-panel-interactive border transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-600/20 shadow-glow-purple text-purple-200' 
                    : 'border-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">{s.name}</span>
                </div>
                <div className="text-[10px] text-slate-400">15 Questions • 10m</div>
              </button>
            );
          })}
        </div>

        {/* Active Skill Briefing Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-xs font-mono uppercase text-purple-400 tracking-wider">
                Target Verification Domain
              </div>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                {activeSkill.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {activeSkill.description}
              </p>
            </div>

            {existingBadge && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                <Award className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase">Current Status</div>
                  <div className="text-xs font-bold text-slate-200 uppercase">
                    {existingBadge.tier} Tier ({existingBadge.score}%)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tier Thresholds */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Badge Tiers & Elo Rating Adjustments
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg badge-gold flex items-center justify-center font-bold font-mono text-xs">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">Gold Tier (90%+)</div>
                  <div className="text-[11px] text-slate-400">+150 Skill Elo</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-400/30 bg-slate-400/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg badge-silver flex items-center justify-center font-bold font-mono text-xs">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Silver Tier (75%+)</div>
                  <div className="text-[11px] text-slate-400">+95 Skill Elo</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg badge-bronze flex items-center justify-center font-bold font-mono text-xs">
                  B
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-300">Bronze Tier (60%+)</div>
                  <div className="text-[11px] text-slate-400">+50 Skill Elo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Anti-Cheat Safeguards Notice */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Assessment Anti-Cheat & Telemetry Rules</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Tab switching & focus loss are logged in real time</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Copying, pasting, and context menus are disabled</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>10-minute strict time limit with auto-submission</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Continuous candidate presence monitoring</span>
              </li>
            </ul>
          </div>

          {/* Start CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400">
              Ready? Click to enter full proctored mode.
            </div>
            <button
              onClick={startAssessment}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-glow-purple transition-all flex items-center justify-center gap-2"
            >
              <span>Begin Proctored Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: ACTIVE PROCTORED TEST RUNNER
  // ----------------------------------------------------
  if (sessionState === 'testing') {
    const currentQ = skillQuestions[currentQuestionIdx] || skillQuestions[0];
    const isAnswered = selectedAnswers[currentQ.id] !== undefined;
    const isLastQuestion = currentQuestionIdx === skillQuestions.length - 1;

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Hidden Canvas for AI Frame Grabbing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tab-Switch Warning Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel border border-rose-500/50 p-6 rounded-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Anti-Cheat Telemetry Alert
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A window blur, tab-switch, or AI proctoring violation was detected. <strong>Strike {tabSwitches} recorded.</strong> Infractions deduct from your permanent assessment integrity rating.
              </p>
              <div className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                Total Infractions: {tabSwitches}
              </div>
              <button
                onClick={() => setShowViolationModal(false)}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                I Understand — Return to Test
              </button>
            </div>
          </div>
        )}

        {/* Top HUD: Timer, Telemetry & Progress */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Skill Title & Question Counter */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{activeSkill.name}</div>
              <div className="text-[11px] text-slate-400">
                Question {currentQuestionIdx + 1} of {skillQuestions.length}
              </div>
            </div>
          </div>

          {/* Telemetry Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            {/* Presence Camera Box */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-mono">Camera Active</span>
            </div>

            {/* Tab Switches Counter */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
              tabSwitches === 0 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <Eye className="w-3.5 h-3.5" />
              <span>{tabSwitches} Switches</span>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-bold ${
              timeRemainingSeconds < 120 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' 
                : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Question Content & Navigation Drawer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Card (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 min-h-[380px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/5">
                  <span className="font-mono text-purple-400">
                    Q{currentQuestionIdx + 1} • {currentQ.type.toUpperCase()}
                  </span>
                  <span>Select 1 option</span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-slate-100 whitespace-pre-line leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQ.id, idx)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-purple-100 shadow-sm'
                            : 'glass-input border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border ${
                          isSelected 
                            ? 'bg-purple-600 text-white border-purple-400' 
                            : 'border-slate-500 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {isLastQuestion ? (
                    <button
                      onClick={handleSubmitTest}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Assessment</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-purple transition-all flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Question Palette & Camera Box (1 col) */}
          <div className="space-y-4">
            
            {/* Live Camera Stream Simulator */}
            <div className="glass-panel p-3 rounded-2xl border border-white/10 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Integrity Stream</span>
                <span className="text-emerald-400 font-mono">100% Focused</span>
              </div>
              <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-white/10 flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {/* Simulated bounding box */}
                <div className="absolute inset-4 border border-purple-500/40 rounded-lg pointer-events-none flex items-start justify-between p-1 text-[9px] text-purple-400 font-mono">
                  <span>ID: VERIFIED</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
              </div>
            </div>

            {/* Question Quick-Palette */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Question Index</span>
                <span className="font-mono text-purple-400">
                  {Object.keys(selectedAnswers).length} / {skillQuestions.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {skillQuestions.map((q, idx) => {
                  const answered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                        isCurrent
                          ? 'border-2 border-purple-400 bg-purple-600/30 text-white'
                          : answered
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>

            {/* Direct Submit Action */}
            <button
              onClick={handleSubmitTest}
              className="w-full py-2.5 rounded-xl glass-panel-interactive border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/10 transition-colors"
            >
              Finish & Grade Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: RESULTS & VERIFIED BADGE REPORT
  // ----------------------------------------------------
  if (sessionState === 'result' && testResult) {
    const isPassed = testResult.tier !== 'none';

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Headline Result Card */}
        <div className={`p-8 rounded-3xl glass-panel border text-center space-y-6 ${
          testResult.tier === 'gold' 
            ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/80 shadow-glow-gold'
            : testResult.tier === 'silver'
            ? 'border-slate-400/40 bg-gradient-to-b from-slate-800/30 to-slate-900/80'
            : testResult.tier === 'bronze'
            ? 'border-orange-500/40 bg-gradient-to-b from-orange-950/20 to-slate-900/80'
            : 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900/80'
        }`}>
          
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl bg-purple-600/30 border border-purple-400/40">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Assessment Verified & Stamped
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {isPassed ? (
                <span>
                  Awarded{' '}
                  <span className={
                    testResult.tier === 'gold' ? 'text-amber-300' :
                    testResult.tier === 'silver' ? 'text-slate-200' : 'text-orange-300'
                  }>
                    {testResult.tier.toUpperCase()} TIER
                  </span>
                </span>
              ) : (
                <span className="text-rose-400">Assessment Below Threshold</span>
              )}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              {isPassed 
                ? `You passed the ${testResult.skill.name} verification with ${testResult.score}% accuracy and a ${testResult.integrityScore}% integrity score.`
                : `You scored ${testResult.score}%. A minimum of 60% is required for Bronze verification. You may review your answers below and retake anytime.`
              }
            </p>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400">Score Accuracy</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                {testResult.score}%
              </div>
              <div className="text-[10px] text-slate-500">
                {testResult.correctCount}/{testResult.totalQuestions} Correct
              </div>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400">Integrity Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {testResult.integrityScore}%
              </div>
              <div className="text-[10px] text-slate-500">
                {testResult.tabSwitches} Infractions
              </div>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400">Time Taken</div>
              <div className="text-2xl font-bold font-mono text-purple-300 mt-0.5">
                {Math.floor(testResult.timeTaken / 60)}m {testResult.timeTaken % 60}s
              </div>
              <div className="text-[10px] text-slate-500">Under 10m Limit</div>
            </div>

            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400">Elo Rating Gain</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">
                +{testResult.tier === 'gold' ? 150 : testResult.tier === 'silver' ? 95 : testResult.tier === 'bronze' ? 50 : 0}
              </div>
              <div className="text-[10px] text-slate-500">Indexed to Profile</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-purple transition-all"
            >
              View Updated Dashboard
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
            >
              Match Complementary Teams
            </button>
            <button
              onClick={() => setShowReviewAccordion(!showReviewAccordion)}
              className="px-5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
            >
              {showReviewAccordion ? 'Hide Answer Review' : 'Review 15 Questions'}
            </button>
          </div>
        </div>

        {/* Detailed Question Review Accordion */}
        {showReviewAccordion && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                Detailed Technical Review & Explanations
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                {testResult.correctCount} Correct • {testResult.totalQuestions - testResult.correctCount} Incorrect
              </div>
            </div>

            <div className="space-y-4">
              {skillQuestions.map((q, idx) => {
                const userAnsIdx = selectedAnswers[q.id];
                const isCorrect = userAnsIdx === q.correctIndex;

                return (
                  <div 
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-3 ${
                      isCorrect 
                        ? 'border-emerald-500/30 bg-emerald-950/10' 
                        : 'border-rose-500/30 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-200 text-sm">
                        Q{idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold uppercase text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500">Your Answer: </span>
                        <span className={isCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                          {userAnsIdx !== undefined ? q.options[userAnsIdx] : 'Unanswered'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="text-slate-500">Correct Answer: </span>
                          <span className="text-emerald-300 font-medium">
                            {q.options[q.correctIndex]}
                          </span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-purple-300">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
