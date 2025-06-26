// Example Email Integration for Lecturer Management
// Add these functions to your lecturer-manage-slots.html or similar files

// Example: When lecturer approves an appointment
async function approveAppointmentWithEmail(appointmentId) {
  try {
    // Get appointment data
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    const appointmentData = appointmentDoc.data();
    
    // Update appointment status
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
    
    // Send approval email to student
    await EmailService.sendBookingApproved({
      studentEmail: appointmentData.studentEmail,
      studentName: appointmentData.studentName,
      lecturerName: appointmentData.lecturerName,
      date: appointmentData.date,
      time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      purpose: appointmentData.purpose,
      location: 'Office/Online - Details to be confirmed',
      bookingId: appointmentId,
      notes: 'Please be punctual and prepared for the meeting.'
    });
    
    // Schedule automatic reminders
    await EmailService.scheduleReminders({
      recipientEmail: appointmentData.studentEmail,
      recipientName: appointmentData.studentName,
      date: appointmentData.date,
      time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      purpose: appointmentData.purpose,
      otherPartyName: appointmentData.lecturerName,
      otherPartyEmail: appointmentData.lecturerEmail,
      appointmentId: appointmentId
    });
    
    // Also schedule reminders for lecturer
    await EmailService.scheduleReminders({
      recipientEmail: appointmentData.lecturerEmail,
      recipientName: appointmentData.lecturerName,
      date: appointmentData.date,
      time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      purpose: appointmentData.purpose,
      otherPartyName: appointmentData.studentName,
      otherPartyEmail: appointmentData.studentEmail,
      appointmentId: appointmentId
    });
    
    console.log('✅ Appointment approved and notifications sent');
    
  } catch (error) {
    console.error('❌ Error approving appointment:', error);
  }
}

// Example: When lecturer cancels an appointment
async function cancelAppointmentWithEmail(appointmentId, cancellationReason) {
  try {
    // Get appointment data
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    const appointmentData = appointmentDoc.data();
    
    // Update appointment status
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: cancellationReason
    });
    
    // Free up the slot
    if (appointmentData.slotId) {
      await updateDoc(doc(db, 'appointment_slots', appointmentData.slotId), {
        isBooked: false,
        bookedBy: null,
        appointmentId: null
      });
    }
    
    // Send cancellation email to student
    await EmailService.sendBookingCancelled({
      recipientEmail: appointmentData.studentEmail,
      recipientName: appointmentData.studentName,
      cancelledBy: appointmentData.lecturerName,
      date: appointmentData.date,
      time: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      reason: cancellationReason,
      bookingId: appointmentId,
      otherPartyName: appointmentData.lecturerName
    });
    
    console.log('✅ Appointment cancelled and notification sent');
    
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
  }
}

