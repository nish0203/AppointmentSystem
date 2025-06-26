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

    // Appointment email methods (plain text versions)
    async sendBookingConfirmation(studentEmail, studentName, lecturerName, appointmentDate, appointmentTime, meetingLink = null) {
        const message = `
🎓 APPOINTMENT CONFIRMED!

Dear ${studentName},

Your appointment has been successfully booked with ${lecturerName}.

📅 APPOINTMENT DETAILS:
Date: ${appointmentDate}
Time: ${appointmentTime}
Lecturer: ${lecturerName}
${meetingLink ? `Meeting Link: ${meetingLink}` : ''}

Please make sure to attend your appointment on time. If you need to reschedule or cancel, please contact your lecturer in advance.

This is an automated message from the University Booking System.
Please do not reply to this email.
        `.trim();
        
        return await this.sendPlainEmail(studentEmail, message);
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

    async sendCancellationNotification(email, name, appointmentDate, appointmentTime, reason = '') {
        const message = `
❌ APPOINTMENT CANCELLED

Dear ${name},

Your appointment scheduled for ${appointmentDate} at ${appointmentTime} has been cancelled.

${reason ? `Reason: ${reason}` : ''}

Please book a new appointment if needed.

This is an automated message from the University Booking System.
        `.trim();
        
        return await this.sendPlainEmail(email, message);
    }

    async sendAppointmentReminder(email, name, appointmentDate, appointmentTime, lecturerName) {
        const message = `
⏰ APPOINTMENT REMINDER

Dear ${name},

This is a friendly reminder about your upcoming appointment:

Date: ${appointmentDate}
Time: ${appointmentTime}
Lecturer: ${lecturerName}

Please be on time. Thank you!

This is an automated reminder from the University Booking System.
        `.trim();
        
        return await this.sendPlainEmail(email, message);
    }
}

// Create global instance
window.emailService = new EmailService(); 