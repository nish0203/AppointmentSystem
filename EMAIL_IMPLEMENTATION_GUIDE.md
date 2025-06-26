# Email Notification System - Implementation Guide

## 📧 Complete Email Implementation for Appointment System

This guide shows you how to implement a comprehensive email notification system using EmailJS and Mailgun for your appointment booking system.

## 🚀 Quick Start

### 1. **Setup EmailJS Templates**
First, create these 8 email templates in your EmailJS dashboard with the exact template IDs:

- `template_appointment_reminder` - For 24h and 1h reminders
- `template_booking_confirmation` - When student books an appointment
- `template_booking_approved` - When lecturer approves booking
- `template_booking_cancelled` - When appointment is cancelled
- `template_reschedule_request` - When student requests reschedule
- `template_reschedule_approved` - When reschedule is approved
- `template_reschedule_rejected` - When reschedule is rejected
- `template_slot_booked_alert` - Alert lecturer of new booking

### 2. **Add Scripts to Your HTML Files**
Add these scripts to any page where you want email notifications:

```html
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<!-- Email Service -->
<script src="email-service.js"></script>
```

### 3. **Update Your EmailJS Configuration**
In `email-service.js`, update these values:
```javascript
this.SERVICE_ID = "your_service_id";
this.PUBLIC_KEY = "your_public_key";
```

## 📋 Implementation Scenarios

### ✅ **When Student Books Appointment**
```javascript
// In student booking function
await EmailService.sendBookingConfirmation({
  studentEmail: 'student@email.com',
  studentName: 'John Doe',
  lecturerName: 'Dr. Smith',
  lecturerEmail: 'dr.smith@university.edu',
  date: '2024-01-15',
  time: '10:00 AM - 11:00 AM',
  purpose: 'Project discussion',
  bookingId: 'BK001'
});

await EmailService.sendSlotBookedAlert({
  lecturerEmail: 'dr.smith@university.edu',
  lecturerName: 'Dr. Smith',
  studentName: 'John Doe',
  studentEmail: 'student@email.com',
  studentId: 'ST001',
  date: '2024-01-15',
  time: '10:00 AM - 11:00 AM',
  purpose: 'Project discussion',
  bookingId: 'BK001'
});
```

### ✅ **When Lecturer Approves Appointment**
```javascript
// In lecturer approval function
await EmailService.sendBookingApproved({
  studentEmail: appointmentData.studentEmail,
  studentName: appointmentData.studentName,
  lecturerName: appointmentData.lecturerName,
  date: appointmentData.date,
  time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
  purpose: appointmentData.purpose,
  location: 'Office Room 123',
  bookingId: appointmentId,
  notes: 'Please bring your project documents.'
});

// Schedule automatic reminders
await EmailService.scheduleReminders({
  recipientEmail: appointmentData.studentEmail,
  recipientName: appointmentData.studentName,
  date: appointmentData.date,
  time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
  purpose: appointmentData.purpose,
  otherPartyName: appointmentData.lecturerName,
  otherPartyEmail: appointmentData.lecturerEmail,
  appointmentId: appointmentId
});
```

### ✅ **When Appointment is Cancelled**
```javascript
await EmailService.sendBookingCancelled({
  recipientEmail: appointmentData.studentEmail,
  recipientName: appointmentData.studentName,
  cancelledBy: appointmentData.lecturerName,
  date: appointmentData.date,
  time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
  reason: 'Emergency meeting conflict',
  bookingId: appointmentId,
  otherPartyName: appointmentData.lecturerName
});
```

### ✅ **When Student Requests Reschedule**
```javascript
await EmailService.sendRescheduleRequest({
  lecturerEmail: appointmentData.lecturerEmail,
  lecturerName: appointmentData.lecturerName,
  studentName: appointmentData.studentName,
  studentEmail: appointmentData.studentEmail,
  originalDate: appointmentData.date,
  originalTime: `${appointmentData.startTime} - ${appointmentData.endTime}`,
  requestedDate: newDate,
  requestedTime: newTime,
  reason: 'Class schedule conflict',
  appointmentId: appointmentId
});
```

### ✅ **When Lecturer Responds to Reschedule**
```javascript
// Approve reschedule
await EmailService.sendRescheduleResponse({
  studentEmail: requestData.studentEmail,
  studentName: requestData.studentName,
  lecturerName: requestData.lecturerName,
  originalDate: requestData.originalDate,
  originalTime: requestData.originalTime,
  newDate: requestData.requestedDate,
  newTime: requestData.requestedTime,
  approved: true,
  appointmentId: requestData.appointmentId
});

// Reject reschedule
await EmailService.sendRescheduleResponse({
  studentEmail: requestData.studentEmail,
  studentName: requestData.studentName,
  lecturerName: requestData.lecturerName,
  originalDate: requestData.originalDate,
  originalTime: requestData.originalTime,
  approved: false,
  rejectionReason: 'No alternative slots available',
  appointmentId: requestData.appointmentId
});
```

