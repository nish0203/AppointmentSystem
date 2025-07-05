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

  // Appointment-related notifications
  async addAppointmentBooked(data) {
    await this.addNotification({
      type: 'appointment_booked',
      title: 'Appointment Booked',
      message: `Your appointment with ${data.lecturerName} has been booked for ${data.date} at ${data.time}`,
      icon: 'fa-calendar-check',
      category: 'Appointments'
    });
  }

  async addAppointmentApproved(data) {
    await this.addNotification({
      type: 'appointment_approved',
      title: 'Appointment Approved',
      message: `Your appointment with ${data.lecturerName} on ${data.date} has been approved`,
      icon: 'fa-check-circle',
      category: 'Appointments'
    });
  }

  async addAppointmentRejected(data) {
    await this.addNotification({
      type: 'appointment_rejected',
      title: 'Appointment Rejected',
      message: `Your appointment request with ${data.lecturerName} has been rejected. Reason: ${data.reason || 'Not specified'}`,
      icon: 'fa-times-circle',
      category: 'Appointments'
    });
  }

  async addAppointmentCancelled(data) {
    await this.addNotification({
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment with ${data.lecturerName} on ${data.date} has been cancelled`,
      icon: 'fa-calendar-times',
      category: 'Appointments'
    });
  }

  async addAppointmentReminder(data) {
    await this.addNotification({
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with ${data.lecturerName} ${data.timing}`,
      icon: 'fa-bell',
      category: 'Reminders'
    });
  }

  // For lecturers
  async addSlotBookedAlert(data) {
    await this.addNotification({
      type: 'slot_booked',
      title: 'New Appointment Request',
      message: `${data.studentName} has booked your slot on ${data.date} at ${data.time}`,
      icon: 'fa-user-clock',
      category: 'Bookings'
    });
  }

  async addInquiryReceived(data) {
    await this.addNotification({
      type: 'inquiry_received',
      title: 'New Inquiry Received',
      message: `You have received a new inquiry from ${data.studentName}: "${data.subject}"`,
      icon: 'fa-question-circle',
      category: 'Inquiries'
    });
  }

  // System notifications
  async addSystemUpdate(data) {
    await this.addNotification({
      type: 'system_update',
      title: data.title || 'System Update',
      message: data.message,
      icon: 'fa-info-circle',
      category: 'System'
    });
  }

  async markAsRead(notificationId) {
    if (!this.db) return;
    
    try {
      // Import Firebase functions dynamically
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      await updateDoc(doc(this.db, 'notifications', notificationId), {
        read: true,
        updatedAt: new Date()
      });
      
      // Update local array
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
      const { collection, query, where, getDocs, doc, updateDoc, writeBatch } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(
        notificationsRef,
        where('userEmail', '==', this.currentUser),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(this.db);
      
      snapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true, updatedAt: new Date() });
      });
      
      await batch.commit();
      
      // Update local array
      this.notifications.forEach(n => n.read = true);
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
      
      // Update local array
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
      const { collection, query, where, getDocs, doc, deleteDoc, writeBatch } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
      
      const notificationsRef = collection(this.db, 'notifications');
      const q = query(notificationsRef, where('userEmail', '==', this.currentUser));
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(this.db);
      
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      await batch.commit();
      
      // Update local array
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
    const badge = document.getElementById('notification-badge') || document.getElementById('notification-count');
    const count = this.getUnreadCount();
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    this.renderNotifications();
  }

  renderNotifications() {
    const container = document.getElementById('notifications-list') || document.getElementById('notification-list');
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div class="no-notifications">
          <i class="fa fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
        <div class="notification-icon">
          <i class="fa ${notification.icon || 'fa-bell'}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
          </div>
          <p class="notification-message">${notification.message}</p>
          <div class="notification-actions">
            <button class="mark-read-btn" onclick="window.NotificationService.markAsRead('${notification.id}')">
              ${notification.read ? 'Read' : 'Mark as read'}
            </button>
            <button class="delete-btn" onclick="window.NotificationService.deleteNotification('${notification.id}')">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Toast notifications disabled
  showToast(message) {
    // Disabled for now
  }

  // Create notification dropdown HTML if it doesn't exist
  initializeDropdown() {
    // Check if notification dropdown already exists
    const existingDropdown = document.getElementById('notification-dropdown');
    if (existingDropdown) return;

    const notificationHTML = `
      <div class="notification-wrapper">
        <button class="notification-btn" id="notification-btn">
          <i class="fa fa-bell"></i>
          <span class="notification-badge" id="notification-badge">0</span>
        </button>
        <div class="notification-dropdown" id="notification-dropdown">
          <div class="notification-header">
            <h3>Notifications</h3>
            <div class="notification-controls">
              <button onclick="window.NotificationService.markAllAsRead()" class="mark-all-read">Mark all read</button>
              <button onclick="window.NotificationService.clearAllNotifications()" class="clear-all">Clear all</button>
            </div>
          </div>
          <div class="notifications-list" id="notifications-list">
            <!-- Notifications will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Try to find the header-right container and insert notification dropdown as first child
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      headerRight.insertAdjacentHTML('afterbegin', notificationHTML);
    } else {
      // Fallback: Find the logout wrapper and insert notification dropdown before it
      const logoutWrapper = document.querySelector('.logout-wrapper');
      if (logoutWrapper) {
        logoutWrapper.insertAdjacentHTML('beforebegin', notificationHTML);
      }
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
      
    if (notificationBtn && notificationDropdown) {
      notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
      });
      
      document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
          notificationDropdown.classList.remove('show');
        }
      });
    }
  }
}

// Create global instance
window.NotificationService = new NotificationService();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (window.NotificationService) {
    window.NotificationService.initializeDropdown();
  }
}); 