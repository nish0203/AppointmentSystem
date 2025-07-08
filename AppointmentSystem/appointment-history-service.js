// Automatic Appointment History Management Service
class AppointmentHistoryService {
    constructor() {
        this.db = null;
        this.notificationService = null;
        this.historyCheckInterval = null;
        this.checkIntervalMinutes = 30; // Check every 30 minutes
        this.processedAppointments = new Set(); // Track processed appointments
        
        console.log('🕒 AppointmentHistoryService initialized');
    }

    async initialize(db) {
        this.db = db;
        
        // Initialize NotificationService if available
        if (window.NotificationService) {
            this.notificationService = window.NotificationService;
            console.log('📱 NotificationService connected to AppointmentHistoryService');
        }
        
        // Start the automatic history management
        this.startHistoryManagement();
        
        console.log('✅ AppointmentHistoryService initialized with database connection');
    }

    startHistoryManagement() {
        // Run initial check
        this.checkForPastAppointments();
        
        // Set up periodic checks
        this.historyCheckInterval = setInterval(() => {
            this.checkForPastAppointments();
        }, this.checkIntervalMinutes * 60 * 1000); // Convert to milliseconds
        
        console.log(`🔄 History management started - checking every ${this.checkIntervalMinutes} minutes`);
    }

    stopHistoryManagement() {
        if (this.historyCheckInterval) {
            clearInterval(this.historyCheckInterval);
            this.historyCheckInterval = null;
            console.log('⏹️ History management stopped');
        }
    }

    async checkForPastAppointments() {
        if (!this.db) {
            console.warn('⚠️ Database not initialized for history management');
            return;
        }

        try {
            console.log('🔍 Checking for past appointments to move to history...');
            
            // Import Firebase functions dynamically
            const { collection, query, where, getDocs, updateDoc, doc } = 
                await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
            
            // Get all approved appointments
            const appointmentsQuery = query(
                collection(this.db, 'appointments'),
                where('status', '==', 'approved')
            );
            
            const querySnapshot = await getDocs(appointmentsQuery);
            const pastAppointments = [];
            const currentDateTime = new Date();
            
            console.log(`📋 Found ${querySnapshot.size} approved appointments to check`);
            
            querySnapshot.forEach((doc) => {
                const appointment = { id: doc.id, ...doc.data() };
                
                // Parse appointment date and time
                const appointmentDateTime = this.parseAppointmentDateTime(appointment.date, appointment.endTime);
                
                if (appointmentDateTime && currentDateTime > appointmentDateTime) {
                    // Check if we haven't already processed this appointment
                    const appointmentKey = `${appointment.id}_completed`;
                    if (!this.processedAppointments.has(appointmentKey)) {
                        pastAppointments.push(appointment);
                    }
                }
            });
            
            console.log(`⏰ Found ${pastAppointments.length} appointments that have passed their scheduled time`);
            
            // Process each past appointment
            for (const appointment of pastAppointments) {
                await this.moveAppointmentToHistory(appointment);
            }
            
            if (pastAppointments.length > 0) {
                console.log(`✅ Successfully moved ${pastAppointments.length} appointments to history`);
            }
            
        } catch (error) {
            console.error('❌ Error checking for past appointments:', error);
        }
    }

