document.getElementById('search-btn').addEventListener('click', function() {
    const keyword = document.getElementById('search-lecturer').value.trim().toLowerCase();
    const errorDiv = document.getElementById('search-error');
    errorDiv.textContent = '';
    if (keyword.includes('asma')) {
      window.location.href = 'lecturer-profile.html';
    } else {
      errorDiv.textContent = 'Lecturer not found';
    }
  });
  
// Your existing search lecturer script...

// Collapsible functionality
document.querySelectorAll('.collapsible h3').forEach(h3 => {
  h3.addEventListener('click', function() {
    const card = this.parentElement;
    card.classList.toggle('active');
  });
});


// Toggle the dropdown
document.querySelector('.book-main-btn').addEventListener('click', function () {
  const dropdown = document.querySelector('.booking-dropdown');
  dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
});

// Manage booking and cancel buttons
const bookButtons = document.querySelectorAll('.time-book-btn');
const cancelButtons = document.querySelectorAll('.cancel-btn');

bookButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    // Hide all cancel buttons first
    cancelButtons.forEach(c => c.style.display = 'none');

    // Show only the corresponding cancel button
    cancelButtons[index].style.display = 'inline-block';
  });
});

cancelButtons.forEach((cancelBtn, index) => {
  cancelBtn.addEventListener('click', () => {
    // Hide this cancel button
    cancelBtn.style.display = 'none';
  });
});

function bookTime(slot) {
// First hide all cancel buttons
document.getElementById('cancel-8am-10am').style.display = 'none';
    document.getElementById('cancel-10am-12pm').style.display = 'none';
    document.getElementById('cancel-4pm-6pm').style.display = 'none';

// Then show only the selected cancel button
var cancelButton = document.getElementById('cancel-' + slot);
if (cancelButton) {
  cancelButton.style.display = 'inline-block';
} else {
  console.log('Cancel button not found for slot:', slot);
}
}

function cancelTime(slot) {
// Hide the cancel button for that slot
var cancelButton = document.getElementById('cancel-' + slot);
if (cancelButton) {
  cancelButton.style.display = 'none';
}
}




flatpickr("#appointment-date", {
inline: true,
minDate: "today",
dateFormat: "Y-m-d"
});

let currentRating = 0;

function openFeedback() {
  document.getElementById('feedbackModal').style.display = 'flex';
}

function closeFeedback() {
  document.getElementById('feedbackModal').style.display = 'none';
}

function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('#stars span');
  stars.forEach((star, index) => {
    star.textContent = index < rating ? '⭐' : '☆';
  });
}

function submitFeedback() {
  const text = document.getElementById('feedbackText').value;
  alert(`Thank you!\nRating: ${currentRating} star(s)\nFeedback: ${text}`);
  closeFeedback();
}