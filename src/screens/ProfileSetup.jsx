import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPut, apiPost } from '../lib/api';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PROFICIENCY_LABELS = ['', 'Aware', 'Novice', 'Proficient', 'Advanced', 'Expert'];
const PROFICIENCY_DESCS = [
  '',
  'Can explain concept, cannot implement independently',
  'Can implement with guidance/references',
  'Can implement independently, knows best practices',
  'Can teach others, optimize, handle edge cases',
  'Can design systems, publish, recognized authority',
];

const STEPS = ['Resume', 'Skills', 'Links', 'Goal'];

export default function ProfileSetup() {
  const { state, navigate } = useApp();
  const token = state.token;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Step 1: Resume
  const [resumeText, setResumeText] = useState('');
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Step 2: Skills
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Step 3: Links
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Step 4: Goal
  const [goal, setGoal] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [interviewDeadline, setInterviewDeadline] = useState('');
  const [jdText, setJdText] = useState('');

  useEffect(() => {
    if (!token || !state.user?.id) return;
    apiGet(`/profile/${state.user.id}`, token).then((data) => {
      if (data && !data.error) {
        setProfile(data);
        setSkills(data.skills || []);
        setGithubUrl(data.githubUrl || '');
        setPortfolioUrl(data.portfolioUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setGoal(data.goal || '');
        setTargetRole(data.targetRole || '');
        setTargetCompany(data.targetCompany || '');
        setInterviewDeadline(data.interviewDeadline || '');
      }
    }).finally(() => setLoading(false));
  }, [token, state.user?.id]);

  const handleResumeParse = async () => {
    if (!resumeText.trim()) return;
    setResumeParsing(true);
    setResumeError('');
    try {
      const result = await apiPost('/profile/resume/parse', { resumeText: resumeText.trim() }, token);
      if (result?.success && result?.data?.skills) {
        const parsed = result.data.skills.map((s) => ({
          name: s.name,
          proficiency: Math.min(5, Math.max(1, Math.ceil((s.years || 1) / 2))),
          years: s.years || 1,
          category: s.category || 'technical',
          confidence: 'ai-extracted',
        }));
        setSkills((prev) => {
          const existing = new Set(prev.map((s) => s.name.toLowerCase()));
          const newOnes = parsed.filter((s) => !existing.has(s.name.toLowerCase()));
          return [...prev, ...newOnes];
        });
      }
    } catch {
      setResumeError('Could not parse resume. You can add skills manually.');
    }
    setResumeParsing(false);
  };

  const addSkill = () => {
    const name = newSkill.trim();
    if (!name || skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills([...skills, { name, proficiency: 2, years: 1, category: 'technical', confidence: 'self-reported' }]);
    setNewSkill('');
  };

  const removeSkill = (name) => setSkills(skills.filter((s) => s.name !== name));

  const updateProficiency = (name, val) => {
    setSkills(skills.map((s) => s.name === name ? { ...s, proficiency: Math.max(1, Math.min(5, val)) } : s));
  };

  const skillCategories = [...new Set(skills.map((s) => s.category))];

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      skills,
      githubUrl: githubUrl || null,
      portfolioUrl: portfolioUrl || null,
      linkedinUrl: linkedinUrl || null,
      goal: goal || null,
      targetRole: targetRole || null,
      targetCompany: targetCompany || null,
      interviewDeadline: interviewDeadline || null,
      onboardingComplete: true,
    };
    if (goal === 'interview' && jdText.trim()) {
      payload.jdText = jdText.trim();
    }
    try {
      await apiPut(`/profile/${state.user.id}`, payload, token);
      navigate(goal === 'interview' ? 'dashboard' : 'hub');
    } catch {
      alert('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#010203', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A59F97', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#010203', color: '#f3f2ee', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(243,242,238,0.08)' }}>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#CFFF00', letterSpacing: '-0.02em', marginBottom: '8px' }}>SYNAPSE</div>
        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Set Up Your Profile</div>
        <div style={{ fontSize: '14px', color: '#A59F97', marginTop: '8px' }}>Step {step + 1} of 4 — {STEPS[step]}</div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 40px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i <= step ? '#CFFF00' : 'rgba(243,242,238,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>

        {/* STEP 1: RESUME */}
        {step === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Paste your resume</h2>
            <p style={{ fontSize: '14px', color: '#A59F97', marginBottom: '24px' }}>We'll extract your skills automatically. You can edit them in the next step.</p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here..."
              rows={12}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(243,242,238,0.15)',
                background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', fontFamily: 'var(--font-mono)',
                resize: 'vertical', outline: 'none',
              }}
            />
            {resumeError && <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#EF4444', fontSize: '13px' }}>{resumeError}</div>}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={handleResumeParse} disabled={!resumeText.trim() || resumeParsing}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: resumeText.trim() ? '#CFFF00' : 'rgba(243,242,238,0.1)', color: resumeText.trim() ? '#010203' : '#A59F97', fontWeight: 700, cursor: resumeText.trim() ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
                {resumeParsing ? 'Parsing...' : 'Parse Resume'}
              </button>
              <button onClick={() => setStep(1)}
                style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.2)', background: 'transparent', color: '#f3f2ee', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Skip — I'll add skills manually
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SKILLS */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Your Skills</h2>
            <p style={{ fontSize: '14px', color: '#A59F97', marginBottom: '24px' }}>Rate your proficiency (1-5). Add at least 3 skills.</p>

            {/* Add skill */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Add a skill..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }}
              />
              <button onClick={addSkill}
                style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: newSkill.trim() ? '#CFFF00' : 'rgba(243,242,238,0.1)', color: newSkill.trim() ? '#010203' : '#A59F97', fontWeight: 700, cursor: newSkill.trim() ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
                Add
              </button>
            </div>

            {/* Skill list grouped by category */}
            {skillCategories.map((cat) => (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#A59F97', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{cat}</div>
                {skills.filter((s) => s.category === cat).map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '8px', background: 'rgba(243,242,238,0.05)', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.08)' }}>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="range" min="1" max="5" value={s.proficiency}
                        onChange={(e) => updateProficiency(s.name, parseInt(e.target.value))}
                        style={{ width: '100px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#CFFF00', fontWeight: 700, minWidth: '60px', textAlign: 'center' }} title={PROFICIENCY_DESCS[s.proficiency]}>
                        {PROFICIENCY_LABELS[s.proficiency]}
                      </span>
                    </div>
                    <button onClick={() => removeSkill(s.name)}
                      style={{ background: 'none', border: 'none', color: '#A59F97', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>✕</button>
                  </div>
                ))}
              </div>
            ))}

            {skills.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#A59F97', fontSize: '14px' }}>
                No skills yet. Paste your resume in Step 1, or add skills manually above.
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={skills.length < 3}
              style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: skills.length >= 3 ? '#CFFF00' : 'rgba(243,242,238,0.1)', color: skills.length >= 3 ? '#010203' : '#A59F97', fontWeight: 700, cursor: skills.length >= 3 ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
              {skills.length >= 3 ? `Continue (${skills.length} skills)` : `Add ${3 - skills.length} more skill${3 - skills.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* STEP 3: LINKS */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Connect your profiles</h2>
            <p style={{ fontSize: '14px', color: '#A59F97', marginBottom: '24px' }}>Optional — add links to showcase your work.</p>

            {[{ label: 'GitHub URL', val: githubUrl, set: setGithubUrl, placeholder: 'https://github.com/yourhandle' },
              { label: 'Portfolio URL', val: portfolioUrl, set: setPortfolioUrl, placeholder: 'https://yourportfolio.com' },
              { label: 'LinkedIn URL', val: linkedinUrl, set: setLinkedinUrl, placeholder: 'https://linkedin.com/in/yourprofile' },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#A59F97', marginBottom: '6px' }}>{f.label}</label>
                <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.2)', background: 'transparent', color: '#f3f2ee', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back</button>
              <button onClick={() => setStep(3)} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#CFFF00', color: '#010203', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 4: GOAL */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>What's your goal?</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Interview Card */}
              <div onClick={() => setGoal('interview')} style={{
                padding: '24px', borderRadius: '16px', cursor: 'pointer',
                background: goal === 'interview' ? 'rgba(207,255,0,0.08)' : 'rgba(243,242,238,0.03)',
                border: `2px solid ${goal === 'interview' ? '#CFFF00' : 'rgba(243,242,238,0.1)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>I'm preparing for an interview</div>
                <div style={{ fontSize: '13px', color: '#A59F97', marginBottom: '16px' }}>Submit a job description and get a personalized prep plan with STAR questions.</div>

                {goal === 'interview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease' }}>
                    <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role (e.g. Senior ML Engineer)"
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }} />
                    <input value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="Target company (optional)"
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }} />
                    <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the job description here..."
                      rows={5}
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', fontFamily: 'var(--font-mono)', resize: 'vertical', outline: 'none' }} />
                    <input type="date" value={interviewDeadline} onChange={(e) => setInterviewDeadline(e.target.value)}
                      style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }} />
                    {interviewDeadline && (() => {
                      const diff = Math.ceil((new Date(interviewDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                      return <div style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '8px', background: diff <= 1 ? 'rgba(239,68,68,0.15)' : 'rgba(207,255,0,0.08)', color: diff <= 1 ? '#EF4444' : '#CFFF00', fontWeight: 600 }}>
                        {diff <= 1 ? '🚀 Crash mode: intensive prep (<24hr)' : `📅 Structured prep: ${diff} days`}
                      </div>;
                    })()}
                  </div>
                )}
              </div>

              {/* Learning Card */}
              <div onClick={() => setGoal('curriculum')} style={{
                padding: '24px', borderRadius: '16px', cursor: 'pointer',
                background: goal === 'curriculum' ? 'rgba(207,255,0,0.08)' : 'rgba(243,242,238,0.03)',
                border: `2px solid ${goal === 'curriculum' ? '#CFFF00' : 'rgba(243,242,238,0.1)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>I want systematic learning</div>
                <div style={{ fontSize: '13px', color: '#A59F97', marginBottom: '16px' }}>Get a personalized curriculum designed to bring you to 92% mastery in your target role.</div>

                {goal === 'curriculum' && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role (e.g. Full Stack Developer)"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.15)', background: 'rgba(243,242,238,0.05)', color: '#f3f2ee', fontSize: '14px', outline: 'none' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(243,242,238,0.2)', background: 'transparent', color: '#f3f2ee', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back</button>
              <button onClick={handleSubmit} disabled={!goal || saving}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: goal && !saving ? '#CFFF00' : 'rgba(243,242,238,0.1)', color: goal && !saving ? '#010203' : '#A59F97', fontWeight: 700, cursor: goal && !saving ? 'pointer' : 'not-allowed', fontSize: '14px', flex: 1 }}>
                {saving ? 'Saving...' : goal === 'interview' ? 'Start Interview Prep →' : goal === 'curriculum' ? 'Build My Curriculum →' : 'Select a goal to continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
