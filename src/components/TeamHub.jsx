import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import confetti from 'canvas-confetti';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  XCircle, 
  AlertCircle,
  Plus,
  Send,
  Zap,
  Check,
  Compass,
  Layers,
  Trash2,
  Sliders
} from 'lucide-react';

export default function TeamHub() {
  const { 
    teams, 
    currentUser, 
    skills, 
    applyToTeamSlot, 
    teamApplications, 
    acceptApplicant, 
    declineApplicant, 
    createTeam, 
    showToast,
    setActiveTab,
    setSelectedSkillForTest
  } = useApp();

  // Active modal states
  const [selectedSlotForApply, setSelectedSlotForApply] = useState(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  // New team creation form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTrack, setNewTeamTrack] = useState('Campus Recruitment & Trust Tech');
  const [newTeamTagline, setNewTeamTagline] = useState('');
  const [newTeamSlots, setNewTeamSlots] = useState([
    {
      id: 'custom-slot-1',
      title: 'Fullstack Systems Dev',
      requiredSkillId: 'skill-backend',
      requiredSkillName: 'Backend Architecture',
      minElo: 1400,
      minTier: 'silver',
      challengeQuestion: 'Describe your strategy to maintain sub-10ms response latency under peak concurrency.',
      status: 'open',
      assignedUserId: null
    },
    {
      id: 'custom-slot-2',
      title: 'UI/UX Interface Specialist',
      requiredSkillId: 'skill-design',
      requiredSkillName: 'UI/UX & Product Design',
      minElo: 1400,
      minTier: 'silver',
      challengeQuestion: 'How do you structure component design tokens to support accessible dark-mode variants?',
      status: 'open',
      assignedUserId: null
    }
  ]);

  const addSlot = () => {
    if (newTeamSlots.length >= 4) {
      showToast('Maximum 4 open vacancy slots allowed per squad.', 'error');
      return;
    }
    const defaultSkill = skills[newTeamSlots.length % skills.length] || skills[0];
    setNewTeamSlots(prev => [
      ...prev,
      {
        id: 'slot-draft-' + Date.now(),
        title: 'Systems Specialist',
        requiredSkillId: defaultSkill.id,
        requiredSkillName: defaultSkill.name,
        minElo: 1400,
        minTier: 'silver',
        challengeQuestion: 'Explain how you approach testing, error boundary resilience, and state caching.',
        status: 'open',
        assignedUserId: null
      }
    ]);
  };

  const removeSlot = (index) => {
    if (newTeamSlots.length <= 1) {
      showToast('Squad must contain at least 1 open role vacancy.', 'error');
      return;
    }
    setNewTeamSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    setNewTeamSlots(prev => {
      const updated = [...prev];
      if (field === 'requiredSkillId') {
        const foundSkill = skills.find(s => s.id === value);
        updated[index] = {
          ...updated[index],
          requiredSkillId: value,
          requiredSkillName: foundSkill ? foundSkill.name : 'Engineering'
        };
      } else if (field === 'minElo') {
        const eloVal = Number(value) || 1200;
        const tier = eloVal >= 1800 ? 'gold' : eloVal >= 1400 ? 'silver' : 'bronze';
        updated[index] = { ...updated[index], minElo: eloVal, minTier: tier };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // ----------------------------------------------------
  // COMPLEMENTARY TEAM SYNERGY ALGORITHM
  // ----------------------------------------------------
  const calculateTeamSynergy = (team) => {
    const openSlots = team.slots.filter(s => s.status === 'open');
    if (openSlots.length === 0) return { percentage: 40, label: 'Team Saturated (All Slots Filled)' };

    // Check if candidate has verified badges that fill the team's open slots
    let matchingSlots = 0;
    let candidateSkills = (currentUser.verifiedBadges || []).map(b => b.skillId);

    openSlots.forEach(slot => {
      if (candidateSkills.includes(slot.requiredSkillId)) {
        matchingSlots++;
      }
    });

    if (matchingSlots > 0) {
      const matchPercentage = Math.min(96, Math.round((matchingSlots / openSlots.length) * 100));
      return {
        percentage: matchPercentage,
        label: `High Complementary Fit (${matchingSlots} Open Voids Filled)`
      };
    }

    // Baseline fit based on overall Elo rating
    if (currentUser.eloRating >= 1500) {
      return { percentage: 70, label: 'Strong Generalist Candidate' };
    }

    return { percentage: 50, label: 'Standard Fit' };
  };

  const handleOpenApplyModal = (team, slot) => {
    // Validate minimum Elo requirement
    if (currentUser.eloRating < slot.minElo) {
      showToast(`Requires minimum ${slot.minElo} Elo rating. You have ${currentUser.eloRating} Elo. Complete assessments to elevate your rating.`, 'error');
      return;
    }

    setSelectedSlotForApply({ team, slot });
    setChallengeAnswer('');
  };

  const handleSubmitApplication = () => {
    if (!challengeAnswer.trim()) {
      showToast('Please provide an answer to the pre-join team challenge.', 'error');
      return;
    }

    applyToTeamSlot(
      selectedSlotForApply.team.id,
      selectedSlotForApply.slot.id,
      challengeAnswer.trim()
    );

    setSelectedSlotForApply(null);
    setChallengeAnswer('');
  };

  const handleCreateNewTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamTagline.trim()) {
      showToast('Please enter a team name and mission tagline', 'error');
      return;
    }

    if (newTeamSlots.length === 0) {
      showToast('Please add at least 1 open vacancy slot for your squad.', 'error');
      return;
    }

    for (let i = 0; i < newTeamSlots.length; i++) {
      if (!newTeamSlots[i].title.trim()) {
        showToast(`Please enter a role title for slot #${i + 1}`, 'error');
        return;
      }
      if (!newTeamSlots[i].challengeQuestion.trim()) {
        showToast(`Please enter a challenge question for "${newTeamSlots[i].title}"`, 'error');
        return;
      }
    }

    createTeam({
      name: newTeamName.trim(),
      track: newTeamTrack.trim(),
      tagline: newTeamTagline.trim(),
      slots: [
        {
          id: 'lead-slot-' + Date.now(),
          title: 'Squad Lead & Architect',
          requiredSkillId: currentUser.verifiedBadges[0]?.skillId || 'skill-frontend',
          requiredSkillName: currentUser.verifiedBadges[0]?.skillName || 'Engineering Lead',
          minElo: currentUser.eloRating,
          minTier: 'gold',
          assignedUserId: currentUser.id,
          assignedUserName: currentUser.fullName,
          assignedUserElo: currentUser.eloRating,
          assignedUserTier: currentUser.eloTier || 'gold',
          status: 'filled'
        },
        ...newTeamSlots.map((slot, index) => ({
          id: `slot-${Date.now()}-${index}`,
          title: slot.title.trim(),
          requiredSkillId: slot.requiredSkillId,
          requiredSkillName: slot.requiredSkillName,
          minElo: Number(slot.minElo) || 1200,
          minTier: Number(slot.minElo) >= 1800 ? 'gold' : Number(slot.minElo) >= 1400 ? 'silver' : 'bronze',
          assignedUserId: null,
          assignedUserName: null,
          assignedUserElo: null,
          assignedUserTier: null,
          status: 'open',
          challengeQuestion: slot.challengeQuestion.trim()
        }))
      ]
    });

    confetti({ particleCount: 90, spread: 60 });
    setIsCreateTeamOpen(false);
    setNewTeamName('');
    setNewTeamTagline('');
  };

  // Applications targeting teams led by current user
  const myTeamIds = teams.filter(t => t.leadId === currentUser.id).map(t => t.id);
  const pendingApplicationsForMe = teamApplications.filter(
    a => myTeamIds.includes(a.teamId) && a.status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Complementary Skill Matching (PS Focus Area 2 & 3)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Complementary Hackathon Team Hub
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Form balanced engineering squads based on verified skill Elo ratings. Pass team-specific pre-join challenges to secure your vacancy slot.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTeamOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold shadow-glow-purple transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Form New Squad</span>
        </button>
      </div>

      {/* Team Lead Application Review Queue (if current user has pending reviews) */}
      {pendingApplicationsForMe.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Pending Pre-Join Applications ({pendingApplicationsForMe.length})</span>
            </h3>
            <span className="text-xs text-amber-300 font-mono">Leader Review Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApplicationsForMe.map(app => (
              <div key={app.id} className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      name={app.applicantName} 
                      size="w-9 h-9" 
                      textSize="text-xs" 
                      className="rounded-full border border-amber-400/50" 
                    />
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{app.applicantName}</div>
                      <div className="text-[11px] text-amber-300 font-mono">{app.applicantElo} Elo</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{app.appliedAt}</span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Pre-Join Challenge Response:
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-3">
                    &ldquo;{app.challengeResponse}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      acceptApplicant(app.id);
                      confetti({ particleCount: 80, spread: 60 });
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept to Team</span>
                  </button>
                  <button
                    onClick={() => declineApplicant(app.id)}
                    className="px-3 py-1.5 rounded-lg glass-panel hover:bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Active Hackathon Squads & Open Slots</span>
          <span className="text-xs text-slate-400 font-mono">({teams.length} Teams)</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map(team => {
            const synergy = calculateTeamSynergy(team);

            return (
              <div 
                key={team.id}
                className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 flex flex-col justify-between"
              >
                {/* Team Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
                        {team.hackathonTrack}
                      </div>
                      <h3 className="text-2xl font-bold text-white mt-0.5">
                        {team.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {team.tagline}
                      </p>
                    </div>

                    {/* Complementary Synergy Badge */}
                    <div className="glass-panel px-3 py-2 rounded-xl border border-emerald-500/30 text-right min-w-[130px]">
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        Synergy Match
                      </div>
                      <div className="text-lg font-extrabold font-mono text-emerald-400">
                        {synergy.percentage}%
                      </div>
                      <div className="text-[9px] text-emerald-300 truncate max-w-[120px]">
                        {synergy.label}
                      </div>
                    </div>
                  </div>

                  {/* Team Lead Profile Row */}
                  <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-400">
                    <UserAvatar 
                      name={team.leadName} 
                      size="w-5 h-5" 
                      textSize="text-[9px]" 
                      className="rounded-full border border-purple-400/50" 
                    />
                    <span>Lead: <strong className="text-slate-200">{team.leadName}</strong></span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">{team.membersCount} / {team.maxMembers} Members</span>
                  </div>
                </div>

                {/* Team Vacancy Slots */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Role Slots & Pre-Join Criteria</span>
                    <span className="text-[10px] text-slate-500">Min Elo Required</span>
                  </div>

                  <div className="space-y-2">
                    {team.slots.map(slot => {
                      const isFilled = slot.status === 'filled';
                      const isCurrentUserInSlot = slot.assignedUserId === currentUser.id;

                      return (
                        <div 
                          key={slot.id}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isFilled
                              ? 'border-white/5 bg-slate-900/40 text-slate-400'
                              : 'border-purple-500/30 bg-purple-950/20 text-slate-200 hover:border-purple-500/60'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100 text-xs sm:text-sm">
                                {slot.title}
                              </span>
                              {isFilled ? (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                  Filled
                                </span>
                              ) : (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                  OPEN • Min {slot.minElo} Elo
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Required Skill: <strong className="text-purple-300">{slot.requiredSkillName}</strong>
                            </div>
                          </div>

                          {/* Slot Status / Action */}
                          <div>
                            {isFilled ? (
                              <div className="flex items-center gap-2 text-slate-300">
                                <UserAvatar 
                                  name={slot.assignedUserName || 'User'} 
                                  size="w-5 h-5" 
                                  textSize="text-[9px]" 
                                  className="rounded-full" 
                                />
                                <span className="text-xs font-medium">{slot.assignedUserName}</span>
                                <span className="text-[10px] text-amber-300 font-mono font-bold">
                                  {slot.assignedUserElo} Elo
                                </span>
                              </div>
                            ) : isCurrentUserInSlot ? (
                              <span className="text-xs text-purple-300 font-bold">Your Active Slot</span>
                            ) : (
                              <button
                                onClick={() => handleOpenApplyModal(team, slot)}
                                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-purple transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>Take Pre-Join Challenge</span>
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Join Challenge Modal */}
      {selectedSlotForApply && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full glass-panel border border-purple-500/40 p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="text-xs font-mono uppercase text-purple-400">
                  Pre-Join Technical Gate
                </div>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Apply for {selectedSlotForApply.slot.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Team: {selectedSlotForApply.team.name} • Min Requirement: {selectedSlotForApply.slot.minElo} Elo
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForApply(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Qualification Card */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Your Current Rating:</span>
              </div>
              <span className="font-mono font-bold text-purple-300">
                {currentUser.eloRating} Elo ({currentUser.eloTier})
              </span>
            </div>

            {/* Challenge Question */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Team Challenge Question:</span>
              </label>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-purple-200 font-mono leading-relaxed">
                {selectedSlotForApply.slot.challengeQuestion || 'Describe your technical design approach for high-concurrency microservices.'}
              </div>
            </div>

            {/* Candidate Response Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Your Technical Solution / Architecture Proposal:
              </label>
              <textarea
                rows={4}
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                placeholder="Explain your approach, libraries, data structures, and edge-case handling..."
                className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedSlotForApply(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Solution to Team Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form New Squad Modal — Fully Customizable */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel border border-white/20 p-6 sm:p-8 rounded-3xl space-y-6 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Form a New Hackathon Squad
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure custom role slots, minimum Elo requirements, and pre-join technical challenge questions.
                </p>
              </div>
              <button
                onClick={() => setIsCreateTeamOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTeam} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Squad Name</label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. HyperScale Forge"
                    className="w-full p-2.5 rounded-xl glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Hackathon Track</label>
                  <select
                    value={newTeamTrack}
                    onChange={(e) => setNewTeamTrack(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                  >
                    <option value="Campus Recruitment & Trust Tech" className="bg-slate-900">Campus Recruitment & Trust Tech</option>
                    <option value="AI & Developer Productivity" className="bg-slate-900">AI & Developer Productivity</option>
                    <option value="Distributed Infrastructure & Cloud" className="bg-slate-900">Distributed Infrastructure & Cloud</option>
                    <option value="FinTech & Algorithmic Trading" className="bg-slate-900">FinTech & Algorithmic Trading</option>
                    <option value="Decentralized Trust & Cryptography" className="bg-slate-900">Decentralized Trust & Cryptography</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Mission / Squad Tagline</label>
                <input
                  type="text"
                  required
                  value={newTeamTagline}
                  onChange={(e) => setNewTeamTagline(e.target.value)}
                  placeholder="e.g. Building distributed real-time telemetry systems with zero downtime"
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              {/* Vacancy Slots Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                      Custom Vacancy Slots ({newTeamSlots.length}/4)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Customize required skills, minimum Elo rating, and challenge questions for each open slot.
                    </p>
                  </div>
                  {newTeamSlots.length < 4 && (
                    <button
                      type="button"
                      onClick={addSlot}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {newTeamSlots.map((slot, index) => (
                    <div 
                      key={slot.id} 
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold text-xs uppercase flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Slot #{index + 1} Configuration</span>
                        </span>
                        {newTeamSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove this slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Role Title</label>
                          <input
                            type="text"
                            required
                            value={slot.title}
                            onChange={(e) => updateSlot(index, 'title', e.target.value)}
                            placeholder="e.g. Frontend Architect"
                            className="w-full p-2 rounded-lg glass-input text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Required Skill</label>
                          <select
                            value={slot.requiredSkillId}
                            onChange={(e) => updateSlot(index, 'requiredSkillId', e.target.value)}
                            className="w-full p-2 rounded-lg glass-input text-xs text-slate-200"
                          >
                            {skills.map(s => (
                              <option key={s.id} value={s.id} className="bg-slate-900">
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Minimum Elo</label>
                            <span className="text-[10px] font-mono text-purple-300 uppercase">
                              {slot.minTier}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="1000"
                            max="2400"
                            step="25"
                            required
                            value={slot.minElo}
                            onChange={(e) => updateSlot(index, 'minElo', e.target.value)}
                            className="w-full p-2 rounded-lg glass-input text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Pre-Join Technical Challenge Question
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={slot.challengeQuestion}
                          onChange={(e) => updateSlot(index, 'challengeQuestion', e.target.value)}
                          placeholder="What specific architectural or algorithmic problem must applicants answer to join this slot?"
                          className="w-full p-2.5 rounded-lg glass-input text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-glow-purple transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch Squad & Post Vacancies</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
