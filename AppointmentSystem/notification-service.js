class NotificationService {
  constructor() {
    this.notifications = [];
    this.currentUser = null;
    this.userType = null;
    this.db = null;
    this.initialized = false;
    this.emailService = null;
  }

  async initialize(db) {
    this.db = db;
    this.initialized = true;
    
    if (typeof EmailService !== 'undefined') {
      this.emailService = new EmailService();
      console.log('📧 EmailService initialized in NotificationService');
    } else {
      console.warn('⚠️ EmailService not available - email notifications will be skipped');
    }
    
    if (this.currentUser) {
      await this.loadNotifications();
    }
    this.initializeDropdown();
  }

  setUser(email, type) {
    this.currentUser = email;
    this.userType = type;
    if (this.initialized) {
      this.loadNotifications();
    }
  }

  async loadNotifications() {
    if (!this.currentUser || !this.db) return;
    
    try {
      const { collection, query, where, orderBy, getDocs, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(
        notificationsRef,
        where('userEmail', '==', this.currentUser),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      this.notifications = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        this.notifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
        });
      });
      
      this.updateUI();
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
      this.updateUI();
    }
  }

  async saveNotifications() {
    if (!this.currentUser || !this.db) return;
    
    try {
      const { collection, addDoc, updateDoc, deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      // For now, we'll just update the UI since notifications are loaded from Firebase
      this.updateUI();
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async addNotification(notification) {
    if (!this.currentUser || !this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const newNotification = {
        userEmail: this.currentUser,
        userType: this.userType,
        ...notification,
        timestamp: serverTimestamp(),
        read: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(this.db, 'notifications'), newNotification);
      
      this.notifications.unshift({
        id: docRef.id,
        ...newNotification,
        timestamp: new Date().toISOString()
      });
      
      this.updateUI();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  async addStudentBookedAppointment(data) {
    await this.addNotification({
      type: 'student_booked_appointment',
      title: 'Appointment Booked',
      message: `You have booked an appointment with ${data.lecturerName} at ${data.time}`,
      icon: 'fa-user-clock',
      category: 'Appointments'
    });
  }

  async addLecturerCancelledAppointment(data) {
    await this.addNotification({
      type: 'lecturer_cancelled_appointment',
      title: 'Appointment Cancelled',
      message: `${data.lecturerName} have cancelled your appointment booking for ${data.time}`,
      icon: 'fa-calendar-times',
      category: 'Appointments'
    });
  }

  async addLecturerApprovedAppointment(data) {
    await this.addNotification({
      type: 'lecturer_approved_appointment',
      title: 'Appointment Approved',
      message: `${data.lecturerName} have approved your appointment booking for ${data.time}`,
      icon: 'fa-check-circle',
      category: 'Appointments'
    });
  }

  async addLecturerRejectedAppointment(data) {
    await this.addNotification({
      type: 'lecturer_rejected_appointment',
      title: 'Appointment Rejected',
      message: `${data.lecturerName} have rejected your appointment slot request for ${data.time}`,
      icon: 'fa-times-circle',
      category: 'Appointments'
    });
  }

  async addStudentRequestedNewSlot(data) {
    await this.addNotification({
      type: 'student_requested_new_slot',
      title: 'Slot Request Sent',
      message: `Your slot request has been sent to ${data.lecturerName} for ${data.time}`,
      icon: 'fa-paper-plane',
      category: 'Requests'
    });
  }

  async addStudentBookedSlot(data) {
    await this.addNotification({
      type: 'student_booked_slot',
      title: 'Slot Booked',
      message: `${data.studentName} have booked your appointment slot for ${data.time}`,
      icon: 'fa-user-clock',
      category: 'Bookings'
    });
  }

  async addStudentRequestedSlot(data) {
    await this.addNotification({
      type: 'student_requested_slot',
      title: 'Slot Request',
      message: `${data.studentName} have request for appointment slot for ${data.time}`,
      icon: 'fa-user-plus',
      category: 'Bookings'
    });
  }

  async addStudentRescheduleRequest(data) {
    await this.addNotification({
      type: 'student_reschedule_request',
      title: 'Reschedule Request',
      message: `${data.studentName} have requested reschedule of appointment for ${data.time}`,
      icon: 'fa-user-edit',
      category: 'Bookings'
    });
  }

  async addStudentCancelRequest(data) {
    await this.addNotification({
      type: 'student_cancel_request',
      title: 'Cancellation Request',
      message: `${data.studentName} have requested cancellation of appointment slot at ${data.time}`,
      icon: 'fa-user-times',
      category: 'Bookings'
    });
  }

  // LECTURER ACTION NOTIFICATIONS
  async addLecturerAcceptedSlotRequest(data) {
    await this.addNotification({
      type: 'lecturer_accepted_slot_request',
      title: 'Slot Request Accepted',
      message: `${data.studentName} (${data.studentEmail})'s slot request for ${data.date} at ${data.time} has been accepted and a slot was created.`,
      icon: 'fa-calendar-check',
      category: 'Appointments'
    });
  }

  async addLecturerRejectedSlotRequest(data) {
    await this.addNotification({
      type: 'lecturer_rejected_slot_request',
      title: 'Slot Request Rejected',
      message: `${data.studentName} (${data.studentEmail})'s slot request for ${data.date} at ${data.time} was rejected.`,
      icon: 'fa-times-circle',
      category: 'Appointments'
    });
  }

  // ENHANCED FUNCTION TO SEND BOTH IN-APP AND EMAIL NOTIFICATIONS
  async sendNotificationToUser(userEmail, userType, notificationData) {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const newNotification = {
        userEmail: userEmail,
        userType: userType,
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false,
        createdAt: serverTimestamp()
      };
      
      // Send in-app notification
      await addDoc(collection(this.db, 'notifications'), newNotification);
      console.log('📱 In-app notification sent to:', userEmail);
      
      // Send email notification with real data
      await this.sendEmailNotification(userEmail, userType, notificationData);
      
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  // NEW METHOD TO SEND EMAIL NOTIFICATIONS BASED ON NOTIFICATION TYPE
  async sendEmailNotification(userEmail, userType, notificationData) {
    if (!this.emailService) {
      console.warn('⚠️ EmailService not available - skipping email notification');
      return;
    }

    try {
      const { type, title, message, appointmentData = {} } = notificationData;
      console.log(`📧 Sending email notification: ${type} to ${userEmail}`);

      // Use direct appointment data if provided, otherwise extract from message
      let realAppointmentData = appointmentData;
      if (!realAppointmentData || Object.keys(realAppointmentData).length === 0) {
        realAppointmentData = this.extractAppointmentData(message);
      }
      
      // Handle different notification types using correct email service methods with REAL data
      switch (type) {
        case 'lecturer_approved_appointment':
          await this.emailService.sendBookingConfirmation(
            userEmail,
            realAppointmentData.studentName,
            realAppointmentData.lecturerName,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.meetingLink || null
          );
          break;

        case 'lecturer_rejected_appointment':
          await this.emailService.sendLecturerRejectedAppointment(
            userEmail,  // Student email
            realAppointmentData.studentName,
            realAppointmentData.lecturerName,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.reason || 'No specific reason provided'
          );
          break;

        case 'lecturer_cancelled_appointment':
          await this.emailService.sendLecturerCancelledAppointment(
            userEmail,  // Student email
            realAppointmentData.studentName,
            realAppointmentData.lecturerName,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.reason || 'No specific reason provided'
          );
          break;

        case 'student_booked_slot':
          await this.emailService.sendStudentBookedSlot(
            userEmail,  // Lecturer email
            realAppointmentData.lecturerName,
            realAppointmentData.studentName,
            realAppointmentData.studentEmail,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.purpose || 'General consultation'
          );
          break;

        case 'student_requested_slot':
          await this.emailService.sendStudentRequestedSlot(
            userEmail,  // Lecturer email
            realAppointmentData.lecturerName,
            realAppointmentData.studentName,
            realAppointmentData.studentEmail,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.purpose || 'General consultation'
          );
          break;

        case 'student_requested_new_slot':
          // This is a confirmation to the student that their request was sent
          await this.emailService.sendPlainEmail(
            userEmail,
            `Slot Request Sent\n\nYour request for an appointment slot has been successfully sent to ${realAppointmentData.lecturerName}.\n\nRequested Details:\nDate: ${realAppointmentData.date}\nTime: ${realAppointmentData.time}\nPurpose: ${realAppointmentData.purpose}\n\nThe lecturer will review your request and create a slot if approved.\n\nThis is an automated message from the University Booking System.`
          );
          break;

        case 'student_reschedule_request':
          await this.emailService.sendStudentRescheduleRequest(
            userEmail,  // Lecturer email
            realAppointmentData.lecturerName,
            realAppointmentData.studentName,
            realAppointmentData.studentEmail,
            realAppointmentData.originalDate || realAppointmentData.date,
            realAppointmentData.originalTime || realAppointmentData.time,
            realAppointmentData.newDate,
            realAppointmentData.newTime,
            realAppointmentData.reason || 'No specific reason provided'
          );
          break;

        case 'student_cancel_request':
          await this.emailService.sendStudentCancelRequest(
            userEmail,  // Lecturer email
            realAppointmentData.lecturerName,
            realAppointmentData.studentName,
            realAppointmentData.studentEmail,
            realAppointmentData.date,
            realAppointmentData.time,
            realAppointmentData.reason || 'No specific reason provided'
          );
          break;

        case 'lecturer_accepted_slot_request':
          // This is a notification for the lecturer about their own action
          // Usually no email needed, but we can send a confirmation
          await this.emailService.sendPlainEmail(
            userEmail,
            `Slot Request Accepted\n\nYou have successfully accepted a slot request from ${realAppointmentData.studentName} for ${realAppointmentData.date} at ${realAppointmentData.time}.\n\nThis is an automated message from the University Booking System.`
          );
          break;

        case 'lecturer_rejected_slot_request':
          // This is a notification for the lecturer about their own action
          // Usually no email needed, but we can send a confirmation
          await this.emailService.sendPlainEmail(
            userEmail,
            `Slot Request Rejected\n\nYou have rejected a slot request from ${realAppointmentData.studentName} for ${realAppointmentData.date} at ${realAppointmentData.time}.\n\nThis is an automated message from the University Booking System.`
          );
          break;

        default:
          // Generic email notification
          await this.emailService.sendPlainEmail(
            userEmail,
            `${title}\n\n${message}\n\nThis is an automated message from the University Booking System.`
          );
          break;
      }

      console.log(`✅ Email notification sent successfully: ${type}`);
    } catch (error) {
      console.error(`❌ Failed to send email notification: ${type}`, error);
      // Don't throw error - email failures shouldn't break the notification system
    }
  }

  // HELPER METHOD TO EXTRACT APPOINTMENT DATA FROM NOTIFICATION MESSAGES
  extractAppointmentData(message) {
    const data = {};
    
    // Extract names
    const lecturerMatch = message.match(/(.+?) have (approved|rejected|cancelled)/);
    if (lecturerMatch) {
      data.lecturerName = lecturerMatch[1];
    }
    
    const studentMatch = message.match(/(.+?) have (booked|requested|request)/);
    if (studentMatch) {
      data.studentName = studentMatch[1];
    }
    
    // Extract date and time
    const dateTimeMatch = message.match(/for (.+?) (\d{1,2}:\d{2} (?:AM|PM))/);
    if (dateTimeMatch) {
      data.date = dateTimeMatch[1];
      data.time = dateTimeMatch[2];
    }
    
    // Extract full time range
    const timeRangeMatch = message.match(/(\d{1,2}:\d{2} (?:AM|PM) - \d{1,2}:\d{2} (?:AM|PM))/);
    if (timeRangeMatch) {
      data.time = timeRangeMatch[1];
    }
    
    // Extract date and time patterns for various message formats
    const datePattern = /(\w+,?\s+\w+\s+\d{1,2},?\s+\d{4})/;
    const timePattern = /(\d{1,2}:\d{2}\s+(?:AM|PM)(?:\s+-\s+\d{1,2}:\d{2}\s+(?:AM|PM))?)/;
    
    const dateMatch = message.match(datePattern);
    if (dateMatch) {
      data.date = dateMatch[1];
    }
    
    const timeMatchFull = message.match(timePattern);
    if (timeMatchFull) {
      data.time = timeMatchFull[1];
    }
    
    // Extract reason from messages
    const reasonMatch = message.match(/reason:?\s*(.+?)(?:\.|$)/i);
    if (reasonMatch) {
      data.reason = reasonMatch[1].trim();
    }
    
    // Extract new date/time for reschedule requests
    const rescheduleMatch = message.match(/reschedule.*?to\s+(.+?)\s+(\d{1,2}:\d{2}\s+(?:AM|PM))/i);
    if (rescheduleMatch) {
      data.newDate = rescheduleMatch[1];
      data.newTime = rescheduleMatch[2];
    }
    
    // Extract student email from message context or use a default
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      data.studentEmail = emailMatch[1];
    }
    
    // Extract purpose
    const purposeMatch = message.match(/purpose:?\s*(.+?)(?:\.|$)/i);
    if (purposeMatch) {
      data.purpose = purposeMatch[1].trim();
    }
    
    return data;
  }

  async markAsRead(notificationId) {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      await updateDoc(doc(this.db, 'notifications', notificationId), {
        read: true
      });
      
      // Update local notification
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.updateUI();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const unreadNotifications = this.notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await updateDoc(doc(this.db, 'notifications', notification.id), {
          read: true
        });
        notification.read = true;
      }
      
      this.updateUI();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId) {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      await deleteDoc(doc(this.db, 'notifications', notificationId));
      
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.updateUI();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async clearAllNotifications() {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      for (const notification of this.notifications) {
        await deleteDoc(doc(this.db, 'notifications', notification.id));
      }
      
      this.notifications = [];
      this.updateUI();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  updateUI() {
    const badge = document.getElementById('notification-badge');
    const dropdown = document.getElementById('notification-dropdown');
    
    if (badge) {
      const unreadCount = this.getUnreadCount();
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    if (dropdown) {
      this.renderNotifications();
    }
  }

  renderNotifications() {
    const container = document.getElementById('notification-list');
    if (!container) return;
    
    if (this.notifications.length === 0) {
      container.innerHTML = '<div class="notification-item empty">No notifications</div>';
      return;
    }
    
    container.innerHTML = this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
        <div class="notification-content">
          <div class="notification-header-item">
            <i class="fa ${notification.icon || 'fa-bell'}" style="color: #10B981; margin-right: 8px;"></i>
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
          </div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-actions-item">
            ${!notification.read ? `<button class="notification-btn-item mark-read" onclick="window.NotificationService.markAsRead('${notification.id}')">Mark as Read</button>` : ''}
            <button class="notification-btn-item delete" onclick="window.NotificationService.deleteNotification('${notification.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }

  showToast(message) {
    // Simple toast notification (optional)
    console.log('Toast:', message);
  }

  initializeDropdown() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    console.log('🔍 NotificationService - Button found:', notificationBtn);
    console.log('🔍 NotificationService - Dropdown found:', notificationDropdown);
    
    if (notificationBtn && notificationDropdown) {
      const newBtn = notificationBtn.cloneNode(true);
      notificationBtn.parentNode.replaceChild(newBtn, notificationBtn);
      
      newBtn.addEventListener('click', (e) => {
        console.log('🔔 NotificationService - Button clicked!');
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
        console.log('📱 NotificationService - Dropdown should be:', notificationDropdown.classList.contains('show') ? 'visible' : 'hidden');
        console.log('📱 NotificationService - Dropdown classes:', notificationDropdown.className);
      });
      
      document.addEventListener('click', (e) => {
        if (!newBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
          notificationDropdown.classList.remove('show');
        }
      });
      
      console.log('✅ NotificationService - Event listeners added');
    } else {
      console.error('❌ NotificationService - Button or dropdown not found!');
      console.log('Available elements:', {
        notificationBtn: document.getElementById('notification-btn'),
        notificationDropdown: document.getElementById('notification-dropdown'),
        allButtons: document.querySelectorAll('button'),
        allDropdowns: document.querySelectorAll('.notification-dropdown')
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mark-read')) {
        const notificationId = e.target.closest('.notification-item').dataset.id;
        this.markAsRead(notificationId);
      } else if (e.target.classList.contains('delete')) {
        const notificationId = e.target.closest('.notification-item').dataset.id;
        this.deleteNotification(notificationId);
      }
    });
  }
}

if (!window.NotificationService) {
  window.NotificationService = new NotificationService();
  console.log('✅ NotificationService created');
} else {
  console.log('⚠️ NotificationService already exists, skipping creation');
}

// Initialize dropdown when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.NotificationService) {
    window.NotificationService.initializeDropdown();
    window.NotificationService.setupEventListeners();
    console.log('✅ NotificationService dropdown initialized');
  }
}); 