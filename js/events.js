/* ============================================================
   events.js — Event Cards, Countdown Timers, Registration
   ============================================================ */

'use strict';

const Events = {
  initialized: false,
  activeFilter: 'all',
  registered: new Set(JSON.parse(localStorage.getItem('sp-registered-events') || '[]')),
  saved: new Set(JSON.parse(localStorage.getItem('sp-saved-events') || '[]')),

  eventsData: [
    {
      id: 1,
      title: 'Git Merge Conflict Survival Guide',
      category: 'Git Versioning',
      type: 'online',
      description: 'A live interactive coding session where senior engineers show how to resolve terrifying 200-line merge conflicts without panic, tears, or resorting to git push --force on main. Bring your espresso.',
      image: 'images/event1.jpg',
      date: '2026-06-15',
      time: '2:00 PM – 4:00 PM',
      location: 'Virtual Zoom Workshop',
      price: 'Free',
      attendees: 1840,
      speakers: [
        { name: 'Kunal Shah',  role: 'Software Intern', company: 'ConnectX', avatar: 'images/user1.jpg' },
        { name: 'Rohit Sharma',    role: 'DevOps Architect',company: 'ConnectX', avatar: 'images/user3.jpg' },
      ]
    },
    {
      id: 2,
      title: 'React Layout Paint & Performance Tuning',
      category: 'Frontend Development',
      type: 'online',
      description: 'An intensive profiling masterclass covering laypaint loops, deep dependency arrays, and debugging slow rendering components.',
      image: 'images/event1.jpg',
      date: '2026-06-20',
      time: '10:00 AM – 1:00 PM',
      location: 'Online Broadcast',
      price: 'Free',
      attendees: 920,
      speakers: [
        { name: 'Sarah Chen', role: 'Frontend Intern', company: 'ConnectX', avatar: 'images/user2.jpg' },
        { name: 'Liam Vance', role: 'Senior Frontend Dev', company: 'ConnectX', avatar: 'images/user1.jpg' },
      ]
    },
    {
      id: 3,
      title: 'CSS Grid Alignment vs. Figma Mockup Battle',
      category: 'UI/UX Design',
      type: 'in-person',
      description: 'Watch a lead UI designer and a senior developer attempt to align the same complex dashboard layout under pressure in real-time.',
      image: 'images/event1.jpg',
      date: '2026-07-05',
      time: '4:00 PM – 6:30 PM',
      location: 'San Francisco, CA HQ',
      price: 'Free',
      attendees: 430,
      speakers: [
        { name: 'Emma Rodriguez', role: 'Design Lead', company: 'ConnectX', avatar: 'images/user3.jpg' },
      ]
    },
    {
      id: 4,
      title: 'AI Code Agents: Power Tool or Server Crash?',
      category: 'Artificial Intelligence',
      type: 'hybrid',
      description: 'A friendly debate exploring code generation agents, structural testing, and how to safely leverage AI in production codebases.',
      image: 'images/event1.jpg',
      date: '2026-07-18',
      time: '1:00 PM – 4:00 PM',
      location: 'HQ Auditorium + Zoom',
      price: 'Free',
      attendees: 2100,
      speakers: [
        { name: 'Aanya Patel', role: 'Data Sci Lead', company: 'ConnectX', avatar: 'images/user2.jpg' },
      ]
    },
    {
      id: 5,
      title: 'ConnectX Internship Demo Night',
      category: 'Networking',
      type: 'in-person',
      description: 'ConnectX engineering interns showcase their custom interactive interface tools. The best micro-animation widget wins a featured spotlight!',
      image: 'images/event1.jpg',
      date: '2026-08-02',
      time: '6:00 PM – 9:00 PM',
      location: 'HQ Main Lounge, SF',
      price: 'Free',
      attendees: 350,
      speakers: [
        { name: 'Kunal Shah', role: 'Software Intern', company: 'ConnectX', avatar: 'images/user1.jpg' },
        { name: 'Sarah Chen', role: 'Frontend Intern', company: 'ConnectX', avatar: 'images/user2.jpg' },
      ]
    }
  ],

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load custom events from localStorage
    const stored = localStorage.getItem('sp-events-data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.forEach(pe => {
          if (!this.eventsData.find(e => e.id === pe.id)) {
            this.eventsData.unshift(pe);
          }
        });
      } catch(e) {}
    }

    this.renderFilterBar();
    this.renderEvents();
    this.renderSpeakers();
    this.startAllCountdowns();
    this.initCreateEventForm();
  },

  renderFilterBar() {
    const bar = document.getElementById('events-filter-bar');
    if (!bar) return;

    const filters = ['All', 'Favorites', 'Online', 'In-Person', 'Hybrid', 'Free', 'Technology', 'Design', 'AI/ML'];
    bar.innerHTML = filters.map(f => {
      const isFav = f === 'Favorites';
      const label = isFav ? '<i class="fas fa-heart" style="color:var(--like);margin-right:4px;"></i> Favorites' : f;
      return `
      <button class="filter-chip ${f === 'All' ? 'active' : ''}"
              data-filter="${f.toLowerCase()}"
              onclick="Events.filterEvents('${f.toLowerCase()}')"
              aria-pressed="${f === 'All'}"
              aria-label="Filter by ${f}">
        ${label}
      </button>
    `}).join('');
  },

  filterEvents(filter) {
    this.activeFilter = filter;

    // Update filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      const isActive = chip.dataset.filter === filter;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', isActive);
    });

    this.renderEvents();
  },

  getFilteredEvents() {
    const f = this.activeFilter;
    if (f === 'all') return this.eventsData;
    if (f === 'favorites') {
      return this.eventsData.filter(e => this.saved.has(e.id));
    }
    return this.eventsData.filter(e =>
      e.type === f ||
      e.price.toLowerCase() === f ||
      e.category.toLowerCase() === f ||
      (f === 'free' && e.price === 'Free')
    );
  },

  renderEvents() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    const events = this.getFilteredEvents();
    if (!events.length) {
      if (this.activeFilter === 'favorites') {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;padding:var(--space-2xl) var(--space-lg);text-align:center;background:var(--surface-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);">
            <i class="fas fa-heart" style="font-size:3rem;color:var(--like);margin-bottom:var(--space-md);display:block;animation:heartbeat 1.5s infinite;"></i>
            <h3 style="font-size:var(--fs-md);font-weight:700;color:var(--text-primary);margin-bottom:6px;">No favorite events yet</h3>
            <p style="font-size:var(--fs-sm);color:var(--text-muted);max-width:320px;margin:0 auto;line-height:1.5;">Click the heart icon on any event card to save it here for quick access!</p>
          </div>`;
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;">
            <i class="fas fa-calendar-xmark"></i>
            <h3>No events found</h3>
            <p>Try a different filter</p>
          </div>`;
      }
      return;
    }

    grid.innerHTML = events.map(e => this.eventCardHTML(e)).join('');
    
    // Add keydown listeners for accessibility
    events.forEach(e => {
      const el = document.getElementById(`event-${e.id}`);
      if (el) {
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            if (ev.target.tagName !== 'BUTTON' && !ev.target.closest('button')) {
              ev.preventDefault();
              this.showDetails(e.id);
            }
          }
        });
      }
    });

    this.startAllCountdowns();
  },

  eventCardHTML(event) {
    const isReg = this.registered.has(event.id);
    const isSaved = this.saved.has(event.id);
    const isFree = event.price === 'Free';

    return `
    <article class="event-card" id="event-${event.id}" aria-label="Event: ${event.title}. Category: ${event.category}. Format: ${this.typeLabel(event.type)}. Click or press Enter to view details." tabindex="0" onclick="Events.showDetails(${event.id})">
      <div class="event-card-img-wrapper">
        <img src="${event.image}" alt="${event.title}" class="event-card-img" loading="lazy">
        <div class="event-card-img-overlay"></div>
        <div class="event-badge-row">
          <span class="event-type-badge ${event.type}">${this.typeLabel(event.type)}</span>
          <button class="event-save-btn ${isSaved ? 'saved' : ''}"
                  id="save-btn-${event.id}"
                  aria-label="${isSaved ? 'Unsave' : 'Save'} event"
                  onclick="event.stopPropagation(); Events.toggleSave(event, ${event.id})">
            <i class="fa${isSaved ? 's' : 'r'} fa-heart"></i>
          </button>
        </div>
        <div class="event-date-chip">
          <i class="fas fa-calendar"></i>
          ${this.formatDate(event.date)}
        </div>
      </div>
      <div class="event-card-body">
        <div class="event-card-category">${event.category}</div>
        <h3 class="event-card-title">${event.title}</h3>
        <p class="event-card-desc">${event.description}</p>
        <div class="event-card-meta">
          <div class="event-meta-item">
            <i class="fas fa-clock"></i> ${event.time}
          </div>
          <div class="event-meta-item">
            <i class="fas fa-map-marker-alt"></i> ${event.location}
          </div>
          <div class="event-meta-item">
            <i class="fas fa-users"></i> ${App.formatNumber(event.attendees)} attending
          </div>
        </div>
        <div class="countdown-timer" id="countdown-${event.id}" aria-label="Time remaining">
          <div class="countdown-unit"><div class="countdown-value" data-unit="days">--</div><div class="countdown-label">Days</div></div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit"><div class="countdown-value" data-unit="hours">--</div><div class="countdown-label">Hrs</div></div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit"><div class="countdown-value" data-unit="mins">--</div><div class="countdown-label">Min</div></div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit"><div class="countdown-value" data-unit="secs">--</div><div class="countdown-label">Sec</div></div>
        </div>
        <div class="event-attendees">
          <div class="attendee-stack">
            <img src="images/user1.jpg" alt="Attendee" class="avatar avatar-xs">
            <img src="images/user2.jpg" alt="Attendee" class="avatar avatar-xs">
            <img src="images/user3.jpg" alt="Attendee" class="avatar avatar-xs">
          </div>
          <span class="attendee-count">+${App.formatNumber(event.attendees - 3)} more</span>
        </div>
        <div class="event-card-footer">
          <div class="event-price ${isFree ? 'free' : ''}">
            ${isFree ? '🎟 Free' : event.price}
          </div>
          <button class="btn-register ${isReg ? 'registered' : ''}"
                  id="reg-btn-${event.id}"
                  onclick="event.stopPropagation(); Events.register(${event.id})"
                  aria-pressed="${isReg}">
            ${isReg ? '✓ Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    </article>`;
  },

  showDetails(eventId) {
    const event = this.eventsData.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('event-details-modal');
    const body = document.getElementById('event-details-body');
    const closeBtn = document.getElementById('event-details-close');
    if (!modal || !body) return;

    const isReg = this.registered.has(event.id);
    const isFree = event.price === 'Free';

    body.innerHTML = `
      <div style="position:relative; border-radius: var(--radius-lg); overflow:hidden; height:240px; margin-bottom: var(--space-md);">
        <img src="${event.image}" alt="${event.title}" style="width:100%; height:100%; object-fit:cover;">
        <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
        <div style="position:absolute; bottom:var(--space-md); left:var(--space-md); color:white;">
          <span class="event-type-badge ${event.type}" style="margin-bottom:var(--space-xs); display:inline-block;">${this.typeLabel(event.type)}</span>
          <h3 style="color:white; font-size:var(--fs-lg); font-weight:var(--fw-bold); margin:0;">${event.title}</h3>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div style="font-size: var(--fs-xs); font-weight: var(--fw-bold); color: var(--color-primary); text-transform: uppercase;">${event.category}</div>
        <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height:1.7;">${event.description}</p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color); padding: var(--space-md) 0; margin-bottom: var(--space-md);">
        <div>
          <div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:bold;">Date & Time</div>
          <div style="font-size:var(--fs-sm); font-weight:600; color:var(--text-primary); margin-top:2px;">
            <i class="fas fa-calendar" style="color:var(--color-primary); margin-right:6px;"></i> ${this.formatDate(event.date)}
          </div>
          <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:1px; margin-left:20px;">
            <i class="fas fa-clock" style="margin-right:4px;"></i> ${event.time}
          </div>
        </div>
        <div>
          <div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:bold;">Location</div>
          <div style="font-size:var(--fs-sm); font-weight:600; color:var(--text-primary); margin-top:2px;">
            <i class="fas fa-map-marker-alt" style="color:var(--color-primary); margin-right:6px;"></i> ${event.location}
          </div>
        </div>
      </div>

      <div style="margin-bottom: var(--space-lg);">
        <div style="font-size:10px; text-transform:uppercase; color:var(--text-muted); font-weight:bold; margin-bottom:var(--space-sm);">Speakers</div>
        <div style="display:flex; flex-direction:column; gap:var(--space-sm);">
          ${event.speakers.map(s => `
            <div style="display:flex; align-items:center; gap:var(--space-md);">
              <img src="${s.avatar}" alt="${s.name}" class="avatar avatar-sm">
              <div>
                <div style="font-size:var(--fs-xs); font-weight:600; color:var(--text-primary);">${s.name}</div>
                <div style="font-size:10px; color:var(--text-muted);">${s.role} at ${s.company}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:var(--space-md);">
        <div style="font-size:var(--fs-md); font-weight:var(--fw-extrabold); color:var(--text-primary);">
          ${isFree ? '🎟 Free' : event.price}
        </div>
        <div style="display:flex; gap:var(--space-sm);">
          <button class="btn btn-ghost" id="details-close-btn-footer">Close</button>
          <button class="btn btn-primary ${isReg ? 'btn-outline' : ''}" id="details-reg-btn" onclick="Events.toggleDetailsReg(${event.id})">
            ${isReg ? '✓ Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (typeof App !== 'undefined' && App.focusTrap) {
      App.focusTrap(modal);
    }

    const closeHandler = () => {
      modal.classList.remove('open');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      document.getElementById(`event-${eventId}`)?.focus();
    };

    closeBtn.onclick = closeHandler;
    document.getElementById('details-close-btn-footer').onclick = closeHandler;
  },

  toggleDetailsReg(eventId) {
    this.register(eventId);
    // Update reg button in details modal
    const regBtn = document.getElementById('details-reg-btn');
    if (regBtn) {
      const isReg = this.registered.has(eventId);
      regBtn.textContent = isReg ? '✓ Registered' : 'Register Now';
      regBtn.className = `btn btn-primary ${isReg ? 'btn-outline' : ''}`;
    }
  },

  initCreateEventForm() {
    const openBtn = document.getElementById('open-create-event-btn');
    const modal = document.getElementById('create-event-modal');
    const closeBtn = document.getElementById('create-event-close');
    const cancelBtn = document.getElementById('create-event-cancel');
    const form = document.getElementById('create-event-form');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('open');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (typeof App !== 'undefined' && App.focusTrap) {
          App.focusTrap(modal);
        }
      });
    }

    const closeHandler = () => {
      modal.classList.remove('open');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      openBtn?.focus();
    };

    if (closeBtn) closeBtn.onclick = closeHandler;
    if (cancelBtn) cancelBtn.onclick = closeHandler;

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('event-form-title').value.trim();
        const category = document.getElementById('event-form-category').value;
        const format = document.getElementById('event-form-type').value;
        const date = document.getElementById('event-form-date').value;
        const time = document.getElementById('event-form-time').value.trim();
        const location = document.getElementById('event-form-location').value.trim();
        const desc = document.getElementById('event-form-desc').value.trim();

        if (!title || !date || !time || !location) {
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Please fill all required fields!', 'error');
          }
          return;
        }

        const newEvent = {
          id: Date.now(),
          title,
          category,
          type: format,
          description: desc || 'No description provided.',
          image: 'images/event1.jpg',
          date,
          time,
          location,
          price: 'Free',
          attendees: 1,
          speakers: [
            {
              name: App.currentUser?.name || 'You',
              role: App.currentUser?.role || 'Organizer',
              company: 'ConnectX',
              avatar: App.currentUser?.avatar || 'images/user1.jpg'
            }
          ]
        };

        // Prepend and persist
        this.eventsData.unshift(newEvent);
        
        const customEvents = JSON.parse(localStorage.getItem('sp-events-data') || '[]');
        customEvents.unshift(newEvent);
        localStorage.setItem('sp-events-data', JSON.stringify(customEvents));

        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Event created successfully! 🎉', 'success');
        }

        this.renderEvents();
        closeHandler();
        form.reset();
      });
    }
  },

  typeLabel(type) {
    return { online: '🌐 Online', 'in-person': '📍 In-Person', hybrid: '🔀 Hybrid' }[type] || type;
  },

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  register(eventId) {
    const btn = document.getElementById(`reg-btn-${eventId}`);
    if (!btn) return;

    if (this.registered.has(eventId)) {
      this.registered.delete(eventId);
      btn.textContent = 'Register Now';
      btn.classList.remove('registered');
      btn.setAttribute('aria-pressed', 'false');
      App.showToast('Registration cancelled', 'info');
    } else {
      this.registered.add(eventId);
      btn.textContent = '✓ Registered';
      btn.classList.add('registered');
      btn.setAttribute('aria-pressed', 'true');
      App.showToast('Successfully registered! 🎉 Check your email.', 'success');
    }

    localStorage.setItem('sp-registered-events', JSON.stringify([...this.registered]));
  },

  toggleSave(e, eventId) {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    const btn = document.getElementById(`save-btn-${eventId}`);
    
    if (this.saved.has(eventId)) {
      this.saved.delete(eventId);
      if (btn) {
        btn.classList.remove('saved');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'far fa-heart';
      }
      App.showToast('Event removed from favorites', 'info', 2000);
    } else {
      this.saved.add(eventId);
      if (btn) {
        btn.classList.add('saved');
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fas fa-heart';
      }
      App.showToast('Event saved to favorites! ❤️', 'success', 2000);
    }

    localStorage.setItem('sp-saved-events', JSON.stringify([...this.saved]));

    if (this.activeFilter === 'favorites') {
      this.renderEvents();
    }
  },

  startAllCountdowns() {
    this.eventsData.forEach(e => this.startCountdown(e.id, e.date));
  },

  startCountdown(eventId, dateStr) {
    const container = document.getElementById(`countdown-${eventId}`);
    if (!container) return;

    const update = () => {
      const now    = Date.now();
      const target = new Date(dateStr).getTime();
      let diff = Math.max(0, Math.floor((target - now) / 1000));

      if (diff <= 0) {
        container.innerHTML = `<div style="color:var(--color-primary);font-weight:700;font-size:var(--fs-sm);">🎉 Event is Live!</div>`;
        return;
      }

      const days  = Math.floor(diff / 86400); diff -= days * 86400;
      const hours = Math.floor(diff / 3600);  diff -= hours * 3600;
      const mins  = Math.floor(diff / 60);    diff -= mins * 60;
      const secs  = diff;

      const set = (unit, val) => {
        const el = container.querySelector(`[data-unit="${unit}"]`);
        if (el) el.textContent = String(val).padStart(2, '0');
      };
      set('days', days); set('hours', hours); set('mins', mins); set('secs', secs);
    };

    update();
    const timer = setInterval(() => {
      if (!document.getElementById(`countdown-${eventId}`)) { clearInterval(timer); return; }
      update();
    }, 1000);
  },

  renderSpeakers() {
    const grid = document.getElementById('speakers-grid');
    if (!grid) return;

    const allSpeakers = this.eventsData.flatMap(e => e.speakers).slice(0, 6);
    grid.innerHTML = allSpeakers.map(s => `
      <div class="speaker-card" role="article">
        <div class="speaker-avatar">
          <img src="${s.avatar}" alt="${s.name}" class="avatar avatar-lg">
        </div>
        <div class="speaker-name">${s.name}</div>
        <div class="speaker-role">${s.role}</div>
        <span class="speaker-company">${s.company}</span>
      </div>
    `).join('');
  }
};
