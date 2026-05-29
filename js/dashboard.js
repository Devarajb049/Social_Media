/* ============================================================
   dashboard.js — Section Switching, Sidebar, Dropdown
   ============================================================ */

'use strict';

const Dashboard = {

  currentSection: 'feed',
  sidebarCollapsed: false,

  /**
   * Initialize dashboard
   */
  init() {
    this.populateUserInfo();
    this.initSidebar();
    this.initSectionNav();
    this.initHeader();
    this.initFAB();
    this.showSection('feed'); // default section

    console.log('[Dashboard] Initialized');
  },

  /**
   * Fill user info from localStorage
   */
  populateUserInfo() {
    const user = App.currentUser;
    if (!user) return;

    // Sidebar
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setSrc = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };

    setEl('sidebar-user-name',    user.name);
    setEl('sidebar-user-role',    user.role || 'Member');
    setEl('header-user-name',     user.name.split(' ')[0]);
    setSrc('sidebar-avatar',      user.avatar || 'images/user1.jpg');
    setSrc('header-avatar',       user.avatar || 'images/user1.jpg');
  },

  /**
   * Sidebar toggle (mobile & collapse)
   */
  initSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const toggleMb = document.getElementById('sidebar-toggle');
    const collapseBtn = document.getElementById('sidebar-collapse');

    // Mobile toggle
    if (toggleMb) {
      toggleMb.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
        document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
      });
    }

    // Overlay click closes sidebar
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Desktop collapse
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        const main = document.querySelector('.main-content');
        if (main) main.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
        collapseBtn.setAttribute('aria-expanded', String(!this.sidebarCollapsed));
        
        // Toggle icon, titles, and labels
        const icon = document.getElementById('collapse-icon');
        if (icon) {
          if (this.sidebarCollapsed) {
            icon.className = 'fas fa-angles-right';
            collapseBtn.title = 'Expand Sidebar';
            collapseBtn.setAttribute('aria-label', 'Expand Sidebar');
          } else {
            icon.className = 'fas fa-angles-left';
            collapseBtn.title = 'Collapse Sidebar';
            collapseBtn.setAttribute('aria-label', 'Collapse Sidebar');
          }
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
          App.logout();
        }
      });
    }
  },

  /**
   * Wire sidebar navigation links to section switching
   */
  initSectionNav() {
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.showSection(section);

        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  },

  /**
   * Switch visible section
   * @param {string} sectionId
   */
  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    // Remove active from all nav links
    document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));

    // Show target section
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
      target.classList.add('active');
      this.currentSection = sectionId;
    }

    // Activate nav links
    document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(l => l.classList.add('active'));

    // Show/hide create-post FAB (only visible on feed)
    const fab = document.getElementById('fab-create');
    if (fab) {
      fab.style.display = (sectionId === 'feed') ? 'flex' : 'none';
    }

    // Update page title in header
    const titles = {
      feed:          'Home Feed',
      messages:      'Messages',
      events:        'Events',
      showcase:      'Talent',
      notifications: 'Notifications',
      profile:       'My Profile',
      settings:      'Settings'
    };
    const titleEl = document.getElementById('header-page-title');
    if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;

    // Section-specific init
    switch (sectionId) {
      case 'feed':          Feed.init();    break;
      case 'messages':      Messages.init(); break;
      case 'events':        Events.init();  break;
      case 'notifications': this.renderNotifications(); break;
      case 'showcase':      Profile.init(); break;
      case 'profile':       Profile.init(); break;
      case 'settings':      this.initSettings(); break;
    }

    // Scroll main content to top
    const mc = document.querySelector('.main-content');
    if (mc) mc.scrollTo(0, 0);
  },

  /**
   * Header: search, dropdowns, notifications
   */
  initHeader() {
    // Avatar dropdown toggle
    const avatarBtn = document.getElementById('header-avatar-btn');
    const dropdown  = document.getElementById('header-dropdown');

    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        avatarBtn.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      });
    }

    // Notifications bell
    const bellBtn = document.getElementById('notif-bell');
    if (bellBtn) {
      bellBtn.addEventListener('click', () => {
        this.showSection('notifications');
      });
    }

    // Search input
    const searchIn = document.getElementById('header-search');
    if (searchIn) {
      searchIn.addEventListener('input', App.debounce((e) => {
        const q = e.target.value.trim();
        if (q.length > 1) {
          App.showToast(`Searching for "${q}"...`, 'info', 1500);
        }
      }, 400));
    }
  },

  /**
   * FAB (Floating Action Button) — create post
   */
  initFAB() {
    const fab = document.getElementById('fab-create');
    if (!fab) return;

    fab.addEventListener('click', () => {
      const modal = document.getElementById('create-post-modal');
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        modal.querySelector('textarea')?.focus();
      }
    });

    // Modal close
    const closeBtn = document.getElementById('modal-close');
    const overlay  = document.getElementById('create-post-modal');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    // Publish post button
    const publishBtn = document.getElementById('publish-post-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        const textarea = document.getElementById('new-post-text');
        const content  = textarea?.value.trim();

        if (!content) {
          App.showToast('Please write something to post!', 'error');
          return;
        }

        Feed.addPost(content);
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
        if (textarea) textarea.value = '';
        App.showToast('Post published! 🚀', 'success');
      });
    }
  },

  /**
   * Render notifications section
   */
  renderNotifications() {
    const container = document.getElementById('notif-list');
    if (!container) return;

    // Get notifications from storage or use defaults
    let notifications = JSON.parse(localStorage.getItem('dashboard_notifications')) || [
      { type: 'like',    user: 'Alex Morgan',  action: 'liked your post',         time: '2m ago',   unread: true  },
      { type: 'comment', user: 'Sarah Chen',   action: 'commented: "Amazing work!"',time: '15m ago', unread: true  },
      { type: 'follow',  user: 'Jake Wilson',  action: 'started following you',   time: '1h ago',   unread: true  },
      { type: 'event',   user: 'TechConf 2026',action: 'starts in 2 days',        time: '3h ago',   unread: false },
      { type: 'like',    user: 'Maria Lopez',  action: 'liked your photo',         time: '5h ago',  unread: false },
      { type: 'comment', user: 'David Kim',    action: 'replied to your comment', time: '1d ago',   unread: false },
      { type: 'follow',  user: 'Emma Stone',   action: 'started following you',   time: '2d ago',   unread: false },
    ];

    const icons = { like:'fa-heart', comment:'fa-comment', follow:'fa-user-plus', event:'fa-calendar' };

    container.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" role="article">
        <div class="notif-icon ${n.type}">
          <i class="fas ${icons[n.type]}"></i>
        </div>
        <div class="notif-body">
          <p class="notif-text"><strong>${n.user}</strong> ${n.action}</p>
          <p class="notif-time">${n.time}</p>
        </div>
      </div>
    `).join('');

    // Update badge
    const badge = document.querySelector('[data-section="notifications"] .nav-badge');
    if (badge) {
      const unreadCount = notifications.filter(n => n.unread).length;
      if (unreadCount === 0) {
        badge.style.display = 'none';
      } else {
        badge.style.display = 'inline-flex';
        badge.textContent = unreadCount;
      }
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead() {
    let notifications = JSON.parse(localStorage.getItem('dashboard_notifications')) || [
      { type: 'like',    user: 'Alex Morgan',  action: 'liked your post',         time: '2m ago',   unread: true  },
      { type: 'comment', user: 'Sarah Chen',   action: 'commented: "Amazing work!"',time: '15m ago', unread: true  },
      { type: 'follow',  user: 'Jake Wilson',  action: 'started following you',   time: '1h ago',   unread: true  },
      { type: 'event',   user: 'TechConf 2026',action: 'starts in 2 days',        time: '3h ago',   unread: false },
      { type: 'like',    user: 'Maria Lopez',  action: 'liked your photo',         time: '5h ago',  unread: false },
      { type: 'comment', user: 'David Kim',    action: 'replied to your comment', time: '1d ago',   unread: false },
      { type: 'follow',  user: 'Emma Stone',   action: 'started following you',   time: '2d ago',   unread: false },
    ];

    // Mark all as read
    notifications = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));

    // Re-render
    this.renderNotifications();

    // Update bell icon to remove unread indicator
    const notifBell = document.getElementById('notif-bell');
    if (notifBell) {
      const dot = notifBell.querySelector('.header-notif-dot');
      if (dot) dot.style.display = 'none';
    }

    // Hide notification badge
    const badge = document.querySelector('[data-section="notifications"] .nav-badge');
    if (badge) badge.style.display = 'none';

    App.showToast('All notifications marked as read', 'success');
  },

  /**
   * Settings section
   */
  initSettings() {
    // Account settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        App.showToast('Settings saved successfully!', 'success');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