// Example: When student requests reschedule
async function handleRescheduleRequest(appointmentId, newDate, newTime, reason) {
  try {
    // Get appointment data
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    const appointmentData = appointmentDoc.data();
    
    // Create reschedule request record
    await addDoc(collection(db, 'reschedule_requests'), {
      appointmentId: appointmentId,
      studentEmail: appointmentData.studentEmail,
      lecturerEmail: appointmentData.lecturerEmail,
      originalDate: appointmentData.date,
      originalTime: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      requestedDate: newDate,
      requestedTime: newTime,
      reason: reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    
    // Send reschedule request email to lecturer
    await EmailService.sendRescheduleRequest({
      lecturerEmail: appointmentData.lecturerEmail,
      lecturerName: appointmentData.lecturerName,
      studentName: appointmentData.studentName,
      studentEmail: appointmentData.studentEmail,
      originalDate: appointmentData.date,
      originalTime: `${appointmentData.startTime} - ${appointmentData.endTime}`,
      requestedDate: newDate,
      requestedTime: newTime,
      reason: reason,
      appointmentId: appointmentId
    });
    
    console.log('✅ Reschedule request sent');
    
  } catch (error) {
    console.error('❌ Error sending reschedule request:', error);
  }
}

// Example: When lecturer responds to reschedule request
async function respondToRescheduleRequest(requestId, approved, rejectionReason = null) {
  try {
    // Get reschedule request data
    const requestDoc = await getDoc(doc(db, 'reschedule_requests', requestId));
    const requestData = requestDoc.data();
    
    // Update request status
    await updateDoc(doc(db, 'reschedule_requests', requestId), {
      status: approved ? 'approved' : 'rejected',
      respondedAt: new Date().toISOString(),
      rejectionReason: rejectionReason
    });
    
    if (approved) {
      // Update the original appointment
      await updateDoc(doc(db, 'appointments', requestData.appointmentId), {
        date: requestData.requestedDate,
        startTime: requestData.requestedTime.split(' - ')[0],
        endTime: requestData.requestedTime.split(' - ')[1],
        rescheduledAt: new Date().toISOString()
      });
      
      // Send approval email
      await EmailService.sendRescheduleResponse({
        studentEmail: requestData.studentEmail,
        studentName: requestData.studentName,
        lecturerName: requestData.lecturerName,
        originalDate: requestData.originalDate,
        originalTime: requestData.originalTime,
        newDate: requestData.requestedDate,
        newTime: requestData.requestedTime,
        approved: true,
        appointmentId: requestData.appointmentId
      });
      
      // Schedule new reminders
      await EmailService.scheduleReminders({
        recipientEmail: requestData.studentEmail,
        recipientName: requestData.studentName,
        date: requestData.requestedDate,
        time: requestData.requestedTime,
        purpose: 'Rescheduled appointment',
        otherPartyName: requestData.lecturerName,
        otherPartyEmail: requestData.lecturerEmail,
        appointmentId: requestData.appointmentId
      });
      
    } else {
      // Send rejection email
      await EmailService.sendRescheduleResponse({
        studentEmail: requestData.studentEmail,
        studentName: requestData.studentName,
        lecturerName: requestData.lecturerName,
        originalDate: requestData.originalDate,
        originalTime: requestData.originalTime,
        approved: false,
        rejectionReason: rejectionReason,
        appointmentId: requestData.appointmentId
      });
    }
    
    console.log(`✅ Reschedule request ${approved ? 'approved' : 'rejected'} and notification sent`);
    
  } catch (error) {
    console.error('❌ Error responding to reschedule request:', error);
  }
}

// Example: Batch send daily reminders
async function sendDailyReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Get all appointments for tomorrow
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('date', '==', tomorrowStr),
      where('status', '==', 'approved')
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const notifications = [];
    
    appointmentsSnapshot.forEach(doc => {
      const appointment = doc.data();
      
      // Add student reminder
      notifications.push({
        type: 'reminder',
        reminderType: '24h',
        data: {
          recipientEmail: appointment.studentEmail,
          recipientName: appointment.studentName,
          date: appointment.date,
          time: `${appointment.startTime} - ${appointment.endTime}`,
          purpose: appointment.purpose,
          otherPartyName: appointment.lecturerName,
          otherPartyEmail: appointment.lecturerEmail,
          appointmentId: doc.id
        }
      });
      
      // Add lecturer reminder
      notifications.push({
        type: 'reminder',
        reminderType: '24h',
        data: {
          recipientEmail: appointment.lecturerEmail,
          recipientName: appointment.lecturerName,
          date: appointment.date,
          time: `${appointment.startTime} - ${appointment.endTime}`,
          purpose: appointment.purpose,
          otherPartyName: appointment.studentName,
          otherPartyEmail: appointment.studentEmail,
          appointmentId: doc.id
        }
      });
    });
    
    // Send batch notifications
    const results = await EmailService.sendBatchNotifications(notifications);
    console.log(`✅ Sent ${results.length} daily reminders`);
    
  } catch (error) {
    console.error('❌ Error sending daily reminders:', error);
  }
}

// Example: Setup automatic reminder system
function setupAutomaticReminders() {
  // Run daily at 9 AM
  const now = new Date();
  const nineAM = new Date();
  nineAM.setHours(9, 0, 0, 0);
  
  if (now > nineAM) {
    nineAM.setDate(nineAM.getDate() + 1);
  }
  
  const timeUntilNineAM = nineAM - now;
  
  setTimeout(() => {
    sendDailyReminders();
    // Then set up daily interval
    setInterval(sendDailyReminders, 24 * 60 * 60 * 1000); // Every 24 hours
  }, timeUntilNineAM);
  
  console.log('✅ Automatic reminder system setup complete');
}

// Export functions for use in other files
window.EmailIntegration = {
  approveAppointmentWithEmail,
  cancelAppointmentWithEmail,
  handleRescheduleRequest,
  respondToRescheduleRequest,
  sendDailyReminders,
  setupAutomaticReminders
}; 