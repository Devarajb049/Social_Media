/* ============================================================
   profile.js — Profile Stats, Tabs, Gallery, Showcase
   ============================================================ */

'use strict';

const Profile = {
  initialized: false,
  activeTab: 'posts',

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.renderProfile();
    this.initTabs();
    this.renderPostGrid();
    this.renderShowcase();
    this.renderExperience();
  },

  renderProfile() {
    const user = App.currentUser;
    if (!user) return;

    const setEl  = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    const setSrc = (id, src) => { const e = document.getElementById(id); if (e) e.src = src; };
    const setHtml= (id, val) => { const e = document.getElementById(id); if (e) e.innerHTML = val; };

    setSrc('profile-avatar-img',  user.avatar || 'images/user1.jpg');
    setSrc('profile-cover-img',   'images/banner.jpg');
    setEl('profile-name',         user.name);
    setEl('profile-handle',       user.handle || '@' + user.name.toLowerCase().replace(/\s/g,''));
    setEl('profile-headline',     user.role || 'Software Engineering Intern at ConnectX | Coffee Dev ☕️');
    setEl('profile-bio',          user.bio || 'Building premium interactive web systems at ConnectX. Passionate about micro-interactions, responsive design, and refactoring 4,200-line spaghetti HTML pages. When not coding, I am debating flat vs. glassmorphism in Figma. 🚀');
    setEl('profile-followers',    App.formatNumber(user.followers || 1284));
    setEl('profile-following',    App.formatNumber(user.following || 367));
    setEl('profile-posts-count',  user.posts || 42);
    setEl('profile-connections',  App.formatNumber(500 + Math.floor(Math.random() * 200)));

    // Skills
    const skills = ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Git Versioning', 'Figma prototyping', 'Refactoring Spaghetti', 'Double Espresso Engineering'];
    setHtml('profile-skills', skills.map(s => `
      <span class="skill-tag" role="button" tabindex="0" aria-label="Skill: ${s}">
        <i class="fas fa-code" style="font-size:.7rem;"></i> ${s}
      </span>`).join(''));

    // Profile meta info
    setHtml('profile-meta', `
      <div class="profile-meta-item"><i class="fas fa-map-marker-alt"></i> San Francisco, CA</div>
      <div class="profile-meta-item"><i class="fas fa-link"></i> <a href="#" style="color:var(--color-primary);">connectx.social/kunal</a></div>
      <div class="profile-meta-item"><i class="fas fa-calendar-alt"></i> Joined January 2026</div>
    `);
  },

  initTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });

      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
      });
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.profile-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
      t.setAttribute('aria-selected', t.dataset.tab === tabId);
    });

    document.querySelectorAll('.profile-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `tab-${tabId}`);
    });
  },

  renderPostGrid() {
    const grid = document.getElementById('profile-post-grid');
    if (!grid) return;

    const posts = [
      { img: 'images/post1.jpg', likes: 312, comments: 34 },
      { img: 'images/post2.jpg', likes: 524, comments: 67 },
      { img: 'images/post3.jpg', likes: 289, comments: 22 },
      { img: 'images/post1.jpg', likes: 143, comments: 18 },
      { img: 'images/post2.jpg', likes: 321, comments: 45 },
      { img: 'images/post3.jpg', likes: 98,  comments: 12 },
    ];

    grid.innerHTML = posts.map((p, i) => `
      <div class="post-grid-item" role="button" tabindex="0" aria-label="View post ${i+1}">
        <img src="${p.img}" alt="Post ${i+1}" loading="lazy">
        <div class="post-grid-overlay">
          <span><i class="fas fa-heart"></i> ${App.formatNumber(p.likes)}</span>
          <span><i class="fas fa-comment"></i> ${p.comments}</span>
        </div>
      </div>
    `).join('');
  },

  renderShowcase() {
    const grids = [
      document.getElementById('showcase-grid'),
      document.getElementById('profile-showcase-grid')
    ].filter(Boolean);

    if (!grids.length) return;

    const projects = [
      {
        title: 'ConnectX Social Platform',
        desc: 'A full-featured social networking platform with real-time chat, events, and talent showcase.',
        img: 'images/post1.jpg',
        tags: ['React', 'Node.js', 'MongoDB', 'CSS Grid']
      },
      {
        title: 'Interactive Particle Engine',
        desc: 'A super-smooth, pure CSS and JavaScript physics particle burst system optimized for reactions.',
        img: 'images/post2.jpg',
        tags: ['Vanilla JS', 'CSS3 Transitions', 'UI Micro-Animations']
      },
      {
        title: 'Figma Auto-Layout Master',
        desc: 'A complete collection of dynamic UI design layouts fully responsive across mobile, desktop, and tablets.',
        img: 'images/post3.jpg',
        tags: ['Figma prototyping', 'Responsive layout', 'Design Systems']
      },
      {
        title: 'Spaghetti Script Refactorer',
        desc: 'A CLI tool that automatically extracts inline script tags, cleans up duplicated functions, and optimizes layout paint times.',
        img: 'images/post1.jpg',
        tags: ['Node.js', 'Parser AST', 'Automation']
      },
    ];

    const html = projects.map(p => `
      <div class="showcase-card" role="article" aria-label="${p.title}">
        <img src="${p.img}" alt="${p.title}" class="showcase-card-img" loading="lazy">
        <div class="showcase-card-body">
          <div class="showcase-card-title">${p.title}</div>
          <div class="showcase-card-desc">${p.desc}</div>
          <div class="showcase-card-tags">
            ${p.tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
          </div>
          <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
            <button class="btn btn-sm btn-primary" onclick="App.showToast('Opening demo...','info')">
              <i class="fas fa-external-link-alt"></i> Demo
            </button>
          </div>
        </div>
      </div>
    `).join('');

    grids.forEach(grid => {
      grid.innerHTML = html;
    });
  },

  renderExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;

    const items = [
      { icon: 'fa-building', title: 'Software Engineering Intern', company: 'ConnectX Corporation', period: 'May 2026 – Present · 1 mo' },
      { icon: 'fa-laptop-code', title: 'Open Source Contributor', company: 'GitHub Community', period: '2024 – 2026 · 2 yrs' },
      { icon: 'fa-graduation-cap', title: 'B.S. Computer Science', company: 'MIT', period: '2022 – 2026' },
    ];

    list.innerHTML = items.map(item => `
      <div class="experience-item">
        <div class="experience-icon"><i class="fas ${item.icon}"></i></div>
        <div>
          <div class="experience-title">${item.title}</div>
          <div class="experience-company">${item.company}</div>
          <div class="experience-period">${item.period}</div>
        </div>
      </div>
    `).join('');
  }
};
