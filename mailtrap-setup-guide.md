# Mailtrap + Mailgun Hybrid Setup Guide

## 🎯 **Perfect Setup: Mailgun for OTP + Mailtrap for Appointments**

This hybrid approach gives you the best of both worlds:
- **Mailgun**: Production OTP emails (reliable delivery)
- **Mailtrap**: Safe testing for appointment notifications

## 🚀 **Mailtrap Setup Steps**

### 1. **Create Mailtrap Account**
1. Go to [Mailtrap.io](https://mailtrap.io/)
2. Sign up for a free account
3. Create a new inbox for testing

### 2. **Get Mailtrap SMTP Credentials**
1. Go to your Mailtrap inbox
2. Click on "SMTP Settings"
3. Note down:
   - **Host**: `smtp.mailtrap.io`
   - **Port**: `2525`
   - **Username**: Your username
   - **Password**: Your password

### 3. **Setup EmailJS Service for Mailtrap**
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create a new service
3. Choose "Custom SMTP" or "Other"
4. Configure with Mailtrap SMTP settings:
   ```
   Service ID: service_mailtrap
   SMTP Server: smtp.mailtrap.io
   Port: 2525
   Username: [your-mailtrap-username]
   Password: [your-mailtrap-password]
   ```

### 4. **Create Mailtrap Email Templates**
Create these templates in EmailJS with "_mt" suffix:

#### Template IDs for Mailtrap:
- `template_appointment_reminder_mt`
- `template_booking_confirmation_mt`
- `template_booking_approved_mt`
- `template_booking_cancelled_mt`
- `template_reschedule_request_mt`
- `template_reschedule_approved_mt`
- `template_reschedule_rejected_mt`
- `template_slot_booked_alert_mt`

## 📧 **Email Template Examples for Mailtrap**

### 1. **template_booking_confirmation_mt**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .status { background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Booking Confirmation</h1>
            <p>Your appointment request has been submitted</p>
        </div>
        
        <p>Dear {{to_name}},</p>
        
        <p>Your appointment request has been successfully submitted and is now pending approval.</p>
        
        <div class="details">
            <h3>📋 Booking Details:</h3>
            <p><strong>Lecturer:</strong> {{lecturer_name}} ({{lecturer_email}})</p>
            <p><strong>Requested Date/Time:</strong> {{appointment_date}}</p>
            <p><strong>Purpose:</strong> {{appointment_purpose}}</p>
            <p><strong>Booking ID:</strong> {{booking_id}}</p>
        </div>
        
        <div class="status">
            <p><strong>Status:</strong> {{status}}</p>
        </div>
        
        <p>You will receive another email once your lecturer approves or responds to your request.</p>
        
        <p>Best regards,<br>
        <strong>Uni Bookings System</strong></p>
        
        <div class="footer">
            <p>This email was sent via Mailtrap for testing purposes.</p>
        </div>
    </div>
</body>
</html>
```

### 2. **template_slot_booked_alert_mt**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Booking</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .student-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .action-btn { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Appointment Booking</h1>
            <p>{{student_name}} has requested an appointment</p>
        </div>
        
        <p>Dear {{to_name}},</p>
        
        <p>You have received a new appointment booking that requires your approval.</p>
        
        <div class="student-info">
            <h3>👤 Student Details:</h3>
            <p><strong>Name:</strong> {{student_name}}</p>
            <p><strong>Email:</strong> {{student_email}}</p>
            <p><strong>Student ID:</strong> {{student_id}}</p>
        </div>
        
        <div class="details">
            <h3>📅 Appointment Details:</h3>
            <p><strong>Date/Time:</strong> {{appointment_date}}</p>
            <p><strong>Purpose:</strong> {{appointment_purpose}}</p>
            <p><strong>Booking ID:</strong> {{booking_id}}</p>
            <p><strong>Booked at:</strong> {{booking_time}}</p>
        </div>
        
        <p>Please log into your dashboard to review and approve this appointment request.</p>
        
        <p>Best regards,<br>
        <strong>Uni Bookings System</strong></p>
        
        <div class="footer">
            <p>This email was sent via Mailtrap for testing purposes.</p>
        </div>
    </div>
</body>
</html>
```

### 3. **template_booking_approved_mt**
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

---
This email was sent via Mailtrap for testing purposes.
```

## 🔧 **Integration Steps**

### 1. **Update Your HTML Files**
Replace the email service script reference:

```html
<!-- OLD: Single service -->
<script src="email-service.js"></script>

<!-- NEW: Hybrid service -->
<script src="email-service-hybrid.js"></script>
```

### 2. **Update Configuration**
In `email-service-hybrid.js`, update:

```javascript
// Mailtrap configuration
this.MAILTRAP_SERVICE_ID = "service_mailtrap"; // Your Mailtrap service ID
this.MAILTRAP_PUBLIC_KEY = "your_mailtrap_public_key"; // Your Mailtrap public key
```

### 3. **Keep Existing OTP Setup**
Your existing Mailgun OTP setup remains unchanged:
- `login.html` continues to use Mailgun for OTP
- No changes needed to OTP functionality

## 🧪 **Testing Workflow**

### Test Appointment Emails (Mailtrap)
```javascript
// All appointment emails go to Mailtrap inbox
await EmailService.sendBookingConfirmation({
  studentEmail: 'test@example.com', // Will appear in Mailtrap
  studentName: 'Test Student',
  lecturerName: 'Test Lecturer',
  lecturerEmail: 'lecturer@test.com',
  date: '2024-01-15',
  time: '10:00 AM - 11:00 AM',
  purpose: 'Test appointment',
  bookingId: 'TEST001'
});
```

### Test OTP Emails (Mailgun)
```javascript
// OTP emails still go through Mailgun (production)
await EmailService.sendOTPEmail('user@email.com', '123456', '15 minutes');
```

## 📊 **Email Flow Diagram**

```
📱 User Action          📧 Email Route         📬 Destination
─────────────────────────────────────────────────────────────
Login (OTP)         →   Mailgun           →   Real Email
Book Appointment    →   Mailtrap          →   Test Inbox
Approve Booking     →   Mailtrap          →   Test Inbox
Cancel Appointment  →   Mailtrap          →   Test Inbox
Reschedule Request  →   Mailtrap          →   Test Inbox
Reminders          →   Mailtrap          →   Test Inbox
```

## 🔄 **Switching to Production**

When ready for production, you can:

### Option 1: Keep Hybrid (Recommended)
- Keep OTP on Mailgun (production)
- Move appointment emails to Mailgun (production)

### Option 2: Move Appointments to Production
Update the service to use Mailgun for appointments:

```javascript
// In email-service-hybrid.js
async sendBookingConfirmation(bookingData) {
  // Switch to Mailgun for production
  return await emailjs.send(
    this.MAILGUN_SERVICE_ID,  // Use Mailgun
    'template_booking_confirmation', // Mailgun template
    templateParams,
    { publicKey: this.MAILGUN_PUBLIC_KEY }
  );
}
```

## ✅ **Benefits of This Setup**

### 🔒 **Safe Testing**
- All appointment emails go to Mailtrap
- No risk of sending test emails to real users
- Perfect for development and staging

### 🚀 **Production Ready**
- OTP emails work in production via Mailgun
- Easy to switch appointment emails to production
- No disruption to existing functionality

### 🎯 **Best Practices**
- Separate concerns (OTP vs Notifications)
- Clear email routing
- Easy debugging and monitoring

## 📝 **Configuration Checklist**

- [ ] Mailtrap account created
- [ ] Mailtrap inbox configured
- [ ] EmailJS service created for Mailtrap
- [ ] 8 Mailtrap email templates created with "_mt" suffix
- [ ] `email-service-hybrid.js` configured with Mailtrap credentials
- [ ] HTML files updated to use hybrid service
- [ ] OTP functionality tested (should still use Mailgun)
- [ ] Appointment emails tested (should go to Mailtrap)

## 🎉 **Result**

You now have:
- ✅ **Production OTP** via Mailgun (reliable delivery)
- ✅ **Safe Testing** for appointment emails via Mailtrap
- ✅ **Easy Production Migration** when ready
- ✅ **No Risk** of sending test emails to real users
- ✅ **Full Debugging** capabilities in Mailtrap inbox

Perfect setup for development and testing! 🚀 