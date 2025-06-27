// Ultra Simple EmailJS Service - Plain Text Only
// Uses EXACTLY the same format as your working OTP emails

class EmailService {
    constructor() {
        // Your existing EmailJS credentials (already working for OTP)
        this.serviceId = 'service_mailgun';
        this.publicKey = 'CO_25CIKuZ9YpYqQt';
        this.templateId = 'template_otp'; // Your existing working template
    }

    // OTP emails (unchanged - already working)
    async sendOTP(email, code) {
        try {
            console.log(`📧 Sending OTP to ${email} via EmailJS...`);
            
            const expiry = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();
            
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                {
                    email: email,
                    passcode: code,
                    time: expiry
                },
                { publicKey: this.publicKey }
            );

            console.log('✅ OTP sent successfully via EmailJS');
            return response;
            
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            throw error;
        }
    }

    // Send appointment emails as plain text (same format as OTP)
    async sendPlainEmail(toEmail, messageText) {
        try {
            console.log(`📧 Sending email to ${toEmail} via EmailJS...`);
            
            const expiry = new Date(Date.now() + 15 * 60 * 1000).toLocaleString();
            
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                {
                    email: toEmail,
                    passcode: '', // Empty for non-OTP emails
                    time: messageText // Put the message content in the 'time' field
                },
                { publicKey: this.publicKey }
            );

            console.log('✅ Email sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send email via EmailJS:', error);
            throw error;
        }
    }

    // Appointment email methods (using proper templates)
    async sendBookingConfirmation(studentEmail, studentName, lecturerName, appointmentDate, appointmentTime, meetingLink = null) {
        try {
            console.log(`📧 Sending booking confirmation to ${studentEmail} via EmailJS...`);
            
            // First try the new template, fallback to OTP template if not available
            let templateId = 'booking_confirmation';
            let templateParams = {
                email: studentEmail,           // Required: recipient email
                student_name: studentName,
                lecturer_name: lecturerName,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                meeting_link: meetingLink || ''
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID:', templateId);
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            try {
                const response = await emailjs.send(
                    this.serviceId,
                    templateId,
                    templateParams,
                    { publicKey: this.publicKey }
                );

                console.log('✅ Booking confirmation sent successfully via EmailJS');
                return { success: true, result: response };
                
            } catch (templateError) {
                console.warn('⚠️ booking_confirmation template not found, falling back to OTP template...');
                console.error('❌ Detailed template error:', templateError);
                console.log('🔍 Response status:', templateError.status);
                console.log('🔍 Response text:', templateError.text);
                
                // Fallback to OTP template with formatted message
                const fallbackMessage = `
🎓 APPOINTMENT CONFIRMED!

Dear ${studentName},

Your appointment has been successfully booked with ${lecturerName}.

📅 APPOINTMENT DETAILS:
Date: ${appointmentDate}
Time: ${appointmentTime}
Lecturer: ${lecturerName}
${meetingLink ? `Meeting Link: ${meetingLink}` : ''}

Please make sure to attend your appointment on time.

This is an automated message from the University Booking System.
                `.trim();
                
                const fallbackParams = {
                    email: studentEmail,
                    passcode: '',
                    time: fallbackMessage
                };
                
                const fallbackResponse = await emailjs.send(
                    this.serviceId,
                    this.templateId, // Use OTP template
                    fallbackParams,
                    { publicKey: this.publicKey }
                );

                console.log('✅ Booking confirmation sent via fallback OTP template');
                return { success: true, result: fallbackResponse, usedFallback: true };
            }
            
        } catch (error) {
            console.error('❌ Failed to send booking confirmation:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendSlotBookedAlert(lecturerEmail, lecturerName, studentName, appointmentDate, appointmentTime, studentEmail = 'student@example.com', purpose = 'General consultation') {
        try {
            console.log(`📚 Sending slot booked alert to ${lecturerEmail} via EmailJS...`);
            
            const templateParams = {
                email: lecturerEmail,  // Use same field name as working OTP
                lecturer_name: lecturerName,
                student_name: studentName,
                student_email: studentEmail,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                purpose: purpose
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: slot_booked_alert');
            console.log('🔑 Using service ID:', this.serviceId);
            
            const response = await emailjs.send(
                this.serviceId,
                'slot_booked_alert', // Use the new template
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Slot booked alert sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send slot booked alert:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendCancellationNotification(email, name, appointmentDate, appointmentTime, reason = '', lecturerName = '', studentName = '') {
        try {
            console.log(`📧 Sending cancellation notification to ${email} via EmailJS...`);
            
            const templateParams = {
                email: email,                      // Required: recipient email
                recipient_name: name,              // Name of recipient (student or lecturer)
                student_name: studentName || name, // Student's name
                lecturer_name: lecturerName || 'Lecturer', // Lecturer's name
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                cancellation_reason: reason || ''
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: cancellation_notification');
            
            const response = await emailjs.send(
                this.serviceId,
                'cancellation_notification',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Cancellation notification sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send cancellation notification:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendAppointmentReminder(email, recipientName, reminderTiming, appointmentDate, appointmentTime, otherPartyName, purpose = 'General consultation') {
        try {
            console.log(`📧 Sending appointment reminder to ${email} via EmailJS...`);
            
            const templateParams = {
                email: email,                    // Required: recipient email
                recipient_name: recipientName,  // Name of recipient
                reminder_timing: reminderTiming, // Flexible timing message
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                other_party_name: otherPartyName,
                purpose: purpose                 // Simple purpose field
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: appointment_reminder');
            console.log('⏰ Reminder timing:', reminderTiming);
            
            const response = await emailjs.send(
                this.serviceId,
                'appointment_reminder',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Appointment reminder sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send appointment reminder:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }
}

// Create global instance
window.emailService = new EmailService(); 