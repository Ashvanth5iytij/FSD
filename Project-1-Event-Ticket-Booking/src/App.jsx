import React, { useState } from 'react'
import Header from './components/Header'
import EventDetails from './components/EventDetails'
import BookingForm from './components/BookingForm'
import BookingSummary from './components/BookingSummary'
import './App.css'

export default function App(){
  const initialEvent = {
    name: 'TechNova 2026 – Department Technical Fest',
    department: 'Department of Computer Science and Engineering',
    dateTime: '2026-10-15 10:00 AM',
    venue: 'Main Auditorium, CS Department',
    ticketPrice: 100,
    initialTickets: 100
  }

  const [availableTickets, setAvailableTickets] = useState(initialEvent.initialTickets)
  const [bookingSummary, setBookingSummary] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  return (
    <div className="app">
      <Header />
      <main className="container">
        <div className="left">
          <EventDetails event={initialEvent} availableTickets={availableTickets} />
          <BookingForm
            event={initialEvent}
            availableTickets={availableTickets}
            setAvailableTickets={setAvailableTickets}
            setBookingSummary={setBookingSummary}
            setConfirmation={setConfirmation}
          />
        </div>
        <div className="right">
          <BookingSummary summary={bookingSummary} confirmation={confirmation} />
        </div>
      </main>
    </div>
  )
}
