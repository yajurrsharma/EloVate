import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_SKILLS, SEED_USERS, SEED_TEAMS, SEED_QUESTIONS } from '../data/seedData';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const STORAGE_KEY = 'elovate_elo_v7';

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');

  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const isAuthenticated = authUser !== null;

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_users');
      return saved ? JSON.parse(saved) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  // Fetch all users from the backend database on mount
  useEffect(() => {
    async function fetchBackendUsers() {
      try {
        const dbUsers = await api.users.getAll();
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          setUsers(dbUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users from backend, falling back to local/seed state', err);
      }
    }
    fetchBackendUsers();
  }, []);

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + '_user_id') || 'user-harshika';
    } catch { return 'user-harshika'; }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + '_role') || 'candidate';
    } catch { return 'candidate'; }
  });

  const loginAsUser = useCallback((user) => {
    setAuthUser(user);
    localStorage.setItem(STORAGE_KEY + '_auth_user', JSON.stringify(user));
    
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) return prev;
      return [...prev, { ...user }];
    });
    
    setCurrentUserId(user.id);
    const resolvedRole = (user.role || 'candidate').toLowerCase();
    setCurrentRole(resolvedRole === 'recruiter' ? 'recruiter' : 'candidate');
    if (resolvedRole === 'recruiter') setActiveTab('recruiter');
    else setActiveTab('dashboard');
  }, []);

  const loginUser = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('elovate_token', data.token);

    const resolvedName = data.user?.fullName || data.user?.full_name || email.split('@')[0];
    const resolvedRole = (data.user?.role || 'candidate').toLowerCase();

    const frontendUser = {
      id: data.user.id,
      fullName: resolvedName,
      email: email,
      role: resolvedRole,
      title: data.user.title || '',
      bio: data.user.bio || '',
      company: data.user.company || '',
      linkedinUrl: data.user.linkedinUrl || data.user.linkedin_url || '',
      certificateName: data.user.certificateName || data.user.certificate_name || '',
      eloRating: data.user.eloRating || data.user.elo_rating || 1200,
      eloTier: data.user.eloTier || data.user.elo_tier || 'Candidate',
      verifiedBadges: data.user.verifiedBadges || data.user.verified_badges || [],
      githubAudits: [],
      avatar: null,
    };
    
    loginAsUser(frontendUser);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${resolvedName}!`, 'success');
  };

  const registerUser = async (formDataObj) => {
    const payload = {
      fullName: formDataObj.fullName || '',
      email: formDataObj.email || '',
      password: formDataObj.password || '',
      role: formDataObj.role || 'candidate',
      title: formDataObj.title || '',
      bio: formDataObj.bio || '',
      company: formDataObj.company || '',
      linkedinUrl: formDataObj.linkedinUrl || '',
      certificateName: formDataObj.certificateFile ? formDataObj.certificateFile.name : '',
    };

    const data = await api.auth.register(payload);
    localStorage.setItem('elovate_token', data.token);

    const resolvedName = formDataObj.fullName || formDataObj.full_name || formDataObj.email.split('@')[0];
    const resolvedRole = (formDataObj.role || 'candidate').toLowerCase();

    const frontendUser = {
      id: data.user?.id || 'user-' + Date.now(),
      fullName: resolvedName,
      email: formDataObj.email,
      role: resolvedRole,
      title: formDataObj.title || '',
      bio: formDataObj.bio || '',
      company: formDataObj.company || '',
      eloRating: 1200,
      eloTier: 'Novice',
      verifiedBadges: [],
      githubAudits: [],
      avatar: null,
      linkedinUrl: formDataObj.linkedinUrl || '',
      certificateName: formDataObj.certificateFile ? formDataObj.certificateFile.name : '',
    };

    loginAsUser(frontendUser);
    setIsAuthModalOpen(false);
    showToast(`Account created! Welcome, ${resolvedName}.`, 'success');
  };

  const logoutUser = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem(STORAGE_KEY + '_auth_user');
    localStorage.removeItem('elovate_token');
    showToast('Signed out successfully.', 'info');
  }, []);

  const logout = logoutUser;

  const [teams, setTeams] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_teams'); return saved ? JSON.parse(saved) : SEED_TEAMS; } catch { return SEED_TEAMS; }
  });

  const [teamApplications, setTeamApplications] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_apps'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [shortlistedCandidates, setShortlistedCandidates] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_shortlist'); return saved ? JSON.parse(saved) : ['user-harshika']; } catch { return ['user-harshika']; }
  });

  const [references, setReferences] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_refs'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [interviews, setInterviews] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_interviews'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [notifications, setNotifications] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_notifs'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [mentorshipSessions, setMentorshipSessions] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY + '_mentorship'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState('onboarding');
  const [selectedSkillForTest, setSelectedSkillForTest] = useState(null);
  const [notification, setNotification] = useState(null);

  const updateAuthUser = useCallback((updates) => {
    setAuthUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY + '_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY + '_teams', JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEY + '_apps', JSON.stringify(teamApplications));
      localStorage.setItem(STORAGE_KEY + '_shortlist', JSON.stringify(shortlistedCandidates));
      localStorage.setItem(STORAGE_KEY + '_refs', JSON.stringify(references));
      localStorage.setItem(STORAGE_KEY + '_interviews', JSON.stringify(interviews));
      localStorage.setItem(STORAGE_KEY + '_notifs', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEY + '_mentorship', JSON.stringify(mentorshipSessions));
      localStorage.setItem(STORAGE_KEY + '_user_id', currentUserId);
      localStorage.setItem(STORAGE_KEY + '_role', currentRole);
    } catch (e) { console.error(e); }
  }, [users, teams, teamApplications, shortlistedCandidates, references, interviews, notifications, mentorshipSessions, currentUserId, currentRole]);

  const currentUser = authUser 
    ? (users.find(u => u.id === authUser.id) || authUser) 
    : (users.find(u => u.id === currentUserId) || users[0]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => { setNotification(null); }, 4000);
  };

  const switchUser = (userId) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      const targetRole = (target.role || 'candidate').toLowerCase();
      setCurrentRole(targetRole === 'recruiter' ? 'recruiter' : 'candidate');
      setActiveTab(targetRole === 'recruiter' ? 'recruiter' : 'dashboard');
      showToast(`Switched to ${target.fullName}`, 'info');
    }
  };

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab(newRole === 'recruiter' ? 'recruiter' : 'invitations');
  };

  const computeUserElo = (user) => {
    let baseElo = 1200;
    let eloBonus = 0;
    (user.verifiedBadges || []).forEach(b => {
      const integrityMultiplier = (b.integrityScore || 100) / 100;
      if (b.tier === 'gold') eloBonus += Math.round(150 * integrityMultiplier);
      else if (b.tier === 'silver') eloBonus += Math.round(95 * integrityMultiplier);
      else if (b.tier === 'bronze') eloBonus += Math.round(50 * integrityMultiplier);
      else eloBonus -= 20;
    });
    (user.githubAudits || []).forEach(g => { if (g.authenticityRating === 'verified') eloBonus += (g.eloBonus || 80); });
    const validEndorsements = Math.min(6, (user.endorsements || []).length);
    eloBonus += validEndorsements * 25;
    const userRefs = references.filter(r => r.candidateId === user.id);
    eloBonus += Math.min(3, userRefs.length) * 40;
    const acceptedInts = interviews.filter(i => i.candidateId === user.id && i.status === 'accepted');
    eloBonus += acceptedInts.length * 30;

    const finalElo = Math.max(800, baseElo + eloBonus);
    let eloTier = 'Novice';
    if (finalElo >= 2100) eloTier = 'Grandmaster';
    else if (finalElo >= 1900) eloTier = 'Master';
    else if (finalElo >= 1700) eloTier = 'Expert';
    else if (finalElo >= 1500) eloTier = 'Specialist';
    else if (finalElo >= 1300) eloTier = 'Candidate';
    return { finalElo, eloTier };
  };

  const recordAssessmentResult = (skillId, scorePercentage, tabSwitches = 0, timeTaken = 320) => {
    let tier = 'none'; let eloDelta = 0;
    if (scorePercentage >= 90) { tier = 'gold'; eloDelta = 150; } 
    else if (scorePercentage >= 75) { tier = 'silver'; eloDelta = 95; } 
    else if (scorePercentage >= 60) { tier = 'bronze'; eloDelta = 50; } 
    else { eloDelta = -20; }
    
    const integrityPenalty = Math.min(40, tabSwitches * 10);
    const integrityScore = Math.max(60, 100 - integrityPenalty);
    const adjustedEloDelta = Math.round(eloDelta * (integrityScore / 100));
    const skillObj = SEED_SKILLS.find(s => s.id === skillId);
    
    const newBadge = {
      skillId, skillName: skillObj ? skillObj.name : 'Technical Skill',
      tier, score: scorePercentage, eloDelta: adjustedEloDelta,
      integrityScore, verifiedAt: 'Verified Just Now', freshnessDays: 0, tabSwitches, timeTaken
    };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId || (authUser && u.id === authUser.id)) {
        const updatedBadges = [...(u.verifiedBadges || []).filter(b => b.skillId !== skillId), newBadge];
        const tempUser = { ...u, verifiedBadges: updatedBadges };
        const { finalElo, eloTier } = computeUserElo(tempUser);
        return { ...tempUser, eloRating: finalElo, eloTier };
      }
      return u;
    }));
    showToast(`Assessment Complete! Tier: ${tier.toUpperCase()}`, 'success');
  };

  const recordGithubAudit = (audit) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId || (authUser && u.id === authUser.id)) {
        const updatedAudits = [...(u.githubAudits || []).filter(a => a.repoName !== audit.repoName), audit];
        const tempUser = { ...u, githubAudits: updatedAudits };
        const { finalElo, eloTier } = computeUserElo(tempUser);
        return { ...tempUser, githubAudits: updatedAudits, eloRating: finalElo, eloTier };
      }
      return u;
    }));
    showToast(`GitHub Project "${audit.repoName}" verified!`, 'success');
  };

  const applyToTeamSlot = (tId, sId, resp) => { showToast('Application submitted!', 'success'); };
  const acceptApplicant = (id) => { showToast('Accepted applicant!', 'success'); };
  const declineApplicant = (id) => { showToast('Application declined.', 'info'); };
  const createTeam = (data) => { showToast('Team created!', 'success'); };
  const toggleShortlistCandidate = (id) => { showToast('Shortlist updated', 'info'); };
  const scheduleInterview = (data) => { showToast('Interview scheduled!', 'success'); };
  const respondToInterview = (id, status) => { showToast(`Interview ${status}!`, 'success'); };
  const requestMentorshipSession = (data) => { showToast('Mentorship requested!', 'success'); };
  const markNotificationAsRead = (id) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const markAllNotificationsAsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };
  const addPeerEndorsement = () => { showToast('Endorsement added', 'success'); };
  const addVerifiedReference = () => { showToast('Reference verified', 'success'); };
  const resetDemoData = () => { showToast('Demo data reset', 'info'); };

  return (
    <AppContext.Provider
      value={{
        users, currentUser, currentUserId, currentRole, switchUser, switchRole,
        activeTab, setActiveTab, skills: SEED_SKILLS, questions: SEED_QUESTIONS,
        teams, setTeams, teamApplications, applyToTeamSlot, acceptApplicant,
        declineApplicant, createTeam, shortlistedCandidates, toggleShortlistCandidate,
        references, addVerifiedReference, addPeerEndorsement, interviews,
        scheduleInterview, respondToInterview, mentorshipSessions, setMentorshipSessions,
        requestMentorshipSession, notifications, markNotificationAsRead,
        markAllNotificationsAsRead, selectedSkillForTest, setSelectedSkillForTest,
        recordAssessmentResult, recordGithubAudit, resetDemoData, showToast, notification,
        authUser, isAuthenticated,
        isAuthModalOpen, setIsAuthModalOpen,
        authModalTab, setAuthModalTab,
        loginUser, registerUser, logoutUser, logout, updateAuthUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
