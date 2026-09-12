import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../data/seedData';
import { 
  Users, Award, Code2, Briefcase, Compass, RotateCcw, 
  ChevronDown, UserCheck, TrendingUp, LayoutDashboard, 
  Bell, CheckCircle2, XCircle, HeartHandshake, FileText, 
  Calendar, MailCheck, GraduationCap, LogOut
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentUser, activeTab, setActiveTab, 
    resetDemoData, notifications, markNotificationAsRead, 
    markAllNotificationsAsRead, respondToInterview, interviews, 
    logoutUser, isAuthenticated, setIsAuthModalOpen, setAuthModalTab
  } = useApp();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);
  const personaRef = useRef(null);

  const userNotifications = isAuthenticated ? (notifications || []).filter(n => n.userId === currentUser?.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const pendingInvitesCount = isAuthenticated ? (interviews || []).filter(
    i => i.candidateId === currentUser?.id && i.status === 'pending'
  ).length : 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setIsBellOpen(false);
      if (personaRef.current && !personaRef.current.contains(e.target)) setIsPersonaOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = (tab) => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const navItems = !isAuthenticated 
    ? [{ id: 'onboarding', label: 'Explore Platform', icon: Compass }]
    : currentUser?.role === 'candidate' 
      ? [
          { id: 'onboarding', label: 'Explore', icon: Compass },
          { id: 'assessment', label: 'Assessments', icon: Award },
          { id: 'projects', label: 'Project Auditor', icon: Code2 },
          { id: 'teams', label: 'Team Hub', icon: Users },
          { id: 'invitations', label: 'Invitations', icon: MailCheck, badge: pendingInvitesCount },
          { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
      : [
          { id: 'onboarding', label: 'Explore', icon: Compass },
          { id: 'assessment', label: 'Assessments', icon: Award },
          { id: 'projects', label: 'Project Auditor', icon: Code2 },
          { id: 'teams', label: 'Team Hub', icon: Users },
          { id: 'recruiter', label: 'Recruiter Dossier', icon: Briefcase },
          { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ];

  const getNotifIcon = (type) => {
    switch (type) {
      case 'interview': return <Calendar className="w-3.5 h-3.5 text-amber-400" />;
      case 'team': return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'endorsement': return <HeartHandshake className="w-3.5 h-3.5 text-[#4F46E5]" />;
      case 'reference': return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case 'mentorship': return <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5]" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleNotifClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTab) setActiveTab(notif.linkTab);
    setIsBellOpen(false);
  };

  const handleInterviewResponse = (e, notif, status) => {
    e.stopPropagation();
    if (notif.interviewId) respondToInterview(notif.interviewId, status);
    markNotificationAsRead(notif.id);
  };

  const showEloPill = activeTab !== 'onboarding' && isAuthenticated;

  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/90 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          <div 
            onClick={() => setActiveTab('onboarding')}
            className="flex items-center cursor-pointer group flex-shrink-0"
          >
            <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-slate-200 transition-colors">
              EloVate
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            
            {!isAuthenticated ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => openAuth('signin')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="px-4 py-2 text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md transition-colors shadow-sm"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <>
                {showEloPill && currentUser?.role === 'candidate' && (
                  <div 
                    onClick={() => setActiveTab('dashboard')}
                    className="cursor-pointer bg-[#0D1117] px-3 py-1.5 rounded-lg flex items-center gap-2.5 border border-slate-800 hover:border-slate-700 transition-colors"
                    title="Skill Rating"
                  >
                    <div className="w-6 h-6 rounded bg-[#4F46E5]/10 border border-[#4F46E5]/20 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-[#4F46E5]" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <span>Elo</span>
                        <span className="text-[8px] text-[#4F46E5] bg-[#4F46E5]/10 px-1 rounded font-mono">
                          {currentUser?.eloTier}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold text-white font-mono">
                        {currentUser?.eloRating} <span className="text-[10px] text-slate-500 font-sans">Elo</span>
                      </div>
                    </div>
                  </div>
                )}

                {showEloPill && currentUser?.role === 'recruiter' && (
                  <div 
                    onClick={() => setActiveTab('recruiter')}
                    className="cursor-pointer bg-[#0D1117] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-amber-500/20"
                  >
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <div className="leading-tight">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-amber-500">Recruiter</div>
                      <div className="text-xs font-semibold text-slate-200">Active View</div>
                    </div>
                  </div>
                )}

                <div className="relative" ref={bellRef}>
                  <button
                    onClick={() => { setIsBellOpen(!isBellOpen); setIsPersonaOpen(false); }}
                    className="relative p-2 rounded-lg bg-[#0D1117] border border-slate-800 text-slate-400 hover:text-white transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isBellOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#0D1117] rounded-xl shadow-2xl z-50 border border-slate-800 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#4F46E5]" />
                          <span className="text-sm font-bold text-slate-100">Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <button onClick={markAllNotificationsAsRead} className="text-[10px] text-[#4F46E5] hover:text-white font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {userNotifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-slate-500">No notifications yet</div>
                        ) : (
                          userNotifications.map(notif => {
                            const isPendingInterview = notif.type === 'interview' && notif.interviewId && 
                              interviews.find(i => i.id === notif.interviewId && i.status === 'pending');
                            return (
                              <div
                                key={notif.id} onClick={() => handleNotifClick(notif)}
                                className={`px-4 py-3 border-b border-slate-800/50 cursor-pointer hover:bg-white/5 transition-colors ${!notif.read ? 'bg-[#4F46E5]/5' : ''}`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="mt-0.5 w-6 h-6 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    {getNotifIcon(notif.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-semibold text-slate-100 line-clamp-1">{notif.title}</span>
                                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] flex-shrink-0" />}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                    <div className="text-[9px] text-slate-500 mt-1">{notif.createdAt}</div>
                                    
                                    {isPendingInterview && (
                                      <div className="flex gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
                                        <button onClick={(e) => handleInterviewResponse(e, notif, 'accepted')} className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-600/30">
                                          Accept
                                        </button>
                                        <button onClick={(e) => handleInterviewResponse(e, notif, 'declined')} className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-600/30">
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={personaRef}>
                  <button
                    onClick={() => { setIsPersonaOpen(!isPersonaOpen); setIsBellOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#0D1117] border border-slate-800 hover:border-slate-600 transition-all text-xs"
                  >
                    <UserAvatar name={currentUser?.fullName || 'User'} size="w-6 h-6" textSize="text-[10px]" className="rounded border border-slate-700" />
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isPersonaOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0D1117] rounded-xl shadow-2xl p-1.5 z-50 border border-slate-800">
                      <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={currentUser?.fullName || 'U'} size="w-8 h-8" textSize="text-xs" className="rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-100 text-sm truncate">{currentUser?.fullName}</div>
                            <div className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'Logged In'}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { logoutUser(); setIsPersonaOpen(false); }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>

                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={() => { resetDemoData(); setIsPersonaOpen(false); }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Demo State</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
