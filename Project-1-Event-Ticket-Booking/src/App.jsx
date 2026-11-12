import React, { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import EventDetails from './components/EventDetails'
import BookingForm from './components/BookingForm'
import BookingSummary from './components/BookingSummary'
import HomePage from './components/HomePage'
import AuthPage from './components/AuthPage'
import LiveWallpaper from './components/LiveWallpaper'
import EventsPage from './components/EventsPage'
import './App.css'

const defaultEvent = {
  name: 'TechNova 2026 – Department Technical Fest',
  department: 'Department of Computer Science and Engineering',
  dateTime: 'Dec 12, 2026 · 10:00 AM',
  venue: 'Vel Tech, Chennai',
  ticketPrice: 100,
  initialTickets: 100,
  availableTickets: 100,
}

export default function App(){
  const [route, setRoute] = useState(() => window.location.pathname)
  const [bookingId, setBookingId] = useState(() => new URLSearchParams(window.location.search).get('bookingId'))
  const [event, setEvent] = useState(defaultEvent)
  const [availableTickets, setAvailableTickets] = useState(defaultEvent.availableTickets)
  const [bookingSummary, setBookingSummary] = useState(null)
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState([])
  const [user, setUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path)
    setRoute(window.location.pathname)
    setBookingId(new URLSearchParams(window.location.search).get('bookingId'))
    setError('')
    const hash = window.location.hash
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    function handlePopState() {
      setRoute(window.location.pathname)
      setBookingId(new URLSearchParams(window.location.search).get('bookingId'))
      const hash = window.location.hash
      if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const loadRecentBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings', { credentials: 'same-origin' })
      if (!response.ok) throw new Error('Unable to load recent bookings.')
      const data = await response.json()
      setBookings(Array.isArray(data) ? data : [])
      return data
    } catch (err) {
      setError(err.message || 'Could not load recent bookings.')
      return []
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadEvent() {
      try {
        const response = await fetch('/api/event')
        if (!response.ok) throw new Error('Unable to load event from SQL backend.')
        const data = await response.json()
        if (active) {
          setEvent(data)
          setAvailableTickets(data.availableTickets)
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not connect to the booking service.')
      }
    }

    async function loadSession() {
      try {
        const response = await fetch('/api/session', { credentials: 'same-origin' })
        if (!response.ok) throw new Error('Unable to check your sign-in status.')
        const data = await response.json()
        if (active) {
          setUser(data.user)
          setSessionLoading(false)
          if (data.user) await loadRecentBookings()
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not connect to the account service.')
          setSessionLoading(false)
        }
      }
    }

    loadEvent()
    loadSession()
    return () => { active = false }
  }, [loadRecentBookings])

  useEffect(() => {
    if (sessionLoading || route !== '/book' && route !== '/tickets' && route !== '/confirmation') return
    if (!user) {
      navigate('/login')
      return
    }
    if (route === '/confirmation' && bookingId) {
      let active = true
      setBookingLoading(true)
      fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, { credentials: 'same-origin' })
        .then(async (response) => {
          const data = await response.json()
          if (!response.ok) throw new Error(data.message || 'Unable to load your booking.')
          if (active) setBookingSummary(data)
        })
        .catch((err) => { if (active) setError(err.message || 'Unable to load your booking.') })
        .finally(() => { if (active) setBookingLoading(false) })
      return () => { active = false }
    }
    return undefined
  }, [bookingId, navigate, route, sessionLoading, user])

  function handleBookingSuccess(summary) {
    setBookingSummary(summary)
    setAvailableTickets(summary.remainingTickets)
    loadRecentBookings()
    navigate(`/confirmation?bookingId=${encodeURIComponent(summary.bookingId)}`)
  }

  async function handleSignOut() {
    try {
      const response = await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
      if (!response.ok) throw new Error('Unable to sign out. Please try again.')
      setUser(null)
      setBookings([])
      setBookingSummary(null)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to sign out. Please try again.')
    }
  }

  return (
    <div className="app">
      <LiveWallpaper />
      <Header user={user} route={route} onNavigate={navigate} onSignOut={handleSignOut} />
      {error && <div className="app-error" role="alert">{error}</div>}
      {route === '/login' ? (
        <AuthPage
          onNavigate={navigate}
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser)
            loadRecentBookings()
            navigate('/book')
          }}
        />
      ) : route === '/events' ? (
        <EventsPage event={event} availableTickets={availableTickets} onNavigate={navigate} />
      ) : route === '/book' ? (
        sessionLoading ? <main className="loading-screen">Getting your festival pass ready…</main> : (
          <main className="booking-page">
            <div className="booking-page-heading">
              <button type="button" className="back-link" onClick={() => navigate('/events')}>← Back to events</button>
              <p className="hero-kicker">RESERVE YOUR PLACE</p>
              <h1>Book Ticket</h1>
              <p>Your TechNova ticket details and confirmation.</p>
            </div>
            <div className="booking-layout">
              <section className="booking-event-column">
                <EventDetails event={event} availableTickets={availableTickets} />
                <aside className="booking-event-note">
                  <span className="live-dot" /> LIVE AVAILABILITY
                  <p>{availableTickets} tickets available · updated from the college booking database.</p>
                </aside>
                <aside className="card recent-bookings booking-recent-card">
                  <h3>My recent bookings</h3>
                  {bookings.length === 0 ? <p className="muted">Your confirmed tickets will appear here.</p> : (
                    <ul className="booking-list">
                      {bookings.slice(0, 3).map((booking) => (
                        <li key={booking.bookingId}>
                          <strong>{booking.bookingId}</strong>
                          <span>{booking.tickets} ticket(s) · ₹{booking.totalAmount}</span>
                          <button type="button" className="history-link" onClick={() => navigate(`/confirmation?bookingId=${encodeURIComponent(booking.bookingId)}`)}>View Ticket →</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" className="text-link history-button" onClick={() => navigate('/tickets')}>View all my bookings →</button>
                </aside>
              </section>
              <section className="booking-main">
                <BookingForm
                  event={event}
                  user={user}
                  availableTickets={availableTickets}
                  setAvailableTickets={setAvailableTickets}
                  setBookingSummary={setBookingSummary}
                  setConfirmation={() => {}}
                  onBookingSuccess={handleBookingSuccess}
                />
              </section>
            </div>
          </main>
        )
      ) : route === '/confirmation' ? (
        <main className="confirmation-page">
          {bookingLoading ? <p className="loading-screen">Finding your ticket…</p> : bookingSummary ? (
            <BookingSummary summary={bookingSummary} onNavigate={navigate} onReceiptUpdated={setBookingSummary} />
          ) : (
            <section className="card ticket-not-found"><h1>We couldn't find that ticket.</h1><p>It may have been removed, or it belongs to another account.</p><button type="button" className="primary-button" onClick={() => navigate('/tickets')}>My tickets</button></section>
          )}
        </main>
      ) : route === '/tickets' ? (
        <main className="tickets-page">
          <div className="booking-page-heading"><p className="hero-kicker">YOUR FESTIVAL MEMORIES</p><h1>My tickets.</h1><p>Every booking, right here when you need it.</p></div>
          {bookings.length === 0 ? (
            <section className="empty-tickets"><span aria-hidden="true">✳</span><h2>No tickets yet.</h2><p>Your next great day is waiting.</p><button type="button" className="primary-button" onClick={() => navigate('/book')}>Find your seat <span aria-hidden="true">↗</span></button></section>
          ) : (
            <ul className="ticket-history">
              {bookings.map((booking) => (
                <li className="history-ticket" key={booking.bookingId}>
                  <div className="ticket-stub"><span>TECHNOVA</span><strong>✳</strong><small>2026</small></div>
                  <div className="history-ticket-details"><span className="hero-kicker">{booking.bookingId}</span><h2>{booking.eventName}</h2><p>{booking.tickets} ticket(s) · {booking.paymentStatus === 'CONFIRMED' ? 'Payment confirmed' : 'Payment pending'} · {booking.accessPass} · {booking.seatZone}</p><small>{new Date(booking.createdAt).toLocaleDateString()}</small></div>
                  <div className="history-ticket-action"><strong>₹{booking.totalAmount}</strong><button type="button" className="text-link" onClick={() => navigate(`/confirmation?bookingId=${encodeURIComponent(booking.bookingId)}`)}>Open ticket ↗</button></div>
                </li>
              ))}
            </ul>
          )}
        </main>
      ) : route === '/' || route === '/about' ? (
        <HomePage event={event} availableTickets={availableTickets} onNavigate={navigate} />
      ) : (
        <main className="page-not-found">
          <p className="hero-kicker">PAGE NOT FOUND</p>
          <h1>This event page has moved.</h1>
          <button type="button" className="primary-button" onClick={() => navigate('/')}>Go to Home <span aria-hidden="true">→</span></button>
        </main>
      )}
    </div>
  )
}
