import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Award, 
  Cpu, 
  Server, 
  Layout, 
  Palette, 
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function SkillOnboarding() {
  const { skills, currentUser, currentRole, setActiveTab, setSelectedSkillForTest } = useApp();

  const getSkillIcon = (iconName) => {
    switch (iconName) {
      case 'Layout': return Layout;
      case 'Server': return Server;
      case 'Cpu': return Cpu;
      case 'Palette': return Palette;
      default: return ShieldCheck;
    }
  };

  const handleStartTest = (skill) => {
    setSelectedSkillForTest(skill);
    setActiveTab('assessment');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-purple-500/20 bg-gradient-to-b from-purple-950/20 via-slate-900/40 to-slate-900/80">
        <div className="relative z-10 space-y-6">
          {/* Headline row with Elo rating */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Everyone says they can do it.{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  We make you prove it.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Eliminate resume fabrications and unverified teammates. EloVate introduces a <strong>Elo Rating System</strong> for developers, measuring real skill through anti-cheat assessments, GitHub commit auditing, and complementary team matchmaking.
              </p>
            </div>

            {/* Live Elo Rating Card — prominent first thing on login */}
            {currentRole === 'candidate' && (
              <div
                onClick={() => setActiveTab('dashboard')}
                className="cursor-pointer glass-panel px-8 py-6 rounded-3xl border border-purple-500/40 text-center flex-shrink-0 hover:border-purple-400/60 transition-all group bg-gradient-to-b from-purple-950/30 to-slate-900/60 min-w-[200px]"
                title="Click to view your full dashboard"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Your Skill Elo</span>
                </div>
                <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-pink-300 font-mono leading-none mb-2">
                  {currentUser.eloRating}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-3">
                  <Zap className="w-3 h-3" />
                  {currentUser.eloTier} Tier
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-3">
                  <span>{currentUser.verifiedBadges.length} Badges</span>
                  <span>•</span>
                  <span>{(currentUser.githubAudits || []).length} Repos</span>
                </div>
                <div className="text-[9px] text-purple-400/70 mt-2 group-hover:text-purple-400 transition-colors">
                  View Full Dashboard →
                </div>
              </div>
            )}
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="glass-panel p-3.5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-purple-300 font-mono">10 Min</div>
              <div className="text-xs text-slate-400">Proctored Assessment</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-emerald-400 font-mono">Elo System</div>
              <div className="text-xs text-slate-400">Competitive Skill Index</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-amber-300 font-mono">GitHub</div>
              <div className="text-xs text-slate-400">Automated Repo Audit</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-pink-400 font-mono">Synergy</div>
              <div className="text-xs text-slate-400">Complementary Teams</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Picker Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Select a Skill Domain to Elevate Your Elo</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full border border-purple-500/30">
                4 Core Stacks
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Complete timed proctored challenges to gain up to +150 Elo rating points per domain.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Cheat Proctored (Fullscreen + Tab-Switch Logging)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill) => {
            const Icon = getSkillIcon(skill.icon);
            const userBadge = (currentUser.verifiedBadges || []).find(b => b.skillId === skill.id);
            const isVerified = Boolean(userBadge);

            return (
              <div 
                key={skill.id}
                className="group relative rounded-2xl glass-panel-interactive p-6 flex flex-col justify-between border border-white/10 hover:border-purple-500/40"
              >
                {/* Top Badge Status */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} p-2.5 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  {isVerified ? (
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      userBadge.tier === 'gold' ? 'badge-gold' :
                      userBadge.tier === 'silver' ? 'badge-silver' : 'badge-bronze'
                    }`}>
                      <Award className="w-3 h-3" />
                      <span>{userBadge.tier} ({userBadge.score}%)</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 text-[10px] uppercase font-bold tracking-wider">
                      Unrated (1200)
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skill.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Up to +150 Elo</span>
                  </div>

                  <button
                    onClick={() => handleStartTest(skill)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-purple transition-all group-hover:translate-x-0.5"
                  >
                    <span>{isVerified ? 'Re-rate' : 'Test Elo'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 4-Step Proof Stack Workflow */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            The EloVate Proof & Rating Pipeline
          </h2>
          <p className="text-sm text-slate-400">
            A dynamic Elo rating model that moves based on demonstrated competence rather than self-reported buzzwords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-bold font-mono flex items-center justify-center border border-purple-500/40">
              01
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Proctored Assessment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-graded technical challenges with tab-switch telemetry. Performance translates directly to +50 to +150 Elo rating.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-bold font-mono flex items-center justify-center border border-blue-500/40">
              02
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">GitHub Repo Auditor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated API analysis of commit volume, author ratios, and language distributions, awarding +80 to +120 Elo.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono flex items-center justify-center border border-emerald-500/40">
              03
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Complementary Team Gates</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teams define open role slots with Minimum Elo requirements. Applicants solve pre-join team challenges before admission.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold font-mono flex items-center justify-center border border-amber-500/40">
              04
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Recruiter Dossier</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters filter talent by Elo tier (Grandmaster, Master, Expert) and review anti-cheat telemetry reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
