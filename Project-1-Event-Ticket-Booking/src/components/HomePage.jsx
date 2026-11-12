import React from 'react'

const highlights = [
  { icon: 'ticket', title: 'Easy Booking', detail: 'Choose your event and reserve a seat in a few simple steps.' },
  { icon: 'ϟ', title: 'Live Availability', detail: 'Ticket availability updates from the booking system.' },
  { icon: '◇', title: 'Secure & Reliable', detail: 'Your account and booking details are stored securely.' },
  { icon: '▣', title: 'Anytime Access', detail: 'Sign in whenever you need to check your tickets.' },
]

export default function HomePage({ event, availableTickets, onNavigate }) {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="home-wallpaper" aria-hidden="true">
            <div className="wallpaper-grid" />
            <div className="wallpaper-aurora aurora-one" />
            <div className="wallpaper-aurora aurora-two" />
            <div className="wallpaper-lights"><i /><i /><i /><i /><i /><i /><i /></div>
            <svg className="wallpaper-waves" viewBox="0 0 1600 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-purple" x1="0" x2="1">
                  <stop offset="0" stopColor="#742cff" stopOpacity=".1" />
                  <stop offset=".48" stopColor="#e748ff" stopOpacity=".95" />
                  <stop offset="1" stopColor="#542bff" stopOpacity=".28" />
                </linearGradient>
                <linearGradient id="wave-cyan" x1="0" x2="1">
                  <stop offset="0" stopColor="#126bff" stopOpacity=".08" />
                  <stop offset=".55" stopColor="#08b6ff" stopOpacity=".85" />
                  <stop offset="1" stopColor="#8147ff" stopOpacity=".15" />
                </linearGradient>
              </defs>
              <path className="wave-line wave-line-purple" d="M-60 190 C120 30 180 250 380 205 S650 85 850 188 1110 250 1290 175 1510 30 1660 135" />
              <path className="wave-line wave-line-cyan" d="M-60 230 C110 145 185 72 345 160 S610 265 790 190 1040 75 1195 160 1470 255 1660 100" />
              <path className="wave-line wave-line-blue" d="M-60 175 C110 260 230 105 400 170 S625 255 830 140 1060 70 1235 183 1460 220 1660 155" />
            </svg>
            <div className="wallpaper-particles particles-left" />
            <div className="wallpaper-particles particles-right" />
        </div>
        <div className="hero-copy">
            <p className="hero-kicker hero-welcome">WELCOME TO</p>
            <span className="hero-underline" aria-hidden="true" />
            <h1>Event Ticket<br /><span>Booking System</span></h1>
            <p className="hero-description">
              Discover campus events, book tickets online, and secure your place in just a few clicks.
            </p>
            <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => onNavigate('/book')}>
                <span className="ticket-symbol" aria-hidden="true" /> Book Ticket Now <span aria-hidden="true">→</span>
              </button>
              <a className="text-link hero-secondary-action" href="#events"><span aria-hidden="true">▦</span> View Events</a>
            </div>
        </div>
        <div className="hero-art" aria-label="Animated abstract stage illustration created with local CSS and SVG">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-glow" />
            <div className="art-sticker sticker-sparkle">✳</div>
            <div className="art-sticker sticker-note">IDEAS<br />IN MOTION</div>
            <div className="art-sticker sticker-waves">〰</div>
            <div className="stage-card">
              <div className="stage-lights"><i /><i /><i /><i /><i /></div>
              <div className="stage-screen"><span>TECH</span><strong>NOVA</strong><small>LIVE · 2026</small></div>
              <div className="stage-floor" />
            </div>
            <div className="floating-tag tag-date">📍 &nbsp; MAIN AUDITORIUM</div>
            <div className="floating-tag tag-day"><span className="live-dot" /> LIVE EVENT</div>
        </div>
        <article className="featured-event-card">
            <div className="featured-event-info">
              <span className="featured-badge"><span aria-hidden="true">★</span> Featured Event</span>
              <p className="featured-kicker">UP NEXT AT TECHNOVA</p>
              <h2>{event.name}</h2>
              <p className="featured-department">{event.department}</p>
              <div className="featured-meta">
                <span><b aria-hidden="true">▦</b>{event.dateTime}</span>
                <span><b aria-hidden="true">⌖</b>{event.venue}</span>
                <span><b aria-hidden="true">₹</b>₹{event.ticketPrice} per ticket</span>
                <span><b aria-hidden="true">◉</b>{availableTickets} tickets available</span>
              </div>
            </div>
            <div className="featured-event-action">
              <div className="featured-event-art" aria-hidden="true">
                <span className="art-code">&lt;/&gt;</span><span className="art-orbit" /><span className="art-chip">✳</span>
                <span className="art-laptop"><span>TECH<br />NOVA</span></span>
                <span className="art-gear">⚙</span>
              </div>
              <button type="button" className="featured-book-button" onClick={() => onNavigate('/book')}>Book Now <span aria-hidden="true">→</span></button>
            </div>
        </article>
        <div className="hero-bottomline" aria-hidden="true"><span>EVENTS · IDEAS · COMMUNITY</span><span>✦ &nbsp; YOUR NEXT EXPERIENCE STARTS HERE</span></div>
      </section>

      <section className="feature-strip" aria-label="Booking system features">
        {highlights.map((item, index) => (
            <div className="feature-strip-item" key={item.title}>
              <span className={`feature-strip-icon feature-icon-${index + 1}`} aria-hidden="true">
                {item.icon === 'ticket' ? <span className="ticket-symbol" /> : item.icon}
              </span>
              <span>{index === 1 ? 'Real-time' : index === 2 ? 'Secure &' : item.title.split(' ')[0]}<br />{index === 0 ? 'Booking' : index === 1 ? 'Availability' : index === 2 ? 'Reliable' : 'Access'}</span>
            </div>
        ))}
      </section>

      <section className="experience-section" id="events">
        <div className="section-heading">
            <div><p className="hero-kicker">WHAT'S HAPPENING</p><h2>Find your next<br /><span>campus experience.</span></h2></div>
            <button type="button" className="text-link" onClick={() => onNavigate('/book')}>Explore the event <span aria-hidden="true">→</span></button>
        </div>
        <div className="event-list">
            <article className="event-list-card">
              <div className="event-list-date"><span>TECHNOVA</span><strong>2026</strong><small>FEATURED</small></div>
              <div className="event-list-content"><span className="event-list-status"><i /> OPEN FOR BOOKING</span><h3>{event.name}</h3><p>{event.department}</p><div className="event-list-meta"><span>▦ &nbsp;{event.dateTime}</span><span>⌖ &nbsp;{event.venue}</span></div></div>
              <div className="event-list-ticket"><strong>₹{event.ticketPrice}</strong><span>per ticket</span><button type="button" className="event-list-button" onClick={() => onNavigate('/book')}>View details&nbsp; →</button></div>
            </article>
        </div>
      </section>

      <section className="experience-section about-section" id="about">
        <div className="section-heading">
            <div><p className="hero-kicker">BOOKING MADE SIMPLE</p><h2>Your event.<br /><span>Your place.</span></h2></div>
        </div>
        <div className="highlight-grid">
            {highlights.map((item, index) => (
              <article className={`highlight-card highlight-${index + 1}`} key={item.title}>
                <span className={`highlight-icon feature-strip-icon feature-icon-${index + 1}`} aria-hidden="true">
                  {item.icon === 'ticket' ? <span className="ticket-symbol" /> : item.icon}
                </span>
                <span className="highlight-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
        </div>
        <div className="closing-callout">
            <div><span className="live-badge"><span className="live-dot" /> CAMPUS EVENTS, ALL IN ONE PLACE</span><h2>Make room for<br />a great experience.</h2></div>
            <button type="button" className="primary-button" onClick={() => onNavigate('/book')}>Book your ticket <span aria-hidden="true">→</span></button>
        </div>
      </section>
      <footer className="site-footer"><span>🎟 EVENT TICKET BOOKING · TECHNOVA 2026</span><span>A college event booking project · Built for our campus. ✦</span></footer>
    </main>
  )
}
