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
    this.renderFilterBar();
    this.renderEvents();
    this.renderSpeakers();
    this.startAllCountdowns();
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
    this.startAllCountdowns();
  },

  eventCardHTML(event) {
    const isReg = this.registered.has(event.id);
    const isSaved = this.saved.has(event.id);
    const isFree = event.price === 'Free';

    return `
    <article class="event-card" id="event-${event.id}" aria-label="${event.title}">
      <div class="event-card-img-wrapper">
        <img src="${event.image}" alt="${event.title}" class="event-card-img" loading="lazy">
        <div class="event-card-img-overlay"></div>
        <div class="event-badge-row">
          <span class="event-type-badge ${event.type}">${this.typeLabel(event.type)}</span>
          <button class="event-save-btn ${isSaved ? 'saved' : ''}"
                  id="save-btn-${event.id}"
                  aria-label="Save event"
                  onclick="Events.toggleSave(event, ${event.id})">
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
                  onclick="Events.register(${event.id})"
                  aria-pressed="${isReg}">
            ${isReg ? '✓ Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    </article>`;
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
