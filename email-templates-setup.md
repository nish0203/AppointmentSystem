# Email Templates Setup Guide

## EmailJS + Mailgun Configuration

### Required Email Templates

You need to create the following templates in your EmailJS dashboard:

#### 1. **template_appointment_reminder** - Appointment Reminders
```html
Subject: Reminder: Appointment in {{reminder_type}}

Dear {{to_name}},

This is a friendly reminder that you have an appointment scheduled for {{appointment_date}}.

**Appointment Details:**
- With: {{other_party_name}} ({{other_party_email}})
- Purpose: {{appointment_purpose}}
- Location: {{location}}
- Appointment ID: {{appointment_id}}

Please make sure to be available at the scheduled time. If you need to reschedule or cancel, please contact the other party as soon as possible.

Best regards,
Uni Bookings System
```

#### 2. **template_booking_confirmation** - Student Booking Confirmation
```html
Subject: Booking Confirmation - Appointment Request Submitted

Dear {{to_name}},

Your appointment request has been successfully submitted and is now pending approval.

**Booking Details:**
- Lecturer: {{lecturer_name}} ({{lecturer_email}})
- Requested Date/Time: {{appointment_date}}
- Purpose: {{appointment_purpose}}
- Booking ID: {{booking_id}}
- Status: {{status}}

You will receive another email once your lecturer approves or responds to your request.

Best regards,
Uni Bookings System
```

#### 3. **template_booking_approved** - Booking Approved
```html
Subject: ✅ Appointment Approved - {{appointment_date}}

Dear {{to_name}},

Great news! Your appointment request has been approved by {{lecturer_name}}.

**Confirmed Appointment Details:**
- Lecturer: {{lecturer_name}}
- Date/Time: {{appointment_date}}
- Purpose: {{appointment_purpose}}
- Location: {{location}}
- Booking ID: {{booking_id}}

{{#additional_notes}}
**Additional Notes from Lecturer:**
{{additional_notes}}
{{/additional_notes}}

Please be punctual and prepared for your appointment. You will receive reminder emails 24 hours and 1 hour before the appointment.

Best regards,
Uni Bookings System
```

#### 4. **template_booking_cancelled** - Booking Cancelled
```html
Subject: ❌ Appointment Cancelled - {{appointment_date}}

Dear {{to_name}},

We regret to inform you that your appointment scheduled for {{appointment_date}} has been cancelled.

**Cancellation Details:**
- Cancelled by: {{cancelled_by}}
- Original appointment with: {{other_party_name}}
- Booking ID: {{booking_id}}
- Reason: {{cancellation_reason}}

Please feel free to book another appointment slot if needed.

Best regards,
Uni Bookings System
```

#### 5. **template_reschedule_request** - Reschedule Request (to Lecturer)
```html
Subject: 📅 Reschedule Request from {{student_name}}

Dear {{to_name}},

{{student_name}} ({{student_email}}) has requested to reschedule their appointment with you.

**Current Appointment:**
- Date/Time: {{original_date}}

**Requested New Date/Time:**
- Date/Time: {{requested_date}}

**Reason for Reschedule:**
{{reschedule_reason}}

**Appointment ID:** {{appointment_id}}

Please log into your dashboard to approve or reject this reschedule request.

Best regards,
Uni Bookings System
```

#### 6. **template_reschedule_approved** - Reschedule Approved
```html
Subject: ✅ Reschedule Request Approved

Dear {{to_name}},

Good news! {{lecturer_name}} has approved your reschedule request.

**Updated Appointment Details:**
- Original Date: {{original_date}}
- New Date: {{new_date}}
- Appointment ID: {{appointment_id}}

You will receive reminder emails for your new appointment time.

Best regards,
Uni Bookings System
```

#### 7. **template_reschedule_rejected** - Reschedule Rejected
```html
Subject: ❌ Reschedule Request Declined

Dear {{to_name}},

We regret to inform you that {{lecturer_name}} has declined your reschedule request.

**Appointment Details:**
- Original Date: {{original_date}}
- Status: {{status}}
- Appointment ID: {{appointment_id}}

**Reason for Decline:**
{{rejection_reason}}

Your original appointment time remains unchanged. Please contact your lecturer directly if you need to discuss alternative arrangements.

Best regards,
Uni Bookings System
```

#### 8. **template_slot_booked_alert** - Slot Booked Alert (to Lecturer)
```html
Subject: 🔔 New Appointment Booking - {{student_name}}

Dear {{to_name}},

You have received a new appointment booking that requires your approval.

**Student Details:**
- Name: {{student_name}}
- Email: {{student_email}}
- Student ID: {{student_id}}

**Appointment Details:**
- Date/Time: {{appointment_date}}
- Purpose: {{appointment_purpose}}
- Booking ID: {{booking_id}}
- Booked at: {{booking_time}}

Please log into your dashboard to review and approve this appointment request.

Best regards,
Uni Bookings System
```

## Implementation Steps

### 1. EmailJS Dashboard Setup
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create a new service or use your existing Mailgun service
3. Create each template above with the exact template IDs:
   - `template_appointment_reminder`
   - `template_booking_confirmation`
   - `template_booking_approved`
   - `template_booking_cancelled`
   - `template_reschedule_request`
   - `template_reschedule_approved`
   - `template_reschedule_rejected`
   - `template_slot_booked_alert`

### 2. Template Variables
Each template uses specific variables that are passed from the JavaScript code. Make sure to include all the variables shown in the templates above.

### 3. HTML File Integration
Add this to any HTML file where you want to use email notifications:

```html
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<!-- Email Service -->
<script src="email-service.js"></script>
```

### 4. Usage Examples

#### Send Booking Confirmation
```javascript
await EmailService.sendBookingConfirmation({
  studentEmail: 'student@example.com',
  studentName: 'John Doe',
  lecturerName: 'Dr. Smith',
  lecturerEmail: 'dr.smith@university.edu',
  date: '2024-01-15',
  time: '10:00 AM',
  purpose: 'Project discussion',
  bookingId: 'BK001'
});
```

#### Send Slot Booked Alert
```javascript
await EmailService.sendSlotBookedAlert({
  lecturerEmail: 'dr.smith@university.edu',
  lecturerName: 'Dr. Smith',
  studentName: 'John Doe',
  studentEmail: 'student@example.com',
  studentId: 'ST001',
  date: '2024-01-15',
  time: '10:00 AM',
  purpose: 'Project discussion',
  bookingId: 'BK001'
});
```

#### Schedule Automatic Reminders
```javascript
await EmailService.scheduleReminders({
  recipientEmail: 'student@example.com',
  recipientName: 'John Doe',
  date: '2024-01-15',
  time: '10:00 AM',
  purpose: 'Project discussion',
  otherPartyName: 'Dr. Smith',
  otherPartyEmail: 'dr.smith@university.edu',
  appointmentId: 'APT001'
});
```

## Rate Limiting & Best Practices

1. **Batch Processing**: Use `sendBatchNotifications()` for multiple emails
2. **Rate Limiting**: The service includes 1-second delays between emails
3. **Error Handling**: All methods return `{success: boolean, error?: any}`
4. **Logging**: Console logs show success/failure for debugging

## Testing

Test each template by calling the methods with sample data:

```javascript
// Test booking confirmation
EmailService.sendBookingConfirmation({
  studentEmail: 'test@example.com',
  studentName: 'Test Student',
  lecturerName: 'Test Lecturer',
  lecturerEmail: 'lecturer@test.com',
  date: '2024-01-15',
  time: '10:00 AM',
  purpose: 'Test appointment',
  bookingId: 'TEST001'
});
``` 