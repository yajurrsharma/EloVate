import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Video, 
  TrendingUp, 
  Briefcase, 
  ChevronRight,
  Award
} from 'lucide-react';

export default function RecruitmentInvitations() {
  const { 
    currentUser, 
    interviews, 
    respondToInterview, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'declined'

  // Filter invitations for current candidate
  const candidateInterviews = (interviews || []).filter(
    i => i.candidateId === currentUser.id
  );

  const pendingCount = candidateInterviews.filter(i => i.status === 'pending').length;
  const acceptedCount = candidateInterviews.filter(i => i.status === 'accepted').length;
  const declinedCount = candidateInterviews.filter(i => i.status === 'declined').length;
  const totalEloEarned = acceptedCount * 30;

  const filteredInterviews = candidateInterviews.filter(interview => {
    if (activeFilter === 'pending') return interview.status === 'pending';
    if (activeFilter === 'accepted') return interview.status === 'accepted';
    if (activeFilter === 'declined') return interview.status === 'declined';
    return true;
  });

  const handleAccept = (interviewId) => {
    respondToInterview(interviewId, 'accepted');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDecline = (interviewId) => {
    respondToInterview(interviewId, 'declined');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Recruitment Pipeline & Direct Invitations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Recruiter Interview Invitations
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Direct interview invitations sent to you by verified technical hiring managers and talent partners. Accept interview calls to confirm your screening slot and elevate your Developer Elo score (+30 Elo each).
          </p>
        </div>

        {/* Quick CTA */}
        <button
          onClick={() => setActiveTab('assessment')}
          className="px-4 py-2.5 rounded-xl glass-panel-interactive border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 self-start md:self-auto hover:bg-purple-600/20 transition-all"
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>Boost Elo via Assessments</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Invitations</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {candidateInterviews.length}
          </div>
          <div className="text-[11px] text-slate-500">Received to date</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-400">Pending Decision</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-400/80">Requires your reply</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Confirmed Calls</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
            {acceptedCount}
          </div>
          <div className="text-[11px] text-emerald-400/80">Scheduled & active</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-1">
          <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Elo Boost Earned</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
            +{totalEloEarned}
          </div>
          <div className="text-[11px] text-purple-400/80">+30 Elo per confirmation</div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Invitations', count: candidateInterviews.length },
          { id: 'pending', label: 'Pending Reply', count: pendingCount },
          { id: 'accepted', label: 'Confirmed & Scheduled', count: acceptedCount },
          { id: 'declined', label: 'Declined', count: declinedCount }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeFilter === filter.id
                ? 'bg-purple-600 text-white shadow-glow-purple border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Invitations Grid / List */}
      {filteredInterviews.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/10 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No invitations found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeFilter === 'pending'
                ? "You have no pending recruiter invitations at the moment."
                : "Recruiters discover candidates by verified skill Elo ratings. Pass more assessments to appear at the top of recruiter search dossiers!"}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('assessment')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all inline-flex items-center gap-2"
          >
            <span>Elevate Skill Elo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map(interview => (
            <div
              key={interview.id}
              className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between space-y-5 transition-all ${
                interview.status === 'pending'
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/15 to-slate-900/60 shadow-lg'
                  : interview.status === 'accepted'
                  ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/15 to-slate-900/60 shadow-lg'
                  : 'border-white/10 opacity-60'
              }`}
            >
              <div className="space-y-4">
                
                {/* Header: Recruiter info & Status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar 
                      name={interview.recruiterName} 
                      size="w-12 h-12" 
                      textSize="text-base"
                      className="rounded-2xl shadow-md border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-base truncate">
                          {interview.recruiterName}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                          <Building2 className="w-2.5 h-2.5" />
                          {interview.recruiterCompany}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                        Role: <span className="text-purple-300 font-semibold">{interview.role}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border font-mono ${
                    interview.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : interview.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {interview.status === 'accepted' ? 'Confirmed' : interview.status}
                  </span>
                </div>

                {/* Date, Time & Virtual Meeting Room */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono bg-black/40 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{interview.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{interview.time}</span>
                  </div>
                </div>

                {/* Recruiter's personal invitation note */}
                {interview.notes && (
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Recruiter's Screening Note:
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                      &ldquo;{interview.notes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Elo Impact Badge */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Elo Reward:</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    +30 Developer Elo Rating
                  </span>
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-2 border-t border-white/10">
                {interview.status === 'pending' ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAccept(interview.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Interview (+30 Elo)</span>
                    </button>
                    <button
                      onClick={() => handleDecline(interview.id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                ) : interview.status === 'accepted' ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => showToast('Connecting to encrypted virtual meeting room...', 'info')}
                      className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Join Virtual Room</span>
                    </button>
                    <button
                      onClick={() => showToast('Calendar invitation added to your schedule!', 'success')}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all"
                    >
                      Add to Calendar
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-1.5 text-xs text-slate-500 italic">
                    Invitation was declined.
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
