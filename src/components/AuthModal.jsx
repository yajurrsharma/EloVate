import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SKILLS = [
  'React', 'Node.js', 'Python', 'Go', 'Rust', 'TypeScript', 'PostgreSQL',
  'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'System Design',
  'Java', 'C++', 'Swift', 'Kotlin', 'GraphQL', 'Redis', 'Blockchain',
];

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    loginUser, 
    registerUser
  } = useApp();

  const [step, setStep] = useState(1);       // 1 = creds, 2 = profile (register only)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Register-only fields
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('candidate');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');

  if (!isAuthModalOpen) return null;

  const mode = authModalTab === 'signin' ? 'login' : 'register';
  
  const switchMode = (m) => { 
    setAuthModalTab(m === 'login' ? 'signin' : 'signup'); 
    setStep(1); 
    setError(''); 
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    
    // Strict validation regex preventing pure numeric labels like @1234.edu
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@([a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(email.trim())) {
      return setError('Invalid email format. Both the username and domain sections must contain alphabetical characters.');
    }

    if (mode === 'login') return submitLogin();
    if (!fullName.trim()) return setError('Full name is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setStep(2);
  };

  async function submitLogin() {
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        title: title.trim(),
        bio: bio.trim(),
        company: company.trim(),
      });
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && setIsAuthModalOpen(false)}>
      <div className="auth-modal">
        <div className="auth-header relative">
          <button 
            onClick={() => setIsAuthModalOpen(false)} 
            className="absolute right-0 top-0 text-slate-400 hover:text-white"
          >
            ✕
          </button>
          <div className="auth-logo">
            <span className="auth-logo-text">EloVate</span>
          </div>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to your engineering profile'
              : 'Create your engineering profile'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >Sign In</button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >Create Account</button>
        </div>

        {mode === 'register' && (
          <div className="auth-steps">
            <div className={`auth-step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className="auth-step-line" />
            <div className={`auth-step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <form className="auth-form" onSubmit={handleStep1} autoComplete="on">
            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">I am a</label>
                <div className="auth-role-toggle">
                  <button
                    type="button"
                    className={`auth-role-btn ${role === 'candidate' ? 'active' : ''}`}
                    onClick={() => setRole('candidate')}
                  >
                    <span>👩‍💻</span> Candidate
                  </button>
                  <button
                    type="button"
                    className={`auth-role-btn ${role === 'recruiter' ? 'active' : ''}`}
                    onClick={() => setRole('recruiter')}
                  >
                    <span>🏢</span> Recruiter
                  </button>
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="text"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-pw-wrap">
                <input
                  className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : mode === 'login' ? 'Sign In' : 'Continue →'}
            </button>
          </form>
        )}

        {step === 2 && mode === 'register' && (
          <form className="auth-form" onSubmit={submitRegister}>
            <div className="auth-field">
              <label className="auth-label">Your Title <span className="auth-optional">(optional)</span></label>
              <input
                className="auth-input"
                type="text"
                placeholder={role === 'recruiter' ? 'e.g. Senior Talent Partner' : 'e.g. Full Stack Engineer'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {role === 'recruiter' && (
              <div className="auth-field">
                <label className="auth-label">Company <span className="auth-optional">(optional)</span></label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="e.g. Stripe, Google, YC startup"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Short Bio <span className="auth-optional">(optional)</span></label>
              <textarea
                className="auth-input auth-textarea"
                placeholder="Tell the community what you're working on..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            <p className="auth-elo-note">
              🏆 You'll start at <strong>1,200 Elo</strong> (Novice). Complete assessments, accept interviews, and get endorsed to climb the leaderboard.
            </p>

            <div className="auth-form-actions">
              <button type="button" className="auth-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Create Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
