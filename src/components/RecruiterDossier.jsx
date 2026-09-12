import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import { 
  Briefcase, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  XCircle, 
  Layers, 
  Printer, 
  ChevronRight,
  Clock,
  MessageSquare,
  X
} from 'lucide-react';

export default function RecruiterDossier() {
  const { 
    users, 
    shortlistedCandidates, 
    toggleShortlistCandidate, 
    references,
    scheduleInterview,
    showToast
  } = useApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('all');
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [minIntegrity, setMinIntegrity] = useState(90);

  // Active Dossier Modal for Candidate deep-dive
  const [inspectedCandidate, setInspectedCandidate] = useState(null);

  // Schedule Interview Modal
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [intDate, setIntDate] = useState('');
  const [intTime, setIntTime] = useState('');
  const [intRole, setIntRole] = useState('');
  const [intNotes, setIntNotes] = useState('');

  // Filter candidates (only show candidate role users)
  const candidateList = users.filter(u => u.role === 'candidate');

  const filteredCandidates = candidateList.filter(candidate => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = candidate.fullName.toLowerCase().includes(q);
      const matchesTitle = (candidate.title || '').toLowerCase().includes(q);
      const matchesSkill = (candidate.verifiedBadges || []).some(b => b.skillName.toLowerCase().includes(q));
      if (!matchesName && !matchesTitle && !matchesSkill) return false;
    }

    if (selectedTierFilter !== 'all') {
      if (candidate.eloTier.toLowerCase() !== selectedTierFilter.toLowerCase()) return false;
    }

    if (selectedSkillFilter !== 'all') {
      const hasSkill = (candidate.verifiedBadges || []).some(b => b.skillId === selectedSkillFilter);
      if (!hasSkill) return false;
    }

    if (candidate.verifiedBadges.length > 0) {
      const avgIntegrity = candidate.verifiedBadges.reduce((a, b) => a + (b.integrityScore || 100), 0) / candidate.verifiedBadges.length;
      if (avgIntegrity < minIntegrity) return false;
    }

    if (onlyShortlisted && !shortlistedCandidates.includes(candidate.id)) {
      return false;
    }

    return true;
  });

  const handlePrintDossier = () => {
    window.print();
  };

  const openScheduleModal = (candidate) => {
    setSchedulingFor(candidate);
    setIntRole(candidate.title || '');
    setIntDate('');
    setIntTime('');
    setIntNotes('');
    setInspectedCandidate(null);
  };

  const handleSubmitInterview = (e) => {
    e.preventDefault();
    if (!intDate || !intTime) {
      showToast('Please select a date and time for the interview', 'error');
      return;
    }
    scheduleInterview({
      candidateId: schedulingFor.id,
      date: intDate,
      time: intTime,
      role: intRole || schedulingFor.title,
      notes: intNotes
    });
    setSchedulingFor(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Recruiter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>High-Signal Recruiter & Judge Dossier (Market Ready View)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified Candidate Dossier
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Zero-noise talent screening. Review proctored assessment logs, anti-cheat telemetry, audited GitHub projects, and verified references with zero resume inflation.
          </p>
        </div>

        {/* Shortlist Counter Banner */}
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 flex items-center gap-4 self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Shortlisted for Interview</div>
            <div className="text-xl font-extrabold font-mono text-white">
              {shortlistedCandidates.length} <span className="text-xs font-normal text-slate-400">Candidates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, title, or stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
            />
          </div>

          {/* Skill Filter Dropdown */}
          <select
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-200"
          >
            <option value="all">All Verified Skills</option>
            <option value="skill-frontend">Frontend Engineering</option>
            <option value="skill-backend">Backend Architecture</option>
            <option value="skill-dsa">Data Structures & Algorithms</option>
            <option value="skill-design">UI/UX & Product Design</option>
          </select>

          {/* Elo Tier Selector */}
          <select
            value={selectedTierFilter}
            onChange={(e) => setSelectedTierFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-200"
          >
            <option value="all">All Elo Tiers</option>
            <option value="grandmaster">Grandmaster (2100+)</option>
            <option value="master">Master (1900+)</option>
            <option value="expert">Expert (1700+)</option>
            <option value="specialist">Specialist (1500+)</option>
            <option value="candidate">Candidate (1300+)</option>
          </select>
        </div>

        {/* Second Row: Integrity Slider & Shortlist Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Min Anti-Cheat Integrity:</span>
            <input
              type="range"
              min="70"
              max="100"
              step="5"
              value={minIntegrity}
              onChange={(e) => setMinIntegrity(Number(e.target.value))}
              className="w-28 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-bold">{minIntegrity}% Clean</span>
          </div>

          <button
            onClick={() => setOnlyShortlisted(!onlyShortlisted)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              onlyShortlisted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Show Shortlisted Only ({shortlistedCandidates.length})</span>
          </button>
        </div>
      </div>

      {/* Candidate Dossier Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Displaying <strong>{filteredCandidates.length}</strong> verified engineering candidates</span>
          <span>Ranked by Skill Elo Rating</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => {
            const isShortlisted = shortlistedCandidates.includes(candidate.id);
            const candidateRefs = references.filter(r => r.candidateId === candidate.id);

            return (
              <div 
                key={candidate.id}
                className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar 
                        name={candidate.fullName} 
                        size="w-12 h-12" 
                        textSize="text-sm" 
                        className="rounded-2xl shadow-md border border-purple-500/30 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors truncate">
                          {candidate.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{candidate.title}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleShortlistCandidate(candidate.id)}
                      className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                        isShortlisted
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                      }`}
                      title={isShortlisted ? 'Remove from shortlist' : 'Shortlist candidate'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Elo Pill & Rating Tier */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-mono">
                    <span className="text-slate-400">Developer Elo:</span>
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <span>{candidate.eloRating} Elo</span>
                      <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded font-sans font-bold">
                        {candidate.eloTier}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Verified Proof Metrics */}
                <div className="space-y-2.5 text-xs">
                  
                  {/* Verified Badges */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Proctored Assessments
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.verifiedBadges.length > 0 ? candidate.verifiedBadges.map((b, idx) => (
                        <span 
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            b.tier === 'gold' ? 'badge-gold' :
                            b.tier === 'silver' ? 'badge-silver' : 'badge-bronze'
                          }`}
                          title={`Score: ${b.score}% • Anti-Cheat: ${b.integrityScore}%`}
                        >
                          {b.skillName.split(' ')[0]} ({b.tier.toUpperCase()})
                        </span>
                      )) : (
                        <span className="text-[10px] text-slate-500 italic">No assessments yet</span>
                      )}
                    </div>
                  </div>

                  {/* GitHub Repos */}
                  {(candidate.githubAudits || []).length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Audited GitHub Repos
                      </div>
                      <div className="space-y-1">
                        {(candidate.githubAudits || []).map((repo, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                            <span className="truncate max-w-[140px] text-blue-300 font-mono">{repo.repoName}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{repo.commits} commits</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External References */}
                  {candidateRefs.length > 0 && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{candidateRefs.length} Verified Supervisor Reference{candidateRefs.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => setInspectedCandidate(candidate)}
                    className="flex-1 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  >
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openScheduleModal(candidate)}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
                    title="Schedule Verified Interview"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Invite</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Dossier Deep-Dive Modal */}
      {inspectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel border border-white/20 p-6 sm:p-8 rounded-3xl space-y-6 my-8 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  name={inspectedCandidate.fullName} 
                  size="w-16 h-16" 
                  textSize="text-xl" 
                  className="rounded-2xl shadow-xl border-2 border-purple-500/40 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{inspectedCandidate.fullName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      {inspectedCandidate.eloTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{inspectedCandidate.title}</p>
                  <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                    Rating: {inspectedCandidate.eloRating} Elo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDossier}
                  className="p-2 rounded-xl glass-panel hover:bg-white/10 text-slate-300"
                  title="Print / Export Dossier"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectedCandidate(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Assessment Telemetry Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Proctored Assessment Telemetry Log</span>
              </h4>

              {inspectedCandidate.verifiedBadges.length > 0 ? (
                <div className="space-y-2">
                  {inspectedCandidate.verifiedBadges.map((badge, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{badge.skillName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Score: {badge.score}% • Tab Switches: {badge.tabSwitches || 0}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          badge.tier === 'gold' ? 'badge-gold' :
                          badge.tier === 'silver' ? 'badge-silver' : 'badge-bronze'
                        }`}>
                          {badge.tier}
                        </span>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          {badge.integrityScore}% Integrity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No proctored assessments completed yet.</p>
              )}
            </div>

            {/* Audited Repositories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>External GitHub Repository Audits</span>
              </h4>

              {(inspectedCandidate.githubAudits || []).length > 0 ? (
                <div className="space-y-2">
                  {(inspectedCandidate.githubAudits || []).map((audit, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-blue-300 font-mono flex items-center gap-1">
                          <span>{audit.repoName}</span>
                          <a href={audit.repoUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {audit.language} • {audit.commits} Commits • {audit.stars} Stars
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {audit.authorshipRatio}% Authorship
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No audited repositories attached yet.</p>
              )}
            </div>

            {/* Verified External References */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Verified Supervisor References & LORs</span>
              </h4>

              {references.filter(r => r.candidateId === inspectedCandidate.id).length > 0 ? (
                references.filter(r => r.candidateId === inspectedCandidate.id).map(ref => (
                  <div key={ref.id} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-100">{ref.refereeName}</strong>
                        <div className="text-[11px] text-slate-400">{ref.refereeRole} ({ref.relationship})</div>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-mono flex-shrink-0">{ref.submittedAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      &ldquo;{ref.testimonial}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No verified supervisor references submitted.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => toggleShortlistCandidate(inspectedCandidate.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  shortlistedCandidates.includes(inspectedCandidate.id)
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{shortlistedCandidates.includes(inspectedCandidate.id) ? 'Shortlisted ✓' : 'Add to Shortlist'}</span>
              </button>

              <button
                onClick={() => openScheduleModal(inspectedCandidate)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingFor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border border-amber-500/40 p-6 sm:p-8 rounded-3xl space-y-5 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Schedule Interview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sending verified interview invite to <span className="text-amber-300 font-medium">{schedulingFor.fullName}</span>
                </p>
              </div>
              <button onClick={() => setSchedulingFor(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterview} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Role / Position</label>
                <input
                  type="text"
                  value={intRole}
                  onChange={(e) => setIntRole(e.target.value)}
                  placeholder="e.g. Frontend Specialist & React Architect"
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <input
                    type="time"
                    required
                    value={intTime}
                    onChange={(e) => setIntTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Interview Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  placeholder="e.g. Focus areas: system design, React architecture, performance..."
                  className="w-full p-2.5 rounded-xl glass-input resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSchedulingFor(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Send Interview Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
