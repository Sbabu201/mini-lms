/**
 * Escapes HTML entities to prevent XSS in dynamic template content.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates the HTML template for the course content WebView.
 * Supports bidirectional communication with React Native:
 * - Native → Web: via `postMessage` and `injectedJavaScriptBeforeContentLoaded` (headers)
 * - Web → Native: via `window.ReactNativeWebView.postMessage`
 */
export function generateCourseContentHTML(course: {
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  price: number;
  studentsEnrolled: number;
  images: string[];
}): string {
  // Escape all dynamic values to prevent XSS
  const safeTitle = escapeHtml(course.title);
  const safeDescription = escapeHtml(course.description);
  const safeCategory = escapeHtml(course.category);
  const safeInstructor = escapeHtml(course.instructor);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${safeTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0D1321;
      color: #E6E9EF;
      padding: 24px 20px;
      line-height: 1.6;
    }

    .header {
      margin-bottom: 24px;
    }

    .category {
      display: inline-block;
      background: rgba(23, 176, 126, 0.2);
      color: #3BCD9A;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #6B7D96;
    }

    .instructor {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(27, 36, 54, 0.8);
      border: 1px solid rgba(35, 46, 68, 0.5);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .instructor img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .instructor-info h3 {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .instructor-info p {
      font-size: 12px;
      color: #6B7D96;
    }

    .section {
      margin-bottom: 28px;
    }

    .section h2 {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(35, 46, 68, 0.5);
    }

    .section p {
      font-size: 14px;
      color: #95A3B8;
      line-height: 1.8;
    }

    .syllabus-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(27, 36, 54, 0.5);
      border: 1px solid rgba(35, 46, 68, 0.3);
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }

    .syllabus-item:active {
      transform: scale(0.98);
      background: rgba(23, 176, 126, 0.15);
    }

    .syllabus-item.completed {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .syllabus-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(23, 176, 126, 0.3);
      color: #3BCD9A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .syllabus-item.completed .syllabus-number {
      background: rgba(16, 185, 129, 0.3);
      color: #10B981;
    }

    .syllabus-text {
      font-size: 14px;
      color: #E6E9EF;
      font-weight: 500;
    }

    .syllabus-duration {
      margin-left: auto;
      font-size: 12px;
      color: #4B5E78;
    }

    .image-gallery {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }

    .image-gallery img {
      width: 200px;
      height: 140px;
      object-fit: cover;
      border-radius: 12px;
      flex-shrink: 0;
    }

    /* ── Action Buttons ────────────────────────────────── */
    .actions {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }

    .action-btn {
      flex: 1;
      padding: 14px 16px;
      border: none;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      transition: transform 0.15s, opacity 0.15s;
      font-family: inherit;
    }

    .action-btn:active {
      transform: scale(0.96);
      opacity: 0.8;
    }

    .btn-bookmark {
      background: rgba(23, 176, 126, 0.2);
      color: #3BCD9A;
      border: 1px solid rgba(23, 176, 126, 0.3);
    }

    .btn-bookmark.active {
      background: rgba(23, 176, 126, 0.4);
      color: #FFFFFF;
    }

    .btn-enroll {
      background: #17B07E;
      color: #FFFFFF;
    }

    .btn-enroll.active {
      background: rgba(16, 185, 129, 0.3);
      color: #10B981;
    }

    /* ── Native Headers Banner ─────────────────────────── */
    .headers-banner {
      background: rgba(27, 36, 54, 0.8);
      border: 1px solid rgba(35, 46, 68, 0.5);
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 24px;
      font-size: 12px;
    }

    .headers-banner h3 {
      font-size: 13px;
      font-weight: 700;
      color: #3BCD9A;
      margin-bottom: 8px;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }

    .header-key {
      color: #6B7D96;
      font-family: monospace;
    }

    .header-value {
      color: #E6E9EF;
      font-family: monospace;
    }

    /* ── Status Banner ─────────────────────────────────── */
    .status-banner {
      display: none;
      background: rgba(16, 185, 129, 0.2);
      color: #10B981;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    .status-banner.visible {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .footer {
      text-align: center;
      padding: 20px 0;
      margin-top: 20px;
      border-top: 1px solid rgba(35, 46, 68, 0.3);
      font-size: 12px;
      color: #4B5E78;
    }
  </style>
</head>
<body>
  <div id="status-banner" class="status-banner"></div>

  <div class="header">
    <span class="category">${safeCategory}</span>
    <h1>${safeTitle}</h1>
    <div class="meta">
      <span class="meta-item">⭐ ${course.rating.toFixed(1)}</span>
      <span class="meta-item">👥 ${course.studentsEnrolled.toLocaleString()} students</span>
      <span class="meta-item">💰 $${course.price.toFixed(2)}</span>
    </div>
  </div>

  <!-- Native Headers Display (demonstrates headers-based communication) -->
  <div id="headers-banner" class="headers-banner">
    <h3>📡 Native Context (via Headers)</h3>
    <div id="headers-content">Loading native context...</div>
  </div>

  <!-- Action Buttons: Web → Native communication -->
  <div class="actions">
    <button id="btn-bookmark" class="action-btn btn-bookmark" onclick="toggleBookmark()">
      🔖 Bookmark
    </button>
    <button id="btn-enroll" class="action-btn btn-enroll" onclick="toggleEnroll()">
      🎓 Enroll
    </button>
  </div>

  <div class="instructor">
    <img src="${course.instructorAvatar}" alt="${safeInstructor}" />
    <div class="instructor-info">
      <h3>${safeInstructor}</h3>
      <p>Course Instructor</p>
    </div>
  </div>

  <div class="section">
    <h2>📖 About This Course</h2>
    <p>${safeDescription}</p>
    <p style="margin-top: 12px;">
      This comprehensive course covers everything you need to know about ${safeTitle.toLowerCase()}.
      You'll gain hands-on experience through practical projects, quizzes, and real-world case studies 
      designed by industry experts.
    </p>
  </div>

  <div class="section">
    <h2>📋 Course Syllabus</h2>
    <div class="syllabus-item" onclick="markComplete(this, 1)">
      <span class="syllabus-number">1</span>
      <span class="syllabus-text">Introduction & Course Overview</span>
      <span class="syllabus-duration">15 min</span>
    </div>
    <div class="syllabus-item" onclick="markComplete(this, 2)">
      <span class="syllabus-number">2</span>
      <span class="syllabus-text">Fundamentals & Core Concepts</span>
      <span class="syllabus-duration">45 min</span>
    </div>
    <div class="syllabus-item" onclick="markComplete(this, 3)">
      <span class="syllabus-number">3</span>
      <span class="syllabus-text">Intermediate Techniques</span>
      <span class="syllabus-duration">60 min</span>
    </div>
    <div class="syllabus-item" onclick="markComplete(this, 4)">
      <span class="syllabus-number">4</span>
      <span class="syllabus-text">Advanced Topics & Best Practices</span>
      <span class="syllabus-duration">50 min</span>
    </div>
    <div class="syllabus-item" onclick="markComplete(this, 5)">
      <span class="syllabus-number">5</span>
      <span class="syllabus-text">Hands-on Project</span>
      <span class="syllabus-duration">90 min</span>
    </div>
    <div class="syllabus-item" onclick="markComplete(this, 6)">
      <span class="syllabus-number">6</span>
      <span class="syllabus-text">Final Assessment & Certification</span>
      <span class="syllabus-duration">30 min</span>
    </div>
  </div>

  ${
    course.images.length > 0
      ? `
  <div class="section">
    <h2>🖼️ Course Gallery</h2>
    <div class="image-gallery">
      ${course.images.map((img) => `<img src="${img}" alt="Course content" />`).join('')}
    </div>
  </div>
  `
      : ''
  }

  <div class="section">
    <h2>🎯 What You'll Learn</h2>
    <p>✅ Master the core fundamentals of ${safeTitle}</p>
    <p>✅ Build real-world projects with hands-on exercises</p>
    <p>✅ Understand industry best practices and standards</p>
    <p>✅ Earn a certificate of completion</p>
    <p>✅ Get lifetime access to course materials</p>
  </div>

  <div class="footer">
    Powered by LearnHub • © 2026
  </div>

  <script>
    // ── Read Native Headers (injected via injectedJavaScriptBeforeContentLoaded) ──
    function displayNativeHeaders() {
      var container = document.getElementById('headers-content');
      if (window.__NATIVE_HEADERS__) {
        var html = '';
        var headers = window.__NATIVE_HEADERS__;
        for (var key in headers) {
          if (headers.hasOwnProperty(key)) {
            html += '<div class="header-row"><span class="header-key">' + key + '</span><span class="header-value">' + headers[key] + '</span></div>';
          }
        }
        container.innerHTML = html;
      } else {
        container.innerHTML = '<span style="color: #4B5E78;">No native headers received</span>';
      }

      // Update button states from native context
      if (window.__NATIVE_CONTEXT__) {
        updateBookmarkButton(window.__NATIVE_CONTEXT__.isBookmarked);
        updateEnrollButton(window.__NATIVE_CONTEXT__.isEnrolled);
      }
    }

    // ── Status Banner ──
    function showStatus(message) {
      var banner = document.getElementById('status-banner');
      banner.textContent = message;
      banner.classList.add('visible');
      setTimeout(function() { banner.classList.remove('visible'); }, 3000);
    }

    // ── Web → Native: Toggle Bookmark ──
    function toggleBookmark() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOGGLE_BOOKMARK' }));
      }
    }

    // ── Web → Native: Toggle Enroll ──
    function toggleEnroll() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOGGLE_ENROLL' }));
      }
    }

    // ── Web → Native: Mark section complete ──
    function markComplete(element, sectionNumber) {
      element.classList.toggle('completed');
      var isCompleted = element.classList.contains('completed');
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MARK_COMPLETE',
          payload: { section: sectionNumber, completed: isCompleted }
        }));
      }
    }

    // ── Update UI from native responses ──
    function updateBookmarkButton(isBookmarked) {
      var btn = document.getElementById('btn-bookmark');
      if (isBookmarked) {
        btn.classList.add('active');
        btn.textContent = '🔖 Bookmarked';
      } else {
        btn.classList.remove('active');
        btn.textContent = '🔖 Bookmark';
      }
    }

    function updateEnrollButton(isEnrolled) {
      var btn = document.getElementById('btn-enroll');
      if (isEnrolled) {
        btn.classList.add('active');
        btn.textContent = '✅ Enrolled';
      } else {
        btn.classList.remove('active');
        btn.textContent = '🎓 Enroll';
      }
    }

    // ── Listen for messages from React Native ──
    function handleNativeMessage(event) {
      try {
        var data = JSON.parse(event.data);
        switch (data.type) {
          case 'UPDATE_STATUS':
            showStatus(data.message);
            break;
          case 'BOOKMARK_UPDATED':
            updateBookmarkButton(data.isBookmarked);
            showStatus(data.isBookmarked ? '🔖 Course bookmarked!' : '📄 Bookmark removed');
            break;
          case 'ENROLL_UPDATED':
            updateEnrollButton(data.isEnrolled);
            showStatus(data.isEnrolled ? '🎓 You are now enrolled!' : '📤 Enrollment removed');
            break;
        }
      } catch(e) {}
    }

    window.addEventListener('message', handleNativeMessage);
    document.addEventListener('message', handleNativeMessage);

    // ── Initialize ──
    document.addEventListener('DOMContentLoaded', function() {
      displayNativeHeaders();

      // Notify React Native that the WebView is ready
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
      }
    });
  </script>
</body>
</html>
  `.trim();
}
