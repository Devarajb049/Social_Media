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
        user: { name: 'Alex Morgan', handle: '@alexmorgan', avatar: 'images/user1.jpg', role: 'UX Designer' },
        content: 'Just shipped a brand new design system for our startup! 🎨 Months of hard work finally paying off. The team is absolutely amazing. Check out the results! #design #startup #ux',
        image: 'images/post1.jpg',
        likes: 248,
        comments: 34,
        shares: 18,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 2*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Sarah Chen', avatar: 'images/user2.jpg', text: 'This looks absolutely stunning! 🔥' },
          { user: 'David Kim',  avatar: 'images/user3.jpg', text: 'Incredible work, love the color palette!' }
        ]
      },
      {
        id: 2,
        user: { name: 'Sarah Chen', handle: '@sarahchen', avatar: 'images/user2.jpg', role: 'Full Stack Dev' },
        content: 'Excited to announce I just completed the AWS Solutions Architect certification! 🚀 The journey was challenging but totally worth it. If anyone wants study tips, drop a comment below! #aws #cloud #devops',
        image: null,
        likes: 512,
        comments: 67,
        shares: 43,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 5*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Alex Morgan', avatar: 'images/user1.jpg', text: 'Congratulations! Well deserved! 🎉' }
        ]
      },
      {
        id: 3,
        user: { name: 'David Kim', handle: '@davidkim', avatar: 'images/user3.jpg', role: 'Product Manager' },
        content: 'Attending my first tech conference this week and the energy here is unreal! So many brilliant minds in one place 🤯 Networking is truly the lifeblood of innovation. #techconf #networking #innovation',
        image: 'images/post2.jpg',
        likes: 189,
        comments: 22,
        shares: 11,
        saved: false,
        liked: false,
        time: new Date(Date.now() - 24*60*60*1000).toISOString(),
        commentsData: [
          { user: 'Sarah Chen', avatar: 'images/user2.jpg', text: 'Wish I could be there! Share your notes?' }
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
      { name: 'Your Story', avatar: App.currentUser?.avatar || 'images/user1.jpg', isAdd: true },
      { name: 'Alex M.',    avatar: 'images/user1.jpg', viewed: false },
      { name: 'Sarah C.',   avatar: 'images/user2.jpg', viewed: false },
      { name: 'David K.',   avatar: 'images/user3.jpg', viewed: true  },
      { name: 'Maria L.',   avatar: 'images/user1.jpg', viewed: false },
      { name: 'Jake W.',    avatar: 'images/user2.jpg', viewed: true  },
      { name: 'Emma S.',    avatar: 'images/user3.jpg', viewed: false },
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
                onclick="Feed.toggleLike(${post.id})"
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
        <button class="post-action-btn ${post.saved ? 'liked' : ''}"
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
          <img src="${App.currentUser?.avatar || 'images/user1.jpg'}"
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
   * Toggle like on a post
   */
  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;

    const btn = document.getElementById(`like-btn-${postId}`);
    if (btn) {
      btn.classList.toggle('liked', post.liked);
      btn.setAttribute('aria-pressed', post.liked);
      btn.querySelector('i').className = `${post.liked ? 'fas' : 'far'} fa-heart`;
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

    const newComment = { user: user.name, avatar: user.avatar || 'images/user1.jpg', text };
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
      user: { name: user.name, handle: user.handle, avatar: user.avatar || 'images/user1.jpg', role: user.role || 'Member' },
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
        { name: 'Maria Lopez',  role: 'Data Scientist',   avatar: 'images/user1.jpg' },
        { name: 'Jake Wilson',  role: 'DevOps Engineer',  avatar: 'images/user2.jpg' },
        { name: 'Emma Stone',   role: 'Product Designer', avatar: 'images/user3.jpg' },
        { name: 'Ryan Park',    role: 'AI Researcher',    avatar: 'images/user1.jpg' },
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
        { name: '#WebDev',     count: '12.4K posts' },
        { name: '#AITools',    count: '8.9K posts'  },
        { name: '#TechConf',   count: '5.2K posts'  },
        { name: '#OpenSource', count: '4.1K posts'  },
        { name: '#RemoteWork', count: '3.8K posts'  },
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
