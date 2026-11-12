import React, { useMemo, useState } from 'react'

export default function EventsPage({ event, availableTickets, onNavigate }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All Events')
  const categories = ['All Events', 'Technical']
  const visibleEvent = useMemo(() => {
    const matchesCategory = category === 'All Events' || category === 'Technical'
    const matchesQuery = `${event.name} ${event.department} ${event.venue}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  }, [category, event, query])

  return (
    <main className="events-page">
      <div className="events-page-heading">
        <div>
          <p className="hero-kicker">DISCOVER YOUR NEXT EXPERIENCE</p>
          <h1>Events <span>that bring us together.</span></h1>
          <p>Explore college events and reserve your ticket, all in one place.</p>
        </div>
        <label className="event-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="Search events"
            placeholder="Search events..."
            value={query}
            onChange={(change) => setQuery(change.target.value)}
          />
        </label>
      </div>

      <div className="event-filters" aria-label="Filter events by category">
        {categories.map((item) => (
          <button
            className={category === item ? 'event-filter active' : 'event-filter'}
            type="button"
            key={item}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {visibleEvent ? (
        <section className="events-grid" aria-label="Upcoming events">
          <article className="event-catalog-card">
            <div className="catalog-art technical-art" aria-hidden="true">
              <span className="catalog-art-orbit" />
              <span className="catalog-tech-symbol">&lt;/&gt;</span>
              <span className="catalog-art-chip">✳</span>
              <span className="catalog-art-laptop"><span>TECH<br />NOVA</span></span>
              <span className="catalog-art-stars">✦ &nbsp; · &nbsp; ✦</span>
              <span className="catalog-category">Technical</span>
            </div>
            <div className="catalog-details">
              <span className="catalog-status"><i /> OPEN FOR BOOKING · {availableTickets} SEATS</span>
              <h2>{event.name}</h2>
              <p>{event.department}</p>
              <div className="catalog-meta">
                <span><b aria-hidden="true">▦</b>{event.dateTime}</span>
                <span><b aria-hidden="true">⌖</b>{event.venue}</span>
                <span><b aria-hidden="true">₹</b>₹{event.ticketPrice} per ticket</span>
              </div>
              <button type="button" className="catalog-book-button" onClick={() => onNavigate('/book')}>
                View Details <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </section>
      ) : (
        <section className="events-empty">
          <span aria-hidden="true">⌕</span>
          <h2>No events match that search.</h2>
          <p>Try another search, or select All Events to see the college event.</p>
          <button type="button" className="catalog-book-button" onClick={() => { setQuery(''); setCategory('All Events') }}>
            Show all events
          </button>
        </section>
      )}
      <footer className="events-footer">COLLEGE EVENT TICKET BOOKING <span>✦</span> TECHNOVA 2026</footer>
    </main>
  )
}
