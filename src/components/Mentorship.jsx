import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Search, 
  Sparkles, 
  Calendar, 
  Clock, 
  Award, 
  TrendingUp, 
  Send, 
  XCircle, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  MessageSquare,
  BookOpen,
  HelpCircle,
  Filter
} from 'lucide-react';

export default function Mentorship() {
  const { 
    currentUser, 
    users, 
    mentorshipSessions, 
    requestMentorshipSession, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [selectedSkillFilter, setSelectedSkillFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'candidates' | 'recruiters'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState(null);
  
  // Booking modal form state
  const [sessionTopic, setSessionTopic] = useState('System Architecture & Code Review');
  const [sessionDate, setSessionDate] = useState('Tuesday, Next Week');
  const [sessionTime, setSessionTime] = useState('6:00 PM EST');
  const [sessionNotes, setSessionNotes] = useState('');
  const [activeView, setActiveView] = useState('directory'); // 'directory' | 'my-sessions'

  // Qualification logic: candidates with Elo >= 1600 or users marked isMentor or recruiters
  const eligibleMentors = users.filter(u => {
    if (u.id === currentUser.id) return false; // don't mentor yourself
    const isHighEloCandidate = u.role === 'candidate' && (u.eloRating >= 1600 || u.isMentor);
    const isRecruiterMentor = u.role === 'recruiter' || u.isMentor;
    return isHighEloCandidate || isRecruiterMentor;
  });

  // Filter mentors based on search and skill filters
  const filteredMentors = eligibleMentors.filter(mentor => {
    // Role filter
    if (roleFilter === 'candidates' && mentor.role !== 'candidate') return false;
    if (roleFilter === 'recruiters' && mentor.role !== 'recruiter') return false;

    // Skill filter
    if (selectedSkillFilter !== 'all') {
      const skillsMatch = (mentor.mentorSkills || []).some(s => 
        s.toLowerCase().includes(selectedSkillFilter.toLowerCase())
      ) || (mentor.title || '').toLowerCase().includes(selectedSkillFilter.toLowerCase())
        || (mentor.verifiedBadges || []).some(b => b.skillName.toLowerCase().includes(selectedSkillFilter.toLowerCase()));
      if (!skillsMatch) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = mentor.fullName.toLowerCase().includes(query);
      const titleMatch = (mentor.title || '').toLowerCase().includes(query);
      const skillMatch = (mentor.mentorSkills || []).some(s => s.toLowerCase().includes(query));
      if (!nameMatch && !titleMatch && !skillMatch) return false;
    }

    return true;
  });

  // User's own mentorship sessions
  const mySessions = (mentorshipSessions || []).filter(
    s => s.candidateId === currentUser.id || s.mentorId === currentUser.id
  );

  const handleOpenBooking = (mentor) => {
    setSelectedMentorForBooking(mentor);
    setSessionTopic(`1:1 Deep Dive: ${(mentor.mentorSkills && mentor.mentorSkills[0]) || 'Technical Architecture'}`);
    setSessionNotes('');
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!sessionNotes.trim()) {
      showToast('Please provide a brief topic or questions for the session.', 'error');
      return;
    }

    requestMentorshipSession({
      mentorId: selectedMentorForBooking.id,
      topic: sessionTopic,
      date: sessionDate,
      time: sessionTime,
      notes: sessionNotes.trim()
    });

    confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.6 }
    });

    setSelectedMentorForBooking(null);
    setActiveView('my-sessions');
  };

  const isCurrentUserEligible = currentUser.role === 'recruiter' || currentUser.eloRating >= 1600;
  const pointsToUnlock = Math.max(0, 1600 - currentUser.eloRating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span>High-Elo Engineering & Recruiter Mentorship</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Peer & Recruiter Mentorship
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Connect 1-on-1 with verified high-Elo candidates (Elo ≥ 1600) and top tech hiring recruiters. Schedule code reviews, architectural advice, and interview preparation sessions.
          </p>
        </div>

        {/* View Switcher: Directory vs My Sessions */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveView('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'directory'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Mentors ({eligibleMentors.length})</span>
          </button>
          <button
            onClick={() => setActiveView('my-sessions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'my-sessions'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Sessions ({mySessions.length})</span>
          </button>
        </div>
      </div>

      {/* Mentor Qualification Status Card */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/80 to-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-purple-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>EloVate Mentor Standards</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Minimum 1600 Elo Required
              </span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              To guarantee high pedagogical value, only candidates in the <strong>Specialist tier or above (1600+ Elo)</strong> or <strong>Verified Talent Partners</strong> are qualified to mentor peers.
            </p>
          </div>
        </div>

        {/* Current user qualification progress */}
        <div className="glass-panel px-5 py-3 rounded-2xl border border-white/10 min-w-[220px] text-right md:text-left">
          {isCurrentUserEligible ? (
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Qualified Mentor</span>
              </div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {currentUser.fullName} ({currentUser.eloRating} Elo)
              </div>
              <div className="text-[10px] text-slate-400">Your profile is eligible to mentor peers.</div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">
                Unlock Mentorship
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {currentUser.eloRating} / 1600 Elo
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {pointsToUnlock} Elo points to unlock mentor status.
              </div>
            </div>
          )}
        </div>
      </div>

      {activeView === 'directory' ? (
        <>
          {/* Filter & Search Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mentors by name, skill (e.g. Postgres, React, PyTorch), or company..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              {/* Role Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 rounded-xl p-1 border border-white/10">
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'candidates', label: 'High-Elo Candidates' },
                  { id: 'recruiters', label: 'Recruiters' }
                ].map(rf => (
                  <button
                    key={rf.id}
                    onClick={() => setRoleFilter(rf.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      roleFilter === rf.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Tags Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
                <Filter className="w-3 h-3" />
                <span>Skills:</span>
              </span>
              {[
                { id: 'all', label: 'All Domains' },
                { id: 'backend', label: 'Backend & Systems' },
                { id: 'design', label: 'Frontend & UI/UX' },
                { id: 'cloud', label: 'DevOps & Cloud' },
                { id: 'machine learning', label: 'AI / Machine Learning' },
                { id: 'interview', label: 'Interview Prep & Career' }
              ].map(domain => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedSkillFilter(domain.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedSkillFilter === domain.id
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                      : 'glass-panel hover:bg-white/5 text-slate-400 border border-white/5'
                  }`}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Cards Grid */}
          {filteredMentors.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-white/10">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No mentors matching this criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try loosening your search query or selecting "All Domains" to discover other engineering mentors.
              </p>
              <button
                onClick={() => { setSelectedSkillFilter('all'); setSearchQuery(''); setRoleFilter('all'); }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all inline-block"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map(mentor => (
                <div
                  key={mentor.id}
                  className="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 flex flex-col justify-between hover:border-purple-500/40 transition-all group"
                >
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar 
                          name={mentor.fullName} 
                          size="w-14 h-14" 
                          textSize="text-lg"
                          className="rounded-2xl shadow-xl border border-purple-500/30 group-hover:scale-105 transition-transform flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors truncate">
                            {mentor.fullName}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1">{mentor.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {mentor.role === 'recruiter' ? (
                              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                                Recruiter Partner
                              </span>
                            ) : (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                                {mentor.eloRating} Elo • {mentor.eloTier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mentor Bio */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {mentor.mentorBio || mentor.bio}
                    </p>

                    {/* Mentor Skills Badges */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Core Mentoring Areas:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(mentor.mentorSkills || ['System Architecture', 'Clean Code']).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Booking Action */}
                  <div className="pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleOpenBooking(mentor)}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request 1:1 Mentorship Session</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Sessions View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Your Scheduled Mentorship Sessions</span>
              <span className="text-xs text-slate-400 font-mono">({mySessions.length})</span>
            </h2>
            <button
              onClick={() => setActiveView('directory')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              + Book Another Session
            </button>
          </div>

          {mySessions.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-white/10 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No mentorship sessions yet</h3>
              <p className="text-xs text-slate-400">
                Browse our verified high-Elo engineering mentors and schedule your first 1-on-1 architecture or code review session!
              </p>
              <button
                onClick={() => setActiveView('directory')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all inline-block"
              >
                Browse Mentors Directory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mySessions.map(session => {
                const isMentor = session.mentorId === currentUser.id;
                const counterPartyName = isMentor ? session.candidateName : session.mentorName;

                return (
                  <div
                    key={session.id}
                    className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/10 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            name={counterPartyName} 
                            size="w-11 h-11" 
                            textSize="text-sm"
                            className="rounded-xl shadow-md"
                          />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-emerald-400">
                              {isMentor ? 'Mentee' : 'Mentor'}
                            </div>
                            <h3 className="font-bold text-white text-sm">
                              {counterPartyName}
                            </h3>
                            <p className="text-xs text-slate-400">{session.mentorTitle}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          {session.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Session Focus Topic:
                        </div>
                        <div className="text-xs font-bold text-white">
                          {session.topic}
                        </div>
                        {session.notes && (
                          <p className="text-xs text-slate-300 italic mt-1 leading-relaxed">
                            &ldquo;{session.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => showToast('Connecting to encrypted mentorship video room...', 'info')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Launch 1:1 Video Room</span>
                      </button>
                      <button
                        onClick={() => showToast('Calendar event downloaded', 'success')}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
                      >
                        Calendar
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Book Session Modal */}
      {selectedMentorForBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel border border-purple-500/30 p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  name={selectedMentorForBooking.fullName} 
                  size="w-12 h-12" 
                  textSize="text-base"
                  className="rounded-2xl shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Book 1:1 with {selectedMentorForBooking.fullName}
                  </h3>
                  <p className="text-xs text-purple-300 font-mono">
                    {selectedMentorForBooking.role === 'recruiter' ? 'Talent Partner' : `${selectedMentorForBooking.eloRating} Elo • ${selectedMentorForBooking.eloTier}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentorForBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Session Topic / Area</label>
                <select
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200"
                >
                  <option value="System Architecture & Scalability" className="bg-slate-900">System Architecture & Scalability</option>
                  <option value="Component Design Tokens & Frontend Optimization" className="bg-slate-900">Component Design Tokens & Frontend Optimization</option>
                  <option value="Mock Technical Interview & DSA Review" className="bg-slate-900">Mock Technical Interview & DSA Review</option>
                  <option value="Technical Resume & Verified Dossier Strategy" className="bg-slate-900">Technical Resume & Verified Dossier Strategy</option>
                  <option value="Distributed Microservices & Database Indexing" className="bg-slate-900">Distributed Microservices & Database Indexing</option>
                  <option value="Production AI/ML Pipelines & LLM Tuning" className="bg-slate-900">Production AI/ML Pipelines & LLM Tuning</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Preferred Date</label>
                  <input
                    type="text"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    placeholder="e.g. Wednesday, Sep 17"
                    className="w-full p-2.5 rounded-xl glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Preferred Time</label>
                  <input
                    type="text"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    placeholder="e.g. 6:30 PM EST"
                    className="w-full p-2.5 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Discussion Agenda & Questions for Mentor
                </label>
                <textarea
                  rows={4}
                  required
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Outline the specific code repos, architectural trade-offs, or questions you would like to discuss with the mentor..."
                  className="w-full p-3 rounded-xl glass-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForBooking(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-glow-purple transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Book Session</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
