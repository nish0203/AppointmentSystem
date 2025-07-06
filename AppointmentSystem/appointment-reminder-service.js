// Automatic Appointment Reminder Service
class AppointmentReminderService {
    constructor() {
        this.db = null;
        this.emailService = null;
        this.reminderInterval = null;
        this.checkIntervalMinutes = 60; // Check every hour
        this.reminderHours = 24; // Send reminder 24 hours before
        this.sentReminders = new Set(); // Track sent reminders
        
        console.log('📅 AppointmentReminderService initialized');
    }

    async initialize(db, emailService) {
        this.db = db;
        this.emailService = emailService;
        
        // Load previously sent reminders from localStorage
        this.loadSentReminders();
        
        // Start the reminder checking process
        this.startReminderScheduler();
        
        console.log('✅ Appointment reminder service started');
        console.log(`🔄 Checking every ${this.checkIntervalMinutes} minutes for appointments in ${this.reminderHours} hours`);
    }

    startReminderScheduler() {
        // Check immediately on start
        this.checkForUpcomingAppointments();
        
        // Then check every hour
        this.reminderInterval = setInterval(() => {
            this.checkForUpcomingAppointments();
        }, this.checkIntervalMinutes * 60 * 1000);
    }

    stopReminderScheduler() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = null;
            console.log('⏹️ Appointment reminder scheduler stopped');
        }
    }

    async checkForUpcomingAppointments() {
        if (!this.db || !this.emailService) {
            console.warn('⚠️ Database or EmailService not available for reminders');
            return;
        }

        try {
            console.log('🔍 Checking for upcoming appointments...');
            
            // Import Firebase functions
            const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
            
            // Get current time and 24-hour window
            const now = new Date();
            const reminderTime = new Date(now.getTime() + (this.reminderHours * 60 * 60 * 1000));
            const windowStart = new Date(reminderTime.getTime() - (30 * 60 * 1000)); // 30 min before
            const windowEnd = new Date(reminderTime.getTime() + (30 * 60 * 1000)); // 30 min after
            
            console.log(`⏰ Looking for appointments between ${windowStart.toLocaleString()} and ${windowEnd.toLocaleString()}`);
            
            // Query for approved appointments
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('status', '==', 'approved')
            );
            
            const querySnapshot = await getDocs(appointmentsQuery);
            const upcomingAppointments = [];
            
            querySnapshot.forEach((doc) => {
                const appointment = { id: doc.id, ...doc.data() };
                
                // Parse appointment date and time
                const appointmentDateTime = this.parseAppointmentDateTime(appointment.date, appointment.startTime);
                
                if (appointmentDateTime && appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd) {
                    // Check if we haven't already sent a reminder for this appointment
                    const reminderKey = `${appointment.id}_24h`;
                    if (!this.sentReminders.has(reminderKey)) {
                        upcomingAppointments.push(appointment);
                    }
                }
            });
            
            console.log(`📋 Found ${upcomingAppointments.length} appointments needing 24-hour reminders`);
            
            // Send reminders for each appointment
            for (const appointment of upcomingAppointments) {
                await this.sendAppointmentReminders(appointment);
            }
            
        } catch (error) {
            console.error('❌ Error checking for upcoming appointments:', error);
        }
    }

    parseAppointmentDateTime(dateStr, timeStr) {
        try {
            // Handle different date formats
            let appointmentDate;
            
            // Try parsing common date formats
            if (dateStr.includes(',')) {
                // Format: "Monday, January 15, 2024"
                appointmentDate = new Date(dateStr);
            } else if (dateStr.includes('-')) {
                // Format: "2024-01-15"
                appointmentDate = new Date(dateStr);
            } else if (dateStr.toLowerCase() === 'today') {
                appointmentDate = new Date();
            } else if (dateStr.toLowerCase() === 'tomorrow') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
            } else {
                appointmentDate = new Date(dateStr);
            }
            
            // Parse time (format: "10:00 AM" or "14:00")
            let timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (!timeMatch) return null;
            
            let hours = parseInt(timeMatch[1]);
            let minutes = parseInt(timeMatch[2]);
            let ampm = timeMatch[3];
            
            if (ampm) {
                if (ampm.toUpperCase() === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }
            }
            
            appointmentDate.setHours(hours, minutes, 0, 0);
            
            return appointmentDate;
        } catch (error) {
            console.error('❌ Error parsing appointment date/time:', error, { dateStr, timeStr });
            return null;
        }
    }

    async sendAppointmentReminders(appointment) {
        try {
            console.log(`📧 Sending 24-hour reminders for appointment: ${appointment.id}`);
            
            const appointmentDateTime = this.parseAppointmentDateTime(appointment.date, appointment.startTime);
            const formattedDate = appointmentDateTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = `${appointment.startTime} - ${appointment.endTime}`;
            
            // Send reminder to student
            if (appointment.studentEmail) {
                await this.emailService.sendAppointmentReminder(
                    appointment.studentEmail,
                    appointment.studentName || 'Student',
                    'Your appointment is in 24 hours',
                    formattedDate,
                    formattedTime,
                    appointment.lecturerName || 'Lecturer',
                    appointment.purpose || 'General consultation'
                );
                console.log(`✅ 24h reminder sent to student: ${appointment.studentEmail}`);
            }
            
            // Send reminder to lecturer
            if (appointment.lecturerEmail) {
                await this.emailService.sendAppointmentReminder(
                    appointment.lecturerEmail,
                    appointment.lecturerName || 'Lecturer',
                    'You have an appointment in 24 hours',
                    formattedDate,
                    formattedTime,
                    appointment.studentName || 'Student',
                    appointment.purpose || 'General consultation'
                );
                console.log(`✅ 24h reminder sent to lecturer: ${appointment.lecturerEmail}`);
            }
            
            // Mark this reminder as sent
            const reminderKey = `${appointment.id}_24h`;
            this.sentReminders.add(reminderKey);
            this.saveSentReminders();
            
            console.log(`📝 Marked reminder as sent: ${reminderKey}`);
            
        } catch (error) {
            console.error(`❌ Error sending reminders for appointment ${appointment.id}:`, error);
        }
    }

    loadSentReminders() {
        try {
            const saved = localStorage.getItem('appointment_reminders_sent');
            if (saved) {
                const reminderArray = JSON.parse(saved);
                this.sentReminders = new Set(reminderArray);
                console.log(`📁 Loaded ${this.sentReminders.size} previously sent reminders`);
            }
        } catch (error) {
            console.error('❌ Error loading sent reminders:', error);
            this.sentReminders = new Set();
        }
    }

    saveSentReminders() {
        try {
            const reminderArray = Array.from(this.sentReminders);
            localStorage.setItem('appointment_reminders_sent', JSON.stringify(reminderArray));
        } catch (error) {
            console.error('❌ Error saving sent reminders:', error);
        }
    }

    // Clean up old reminder records (older than 7 days)
    cleanupOldReminders() {
        try {
            const now = new Date();
            const cutoffTime = now.getTime() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
            
            const originalSize = this.sentReminders.size;
            this.sentReminders.forEach(reminderKey => {
                // If the reminder key contains a timestamp, check if it's old
                if (reminderKey.includes('_')) {
                    const parts = reminderKey.split('_');
                    if (parts.length > 1) {
                        // For now, we'll keep all reminders since we don't store timestamps
                        // In a real implementation, you might want to add timestamps
                    }
                }
            });
            
            const cleanedSize = this.sentReminders.size;
            if (cleanedSize < originalSize) {
                console.log(`🧹 Cleaned up ${originalSize - cleanedSize} old reminder records`);
                this.saveSentReminders();
            }
        } catch (error) {
            console.error('❌ Error cleaning up reminders:', error);
        }
    }

    // Manual trigger for testing
    async triggerReminderCheck() {
        console.log('🔧 Manual reminder check triggered');
        await this.checkForUpcomingAppointments();
    }

    // Get statistics
    getStats() {
        return {
            sentReminders: this.sentReminders.size,
            checkInterval: this.checkIntervalMinutes,
            reminderHours: this.reminderHours,
            isRunning: this.reminderInterval !== null
        };
    }
}

// Create global instance
window.AppointmentReminderService = new AppointmentReminderService(); 