## ⏰ **Automatic Reminder System**

### Setup Daily Reminders
```javascript
// Add to your main application file
EmailIntegration.setupAutomaticReminders();
```

This will:
- Send 24-hour reminders at 9 AM daily
- Send 1-hour reminders automatically
- Handle both student and lecturer reminders

### Manual Reminder Sending
```javascript
// Send immediate reminders for specific appointment
await EmailService.scheduleReminders({
  recipientEmail: 'user@email.com',
  recipientName: 'User Name',
  date: '2024-01-15',
  time: '10:00 AM - 11:00 AM',
  purpose: 'Meeting purpose',
  otherPartyName: 'Other Person',
  otherPartyEmail: 'other@email.com',
  appointmentId: 'APT001'
});
```

## 🔧 **Integration Steps**

### Step 1: Add to Student Booking Page
```html
<!-- In student-booking-lecturer.html -->
<script src="email-service.js"></script>
```

Then in your booking success handler:
```javascript
// After successful booking
await EmailService.sendBookingConfirmation(bookingData);
await EmailService.sendSlotBookedAlert(alertData);
```

### Step 2: Add to Lecturer Management Page
```html
<!-- In lecturer-manage-slots.html -->
<script src="email-service.js"></script>
<script src="email-integration-example.js"></script>
```

Then replace your approval function:
```javascript
// Replace existing approveAppointment with:
EmailIntegration.approveAppointmentWithEmail(appointmentId);
```

### Step 3: Add to Student Management Page
```html
<!-- In student-manage-appointments.html -->
<script src="email-service.js"></script>
```

For reschedule requests:
```javascript
await EmailService.sendRescheduleRequest(rescheduleData);
```

## 🧪 **Testing**

### Test Individual Functions
```javascript
// Test booking confirmation
EmailService.sendBookingConfirmation({
  studentEmail: 'test@example.com',
  studentName: 'Test Student',
  lecturerName: 'Test Lecturer',
  lecturerEmail: 'lecturer@test.com',
  date: '2024-01-15',
  time: '10:00 AM - 11:00 AM',
  purpose: 'Test appointment',
  bookingId: 'TEST001'
});
```

### Test Batch Notifications
```javascript
const notifications = [
  {
    type: 'booking_confirmation',
    data: { /* booking data */ }
  },
  {
    type: 'slot_booked_alert',
    data: { /* alert data */ }
  }
];

const results = await EmailService.sendBatchNotifications(notifications);
console.log('Batch results:', results);
```

## 🚨 **Error Handling**

All email functions return `{success: boolean, error?: any}`:

```javascript
const result = await EmailService.sendBookingConfirmation(data);
if (!result.success) {
  console.error('Email failed:', result.error);
  // Handle error (show user message, retry, etc.)
}
```

## 📊 **Monitoring**

Check browser console for email status:
- ✅ Success messages show when emails are sent
- ❌ Error messages show when emails fail
- 📧 Batch processing shows progress

## 🔄 **Rate Limiting**

The system includes automatic rate limiting:
- 1-second delay between batch emails
- Prevents EmailJS rate limit issues
- Graceful error handling

## 🎯 **Customization**

### Custom Email Templates
Edit templates in EmailJS dashboard to match your branding.

### Custom Reminder Times
Modify `scheduleReminders()` function to change reminder timing:
```javascript
// Change from 24h/1h to custom times
const reminder48h = new Date(appointmentDateTime.getTime() - (48 * 60 * 60 * 1000));
const reminder2h = new Date(appointmentDateTime.getTime() - (2 * 60 * 60 * 1000));
```

### Custom Notification Types
Add new notification types to the `EmailNotificationService` class.

## 📝 **Files Created**

1. `email-service.js` - Main email service class
2. `email-templates-setup.md` - Template documentation
3. `email-integration-example.js` - Integration examples
4. `EMAIL_IMPLEMENTATION_GUIDE.md` - This guide

## ✅ **Checklist**

- [ ] EmailJS account setup with Mailgun
- [ ] 8 email templates created with correct IDs
- [ ] `email-service.js` added to project
- [ ] Scripts added to HTML files
- [ ] Email functions integrated into booking flow
- [ ] Email functions integrated into approval flow
- [ ] Email functions integrated into cancellation flow
- [ ] Email functions integrated into reschedule flow
- [ ] Automatic reminder system setup
- [ ] Testing completed
- [ ] Error handling implemented

## 🎉 **Result**

Once implemented, your system will automatically send:
- ✅ Booking confirmations to students
- ✅ New booking alerts to lecturers
- ✅ Approval notifications to students
- ✅ Cancellation notifications to both parties
- ✅ Reschedule request notifications to lecturers
- ✅ Reschedule response notifications to students
- ✅ 24-hour and 1-hour appointment reminders
- ✅ All emails are professionally formatted and branded 