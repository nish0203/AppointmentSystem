// Ultra Simple EmailJS Service - Plain Text Only
// Uses EXACTLY the same format as your working OTP emails

/**
 * REQUIRED EMAILJS TEMPLATES:
 * You need to create these templates in your EmailJS dashboard (service_mailgun):
 * 
 * EXISTING TEMPLATES:
 * 1. template_otp                     - OTP and fallback emails
 * 2. booking_confirmation             - Appointment booking confirmations  
 * 3. slot_booked_alert               - Lecturer notifications when student books
 * 4. cancellation_notification       - General cancellation notifications
 * 5. appointment_reminder            - 24-hour appointment reminders
 * 
 * NEW TEMPLATES TO CREATE:
 * 6. rejected_appointment   - When lecturer rejects student appointment
 * 7. cancelled_appointment  - When lecturer cancels confirmed appointment
 * 8. booked_slot            - When student books appointment slot
 * 9. requested_slot         - When student requests new slot creation
 * 10. cancel_request        - When student requests cancellation
 * 11. reschedule_request    - When student requests reschedule
 * 
 * TEMPLATE PARAMETERS:
 * All templates should include these basic fields:
 * - {{email}} (required recipient field)
 * - {{student_name}}, {{lecturer_name}}
 * - {{appointment_date}}, {{appointment_time}}
 * - {{rejection_reason}}, {{cancellation_reason}}, {{reschedule_reason}}
 * - Additional fields as documented in each method below
 */

class EmailService {
    constructor() {
        this.serviceId = 'service_mailgun';
        this.publicKey = 'CO_25CIKuZ9YpYqQt';
        this.templateId = 'template_otp';
    }

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
                    this.templateId,
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
                email: lecturerEmail,
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
                'slot_booked_alert',
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
                email: email,
                recipient_name: name,
                student_name: studentName || name,
                lecturer_name: lecturerName || 'Lecturer',
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
                email: email,
                recipient_name: recipientName,
                reminder_timing: reminderTiming,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                other_party_name: otherPartyName,
                purpose: purpose
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

    async sendLecturerRejectedAppointment(studentEmail, studentName, lecturerName, appointmentDate, appointmentTime, rejectionReason = '') {
        try {
            console.log(`📧 Sending lecturer rejection notification to ${studentEmail} via EmailJS...`);
            
            const templateParams = {
                email: studentEmail,
                student_name: studentName,
                lecturer_name: lecturerName,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                rejection_reason: rejectionReason || 'No specific reason provided'
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: rejected_appointment');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'rejected_appointment',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Lecturer rejection notification sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send lecturer rejection notification:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendLecturerCancelledAppointment(studentEmail, studentName, lecturerName, appointmentDate, appointmentTime, cancellationReason = '') {
        try {
            console.log(`📧 Sending lecturer cancellation notification to ${studentEmail} via EmailJS...`);
            
            const templateParams = {
                email: studentEmail,             // Required: recipient email
                student_name: studentName,
                lecturer_name: lecturerName,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                cancellation_reason: cancellationReason || 'No specific reason provided'
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: cancelled_appointment');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'cancelled_appointment',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Lecturer cancellation notification sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send lecturer cancellation notification:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendStudentBookedSlot(lecturerEmail, lecturerName, studentName, studentEmail, appointmentDate, appointmentTime, purpose = 'General consultation') {
        try {
            console.log(`📧 Sending student booking notification to ${lecturerEmail} via EmailJS...`);
            
            const templateParams = {
                email: lecturerEmail,            // Required: recipient email
                lecturer_name: lecturerName,
                student_name: studentName,
                student_email: studentEmail,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                purpose: purpose
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: booked_slot');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'booked_slot',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Student booking notification sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send student booking notification:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendStudentRequestedSlot(lecturerEmail, lecturerName, studentName, studentEmail, appointmentDate, appointmentTime, purpose = 'General consultation') {
        try {
            console.log(`📧 Sending student slot request notification to ${lecturerEmail} via EmailJS...`);
            
            const templateParams = {
                email: lecturerEmail,            // Required: recipient email
                lecturer_name: lecturerName,
                student_name: studentName,
                student_email: studentEmail,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                purpose: purpose
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: requested_slot');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'requested_slot',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Student slot request notification sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send student slot request notification:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendStudentCancelRequest(lecturerEmail, lecturerName, studentName, studentEmail, appointmentDate, appointmentTime, cancellationReason = '') {
        try {
            console.log(`📧 Sending student cancellation request to ${lecturerEmail} via EmailJS...`);
            
            const templateParams = {
                email: lecturerEmail,            // Required: recipient email
                lecturer_name: lecturerName,
                student_name: studentName,
                student_email: studentEmail,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                cancellation_reason: cancellationReason || 'No specific reason provided'
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: cancel_request');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'cancel_request',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Student cancellation request sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send student cancellation request:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }

    async sendStudentRescheduleRequest(lecturerEmail, lecturerName, studentName, studentEmail, originalDate, originalTime, newDate, newTime, rescheduleReason = '') {
        try {
            console.log(`📧 Sending student reschedule request to ${lecturerEmail} via EmailJS...`);
            
            const templateParams = {
                email: lecturerEmail,            // Required: recipient email
                lecturer_name: lecturerName,
                student_name: studentName,
                student_email: studentEmail,
                original_date: originalDate,
                original_time: originalTime,
                new_date: newDate,
                new_time: newTime,
                reschedule_reason: rescheduleReason || 'No specific reason provided'
            };
            
            console.log('📤 Template params:', templateParams);
            console.log('📧 Using template ID: reschedule_request');
            console.log('🔑 Using service ID:', this.serviceId);
            console.log('🔑 Using public key:', this.publicKey);
            
            const response = await emailjs.send(
                this.serviceId,
                'reschedule_request',
                templateParams,
                { publicKey: this.publicKey }
            );

            console.log('✅ Student reschedule request sent successfully via EmailJS');
            return { success: true, result: response };
            
        } catch (error) {
            console.error('❌ Failed to send student reschedule request:', error);
            console.error('❌ Error details:', error);
            throw error;
        }
    }
}

// Create global instance
window.emailService = new EmailService(); 