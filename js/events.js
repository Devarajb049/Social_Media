/* ============================================================
   events.js — Event Cards, Countdown Timers, Registration
   ============================================================ */

'use strict';

const Events = {
  initialized: false,
  activeFilter: 'all',
  registered: new Set(JSON.parse(localStorage.getItem('sp-registered-events') || '[]')),

  eventsData: [
    {
      id: 1,
      title: 'Global Tech Summit 2026',
      category: 'Technology',
      type: 'online',
      description: 'The world\'s largest gathering of tech innovators, featuring keynotes from industry leaders and hands-on workshops.',
      image: 'images/event1.jpg',
      date: '2026-06-15',
      time: '9:00 AM – 6:00 PM',
      location: 'Virtual + San Francisco, CA',
      price: 'Free',
      attendees: 4200,
      speakers: [
        { name: 'Dr. Jane Smith',  role: 'AI Researcher',   company: 'DeepMind', avatar: 'images/user1.jpg' },
        { name: 'Mark Johnson',    role: 'CEO',             company: 'TechCorp', avatar: 'images/user2.jpg' },
        { name: 'Lisa Wang',       role: 'CTO',             company: 'Innovate', avatar: 'images/user3.jpg' },
      ]
    },
    {
      id: 2,
      title: 'UX Design Masterclass',
      category: 'Design',
      type: 'online',
      description: 'An intensive 2-day workshop covering advanced UX principles, prototyping, and user research techniques.',
      image: 'images/event1.jpg',
      date: '2026-06-20',
      time: '10:00 AM – 4:00 PM',
      location: 'Online (Zoom)',
      price: '$49',
      attendees: 890,
      speakers: [
        { name: 'Emma Rodriguez', role: 'UX Lead',     company: 'Adobe', avatar: 'images/user1.jpg' },
        { name: 'Chris Lee',      role: 'Product Head', company: 'Figma', avatar: 'images/user2.jpg' },
      ]
    },
    {
      id: 3,
      title: 'Web3 & Blockchain Forum',
      category: 'Blockchain',
      type: 'in-person',
      description: 'Explore the future of decentralized web, NFTs, DeFi, and smart contract development.',
      image: 'images/event1.jpg',
      date: '2026-07-05',
      time: '11:00 AM – 7:00 PM',
      location: 'New York, NY',
      price: '$99',
      attendees: 560,
      speakers: [
        { name: 'Satoshi Lee',  role: 'Blockchain Dev',  company: 'Ethereum', avatar: 'images/user3.jpg' },
        { name: 'Ana Costa',    role: 'DeFi Expert',     company: 'Aave',     avatar: 'images/user1.jpg' },
      ]
    },
    {
      id: 4,
      title: 'AI & Machine Learning Bootcamp',
      category: 'AI/ML',
      type: 'hybrid',
      description: 'Three days of immersive learning covering neural networks, LLMs, computer vision, and AI ethics.',
      image: 'images/event1.jpg',
      date: '2026-07-18',
      time: '9:00 AM – 5:00 PM',
      location: 'Austin, TX + Online',
      price: '$149',
      attendees: 1340,
      speakers: [
        { name: 'Dr. Raj Patel', role: 'ML Engineer', company: 'OpenAI',  avatar: 'images/user2.jpg' },
        { name: 'Sophie Müller', role: 'Data Sci',    company: 'Google',  avatar: 'images/user3.jpg' },
      ]
    },
    {
      id: 5,
      title: 'Startup Pitch Night',
      category: 'Entrepreneurship',
      type: 'in-person',
      description: 'Present your startup idea to top investors and angel networks. The best pitch wins $10,000 in funding.',
      image: 'images/event1.jpg',
      date: '2026-08-02',
      time: '6:00 PM – 10:00 PM',
      location: 'Los Angeles, CA',
      price: 'Free',
      attendees: 320,
      speakers: [
        { name: 'Michael Bay', role: 'VC Partner', company: 'Sequoia', avatar: 'images/user1.jpg' },
      ]
    },
    {
      id: 6,
      title: 'Open Source Contributors Meetup',
      category: 'Open Source',
      type: 'online',
      description: 'Connect with open source maintainers and contributors from top projects worldwide.',
      image: 'images/event1.jpg',
      date: '2026-08-10',
      time: '3:00 PM – 7:00 PM',
      location: 'Online (Discord)',
      price: 'Free',
      attendees: 2100,
      speakers: []
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

    const filters = ['All', 'Online', 'In-Person', 'Hybrid', 'Free', 'Technology', 'Design', 'AI/ML'];
    bar.innerHTML = filters.map(f => `
      <button class="filter-chip ${f === 'All' ? 'active' : ''}"
              data-filter="${f.toLowerCase()}"
              onclick="Events.filterEvents('${f.toLowerCase()}')"
              aria-pressed="${f === 'All'}"
              aria-label="Filter by ${f}">
        ${f}
      </button>
    `).join('');
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
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fas fa-calendar-xmark"></i>
          <h3>No events found</h3>
          <p>Try a different filter</p>
        </div>`;
      return;
    }

    grid.innerHTML = events.map(e => this.eventCardHTML(e)).join('');
    this.startAllCountdowns();
  },

  eventCardHTML(event) {
    const isReg = this.registered.has(event.id);
    const isFree = event.price === 'Free';

    return `
    <article class="event-card" id="event-${event.id}" aria-label="${event.title}">
      <div class="event-card-img-wrapper">
        <img src="${event.image}" alt="${event.title}" class="event-card-img" loading="lazy">
        <div class="event-card-img-overlay"></div>
        <div class="event-badge-row">
          <span class="event-type-badge ${event.type}">${this.typeLabel(event.type)}</span>
          <button class="event-save-btn ${isReg ? 'saved' : ''}"
                  aria-label="Save event"
                  onclick="Events.toggleSave(event, ${event.id})">
            <i class="fa${isReg ? 's' : 'r'} fa-heart"></i>
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
    App.showToast('Event saved to your calendar! 📅', 'success', 2000);
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
