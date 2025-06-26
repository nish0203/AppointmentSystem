// Email Notification Service for Appointment System
// Using EmailJS with Mailgun backend

class EmailNotificationService {
  constructor() {
    this.SERVICE_ID = "service_mailgun";
    this.PUBLIC_KEY = "CO_25CIKuZ9YpYqQt";
    
    // Email Templates for different notifications
    this.TEMPLATES = {
      APPOINTMENT_REMINDER: "template_appointment_reminder",
      BOOKING_CONFIRMATION: "template_booking_confirmation", 
      BOOKING_APPROVED: "template_booking_approved",
      BOOKING_CANCELLED: "template_booking_cancelled",
      RESCHEDULE_REQUEST: "template_reschedule_request",
      RESCHEDULE_APPROVED: "template_reschedule_approved",
      RESCHEDULE_REJECTED: "template_reschedule_rejected",
      SLOT_BOOKED_ALERT: "template_slot_booked_alert",
      OTP_LOGIN: "template_otp"
    };
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: this.PUBLIC_KEY });
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

  // Calculate time until appointment for reminders
  getTimeUntilAppointment(appointmentDate, appointmentTime) {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
    const timeDiff = appointmentDateTime - now;
    const hoursUntil = Math.ceil(timeDiff / (1000 * 60 * 60));
    return hoursUntil;
  }

  // Send appointment reminder (24 hours and 1 hour before)
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.APPOINTMENT_REMINDER,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log(`✅ ${reminderType} reminder sent successfully:`, response);
      return { success: true, response };
    } catch (error) {
      console.error(`❌ Failed to send ${reminderType} reminder:`, error);
      return { success: false, error };
    }
  }

  // Send booking confirmation to student
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.BOOKING_CONFIRMATION,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log('✅ Booking confirmation sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send booking confirmation:', error);
      return { success: false, error };
    }
  }

  // Send booking approval notification to student
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.BOOKING_APPROVED,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log('✅ Booking approval sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send booking approval:', error);
      return { success: false, error };
    }
  }

  // Send booking cancellation notification
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.BOOKING_CANCELLED,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log('✅ Cancellation notification sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send cancellation notification:', error);
      return { success: false, error };
    }
  }

  // Send reschedule request notification to lecturer
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.RESCHEDULE_REQUEST,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log('✅ Reschedule request sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send reschedule request:', error);
      return { success: false, error };
    }
  }

  // Send reschedule approval/rejection to student
  async sendRescheduleResponse(responseData) {
    const templateId = responseData.approved ? 
      this.TEMPLATES.RESCHEDULE_APPROVED : 
      this.TEMPLATES.RESCHEDULE_REJECTED;

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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        templateId,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log(`✅ Reschedule ${responseData.approved ? 'approval' : 'rejection'} sent:`, response);
      return { success: true, response };
    } catch (error) {
      console.error(`❌ Failed to send reschedule ${responseData.approved ? 'approval' : 'rejection'}:`, error);
      return { success: false, error };
    }
  }

  // Send slot booked alert to lecturer
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

    try {
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATES.SLOT_BOOKED_ALERT,
        templateParams,
        { publicKey: this.PUBLIC_KEY }
      );
      console.log('✅ Slot booked alert sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to send slot booked alert:', error);
      return { success: false, error };
    }
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
}

// Create global instance
window.EmailService = new EmailNotificationService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailNotificationService;
} 