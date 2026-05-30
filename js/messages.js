/* ============================================================
   messages.js — Chat List, Bubbles, Typing Simulation
   ============================================================ */

"use strict";

const Messages = {
  initialized: false,
  activeConvo: null,

  conversations: [
    {
      id: 1,
      name: "Kunal Shah",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      online: true,
      lastMsg:
        "Too late, I already pushed to production... 💀 Just kidding, git merge and enjoy!",
      time: "2m",
      unread: 3,
      messages: [
        {
          from: "them",
          text: "Hey Sarah! Did you look at that PR with 47 comments? 😂",
          time: "10:30 AM",
        },
        {
          from: "me",
          text: "Haha yes! I literally refactored it three times, I promise it's cleaner now!",
          time: "10:32 AM",
          read: true,
        },
        {
          from: "them",
          text: "No worries, I approved it. It's safe to merge. 🚀",
          time: "10:33 AM",
        },
        {
          from: "me",
          text: "Wait, really? Let me git fetch first to make sure there are no conflicts.",
          time: "10:35 AM",
          read: true,
        },
        {
          from: "them",
          text: "Too late, I already pushed to production... 💀 Just kidding, git merge and enjoy!",
          time: "10:36 AM",
        },
      ],
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      online: true,
      lastMsg:
        "Perfect, we will use your branch as the live demo! See you at 2 PM.",
      time: "1h",
      unread: 1,
      messages: [
        {
          from: "them",
          text: "Hi! Are you coming to the Git Merge Conflict Survival workshop?",
          time: "9:00 AM",
        },
        {
          from: "me",
          text: "Absolutely, I have a 100-line conflict on my local branch right now that I need to resolve.",
          time: "9:05 AM",
          read: true,
        },
        {
          from: "them",
          text: "Perfect, we will use your branch as the live demo! See you at 2 PM.",
          time: "9:10 AM",
        },
      ],
    },
    {
      id: 3,
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      online: false,
      lastMsg:
        "If you delete it, the notification server crashes. Just leave it as is.",
      time: "3h",
      unread: 0,
      messages: [
        {
          from: "me",
          text: "Hey David, do we have any documentation on helper_final_v2()?",
          time: "Yesterday",
        },
        {
          from: "them",
          text: "Honestly, nobody knows who wrote it. It was created in 2024 by an intern who left without committing their source files. 😅",
          time: "Yesterday",
          read: true,
        },
        {
          from: "them",
          text: "If you delete it, the notification server crashes. Just leave it as is.",
          time: "Yesterday",
        },
      ],
    },
    {
      id: 4,
      name: "Aanya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      online: false,
      lastMsg: "Thanks for sharing the AST parser script!",
      time: "1d",
      unread: 0,
      messages: [
        {
          from: "them",
          text: "I read your article on parsing ast files",
          time: "Mon",
        },
        {
          from: "me",
          text: "Glad you liked it! It saves so much refactoring time.",
          time: "Mon",
          read: true,
        },
        {
          from: "them",
          text: "Thanks for sharing the AST parser script!",
          time: "Mon",
        },
      ],
    },
  ],

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.renderConversationList();
    this.showEmptyChat();
    this.updateBadge();
  },

  updateBadge() {
    const badge = document.querySelector(
      '[data-section="messages"] .nav-badge',
    );
    if (!badge) return;
    const totalUnread = this.conversations.reduce(
      (sum, c) => sum + c.unread,
      0,
    );
    if (totalUnread === 0) {
      badge.style.display = "none";
    } else {
      badge.style.display = "inline-flex";
      badge.textContent = totalUnread;
    }
  },

  renderConversationList() {
    const list = document.getElementById("conversation-list");
    if (!list) return;

    list.innerHTML = this.conversations
      .map(
        (c) => `
      <div class="conversation-item ${c.unread > 0 ? "unread" : ""}"
           id="convo-${c.id}"
           role="button" tabindex="0"
           aria-label="Chat with ${c.name}${c.unread ? ", " + c.unread + " unread messages" : ""}"
           onclick="Messages.openConversation(${c.id})">
        <div class="conversation-avatar">
          <img src="${c.avatar}" alt="${c.name}" class="avatar avatar-md">
          ${c.online ? '<span class="online-dot"></span>' : ""}
        </div>
        <div class="conversation-info">
          <div class="conversation-name">${c.name}</div>
          <div class="conversation-preview">${c.lastMsg}</div>
        </div>
        <div class="conversation-meta">
          <span class="conversation-time">${c.time}</span>
          ${c.unread > 0 ? `<span class="unread-count">${c.unread}</span>` : ""}
        </div>
      </div>
    `,
      )
      .join("");

    // Search filter
    const searchIn = document.getElementById("chat-search-input");
    if (searchIn) {
      searchIn.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll(".conversation-item").forEach((item) => {
          const name = item
            .querySelector(".conversation-name")
            .textContent.toLowerCase();
          item.style.display = name.includes(q) ? "" : "none";
        });
      });
    }
  },

  openConversation(id) {
    this.activeConvo = this.conversations.find((c) => c.id === id);
    if (!this.activeConvo) return;

    // Mark as active
    document
      .querySelectorAll(".conversation-item")
      .forEach((el) => el.classList.remove("active"));
    document.getElementById(`convo-${id}`)?.classList.add("active");

    // Clear unread
    this.activeConvo.unread = 0;
    const unreadEl = document.querySelector(`#convo-${id} .unread-count`);
    if (unreadEl) unreadEl.remove();
    document.getElementById(`convo-${id}`)?.classList.remove("unread");

    this.renderChatWindow(this.activeConvo);

    // Mobile: hide list, show window
    const list = document.querySelector(".chat-list");
    const win = document.querySelector(".chat-window");
    if (window.innerWidth <= 767) {
      list?.classList.add("hidden");
      win?.style && (win.style.display = "flex");
    }
  },

  renderChatWindow(convo) {
    const win = document.getElementById("chat-window");
    if (!win) return;

    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-left">
          <button class="chat-back-btn" onclick="Messages.goBack()" aria-label="Back to conversations">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="conversation-avatar" style="position:relative;">
            <img src="${convo.avatar}" alt="${convo.name}" class="avatar avatar-md">
            ${convo.online ? '<span class="online-dot"></span>' : ""}
          </div>
          <div class="chat-header-info">
            <div class="chat-partner-name">${convo.name}</div>
            <div class="chat-status ${convo.online ? "" : "offline"}">
              ${convo.online ? "Active now" : "Offline"}
            </div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="header-action-btn" aria-label="Voice call" onclick="Messages.callAction('voice')">
            <i class="fas fa-phone"></i>
          </button>
          <button class="header-action-btn" aria-label="Video call" onclick="Messages.callAction('video')">
            <i class="fas fa-video"></i>
          </button>
          <button class="header-action-btn" aria-label="More options">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages-area" role="log" aria-label="Messages" aria-live="polite">
        <div class="chat-date-divider">Today</div>
        ${convo.messages.map((m) => this.messageBubbleHTML(m, convo)).join("")}
        <div id="typing-area"></div>
      </div>

      <div class="chat-input-area">
        <div class="chat-input-actions">
          <button class="chat-tool-btn" aria-label="Attach file">
            <i class="fas fa-paperclip"></i>
          </button>
          <button class="chat-tool-btn" aria-label="Add emoji">
            <i class="fas fa-face-smile"></i>
          </button>
        </div>
        <textarea class="chat-input-box" id="chat-input-box"
                  placeholder="Type a message..." rows="1"
                  aria-label="Message input"></textarea>
        <div class="chat-input-actions">
          <button class="chat-tool-btn" aria-label="Send image">
            <i class="fas fa-image"></i>
          </button>
          <button class="chat-send-btn" id="chat-send-btn" aria-label="Send message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    this.scrollToBottom();
    this.initChatInput();
  },

  messageBubbleHTML(msg, convo) {
    const isMe = msg.from === "me";
    const user = App.currentUser;
    return `
      <div class="message-group ${isMe ? "outgoing" : "incoming"}">
        <div class="message-bubble-row">
          ${!isMe ? `<img src="${convo.avatar}" alt="${convo.name}" class="avatar avatar-xs msg-avatar">` : ""}
          <div class="message-bubble">${msg.text}</div>
          ${isMe ? `<img src="${user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}" alt="You" class="avatar avatar-xs msg-avatar">` : ""}
        </div>
        <div class="message-time">
          <span>${msg.time}</span>
          ${isMe ? `<i class="fas fa-check-double message-ticks ${msg.read ? "read" : ""}"></i>` : ""}
        </div>
      </div>`;
  },

  initChatInput() {
    const input = document.getElementById("chat-input-box");
    const sendBtn = document.getElementById("chat-send-btn");
    if (!input) return;

    // Auto-resize textarea
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
      this.showTypingIndicator();
    });

    // Send on Enter (not Shift+Enter)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    sendBtn?.addEventListener("click", () => this.sendMessage());
    input.focus();
  },

  sendMessage() {
    const input = document.getElementById("chat-input-box");
    const text = input?.value.trim();
    if (!text || !this.activeConvo) return;

    const msg = {
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };
    this.activeConvo.messages.push(msg);
    this.activeConvo.lastMsg = text;

    const area = document.getElementById("chat-messages-area");
    const typingArea = document.getElementById("typing-area");
    if (area && typingArea) {
      const el = document.createElement("div");
      el.innerHTML = this.messageBubbleHTML(msg, this.activeConvo);
      area.insertBefore(el.firstElementChild, typingArea);
    }

    input.value = "";
    input.style.height = "auto";
    this.scrollToBottom();

    // Simulate reply
    setTimeout(() => this.simulateReply(), 1200 + Math.random() * 1500);
  },

  simulateReply() {
    if (!this.activeConvo) return;
    const replies = [
      "That sounds great! 👍",
      "I totally agree with you!",
      "Thanks for sharing! 🙌",
      "Interesting perspective...",
      "Let's discuss this more!",
      "Awesome! Let me check.",
      "😄 Sure, sounds good!",
    ];
    const text = replies[Math.floor(Math.random() * replies.length)];
    const msg = {
      from: "them",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    this.activeConvo.messages.push(msg);

    this.showTypingIndicator(true);
    setTimeout(() => {
      this.hideTypingIndicator();
      const area = document.getElementById("chat-messages-area");
      const typingArea = document.getElementById("typing-area");
      if (area && typingArea) {
        const el = document.createElement("div");
        el.innerHTML = this.messageBubbleHTML(msg, this.activeConvo);
        area.insertBefore(el.firstElementChild, typingArea);
        this.scrollToBottom();
      }
    }, 900);
  },

  showTypingIndicator(show = false) {
    const area = document.getElementById("typing-area");
    if (!area || !this.activeConvo) return;
    if (!show) {
      area.innerHTML = "";
      return;
    }
    area.innerHTML = `
      <div class="typing-indicator">
        <img src="${this.activeConvo.avatar}" alt="typing" class="avatar avatar-xs">
        <div class="typing-indicator-bubbles">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const area = document.getElementById("typing-area");
    if (area) area.innerHTML = "";
  },

  scrollToBottom() {
    const area = document.getElementById("chat-messages-area");
    if (area)
      setTimeout(() => {
        area.scrollTop = area.scrollHeight;
      }, 50);
  },

  showEmptyChat() {
    const win = document.getElementById("chat-window");
    if (!win) return;

    win.innerHTML = `
    <div class="chat-empty">
      <div class="chat-empty-card">
        <!-- Floating Neon Ambient Orbs -->
        <div class="chat-empty-orb"></div>
        <div class="chat-empty-orb-2"></div>

        <!-- Drifting Stacked Icon -->
        <div class="chat-empty-icon-container">
          <div class="chat-empty-icon-bg"></div>
          <i class="fas fa-comments"></i>
        </div>

        <h3>Select a conversation</h3>
        <p>Choose from your existing messages<br>or start a new conversation</p>

        <button
          class="btn btn-new-msg"
          onclick="App.showToast('New message feature coming soon!','info')"
          aria-label="Start a new message"
        >
          <i class="fas fa-pen"></i> New Message
        </button>
      </div>
    </div>`;
  },
  goBack() {
    const list = document.querySelector(".chat-list");
    list?.classList.remove("hidden");
    this.activeConvo = null;
    this.showEmptyChat();
  },

  callAction(type) {
    App.showToast(
      `${type === "video" ? "Video" : "Voice"} call coming soon! 📞`,
      "info",
    );
  },
};
