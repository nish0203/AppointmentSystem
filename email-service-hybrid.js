// Hybrid Email Service: Mailgun + Mailtrap
// Uses Mailgun for OTP emails and Mailtrap for appointment notifications

class HybridEmailNotificationService {
  constructor() {
    // Mailgun configuration (for OTP emails)
    this.MAILGUN_SERVICE_ID = "service_mailgun";
    this.MAILGUN_PUBLIC_KEY = "CO_25CIKuZ9YpYqQt";
    
    // Mailtrap configuration (for appointment notifications)
    this.MAILTRAP_SERVICE_ID = "service_mailtrap";
    this.MAILTRAP_PUBLIC_KEY = "your_mailtrap_public_key"; // Update this
    
    // Email Templates for different services
    this.MAILGUN_TEMPLATES = {
      OTP_LOGIN: "template_otp" // Keep existing OTP template on Mailgun
    };
    
    this.MAILTRAP_TEMPLATES = {
      APPOINTMENT_REMINDER: "template_appointment_reminder_mt",
      BOOKING_CONFIRMATION: "template_booking_confirmation_mt", 
      BOOKING_APPROVED: "template_booking_approved_mt",
      BOOKING_CANCELLED: "template_booking_cancelled_mt",
      RESCHEDULE_REQUEST: "template_reschedule_request_mt",
      RESCHEDULE_APPROVED: "template_reschedule_approved_mt",
      RESCHEDULE_REJECTED: "template_reschedule_rejected_mt",
      SLOT_BOOKED_ALERT: "template_slot_booked_alert_mt"
    };
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: this.MAILGUN_PUBLIC_KEY });
    }
  }

  // Format date and time for emails
  formatDateTime(dateStr, timeStr) {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${formattedDate} at ${timeStr}`;
  }

  // Send OTP email via Mailgun (production)
  async sendOTPEmail(email, passcode, time) {
    try {
      const response = await emailjs.send(
        this.MAILGUN_SERVICE_ID,
        this.MAILGUN_TEMPLATES.OTP_LOGIN,
        { email: email, passcode: passcode, time: time },
        { publicKey: this.MAILGUN_PUBLIC_KEY }
      );
      console.log('✅ OTP email sent via Mailgun:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send OTP via Mailgun:', error);
      return { success: false, error };
    }
  }

  // Send appointment emails via Mailtrap (testing/development)
  async sendMailtrapEmail(templateId, templateParams) {
    try {
      const response = await emailjs.send(
        this.MAILTRAP_SERVICE_ID,
        templateId,
        templateParams,
        { publicKey: this.MAILTRAP_PUBLIC_KEY }
      );
      console.log('✅ Email sent via Mailtrap:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send email via Mailtrap:', error);
      return { success: false, error };
    }
  }

  // Send appointment reminder (via Mailtrap)
  async sendAppointmentReminder(appointmentData, reminderType = '24h') {
    const templateParams = {
      to_email: appointmentData.recipientEmail,
      to_name: appointmentData.recipientName,
      appointment_date: this.formatDateTime(appointmentData.date, appointmentData.time),
      appointment_purpose: appointmentData.purpose || 'General consultation',
      location: appointmentData.location || 'Online/Office',
      other_party_name: appointmentData.otherPartyName,
      other_party_email: appointmentData.otherPartyEmail,
      reminder_type: reminderType === '24h' ? '24 hours' : '1 hour',
      appointment_id: appointmentData.appointmentId
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.APPOINTMENT_REMINDER,
      templateParams
    );
  }

  // Send booking confirmation to student (via Mailtrap)
  async sendBookingConfirmation(bookingData) {
    const templateParams = {
      to_email: bookingData.studentEmail,
      to_name: bookingData.studentName,
      lecturer_name: bookingData.lecturerName,
      lecturer_email: bookingData.lecturerEmail,
      appointment_date: this.formatDateTime(bookingData.date, bookingData.time),
      appointment_purpose: bookingData.purpose,
      booking_id: bookingData.bookingId,
      status: 'pending approval'
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.BOOKING_CONFIRMATION,
      templateParams
    );
  }

  // Send booking approval notification to student (via Mailtrap)
  async sendBookingApproved(approvalData) {
    const templateParams = {
      to_email: approvalData.studentEmail,
      to_name: approvalData.studentName,
      lecturer_name: approvalData.lecturerName,
      appointment_date: this.formatDateTime(approvalData.date, approvalData.time),
      appointment_purpose: approvalData.purpose,
      location: approvalData.location || 'To be confirmed',
      booking_id: approvalData.bookingId,
      additional_notes: approvalData.notes || ''
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.BOOKING_APPROVED,
      templateParams
    );
  }

  // Send booking cancellation notification (via Mailtrap)
  async sendBookingCancelled(cancellationData) {
    const templateParams = {
      to_email: cancellationData.recipientEmail,
      to_name: cancellationData.recipientName,
      cancelled_by: cancellationData.cancelledBy,
      appointment_date: this.formatDateTime(cancellationData.date, cancellationData.time),
      cancellation_reason: cancellationData.reason,
      booking_id: cancellationData.bookingId,
      other_party_name: cancellationData.otherPartyName
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.BOOKING_CANCELLED,
      templateParams
    );
  }

  // Send reschedule request notification to lecturer (via Mailtrap)
  async sendRescheduleRequest(rescheduleData) {
    const templateParams = {
      to_email: rescheduleData.lecturerEmail,
      to_name: rescheduleData.lecturerName,
      student_name: rescheduleData.studentName,
      student_email: rescheduleData.studentEmail,
      original_date: this.formatDateTime(rescheduleData.originalDate, rescheduleData.originalTime),
      requested_date: this.formatDateTime(rescheduleData.requestedDate, rescheduleData.requestedTime),
      reschedule_reason: rescheduleData.reason,
      appointment_id: rescheduleData.appointmentId
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.RESCHEDULE_REQUEST,
      templateParams
    );
  }

  // Send reschedule approval/rejection to student (via Mailtrap)
  async sendRescheduleResponse(responseData) {
    const templateId = responseData.approved ? 
      this.MAILTRAP_TEMPLATES.RESCHEDULE_APPROVED : 
      this.MAILTRAP_TEMPLATES.RESCHEDULE_REJECTED;

    const templateParams = {
      to_email: responseData.studentEmail,
      to_name: responseData.studentName,
      lecturer_name: responseData.lecturerName,
      original_date: this.formatDateTime(responseData.originalDate, responseData.originalTime),
      status: responseData.approved ? 'approved' : 'rejected',
      appointment_id: responseData.appointmentId
    };

    if (responseData.approved) {
      templateParams.new_date = this.formatDateTime(responseData.newDate, responseData.newTime);
    } else {
      templateParams.rejection_reason = responseData.rejectionReason || 'No reason provided';
    }

    return await this.sendMailtrapEmail(templateId, templateParams);
  }

  // Send slot booked alert to lecturer (via Mailtrap)
  async sendSlotBookedAlert(bookingData) {
    const templateParams = {
      to_email: bookingData.lecturerEmail,
      to_name: bookingData.lecturerName,
      student_name: bookingData.studentName,
      student_email: bookingData.studentEmail,
      student_id: bookingData.studentId || 'N/A',
      appointment_date: this.formatDateTime(bookingData.date, bookingData.time),
      appointment_purpose: bookingData.purpose,
      booking_id: bookingData.bookingId,
      booking_time: new Date().toLocaleString()
    };

    return await this.sendMailtrapEmail(
      this.MAILTRAP_TEMPLATES.SLOT_BOOKED_ALERT,
      templateParams
    );
  }

  // Schedule automatic reminders
  async scheduleReminders(appointmentData) {
    const appointmentDateTime = new Date(`${appointmentData.date} ${appointmentData.time}`);
    const now = new Date();
    
    // Calculate reminder times
    const reminder24h = new Date(appointmentDateTime.getTime() - (24 * 60 * 60 * 1000));
    const reminder1h = new Date(appointmentDateTime.getTime() - (1 * 60 * 60 * 1000));
    
    const reminders = [];
    
    // Schedule 24-hour reminder
    if (reminder24h > now) {
      const timeUntil24h = reminder24h - now;
      setTimeout(async () => {
        await this.sendAppointmentReminder(appointmentData, '24h');
      }, timeUntil24h);
      reminders.push({ type: '24h', scheduledFor: reminder24h });
    }
    
    // Schedule 1-hour reminder
    if (reminder1h > now) {
      const timeUntil1h = reminder1h - now;
      setTimeout(async () => {
        await this.sendAppointmentReminder(appointmentData, '1h');
      }, timeUntil1h);
      reminders.push({ type: '1h', scheduledFor: reminder1h });
    }
    
    return reminders;
  }

  // Send multiple notifications (batch)
  async sendBatchNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      let result;
      
      switch (notification.type) {
        case 'otp':
          result = await this.sendOTPEmail(
            notification.data.email,
            notification.data.passcode,
            notification.data.time
          );
          break;
        case 'reminder':
          result = await this.sendAppointmentReminder(notification.data, notification.reminderType);
          break;
        case 'booking_confirmation':
          result = await this.sendBookingConfirmation(notification.data);
          break;
        case 'booking_approved':
          result = await this.sendBookingApproved(notification.data);
          break;
        case 'booking_cancelled':
          result = await this.sendBookingCancelled(notification.data);
          break;
        case 'reschedule_request':
          result = await this.sendRescheduleRequest(notification.data);
          break;
        case 'reschedule_response':
          result = await this.sendRescheduleResponse(notification.data);
          break;
        case 'slot_booked_alert':
          result = await this.sendSlotBookedAlert(notification.data);
          break;
        default:
          result = { success: false, error: 'Unknown notification type' };
      }
      
      results.push({
        type: notification.type,
        success: result.success,
        error: result.error || null
      });
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  // Environment switcher for production/development
  async sendEmail(type, data, options = {}) {
    const isProduction = options.production || false;
    
    switch (type) {
      case 'otp':
        // Always use Mailgun for OTP (production)
        return await this.sendOTPEmail(data.email, data.passcode, data.time);
        
      case 'appointment':
        // Use Mailtrap for appointment emails (testing)
        // In production, you could switch this to Mailgun
        if (isProduction) {
          console.log('🚀 Production mode: Would send via Mailgun');
          // return await this.sendMailgunEmail(templateId, templateParams);
        }
        return await this.sendMailtrapEmail(data.templateId, data.templateParams);
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  }
}

// Create global instance
window.HybridEmailService = new HybridEmailNotificationService();

// Backward compatibility - keep the original EmailService name
window.EmailService = window.HybridEmailService;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HybridEmailNotificationService;
} 