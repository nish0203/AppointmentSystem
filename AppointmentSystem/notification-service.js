class NotificationService {
  constructor() {
    this.notifications = [];
    this.currentUser = null;
    this.userType = null;
    this.loadNotifications();
  }

  setUser(email, type) {
    this.currentUser = email;
    this.userType = type;
    this.loadNotifications();
  }

  loadNotifications() {
    if (!this.currentUser) return;
    const stored = localStorage.getItem(`notifications_${this.currentUser}`);
    this.notifications = stored ? JSON.parse(stored) : [];
    this.updateUI();
  }

  saveNotifications() {
    if (!this.currentUser) return;
    localStorage.setItem(`notifications_${this.currentUser}`, JSON.stringify(this.notifications));
    this.updateUI();
  }

  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.updateUI();
  }

  // Appointment-related notifications
  addAppointmentBooked(data) {
    this.addNotification({
      type: 'appointment_booked',
      title: 'Appointment Booked',
      message: `Your appointment with ${data.lecturerName} has been booked for ${data.date} at ${data.time}`,
      icon: 'fa-calendar-check',
      category: 'Appointments'
    });
  }

  addAppointmentApproved(data) {
    this.addNotification({
      type: 'appointment_approved',
      title: 'Appointment Approved',
      message: `Your appointment with ${data.lecturerName} on ${data.date} has been approved`,
      icon: 'fa-check-circle',
      category: 'Appointments'
    });
  }

  addAppointmentRejected(data) {
    this.addNotification({
      type: 'appointment_rejected',
      title: 'Appointment Rejected',
      message: `Your appointment request with ${data.lecturerName} has been rejected. Reason: ${data.reason || 'Not specified'}`,
      icon: 'fa-times-circle',
      category: 'Appointments'
    });
  }

  addAppointmentCancelled(data) {
    this.addNotification({
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment with ${data.lecturerName} on ${data.date} has been cancelled`,
      icon: 'fa-calendar-times',
      category: 'Appointments'
    });
  }

  addAppointmentReminder(data) {
    this.addNotification({
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with ${data.lecturerName} ${data.timing}`,
      icon: 'fa-bell',
      category: 'Reminders'
    });
  }

  // For lecturers
  addSlotBookedAlert(data) {
    this.addNotification({
      type: 'slot_booked',
      title: 'New Appointment Request',
      message: `${data.studentName} has booked your slot on ${data.date} at ${data.time}`,
      icon: 'fa-user-clock',
      category: 'Bookings'
    });
  }

  addInquiryReceived(data) {
    this.addNotification({
      type: 'inquiry_received',
      title: 'New Inquiry Received',
      message: `You have received a new inquiry from ${data.studentName}: "${data.subject}"`,
      icon: 'fa-question-circle',
      category: 'Inquiries'
    });
  }

  // System notifications
  addSystemUpdate(data) {
    this.addNotification({
      type: 'system_update',
      title: data.title || 'System Update',
      message: data.message,
      icon: 'fa-info-circle',
      category: 'System'
    });
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
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
             <button class="mark-read-btn" onclick="window.NotificationService.markAsRead(${notification.id})">
               ${notification.read ? 'Read' : 'Mark as read'}
             </button>
             <button class="delete-btn" onclick="window.NotificationService.deleteNotification(${notification.id})">
               Delete
             </button>
           </div>
        </div>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    
    return time.toLocaleDateString();
  }

  showToast(message) {
    // Toast notifications disabled
    return;
  }

  initializeDropdown() {
    // Create notification dropdown HTML if it doesn't exist
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

    // Find the header-right container and insert notification dropdown as first child
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      headerRight.insertAdjacentHTML('afterbegin', notificationHTML);
      this.setupEventListeners();
      this.updateUI();
    } else {
      // Fallback: Find the logout wrapper and insert notification dropdown before it
      const logoutWrapper = document.querySelector('.logout-wrapper');
      if (logoutWrapper) {
        logoutWrapper.insertAdjacentHTML('beforebegin', notificationHTML);
        this.setupEventListeners();
        this.updateUI();
      }
    }
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