import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);

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
    
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@([a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(email.trim())) {
      return setError('Invalid email format. Both username and domain must contain alphabetical characters.');
    }

    if (mode === 'login') return submitLogin();
    if (!fullName.trim()) return setError('Full name is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    
    // Crucial: Move to Step 2 instead of calling API early
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
        linkedinUrl: linkedinUrl.trim(),
        certificateFile,
      });
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
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
            {mode === 'login' ? 'Sign in to your profile' : 'Create your profile'}
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
                <label className="auth-label">Role</label>
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
                  placeholder={mode === 'register' ? '6+ chars' : '••••••••'}
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
              <label className="auth-label">Title <span className="auth-optional">(optional)</span></label>
              <input
                className="auth-input"
                type="text"
                placeholder={role === 'recruiter' ? 'Senior Talent Partner' : 'Full Stack Engineer'}
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
                  placeholder="Stripe, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">LinkedIn URL <span className="auth-optional">(optional)</span></label>
              <input
                className="auth-input"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Certificate <span className="auth-optional">(optional)</span></label>
              <div className="auth-file-upload">
                <span className="text-xs text-slate-400 truncate">
                  {certificateFile ? certificateFile.name : 'Upload PDF or image'}
                </span>
                <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Browse</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setCertificateFile(e.target.files[0])}
                  className="auth-file-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Bio <span className="auth-optional">(optional)</span></label>
              <textarea
                className="auth-input auth-textarea"
                placeholder="Brief intro..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
              />
            </div>

            <p className="auth-elo-note">
              🏆 Starts at <strong>1,200 Elo</strong>.
            </p>

            <div className="auth-form-actions">
              <button type="button" className="auth-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : 'Complete'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
