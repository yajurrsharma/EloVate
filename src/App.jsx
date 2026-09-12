import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SkillOnboarding from './components/SkillOnboarding';
import AssessmentEngine from './components/AssessmentEngine';
import ProjectAuditor from './components/ProjectAuditor';
import TeamHub from './components/TeamHub';
import RecruiterDossier from './components/RecruiterDossier';
import RecruitmentInvitations from './components/RecruitmentInvitations';
import Mentorship from './components/Mentorship';
import { UserAvatar } from './data/seedData';
import { 
  ShieldAlert, 
  Award, 
  Code2, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Info,
  TrendingUp,
  FolderGit2,
  ExternalLink,
  Zap,
  HeartHandshake,
  FileText,
  Plus,
  Check,
  Calendar,
  XCircle,
  Clock,
  Building2
} from 'lucide-react';

export default function App() {
  const { 
    activeTab, 
    setActiveTab, 
    notification, 
    currentUser, 
    currentRole,
    teams,
    users,
    references,
    interviews,
    addPeerEndorsement,
    addVerifiedReference,
    respondToInterview,
    showToast,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
  } = useApp();

  // Reference Generator Modal State
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [refName, setRefName] = useState('');
  const [refRole, setRefRole] = useState('');
  const [refRelationship, setRefRelationship] = useState('Former Engineering Manager');
  const [refTestimonial, setRefTestimonial] = useState('');

  // Peer Endorsement Selection State
  const [selectedEndorsementPeer, setSelectedEndorsementPeer] = useState('');
  const [selectedEndorsementSkill, setSelectedEndorsementSkill] = useState('Clean Architecture');

  // Show landing/auth state when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">EloVate</h1>
            <p className="text-sm text-slate-400">
              Eliminate resume fabrications. Prove your engineering depth with a competitive Chess-style Elo rating system.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => { setAuthModalTab('signin'); setIsAuthModalOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm"
              >
                Create Account
              </button>
            </div>
          </div>
        </main>
        <AuthModal />
      </div>
    );
  }

  const activeTeam = teams.find(t => 
    t.leadId === currentUser.id || t.slots.some(s => s.assignedUserId === currentUser.id)
  );

  const candidateRefs = references.filter(r => r.candidateId === currentUser.id);
  
  // Interviews addressed to the current candidate
  const myInterviews = interviews.filter(i => i.candidateId === currentUser.id);
  const pendingInterviews = myInterviews.filter(i => i.status === 'pending');

  const handleSimulateSubmitReference = (e) => {
    e.preventDefault();
    if (!refName.trim() || !refTestimonial.trim()) {
      showToast('Please provide referee name and testimonial text', 'error');
      return;
    }

    addVerifiedReference(currentUser.id, {
      refereeName: refName.trim(),
      refereeRole: refRole.trim() || 'Tech Lead @ Innovation Labs',
      relationship: refRelationship,
      ratings: { technical: 5, architecture: 5, collaboration: 5 },
      testimonial: refTestimonial.trim()
    });

    setIsReferenceModalOpen(false);
    setRefName('');
    setRefRole('');
    setRefTestimonial('');
  };

  const handleGiveEndorsement = () => {
    if (!selectedEndorsementPeer) {
      showToast('Please select a peer to endorse', 'error');
      return;
    }
    addPeerEndorsement(selectedEndorsementPeer, selectedEndorsementSkill);
    setSelectedEndorsementPeer('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl glass-panel shadow-2xl border flex items-center gap-3 ${
            notification.type === 'error' 
              ? 'border-rose-500/50 bg-rose-950/80 text-rose-200' 
              : notification.type === 'info'
              ? 'border-purple-500/50 bg-purple-950/80 text-purple-200'
              : 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200'
          }`}>
            {notification.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : notification.type === 'info' ? (
              <Info className="w-5 h-5 text-purple-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'onboarding' && <SkillOnboarding />}
        {activeTab === 'assessment' && <AssessmentEngine />}
        {activeTab === 'projects' && <ProjectAuditor />}
        {activeTab === 'teams' && <TeamHub />}
        {activeTab === 'recruiter' && currentRole === 'recruiter' && <RecruiterDossier />}
        {activeTab === 'invitations' && <RecruitmentInvitations />}
        {activeTab === 'mentorship' && <Mentorship />}

        {/* Candidate Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            
            {/* Candidate Header Profile Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-b from-purple-950/10 to-slate-900/60">
              <div className="flex items-center gap-5">
                <UserAvatar 
                  name={currentUser.fullName} 
                  size="w-20 h-20" 
                  textSize="text-2xl" 
                  className="rounded-2xl shadow-xl border-2 border-purple-500/40" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{currentUser.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                      {currentUser.eloTier} Tier
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{currentUser.title}</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">{currentUser.bio}</p>
                </div>
              </div>

              {/* Chess Elo Rating Dial */}
              <div className="glass-panel px-6 py-4 rounded-2xl border border-purple-500/30 text-center min-w-[180px]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Developer Elo</span>
                </div>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-pink-300 font-mono my-1">
                  {currentUser.eloRating}
                </div>
                <div className="text-[11px] text-purple-400 font-medium">
                  {currentUser.verifiedBadges.length} Skills • {(currentUser.githubAudits || []).length} Repos
                </div>
              </div>
            </div>

            {/* Interview Invitations (Candidate) */}
            {myInterviews.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>Recruitment Interview Invitations</span>
                    {pendingInterviews.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                        {pendingInterviews.length} Pending
                      </span>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myInterviews.map(interview => (
                    <div
                      key={interview.id}
                      className={`glass-panel p-5 rounded-2xl border flex flex-col gap-4 ${
                        interview.status === 'pending'
                          ? 'border-amber-500/30 bg-amber-950/10'
                          : interview.status === 'accepted'
                          ? 'border-emerald-500/30 bg-emerald-950/10'
                          : 'border-rose-500/20 bg-rose-950/10 opacity-70'
                      }`}
                    >
                      {/* Interview header */}
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          name={interview.recruiterName}
                          size="w-10 h-10"
                          textSize="text-sm"
                          className="rounded-xl border border-amber-500/30"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{interview.recruiterName}</span>
                            <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Building2 className="w-2.5 h-2.5" />
                              {interview.recruiterCompany}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">Role: <span className="text-slate-200">{interview.role}</span></p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex-shrink-0 ${
                          interview.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          interview.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {interview.status}
                        </span>
                      </div>

                      {/* Interview details */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-mono bg-slate-900/40 rounded-xl p-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{interview.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{interview.time}</span>
                        </div>
                      </div>

                      {interview.notes && (
                        <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-purple-500/30 pl-3">
                          "{interview.notes}"
                        </p>
                      )}

                      {/* Accept/Decline buttons — only for pending */}
                      {interview.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => respondToInterview(interview.id, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept Interview
                          </button>
                          <button
                            onClick={() => respondToInterview(interview.id, 'declined')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      )}

                      {interview.status === 'accepted' && (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Interview accepted — +30 Elo bonus awarded!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Squad Membership Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {activeTeam ? `Member of ${activeTeam.name}` : 'No Active Squad Joined'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {activeTeam ? `${activeTeam.hackathonTrack} • ${activeTeam.membersCount}/${activeTeam.maxMembers} Members` : 'Browse the Team Hub to match complementary squads'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('teams')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
              >
                {activeTeam ? 'Manage Team Roster' : 'Find Complementary Squad'}
              </button>
            </div>

            {/* Verified Skill Badges Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>Proctored Skill Badges & Elo Contributions</span>
                </h3>
                <button
                  onClick={() => setActiveTab('assessment')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  Take Another Assessment →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUser.verifiedBadges.length > 0 ? (
                  currentUser.verifiedBadges.map((badge, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 text-sm truncate">{badge.skillName}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          Score: {badge.score}% • Integrity: {badge.integrityScore}%
                        </div>
                        <div className="text-[10px] text-purple-300 mt-0.5 font-mono">+{badge.eloDelta || 95} Elo Earned</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 ${
                        badge.tier === 'gold' ? 'badge-gold' :
                        badge.tier === 'silver' ? 'badge-silver' : 'badge-bronze'
                      }`}>
                        {badge.tier}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center glass-panel rounded-xl text-slate-400 text-xs">
                    No verified skill badges yet. Visit Explore & Onboard to test your skills.
                  </div>
                )}
              </div>
            </div>

            {/* Verified GitHub Projects Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-blue-400" />
                  <span>Audited Authentic GitHub Projects</span>
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Audit Another Repo →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentUser.githubAudits || []).length > 0 ? (
                  (currentUser.githubAudits || []).map((audit, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{audit.repoName}</span>
                          <a href={audit.repoUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        </div>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold flex-shrink-0">
                          +{audit.eloBonus || 85} Elo
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-mono flex-wrap">
                        <span>{audit.language}</span>
                        <span>•</span>
                        <span>{audit.commits} Commits</span>
                        <span>•</span>
                        <span className="text-emerald-400">{audit.authorshipRatio}% Authorship</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center glass-panel rounded-xl text-slate-400 text-xs">
                    No audited GitHub projects yet. Visit Project Auditor to verify your repositories.
                  </div>
                )}
              </div>
            </div>

            {/* Peer Endorsements & Verified References Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Peer Endorsements Box */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-purple-400" />
                    <span>Peer Endorsements (Gated)</span>
                  </h3>
                  <span className="text-xs text-purple-300 font-mono">
                    {(currentUser.endorsements || []).length} Confirmed
                  </span>
                </div>

                <div className="space-y-2">
                  {(currentUser.endorsements || []).map((e, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{e.skill}</div>
                        <div className="text-[10px] text-slate-400">Endorsed by {e.giverName}</div>
                      </div>
                      <span className="text-[10px] text-purple-300 font-mono font-bold flex-shrink-0">+25 Elo</span>
                    </div>
                  ))}
                </div>

                {/* Quick Endorse a Peer Action */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Endorse Another Candidate (Requires ≥1 Badge)
                  </div>
                  <select
                    value={selectedEndorsementPeer}
                    onChange={(e) => setSelectedEndorsementPeer(e.target.value)}
                    className="w-full p-2 rounded-lg glass-input text-xs text-slate-200"
                  >
                    <option value="">Select a Candidate to Endorse...</option>
                    {users.filter(u => u.id !== currentUser.id && u.role === 'candidate').map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.title})</option>
                    ))}
                  </select>
                  <select
                    value={selectedEndorsementSkill}
                    onChange={(e) => setSelectedEndorsementSkill(e.target.value)}
                    className="w-full p-2 rounded-lg glass-input text-xs text-slate-200"
                  >
                    <option value="Clean Architecture">Clean Architecture</option>
                    <option value="Rapid Prototyping">Rapid Prototyping</option>
                    <option value="System Concurrency">System Concurrency</option>
                    <option value="Accessible UI Design">Accessible UI Design</option>
                  </select>
                  <button
                    onClick={handleGiveEndorsement}
                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Send Endorsement (+25 Elo to recipient)
                  </button>
                </div>
              </div>

              {/* External References & LORs Box */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Supervisor References & LORs</span>
                  </h3>
                  <button
                    onClick={() => setIsReferenceModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Submit LOR</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {candidateRefs.length > 0 ? (
                    candidateRefs.map((ref) => (
                      <div key={ref.id} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-slate-100 truncate">{ref.refereeName}</strong>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold flex-shrink-0">+40 Elo</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{ref.refereeRole} ({ref.relationship})</div>
                        <p className="text-xs text-slate-300 italic line-clamp-2">
                          &ldquo;{ref.testimonial}&rdquo;
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No external references submitted yet. Click Submit LOR to attach mentor verification.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* External Reference Submission Modal */}
      {isReferenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border border-emerald-500/40 p-6 sm:p-8 rounded-3xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Submit Verified Reference / LOR
                </h3>
                <p className="text-xs text-slate-400">
                  Attaching mentor evaluation for {currentUser.fullName} (+40 Elo)
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateSubmitReference} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Referee Name</label>
                <input
                  type="text"
                  required
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Role & Organization</label>
                <input
                  type="text"
                  value={refRole}
                  onChange={(e) => setRefRole(e.target.value)}
                  placeholder="e.g. Principal Architect @ TechCorp"
                  className="w-full p-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Relationship to Candidate</label>
                <select
                  value={refRelationship}
                  onChange={(e) => setRefRelationship(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                >
                  <option value="Former Engineering Manager">Former Engineering Manager</option>
                  <option value="Research / Thesis Advisor">Research / Thesis Advisor</option>
                  <option value="Senior Team Mentor">Senior Team Mentor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Recommendation / Testimonial</label>
                <textarea
                  rows={3}
                  required
                  value={refTestimonial}
                  onChange={(e) => setRefTestimonial(e.target.value)}
                  placeholder="Summarize candidate technical rigor, architectural consistency, and problem-solving..."
                  className="w-full p-2.5 rounded-xl glass-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsReferenceModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                >
                  Confirm & Stamp Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Clean Footer */}
      <footer className="glass-panel border-t border-white/5 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          EloVate Platform • Verified Skills & Complementary Team Engine
        </div>
      </footer>
    </div>
  );
}
