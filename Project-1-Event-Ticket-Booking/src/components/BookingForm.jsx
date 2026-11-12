import React, { useMemo, useState } from 'react'
import ErrorMessage from './ErrorMessage'

const attendeeOptions = ['Student', 'Faculty', 'Guest', 'VIP']
const accessPasses = [
  { id: 'standard', label: 'Standard', price: 0 },
  { id: 'gold', label: 'Gold', price: 150 },
  { id: 'platinum', label: 'Platinum', price: 280 },
]
const seatZones = [
  { id: 'mid', label: 'Mid Hall', price: 0 },
  { id: 'balcony', label: 'Balcony', price: 80 },
  { id: 'front', label: 'Front Row', price: 140 },
  { id: 'vip', label: 'VIP Lounge', price: 250 },
]
const addOnOptions = [
  { id: 'workshop', label: 'Workshop Pass', price: 120 },
  { id: 'lunch', label: 'Lunch Coupon', price: 90 },
  { id: 'certificate', label: 'Certificate', price: 60 },
  { id: 'parking', label: 'Priority Parking', price: 75 },
]
const quickTicketOptions = [1, 2, 3, 5]

export default function BookingForm({
  event,
  user,
  availableTickets,
  setAvailableTickets,
  setBookingSummary,
  setConfirmation,
  onBookingSuccess,
}) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [tickets, setTickets] = useState(1)
  const [attendeeType, setAttendeeType] = useState('Student')
  const [passType, setPassType] = useState('standard')
  const [seatZone, setSeatZone] = useState('mid')
  const [specialNotes, setSpecialNotes] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPass = useMemo(
    () => accessPasses.find((item) => item.id === passType) || accessPasses[0],
    [passType]
  )
  const selectedSeat = useMemo(
    () => seatZones.find((item) => item.id === seatZone) || seatZones[0],
    [seatZone]
  )
  const selectedAddOnList = useMemo(
    () => addOnOptions.filter((item) => selectedAddOns.includes(item.id)),
    [selectedAddOns]
  )

  const previewBase = Number(tickets || 0) * Number(event.ticketPrice || 0)
  const previewPass = selectedPass.price * Number(tickets || 0)
  const previewSeat = selectedSeat.price * Number(tickets || 0)
  const previewAddOns = selectedAddOnList.reduce((total, item) => total + item.price, 0)
  const previewTotal = previewBase + previewPass + previewSeat + previewAddOns

  const recommendation = useMemo(() => {
    if (Number(tickets) >= 5) return 'Group booking optimized'
    if (attendeeType === 'VIP') return 'VIP lounge preferred'
    if (selectedPass.id === 'platinum') return 'Premium experience selected'
    return 'Smart economy pass selected'
  }, [attendeeType, selectedPass.id, tickets])

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required.'
    else if (!/^[A-Za-z .'-]{2,}$/.test(name.trim())) e.name = 'Please enter a valid name.'
    if (!email.trim()) e.email = 'Email is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Please enter a valid email address.'
    if (!phone.trim()) e.phone = 'Mobile number is required.'
    else if (!/^[0-9+()\-\s]{7,15}$/.test(phone.trim())) e.phone = 'Enter a valid mobile number.'
    if (!department.trim()) e.department = 'Department is required.'
    const qty = Number(tickets)
    if (!tickets || isNaN(qty) || !Number.isInteger(qty) || qty < 1) e.tickets = 'Number of tickets must be at least 1.'
    else if (qty > availableTickets) e.tickets = `Only ${availableTickets} tickets are currently available.`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function resetForm() {
    setName('')
    setEmail('')
    setPhone('')
    setDepartment('')
    setTickets(1)
    setAttendeeType('Student')
    setPassType('standard')
    setSeatZone('mid')
    setSpecialNotes('')
    setSelectedAddOns([])
    setErrors({})
    setBookingSummary(null)
    setConfirmation(null)
  }

  function toggleAddOn(addOnId) {
    setSelectedAddOns((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId]
    )
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setConfirmation(null)
    setBookingSummary(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          phone: phone.trim(),
          tickets: Number(tickets),
          attendeeType,
          accessPass: selectedPass.label,
          seatZone: selectedSeat.label,
          addOns: selectedAddOnList.map((item) => item.label),
          specialNotes: specialNotes.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Booking failed.')
      }

      const summary = {
        bookingId: data.bookingId,
        name: data.name,
        email: data.email,
        phone: phone.trim(),
        department: data.department,
        eventName: event.name,
        eventDateTime: event.dateTime,
        venue: event.venue,
        tickets: data.tickets,
        ticketPrice: data.ticketPrice,
        totalAmount: data.totalAmount,
        remainingTickets: data.remainingTickets,
        paymentStatus: data.paymentStatus,
        receiptNumber: data.receiptNumber,
        paymentMethod: data.paymentMethod,
        confirmedAt: data.confirmedAt,
        emailStatus: data.emailStatus,
        attendeeType,
        accessPass: data.accessPass,
        seatZone: data.seatZone,
        addOns: data.addOns,
        specialNotes: data.specialNotes,
        previewTotal: data.totalAmount,
      }

      setAvailableTickets(data.remainingTickets)
      setBookingSummary(summary)
      setConfirmation(data.message || 'Booking confirmed successfully.')
      setName('')
      setEmail('')
      setPhone('')
      setDepartment('')
      setTickets(1)
      setAttendeeType('Student')
      setPassType('standard')
      setSeatZone('mid')
      setSpecialNotes('')
      setSelectedAddOns([])
      setErrors({})

      if (onBookingSuccess) {
        await onBookingSuccess(summary)
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Booking failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card booking-form-card">
      <div className="card-header-row">
        <div>
          <p className="eyebrow">TECHNOVA 2026</p>
          <h3>Booking Details</h3>
        </div>
        <div className={`status-pill ${availableTickets > 20 ? 'good' : availableTickets > 5 ? 'warn' : 'danger'}`}>
          {availableTickets} left
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
            <ErrorMessage>{errors.name}</ErrorMessage>
          </div>

          <div className="field">
            <label htmlFor="phone">Mobile number</label>
            <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" required />
            <ErrorMessage>{errors.phone}</ErrorMessage>
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required />
            <ErrorMessage>{errors.email}</ErrorMessage>
          </div>

          <div className="field">
            <label htmlFor="dept">Department</label>
            <input id="dept" autoComplete="organization-title" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" required />
            <ErrorMessage>{errors.department}</ErrorMessage>
          </div>

          <div className="field full-width">
            <label htmlFor="tickets">No. of Tickets <span className="required-mark">*</span></label>
            <div className="quick-tickets">
              {quickTicketOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`quick-ticket ${Number(tickets) === option ? 'selected' : ''}`}
                  onClick={() => setTickets(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <input id="tickets" type="number" min="1" value={tickets} onChange={e => setTickets(e.target.value)} />
            <ErrorMessage>{errors.tickets}</ErrorMessage>
          </div>

          <details className="booking-extras full-width">
            <summary>Customize your event experience <span>Optional passes, seats and extras</span></summary>
            <div className="booking-extras-content">
              <div className="field full-width">
                <label>Attendee profile</label>
                <div className="choice-grid">
                  {attendeeOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`option-chip ${attendeeType === option ? 'active' : ''}`}
                      onClick={() => setAttendeeType(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field full-width">
                <label>Access pass</label>
                <div className="choice-grid">
                  {accessPasses.map((pass) => (
                    <button
                      type="button"
                      key={pass.id}
                      className={`option-chip ${passType === pass.id ? 'active' : ''}`}
                      onClick={() => setPassType(pass.id)}
                    >
                      {pass.label}
                      <span>₹{pass.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field full-width">
                <label>Preferred seat zone</label>
                <div className="choice-grid">
                  {seatZones.map((seat) => (
                    <button
                      type="button"
                      key={seat.id}
                      className={`option-chip ${seatZone === seat.id ? 'active' : ''}`}
                      onClick={() => setSeatZone(seat.id)}
                    >
                      {seat.label}
                      <span>₹{seat.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field full-width">
                <label>Smart add-ons</label>
                <div className="addon-grid">
                  {addOnOptions.map((item) => (
                    <label key={item.id} className={`toggle-option ${selectedAddOns.includes(item.id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedAddOns.includes(item.id)}
                        onChange={() => toggleAddOn(item.id)}
                      />
                      <span>{item.label}</span>
                      <small>₹{item.price}</small>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field full-width">
                <label htmlFor="notes">Special notes</label>
                <textarea
                  id="notes"
                  rows="3"
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  placeholder="Accessibility request, team booking, or seating preference..."
                />
              </div>
            </div>
          </details>
        </div>

        <div className="booking-preview">
          <div className="preview-head">
            <span>YOUR TOTAL</span>
            <strong>{recommendation}</strong>
          </div>
          <div className="price-row">
            <span>Base booking</span>
            <strong>₹{previewBase}</strong>
          </div>
          <div className="price-row">
            <span>{selectedPass.label} pass</span>
            <strong>₹{previewPass}</strong>
          </div>
          <div className="price-row">
            <span>{selectedSeat.label}</span>
            <strong>₹{previewSeat}</strong>
          </div>
          {selectedAddOnList.length > 0 && (
            <div className="price-row">
              <span>Add-ons</span>
              <strong>₹{previewAddOns}</strong>
            </div>
          )}
          <div className="preview-total">
            <span>Total Amount</span>
            <strong>₹{previewTotal}</strong>
          </div>
        </div>

        <ErrorMessage>{errors.submit}</ErrorMessage>

        <div className="action-row">
          <button type="submit" disabled={availableTickets <= 0 || isSubmitting}>
            {isSubmitting ? 'Securing your ticket…' : 'Confirm & Book Ticket'}
          </button>
          <button type="button" className="ghost-btn" onClick={resetForm}>Reset</button>
        </div>
      </form>
      {availableTickets <= 0 && <div className="error" style={{ marginTop: 8 }}>Sold Out</div>}
    </div>
  )
}
