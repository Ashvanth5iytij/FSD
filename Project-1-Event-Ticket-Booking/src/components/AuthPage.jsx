import React, { useState } from 'react'

export default function AuthPage({ onAuthenticated, onNavigate }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await fetch(`/api/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to continue.')
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" aria-hidden="true">✳</div>
      <div className="auth-decoration auth-decoration-two" aria-hidden="true">✦</div>
      <section className="auth-card">
        <button type="button" className="back-link" onClick={() => onNavigate('/')}>← Back to events</button>
        <div className="auth-mark" aria-hidden="true"><span className="ticket-symbol" /></div>
        <p className="hero-kicker">{mode === 'login' ? 'YOUR EVENTS ARE WAITING' : 'JOIN THE COMMUNITY'}</p>
        <h1>{mode === 'login' ? 'Welcome back.' : 'Make it yours.'}</h1>
        <p className="auth-intro">
          {mode === 'login'
            ? 'Sign in to pick up where you left off and see your tickets.'
            : 'Create your account to book tickets and keep them safe.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="field">
              <span>Your name</span>
              <input autoComplete="name" maxLength="100" required value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we greet you?" />
            </label>
          )}
          <label className="field">
            <span>Email address</span>
            <input autoComplete="email" type="email" maxLength="150" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" minLength="8" maxLength="128" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button auth-submit" disabled={submitting}>
            {submitting ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'} <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? 'New to TechNova?' : 'Already have an account?'}{' '}
          <button type="button" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        <p className="auth-security"><span aria-hidden="true">◇</span> &nbsp; Your account and bookings stay with this event system.</p>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-orbit" />
        <div className="auth-aside-art" aria-hidden="true">
          <span className="catalog-art-orbit" />
          <span className="catalog-tech-symbol">&lt;/&gt;</span>
          <span className="catalog-art-chip">✳</span>
          <span className="catalog-art-laptop"><span>TECH<br />NOVA</span></span>
          <span className="catalog-art-stars">✦ &nbsp; · &nbsp; ✦</span>
        </div>
        <span className="auth-aside-kicker"><span className="live-dot" /> CAMPUS EVENTS · ONE PLACE</span>
        <p>“Your next campus experience starts with a ticket.”</p>
        <span className="auth-aside-credit">EVENT TICKET BOOKING · TECHNOVA 2026</span>
      </aside>
    </main>
  )
}
