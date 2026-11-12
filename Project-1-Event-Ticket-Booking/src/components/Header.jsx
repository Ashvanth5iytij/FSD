import React from 'react'

export default function Header({ user, route, onNavigate, onSignOut }){
  const activePage = route === '/login' ? 'Sign in' : route === '/events' ? 'Events' : route === '/book' ? 'Book Ticket' : route === '/tickets' ? 'My Bookings' : route === '/about' ? 'About' : 'Home'
  const linkClass = (name) => activePage === name ? 'nav-link nav-link-active' : 'nav-link'

  return (
    <header className="site-header">
      <button type="button" className="brand-lockup" onClick={() => onNavigate('/')} aria-label="TechNova home">
        <span className="brand-mark" aria-hidden="true"><span className="ticket-symbol" /></span>
        <span>EVENT TICKET <span>BOOKING</span><small>TECHNOVA · 2026</small></span>
      </button>
      <nav className="header-nav" aria-label="Main navigation">
        <button type="button" className={linkClass('Home')} onClick={() => onNavigate('/')}>Home</button>
        <button type="button" className={linkClass('Events')} onClick={() => onNavigate('/events')}>Events</button>
        <button type="button" className={linkClass('Book Ticket')} onClick={() => onNavigate('/book')}>Book Ticket</button>
        <button type="button" className={linkClass('My Bookings')} onClick={() => onNavigate(user ? '/tickets' : '/login')}>My Bookings</button>
        <button type="button" className={linkClass('About')} onClick={() => onNavigate('/#about')}>About</button>
        {user ? (
          <div className="header-account">
            <span className="account-greeting">Hey, {user.name.split(' ')[0]}</span>
            <button type="button" className="header-cta header-cta-light" onClick={onSignOut}>Sign out</button>
          </div>
        ) : (
          <button type="button" className={`header-cta ${activePage === 'Sign in' ? 'header-cta-active' : ''}`} aria-current={activePage === 'Sign in' ? 'page' : undefined} onClick={() => onNavigate('/login')}>Sign in</button>
        )}
        <span className="header-divider" aria-hidden="true" />
        <span className="theme-indicator" role="img" aria-label="Dark theme">☾</span>
      </nav>
    </header>
  )
}
