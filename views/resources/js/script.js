// --- NEW: track which event is being edited (null = create mode)
let editingIndex = null;

const events = [];

function updateLocationOptions(modality) {
  const locationField = document.getElementById('location_field');
  const remoteField = document.getElementById('remote_field');

  if (modality === 'in-person') {
    locationField.style.display = 'block';
    remoteField.style.display = 'none';
  } else if (modality === 'remote') {
    locationField.style.display = 'none';
    remoteField.style.display = 'block';
  }
}

// --- NEW: fill the modal form from an event object
function fillFormFromEvent(eventDetails) {
  document.getElementById('event_name').value = eventDetails.name;
  document.getElementById('event_weekday').value = eventDetails.weekday;
  document.getElementById('event_time').value = eventDetails.time;
  document.getElementById('event_modality').value = eventDetails.modality;

  updateLocationOptions(eventDetails.modality);

  document.getElementById('event_location').value = eventDetails.location || '';
  document.getElementById('event_remote_url').value = eventDetails.remote_url || '';
  document.getElementById('event_attendees').value = eventDetails.attendees;
  document.getElementById('event_category').value = eventDetails.category;
}

// --- NEW: clear calendar then re-render all events (keeps UI consistent if weekday/time changes)
function rerenderCalendar() {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  // remove existing event cards
  days.forEach((dayId) => {
    const dayDiv = document.getElementById(dayId);
    const existing = dayDiv.querySelectorAll('.event');
    existing.forEach((el) => el.remove());
  });

  // add all events back
  events.forEach((evt, idx) => addEventToCalendarUI(evt, idx));
}

function saveEvent() {
  const name = document.getElementById('event_name').value.trim();
  const weekday = document.getElementById('event_weekday').value;
  const time = document.getElementById('event_time').value;
  const modality = document.getElementById('event_modality').value;
  const location = document.getElementById('event_location').value.trim();
  const remote_url = document.getElementById('event_remote_url').value.trim();
  const attendees = document.getElementById('event_attendees').value.trim();
  const category = document.getElementById('event_category').value;

  if (!name || !weekday || !time || !attendees || !category) {
    alert('Please fill in all required fields.');
    return;
  }

  if (modality === 'remote') {
    if (!remote_url) {
      alert('Please enter the Remote URL for a remote event.');
      return;
    }
    const pattern = /^https?:\/\/.+/;
    if (!pattern.test(remote_url)) {
      alert('Remote URL must start with http:// or https://');
      return;
    }
  }

  let eventDetails = {
    name,
    weekday,
    time,
    modality,
    location: modality === 'in-person' ? location : null,
    remote_url: modality === 'remote' ? remote_url : null,
    attendees,
    category
  };

  // --- UPDATED: create vs update
  if (editingIndex === null) {
    events.push(eventDetails);
  } else {
    events[editingIndex] = eventDetails;
  }

  // redraw calendar so changes (including weekday) show correctly
  rerenderCalendar();

  // reset to create mode
  editingIndex = null;
  document.getElementById('event_form').reset();
  updateLocationOptions('in-person');

  const eventModalInstance = bootstrap.Modal.getInstance(document.getElementById('event_modal'));
  eventModalInstance.hide();

  console.log(events);
}

// --- UPDATED: accept index so clicking a card knows which event it is
function addEventToCalendarUI(eventInfo, index) {
  let eventCard = createEventCard(eventInfo, index);
  const dayDiv = document.getElementById(eventInfo.weekday.toLowerCase());
  dayDiv.appendChild(eventCard);
}

// --- UPDATED: add click handler to open modal + prefill
function createEventCard(eventDetails, index) {
  let eventElement = document.createElement('div');
  eventElement.classList = 'event row border rounded m-1 py-1';

  // store which event this card represents
  eventElement.dataset.index = index;

  // click -> open modal with prefilled values
  eventElement.addEventListener('click', function () {
    editingIndex = Number(this.dataset.index);

    // title change (optional but helpful)
    document.querySelector('#event_modal .modal-title').innerText = 'Update Event';

    fillFormFromEvent(events[editingIndex]);

    const modal = new bootstrap.Modal(document.getElementById('event_modal'));
    modal.show();
  });

  // Set background color based on category
  let bgColor = '';
  switch (eventDetails.category) {
    case 'work':
      bgColor = '#d1e7dd';
      break;
    case 'academic':
      bgColor = '#cff4fc';
      break;
    case 'personal':
      bgColor = '#e3d7fc';
      break;
    default:
      bgColor = '#f8d7da';
  }
  eventElement.style.backgroundColor = bgColor;

  let info = document.createElement('div');

  let html = `<strong>Event Name:</strong><br>${eventDetails.name}<br>`;
  html += `<strong>Time:</strong><br>${eventDetails.time}<br>`;
  html += `<strong>Modality:</strong><br>${eventDetails.modality}<br>`;

  if (eventDetails.modality === 'in-person') {
    html += `<strong>Location:</strong><br>${eventDetails.location}<br>`;
  } else if (eventDetails.modality === 'remote') {
    html += `<strong>Remote URL:</strong><br>${eventDetails.remote_url}<br>`;
  }

  html += `<strong>Attendees:</strong><br>${eventDetails.attendees}<br>`;
  html += `<strong>Category:</strong><br>${eventDetails.category}<br>`;

  info.innerHTML = html;
  eventElement.appendChild(info);

  return eventElement;
}

const createBtn = document.querySelector('.btn-primary.mt-3');
const eventModal = new bootstrap.Modal(document.getElementById('event_modal'));

createBtn.addEventListener('click', function () {
  // set create mode
  editingIndex = null;

  document.querySelector('#event_modal .modal-title').innerText = 'Create Event';

  document.getElementById('event_form').reset();
  updateLocationOptions('in-person');
  eventModal.show();
});
