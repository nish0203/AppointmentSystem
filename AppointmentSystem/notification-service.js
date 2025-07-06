class NotificationService {
  constructor() {
    this.notifications = [];
    this.currentUser = null;
    this.userType = null;
    this.db = null;
    this.initialized = false;
  }

  async initialize(db) {
    this.db = db;
    this.initialized = true;
    if (this.currentUser) {
      await this.loadNotifications();
    }
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
      // Import Firebase functions dynamically
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
      // Fallback to empty array
      this.notifications = [];
      this.updateUI();
    }
  }

  async saveNotifications() {
    if (!this.currentUser || !this.db) return;
    
    try {
      // Import Firebase functions dynamically
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
      
      // Add to local array with the document ID
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

  // STUDENT NOTIFICATIONS
  async addStudentBookedAppointment(data) {
    await this.addNotification({
      type: 'student_booked_appointment',
      title: 'Appointment Booked',
      message: `You have booked an appointment for ${data.lecturerName} for ${data.time}`,
      icon: 'fa-calendar-check',
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

  // LECTURER NOTIFICATIONS
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

  // HELPER FUNCTION TO SEND NOTIFICATIONS TO OTHER USERS
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
      
      await addDoc(collection(this.db, 'notifications'), newNotification);
      console.log('Notification sent to:', userEmail);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
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
      
      // Remove from local array
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
      // Remove any existing event listeners to prevent duplicates
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
    // Set up event listeners for notification actions
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

// Create global instance only if it doesn't exist
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