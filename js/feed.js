/* ============================================================
   feed.js — Dynamic Post Rendering, Like/Comment/Share
   ============================================================ */

'use strict';

const Feed = {
  initialized: false,
  posts: [],

  /**
   * Initialize feed (only once, or re-render if needed)
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadPosts();
    this.renderStories();
    this.renderPosts();
    this.renderWidgets();
    this.initCreatePost();
  },

  /**
   * Load demo posts data
   */
  loadPosts() {
    const saved = localStorage.getItem('sp-feed-posts');
    if (saved) {
      try { this.posts = JSON.parse(saved); return; } catch(e) {}
    }

    this.posts = [
      {
        id: 1,
        user: { name: 'Kunal Shah', handle: '@kunalshah', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', role: 'Software Engineering Intern' },
        content: 'Senior Dev: "Don\'t worry, our codebase is exceptionally clean, fully documented, and highly modular!" 😇\n\nThe codebase:\n* 4,200 lines of spaghetti JavaScript inside a single index.html script tag.\n* Core functions named helper(), helper2(), helper_final_v2().\n* 67 open merge conflicts waiting for my approval.\n* A comment that says: // TODO: DO NOT TOUCH THIS, IT WILL BREAK THE PROD DATABASE, I DON\'T KNOW WHY.\n\nCurrently refactoring this while drinking my 4th cup of double-shot espresso today. ☕️ Send help or dry-run scripts. #internship #javascript #devlife #refactoring #spaghettiCode',
        image: null,
        likes: 312,
        comments: 34,
        shares: 18,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 1*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Aanya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', text: 'I feel this in my soul. Just wait until you inspect the production database schema... 💀' },
          { user: 'Rohit Sharma',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', text: 'Have you tried deleting the node_modules folder and running npm install? That\'s about as much refactoring as I do. 😂' },
          { user: 'Emma Rodriguez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', text: 'Wait, who wrote that helper_final_v2() function? Please don\'t tell me it was my git blame from 2024...' }
        ]
      },
      {
        id: 2,
        user: { name: 'Sarah Chen', handle: '@sarahchen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', role: 'Full Stack Dev Intern' },
        content: 'Day 15 of my internship at ConnectX: Just pushed my very first hotfix directly to production and didn\'t crash the server! 🚀🎉\n\nHuge thanks to the engineering team for the thorough code reviews and for not laughing at my initial pull request which had 47 comments. Pro tip for incoming interns: keep a notepad next to your keyboard, ask "why" at least ten times a day, and never, ever git push --force on main. 📝💻 #webdev #frontend #prod #milestone #internship',
        image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&h=400&q=80',
        likes: 524,
        comments: 67,
        shares: 43,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 3*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Kunal Shah', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', text: 'Huge congrats Sarah! Meanwhile, my PR is still waiting for review after 4 days. Send your reviewers over! 😂' },
          { user: 'David Kim', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', text: 'Pushed to prod on a Friday and the server is still running. You have officially passed the developer test! 🏆' }
        ]
      },
      {
        id: 3,
        user: { name: 'Emma Rodriguez', handle: '@emmarodriguez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', role: 'UI/UX Design Lead' },
        content: 'Hot take: Flat design is officially obsolete. Glassmorphism, tailored gradients, and premium micro-animations are the only way to build state-of-the-art applications in 2026. If your buttons don\'t have a satisfying spring scaling on hover, you are losing user engagement. ✨🎨\n\nLet\'s settle the debate: are you Team Clean Minimalist or Team Dynamic Glass? Let me know in the comments! #uiux #design #figma #uxdesign #webdevelopment',
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&h=400&q=80',
        likes: 289,
        comments: 22,
        shares: 11,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 18*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', text: 'Team Dynamic Glass all day! The visual feedback makes the app feel so alive.' },
          { user: 'David Kim',  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', text: 'It looks absolutely stunning, Emma! Right up until the developers see the CSS backdrop-filter performance on mobile devices... 😅' }
        ]
      }
    ];
  },

  /**
   * Save posts to localStorage
   */
  savePosts() {
    try {
      localStorage.setItem('sp-feed-posts', JSON.stringify(this.posts));
    } catch(e) {}
  },

  /**
   * Render stories bar
   */
  renderStories() {
    const container = document.getElementById('stories-bar');
    if (!container) return;

    const stories = [
      { name: 'Your Story', avatar: App.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', isAdd: true },
      { name: 'Kunal S.',     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', viewed: false },
      { name: 'Sarah C.',   avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', viewed: false },
      { name: 'Emma R.',    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', viewed: true  },
      { name: 'Aanya P.',   avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', viewed: false },
      { name: 'Rohit S.',    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', viewed: true  },
      { name: 'David K.',    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', viewed: false },
    ];

    container.innerHTML = stories.map((s, i) => {
      if (s.isAdd) {
        return `
          <div class="story-item story-add" role="button" aria-label="Add your story" tabindex="0">
            <button class="story-add-btn" aria-label="Create story">
              <i class="fas fa-plus"></i>
            </button>
            <span class="story-name">Your Story</span>
          </div>`;
      }
      return `
        <div class="story-item" role="button" aria-label="View ${s.name}'s story" tabindex="0"
             onclick="Feed.viewStory(${i}, '${s.name}')">
          <div class="story-avatar-ring ${s.viewed ? 'viewed' : ''}">
            <img src="${s.avatar}" alt="${s.name}" class="avatar">
          </div>
          <span class="story-name">${s.name}</span>
        </div>`;
    }).join('');
  },

  viewStory(index, name) {
    App.showToast(`Viewing ${name}'s story...`, 'info', 1500);
  },

  /**
   * Render all posts into #posts-container
   */
  renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    container.innerHTML = this.posts.map(p => this.postHTML(p)).join('');
    this.attachPostHandlers();
  },

  /**
   * Generate HTML for a single post
   */
  postHTML(post) {
    return `
    <article class="post-card" id="post-${post.id}" aria-label="Post by ${post.user.name}">
      <div class="post-header">
        <div class="post-user-info">
          <div class="relative" style="display:inline-block;">
            <img src="${post.user.avatar}" alt="${post.user.name}" class="avatar avatar-md">
            <span class="online-dot"></span>
          </div>
          <div>
            <div class="post-user-name">${post.user.name}</div>
            <div class="post-user-meta">
              <span>${post.user.role}</span>
              <span>•</span>
              <span>${App.timeAgo(post.time)}</span>
              <i class="fas fa-globe-americas" style="font-size:.7rem;opacity:.6;"></i>
            </div>
          </div>
        </div>
        <button class="post-menu-btn" aria-label="Post options" onclick="Feed.postMenu(event, ${post.id})">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>

      <div class="post-body">
        <p class="post-text">${this.formatText(post.content)}</p>
      </div>

      ${post.image ? `
        <img src="${post.image}" alt="Post image" class="post-image"
             loading="lazy" onclick="Feed.viewImage('${post.image}')">
      ` : ''}

      <div class="post-stats">
        <div class="post-stats-left">
          <div class="like-emoji-stack">
            <span>❤️</span><span>👍</span><span>🔥</span>
          </div>
          <span id="post-likes-${post.id}">${App.formatNumber(post.likes)}</span>
        </div>
        <div style="display:flex;gap:var(--space-md);font-size:var(--fs-xs);color:var(--text-muted);">
          <span>${post.comments} comments</span>
          <span>${post.shares} shares</span>
        </div>
      </div>

      <div class="post-actions" role="group" aria-label="Post actions">
        <button class="post-action-btn ${post.liked ? 'liked' : ''}"
                id="like-btn-${post.id}"
                onclick="Feed.toggleLike(event, ${post.id})"
                aria-pressed="${post.liked}"
                aria-label="${post.liked ? 'Unlike' : 'Like'} post">
          <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
          <span>Like</span>
        </button>
        <button class="post-action-btn" onclick="Feed.toggleComments(${post.id})" aria-label="Comment on post">
          <i class="far fa-comment"></i>
          <span>Comment</span>
        </button>
        <button class="post-action-btn" onclick="Feed.sharePost(${post.id})" aria-label="Share post">
          <i class="fas fa-share"></i>
          <span>Share</span>
        </button>
        <button class="post-action-btn ${post.saved ? 'saved' : ''}"
                onclick="Feed.toggleSave(${post.id})"
                aria-label="${post.saved ? 'Unsave' : 'Save'} post">
          <i class="${post.saved ? 'fas' : 'far'} fa-bookmark"></i>
          <span>Save</span>
        </button>
      </div>

      <div class="post-comments" id="comments-${post.id}">
        ${post.commentsData.map(c => `
          <div class="comment-item">
            <img src="${c.avatar}" alt="${c.user}" class="avatar avatar-sm">
            <div class="comment-bubble">
              <div class="comment-author">${c.user}</div>
              <div class="comment-text">${c.text}</div>
            </div>
          </div>
        `).join('')}
        <div class="comment-input-row">
          <img src="${App.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}"
               alt="You" class="avatar avatar-sm">
          <input type="text" class="comment-input" placeholder="Write a comment..."
                 id="comment-input-${post.id}" aria-label="Write a comment">
          <button class="comment-send-btn" onclick="Feed.addComment(${post.id})" aria-label="Send comment">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </article>`;
  },

  /**
   * Format text: links hashtags, mentions
   */
  formatText(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/(#\w+)/g, '<span class="hashtag">$1</span>')
      .replace(/(@\w+)/g, '<span class="hashtag">$1</span>');
  },

  /**
   * Attach post event handlers
   */
  attachPostHandlers() {
    // Create post box click
    const createBox = document.getElementById('create-post-box');
    if (createBox) {
      createBox.addEventListener('click', () => {
        const modal = document.getElementById('create-post-modal');
        modal?.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    // Comment inputs: enter to send
    document.querySelectorAll('.comment-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const postId = parseInt(input.id.replace('comment-input-', ''));
          this.addComment(postId);
        }
      });
    });
  },

  /**
   * Spawn dynamic heart splash particles around liked buttons
   */
  spawnLikeParticles(event, button) {
    const rect = button.getBoundingClientRect();
    const x = event ? event.clientX : rect.left + rect.width / 2;
    const y = event ? event.clientY : rect.top + rect.height / 2;

    const colors = ['#ef4444', '#f43f5e', '#ec4899', '#f472b6', '#a855f7', '#6366f1'];
    const emojis = ['❤️', '💖', '✨', '🔥', '🌸', '⚡️'];

    for (let i = 0; i < 7; i++) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = 50 + Math.random() * 70; // Trajectory travel distance
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 25; // Float upwards slightly

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.setProperty('--ds', `${0.3 + Math.random() * 0.7}`);

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 850);
    }
  },

  /**
   * Toggle like on a post
   */
  toggleLike(e, postId) {
    if (e) e.stopPropagation();
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;

    const btn = document.getElementById(`like-btn-${postId}`);
    if (btn) {
      btn.classList.toggle('liked', post.liked);
      btn.setAttribute('aria-pressed', post.liked);
      btn.querySelector('i').className = `${post.liked ? 'fas' : 'far'} fa-heart`;

      // Spark heart particles on true likes
      if (post.liked) {
        this.spawnLikeParticles(e, btn);
      }
    }

    const likesEl = document.getElementById(`post-likes-${postId}`);
    if (likesEl) likesEl.textContent = App.formatNumber(post.likes);

    this.savePosts();
  },

  /**
   * Toggle comments visibility
   */
  toggleComments(postId) {
    const comments = document.getElementById(`comments-${postId}`);
    if (comments) {
      comments.classList.toggle('open');
      if (comments.classList.contains('open')) {
        comments.querySelector('.comment-input')?.focus();
      }
    }
  },

  /**
   * Add a comment to a post
   */
  addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text  = input?.value.trim();
    if (!text) return;

    const post  = this.posts.find(p => p.id === postId);
    const user  = App.currentUser;
    if (!post || !user) return;

    const newComment = { user: user.name, avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', text };
    post.commentsData.push(newComment);
    post.comments++;

    // Insert new comment into DOM
    const commentsEl = document.getElementById(`comments-${postId}`);
    if (commentsEl) {
      const inputRow = commentsEl.querySelector('.comment-input-row');
      const commentEl = document.createElement('div');
      commentEl.className = 'comment-item';
      commentEl.innerHTML = `
        <img src="${newComment.avatar}" alt="${newComment.user}" class="avatar avatar-sm">
        <div class="comment-bubble">
          <div class="comment-author">${newComment.user}</div>
          <div class="comment-text">${newComment.text}</div>
        </div>`;
      commentsEl.insertBefore(commentEl, inputRow);
    }

    input.value = '';
    this.savePosts();
    App.showToast('Comment posted!', 'success', 2000);
  },

  /**
   * Share post
   */
  sharePost(postId) {
    App.showToast('Link copied to clipboard! 🔗', 'success', 2000);
  },

  /**
   * Toggle save/bookmark
   */
  toggleSave(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    post.saved = !post.saved;
    this.renderPosts();
    this.savePosts();
    App.showToast(post.saved ? 'Post saved! 🔖' : 'Post unsaved', 'info', 2000);
  },

  /**
   * Post options menu
   */
  postMenu(e, postId) {
    e.stopPropagation();
    App.showToast('Post options coming soon!', 'info', 1500);
  },

  /**
   * View image fullscreen
   */
  viewImage(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.90);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;`;
    overlay.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.5);">`;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  },

  /**
   * Add a new post (from create post modal)
   */
  addPost(content) {
    const user = App.currentUser;
    const newPost = {
      id: Date.now(),
      user: { name: user.name, handle: user.handle, avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80', role: user.role || 'Member' },
      content,
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      saved: false,
      liked: false,
      time: new Date().toISOString(),
      commentsData: []
    };

    this.posts.unshift(newPost);
    this.savePosts();

    const container = document.getElementById('posts-container');
    if (container) {
      const temp = document.createElement('div');
      temp.innerHTML = this.postHTML(newPost);
      container.prepend(temp.firstElementChild);
      this.attachPostHandlers();
    }
  },

  /**
   * Render sidebar widgets (suggested users, trending)
   */
  renderWidgets() {
    // Suggested users
    const suggestedContainer = document.getElementById('suggested-users');
    if (suggestedContainer) {
      const users = [
        { name: 'Aanya Patel',  role: 'Lead Data Scientist', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
        { name: 'Rohit Sharma',  role: 'DevOps Architect',    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
        { name: 'Liam Vance',   role: 'Senior Frontend Dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
        { name: 'Sophia Loren', role: 'Engineering Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
      ];

      suggestedContainer.innerHTML = users.map((u, i) => `
        <div class="suggested-user">
          <img src="${u.avatar}" alt="${u.name}" class="avatar avatar-sm">
          <div class="suggested-user-info">
            <div class="suggested-user-name">${u.name}</div>
            <div class="suggested-user-role">${u.role}</div>
          </div>
          <button class="follow-btn" id="follow-${i}" onclick="Feed.toggleFollow(${i})"
                  aria-label="Follow ${u.name}">Follow</button>
        </div>
      `).join('');
    }

    // Trending
    const trendingContainer = document.getElementById('trending-tags');
    if (trendingContainer) {
      const tags = [
        { name: '#productionCrash', count: '14.2K posts' },
        { name: '#internship',      count: '9.8K posts'  },
        { name: '#centercss',       count: '7.1K posts'  },
        { name: '#coffeeOverdose',  count: '5.4K posts'  },
        { name: '#gitconflict',     count: '3.9K posts'  },
      ];

      trendingContainer.innerHTML = tags.map(t => `
        <div class="trending-tag" role="button" tabindex="0" aria-label="Explore ${t.name}">
          <div>
            <div class="trending-tag-name">${t.name}</div>
            <div class="trending-tag-count">${t.count}</div>
          </div>
          <i class="fas fa-arrow-trend-up" style="color:var(--color-primary);font-size:.8rem;"></i>
        </div>
      `).join('');
    }
  },

  /**
   * Toggle follow on a suggested user
   */
  toggleFollow(index) {
    const btn = document.getElementById(`follow-${index}`);
    if (!btn) return;
    const isFollowing = btn.classList.contains('following');
    btn.classList.toggle('following', !isFollowing);
    btn.textContent = isFollowing ? 'Follow' : 'Following';
    App.showToast(isFollowing ? 'Unfollowed' : 'Following! 🎉', 'success', 1800);
  },

  /**
   * Init create post widget handlers
   */
  initCreatePost() {
    const createBox = document.getElementById('create-post-box');
    if (createBox) {
      createBox.addEventListener('click', () => {
        const modal = document.getElementById('create-post-modal');
        modal?.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
  }
};
