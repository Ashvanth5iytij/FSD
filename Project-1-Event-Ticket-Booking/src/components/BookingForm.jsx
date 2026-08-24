import React, { useState } from 'react'
import ErrorMessage from './ErrorMessage'

export default function BookingForm({event, availableTickets, setAvailableTickets, setBookingSummary, setConfirmation}){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [department,setDepartment] = useState('')
  const [tickets,setTickets] = useState(1)
  const [errors,setErrors] = useState({})

  function validate(){
    const e = {}
    if(!name.trim()) e.name = 'Name is required.'
    else if(!/^[A-Za-z .'-]{2,}$/.test(name.trim())) e.name = 'Please enter a valid name.'
    if(!email.trim()) e.email = 'Email is required.'
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Please enter a valid email address.'
    if(!department.trim()) e.department = 'Department is required.'
    const qty = Number(tickets)
    if(!tickets || isNaN(qty) || !Number.isInteger(qty) || qty < 1) e.tickets = 'Number of tickets must be at least 1.'
    else if(qty > availableTickets) e.tickets = `Only ${availableTickets} tickets are currently available.`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function resetForm(){
    setName('')
    setEmail('')
    setDepartment('')
    setTickets(1)
    setErrors({})
    setBookingSummary(null)
    setConfirmation(null)
  }

  function handleSubmit(ev){
    ev.preventDefault()
    setConfirmation(null)
    setBookingSummary(null)
    if(!validate()) return
    const qty = Number(tickets)
    const total = event.ticketPrice * qty
    // reduce available tickets safely and compute remaining
    const remaining = Math.max(0, availableTickets - qty)
    setAvailableTickets(remaining)
    const bookingId = 'BK' + Date.now().toString().slice(-6)
    const summary = {
      bookingId,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      eventName: event.name,
      tickets: qty,
      ticketPrice: event.ticketPrice,
      totalAmount: total
      ,remainingTickets: remaining
    }
    setBookingSummary(summary)
    setConfirmation('Booking confirmed successfully.')
  }

  return (
    <div className="card" style={{marginTop:16}}>
      <h3>Book Tickets</h3>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={e=>setName(e.target.value)} />
          <ErrorMessage>{errors.name}</ErrorMessage>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <ErrorMessage>{errors.email}</ErrorMessage>
        </div>

        <div className="field">
          <label htmlFor="dept">Department</label>
          <input id="dept" value={department} onChange={e=>setDepartment(e.target.value)} />
          <ErrorMessage>{errors.department}</ErrorMessage>
        </div>

        <div className="field">
          <label htmlFor="tickets">Number of Tickets</label>
          <input id="tickets" type="number" min="1" value={tickets} onChange={e=>setTickets(e.target.value)} />
          <ErrorMessage>{errors.tickets}</ErrorMessage>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button type="submit" disabled={availableTickets <= 0}>Book Ticket</button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>
      </form>
      {availableTickets <= 0 && <div className="error" style={{marginTop:8}}>Sold Out</div>}
      {/** show confirmation near form */}
      {/** Confirmation passed via parent state */}
      <div style={{marginTop:12}}>
        {/** parent will display booking summary */}
      </div>
    </div>
  )
}
