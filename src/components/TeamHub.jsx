import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import confetti from 'canvas-confetti';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Zap, 
  Check, 
  Plus, 
  XCircle,
  TrendingUp,
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
    showToast
  } = useApp();

  const [selectedSlotForApply, setSelectedSlotForApply] = useState(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

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
        challengeQuestion: 'Explain how you approach testing and state caching.',
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

  const calculateTeamSynergy = (team) => {
    const openSlots = team.slots.filter(s => s.status === 'open');
    if (openSlots.length === 0) return { percentage: 40, label: 'Fully Staffed' };

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
        label: `${matchingSlots} Voids Filled`
      };
    }

    return { percentage: currentUser.eloRating >= 1500 ? 70 : 50, label: 'Standard Fit' };
  };

  const handleOpenApplyModal = (team, slot) => {
    if (currentUser.eloRating < slot.minElo) {
      showToast(`Requires minimum ${slot.minElo} Elo rating. You have ${currentUser.eloRating}.`, 'error');
      return;
    }
    setSelectedSlotForApply({ team, slot });
    setChallengeAnswer('');
  };

  const handleSubmitApplication = () => {
    if (!challengeAnswer.trim()) {
      showToast('Please provide an answer to the challenge.', 'error');
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
      showToast('Please enter a team name and tagline', 'error');
      return;
    }

    createTeam({
      name: newTeamName.trim(),
      track: newTeamTrack.trim(),
      tagline: newTeamTagline.trim(),
      slots: [
        {
          id: 'lead-slot-' + Date.now(),
          title: 'Squad Lead',
          requiredSkillId: currentUser.verifiedBadges[0]?.skillId || 'skill-frontend',
          requiredSkillName: currentUser.verifiedBadges[0]?.skillName || 'Lead',
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

  const myTeamIds = teams.filter(t => t.leadId === currentUser.id).map(t => t.id);
  const pendingApplicationsForMe = teamApplications.filter(
    a => myTeamIds.includes(a.teamId) && a.status === 'pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Team Hub
          </h1>
          <p className="text-sm text-slate-400">
            Join balanced engineering squads or form your own team based on verified Elo ratings.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTeamOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Form New Squad</span>
        </button>
      </div>

      {/* Pending Applications Review Queue */}
      {pendingApplicationsForMe.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pending Applications ({pendingApplicationsForMe.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApplicationsForMe.map(app => (
              <div key={app.id} className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={app.applicantName} size="w-8 h-8" textSize="text-xs" />
                    <div>
                      <div className="font-bold text-slate-100 text-xs">{app.applicantName}</div>
                      <div className="text-[11px] text-amber-300 font-mono">{app.applicantElo} Elo</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                  &ldquo;{app.challengeResponse}&rdquo;
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      acceptApplicant(app.id);
                      confetti({ particleCount: 80, spread: 60 });
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => declineApplicant(app.id)}
                    className="px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all"
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
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Active Squads</span>
          <span className="text-xs text-slate-400 font-mono">({teams.length})</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map(team => {
            const synergy = calculateTeamSynergy(team);

            return (
              <div key={team.id} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                        {team.hackathonTrack}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">{team.name}</h3>
                      <p className="text-xs text-slate-300 mt-1">{team.tagline}</p>
                    </div>

                    <div className="glass-panel px-3 py-2 rounded-xl border border-emerald-500/30 text-right">
                      <div className="text-[9px] uppercase font-bold text-slate-400">Synergy</div>
                      <div className="text-base font-extrabold font-mono text-emerald-400">{synergy.percentage}%</div>
                      <div className="text-[9px] text-emerald-300">{synergy.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <UserAvatar name={team.leadName} size="w-5 h-5" textSize="text-[9px]" />
                    <span>Lead: <strong className="text-slate-200">{team.leadName}</strong></span>
                    <span>•</span>
                    <span className="font-mono">{team.membersCount} / {team.maxMembers} Members</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Open Role Slots
                  </div>

                  <div className="space-y-2">
                    {team.slots.map(slot => {
                      const isFilled = slot.status === 'filled';
                      const isCurrentUserInSlot = slot.assignedUserId === currentUser.id;

                      return (
                        <div key={slot.id} className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          isFilled ? 'border-white/5 bg-slate-900/40 text-slate-400' : 'border-purple-500/30 bg-purple-950/20 text-slate-200'
                        }`}>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">{slot.title}</span>
                              {isFilled ? (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Filled</span>
                              ) : (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">Min {slot.minElo} Elo</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Skill: <strong className="text-purple-300">{slot.requiredSkillName}</strong>
                            </div>
                          </div>

                          <div>
                            {isFilled ? (
                              <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                                <UserAvatar name={slot.assignedUserName || 'User'} size="w-5 h-5" textSize="text-[9px]" />
                                <span>{slot.assignedUserName}</span>
                              </div>
                            ) : isCurrentUserInSlot ? (
                              <span className="text-xs text-purple-300 font-bold">Your Slot</span>
                            ) : (
                              <button
                                onClick={() => handleOpenApplyModal(team, slot)}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <span>Apply</span>
                                <TrendingUp className="w-3 h-3" />
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
          <div className="max-w-md w-full glass-panel border border-purple-500/40 p-6 rounded-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Apply for {selectedSlotForApply.slot.title}</h3>
              <button onClick={() => setSelectedSlotForApply(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-purple-200 font-mono">
                {selectedSlotForApply.slot.challengeQuestion}
              </div>

              <textarea
                rows={3}
                value={challengeAnswer}
                onChange={(e) => setChallengeAnswer(e.target.value)}
                placeholder="Type your solution..."
                className="w-full p-3 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setSelectedSlotForApply(null)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button onClick={handleSubmitApplication} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5">
                <Send className="w-3 h-3" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form New Squad Modal */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full glass-panel border border-white/20 p-6 rounded-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Form New Squad</h3>
              <button onClick={() => setIsCreateTeamOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTeam} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Squad Name</label>
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
                <label className="font-bold text-slate-300">Hackathon Track</label>
                <select
                  value={newTeamTrack}
                  onChange={(e) => setNewTeamTrack(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                >
                  <option value="Campus Recruitment & Trust Tech" className="bg-slate-900">Campus Recruitment & Trust Tech</option>
                  <option value="AI & Developer Productivity" className="bg-slate-900">AI & Developer Productivity</option>
                  <option value="Distributed Infrastructure & Cloud" className="bg-slate-900">Distributed Infrastructure & Cloud</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Tagline</label>
                <input
                  type="text"
                  required
                  value={newTeamTagline}
                  onChange={(e) => setNewTeamTagline(e.target.value)}
                  placeholder="Short mission statement"
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Vacancy Slots ({newTeamSlots.length}/4)
                  </span>
                  {newTeamSlots.length < 4 && (
                    <button type="button" onClick={addSlot} className="px-2.5 py-1 rounded bg-purple-600/20 text-purple-300 font-bold text-[11px] flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Slot
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {newTeamSlots.map((slot, index) => (
                    <div key={slot.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold text-[10px] uppercase">Slot #{index + 1}</span>
                        {newTeamSlots.length > 1 && (
                          <button type="button" onClick={() => removeSlot(index)} className="text-slate-400 hover:text-rose-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={slot.title}
                          onChange={(e) => updateSlot(index, 'title', e.target.value)}
                          placeholder="Role title"
                          className="w-full p-2 rounded-lg glass-input text-xs"
                        />
                        <input
                          type="number"
                          min="1000"
                          max="2400"
                          step="25"
                          required
                          value={slot.minElo}
                          onChange={(e) => updateSlot(index, 'minElo', e.target.value)}
                          placeholder="Min Elo"
                          className="w-full p-2 rounded-lg glass-input text-xs font-mono"
                        />
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={slot.challengeQuestion}
                        onChange={(e) => updateSlot(index, 'challengeQuestion', e.target.value)}
                        placeholder="Challenge question for applicants"
                        className="w-full p-2 rounded-lg glass-input text-xs resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setIsCreateTeamOpen(false)} className="px-3 py-1.5 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Squad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