    parseAppointmentDateTime(dateStr, timeStr) {
        try {
            if (!dateStr || !timeStr) {
                console.warn('⚠️ Missing date or time for appointment');
                return null;
            }
            
            // Parse date (expecting YYYY-MM-DD format or readable date)
            let appointmentDate;
            if (dateStr.includes('-')) {
                appointmentDate = new Date(dateStr);
            } else {
                appointmentDate = new Date(dateStr);
            }
            
            if (isNaN(appointmentDate.getTime())) {
                console.warn('⚠️ Invalid date format:', dateStr);
                return null;
            }
            
            // Parse time (expecting HH:MM AM/PM format)
            const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!timeMatch) {
                console.warn('⚠️ Invalid time format:', timeStr);
                return null;
            }
            
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const ampm = timeMatch[3].toUpperCase();
            
            // Convert to 24-hour format
            if (ampm === 'PM' && hours !== 12) {
                hours += 12;
            } else if (ampm === 'AM' && hours === 12) {
                hours = 0;
            }
            
            // Combine date and time
            const appointmentDateTime = new Date(appointmentDate);
            appointmentDateTime.setHours(hours, minutes, 0, 0);
            
            return appointmentDateTime;
            
        } catch (error) {
            console.error('❌ Error parsing appointment date/time:', error);
            return null;
        }
    }

    async moveAppointmentToHistory(appointment) {
        try {
            // Import Firebase functions dynamically
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
            
            // Update appointment status to 'done' (completed)
            await updateDoc(doc(this.db, 'appointments', appointment.id), {
                status: 'done',
                completedAt: new Date().toISOString(),
                autoCompletedBy: 'system',
                autoCompletedReason: 'Appointment time has passed'
            });
            
            // Mark as processed
            const appointmentKey = `${appointment.id}_completed`;
            this.processedAppointments.add(appointmentKey);
            
            console.log(`✅ Moved appointment to history: ${appointment.id} (${appointment.date} ${appointment.startTime}-${appointment.endTime})`);
            
            // Send notification to both student and lecturer
            await this.sendHistoryNotifications(appointment);
            
        } catch (error) {
            console.error('❌ Error moving appointment to history:', error);
        }
    }

    async sendHistoryNotifications(appointment) {
        if (!this.notificationService) {
            console.warn('⚠️ NotificationService not available - skipping history notifications');
            return;
        }

        try {
            const notificationData = {
                type: 'appointment_completed',
                title: 'Appointment Completed',
                icon: 'fa-check-circle',
                category: 'Appointments',
                appointmentData: {
                    studentName: appointment.studentName,
                    lecturerName: appointment.lecturerName,
                    studentEmail: appointment.studentEmail,
                    lecturerEmail: appointment.lecturerEmail,
                    date: appointment.date,
                    time: `${appointment.startTime} - ${appointment.endTime}`,
                    purpose: appointment.purpose || 'General consultation'
                }
            };

            // Send notification to student
            await this.notificationService.sendNotificationToUser(
                appointment.studentEmail, 
                'student', 
                {
                    ...notificationData,
                    message: `Your appointment with ${appointment.lecturerName || 'your lecturer'} on ${appointment.date} ${appointment.startTime}-${appointment.endTime} has been completed and moved to history.`
                }
            );

            // Send notification to lecturer
            await this.notificationService.sendNotificationToUser(
                appointment.lecturerEmail, 
                'lecturer', 
                {
                    ...notificationData,
                    message: `Your appointment with ${appointment.studentName || 'student'} on ${appointment.date} ${appointment.startTime}-${appointment.endTime} has been completed and moved to history.`
                }
            );

            console.log(`📧 History notifications sent for appointment: ${appointment.id}`);
            
        } catch (error) {
            console.error('❌ Error sending history notifications:', error);
        }
    }

    // Manual function to check and move specific appointment
    async moveSpecificAppointmentToHistory(appointmentId) {
        try {
            // Import Firebase functions dynamically
            const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
            
            const appointmentDoc = await getDoc(doc(this.db, 'appointments', appointmentId));
            
            if (!appointmentDoc.exists()) {
                console.error('❌ Appointment not found:', appointmentId);
                return false;
            }
            
            const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() };
            
            // Check if appointment is approved and time has passed
            if (appointment.status === 'approved') {
                const appointmentDateTime = this.parseAppointmentDateTime(appointment.date, appointment.endTime);
                const currentDateTime = new Date();
                
                if (appointmentDateTime && currentDateTime > appointmentDateTime) {
                    await this.moveAppointmentToHistory(appointment);
                    return true;
                } else {
                    console.log('⏰ Appointment time has not passed yet:', appointmentId);
                    return false;
                }
            } else {
                console.log('⚠️ Appointment is not approved:', appointmentId);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error moving specific appointment to history:', error);
            return false;
        }
    }

    // Get service status
    getStatus() {
        return {
            isRunning: this.historyCheckInterval !== null,
            checkIntervalMinutes: this.checkIntervalMinutes,
            processedCount: this.processedAppointments.size,
            dbConnected: this.db !== null,
            notificationServiceConnected: this.notificationService !== null
        };
    }

    // Clear processed appointments cache (for testing)
    clearProcessedCache() {
        this.processedAppointments.clear();
        console.log('🗑️ Cleared processed appointments cache');
    }
}

// Create global instance
if (!window.AppointmentHistoryService) {
    window.AppointmentHistoryService = new AppointmentHistoryService();
    console.log('✅ AppointmentHistoryService created globally');
} else {
    console.log('⚠️ AppointmentHistoryService already exists, skipping creation');
} 