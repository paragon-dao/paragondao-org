/**
 * ParagonDAO Analytics Tracking Service
 * Tracks user behavior: page views, clicks, scroll depth, time on page
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// Generate unique session ID
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('paragondao_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('paragondao_session_id', sessionId);
  }
  return sessionId;
}

// Generate event ID
function generateEventId() {
  return 'evt_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Detect device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

// Detect OS
function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

// Parse referrer source
function getReferrerSource(referrer) {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    if (hostname.includes('google')) return 'google';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'facebook';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('github')) return 'github';
    if (hostname.includes('reddit')) return 'reddit';
    if (hostname.includes('youtube')) return 'youtube';
    return 'other';
  } catch {
    return 'unknown';
  }
}

class TrackingService {
  constructor() {
    this.sessionId = getSessionId();
    this.userId = null;
    this.eventQueue = [];
    this.isInitialized = false;
    this.scrollDepth = 0;
    this.pageStartTime = Date.now();
    this.flushInterval = null;
    this.config = {
      debug: true, // Always debug for now to see what's happening
      batchSize: 5, // Smaller batch for faster sends
      flushInterval: 10000, // 10 seconds - more frequent
      trackClicks: true,
      trackScroll: true,
      trackTime: true,
    };
  }

  /**
   * Initialize tracking
   */
  async init() {
    if (this.isInitialized) {
      console.log('📊 Tracking already initialized');
      return;
    }

    console.log('📊 Initializing tracking service...', { 
      apiUrl: API_URL,
      sessionId: this.sessionId 
    });

    // Check Do Not Track - but still allow in dev
    if (navigator.doNotTrack === '1' && !this.config.debug) {
      console.log('📊 Tracking disabled (DNT enabled)');
      return;
    }

    try {
      // Track initial session
      await this.trackSession();

      // Track initial pageview
      await this.trackPageview();

      // Setup scroll tracking
      if (this.config.trackScroll) {
        this.setupScrollTracking();
      }

      // Setup click tracking
      if (this.config.trackClicks) {
        this.setupClickTracking();
      }

      // Setup time tracking (on page leave)
      if (this.config.trackTime) {
        this.setupTimeTracking();
      }

      // Setup flush interval
      this.flushInterval = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);

      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush(true));
      
      // Also flush on visibility change (when tab becomes hidden)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });

      this.isInitialized = true;
      console.log('📊 Tracking initialized successfully!', { sessionId: this.sessionId });
      
      // Force flush initial events
      await this.flush();
      
    } catch (error) {
      console.error('📊 Tracking initialization failed:', error);
    }
  }

  /**
   * Set user ID (call after login)
   */
  setUser(userId, email = null) {
    this.userId = userId;
    console.log('📊 User set:', userId);
    
    // Update session with user info
    this.sendEvent('session_update', {
      user_id: userId,
      email: email,
    });
  }

  /**
   * Track session start
   */
  async trackSession() {
    const sessionData = {
      session_id: this.sessionId,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer_source: getReferrerSource(document.referrer),
      referrer_url: document.referrer || null,
      landing_page: window.location.pathname,
      user_agent: navigator.userAgent,
    };

    console.log('📊 Tracking session start:', sessionData);
    await this.sendEvent('session_start', sessionData);
  }

  /**
   * Track pageview
   */
  async trackPageview(path = null) {
    const pagePath = path || window.location.pathname;
    this.pageStartTime = Date.now();
    this.scrollDepth = 0;

    const data = {
      page_path: pagePath,
      page_title: document.title,
      referrer: document.referrer,
    };

    console.log('📊 Tracking pageview:', data);
    await this.sendEvent('pageview', data);
    
    // Immediately flush pageviews
    await this.flush();
  }

  /**
   * Track button/link click
   */
  async trackClick(element, metadata = {}) {
    const data = {
      page_path: window.location.pathname,
      element_type: element.tagName?.toLowerCase() || 'unknown',
      element_id: element.id || null,
      element_class: typeof element.className === 'string' ? element.className : null,
      element_text: element.textContent?.slice(0, 100)?.trim() || null,
      element_href: element.href || element.getAttribute?.('href') || null,
      ...metadata,
    };

    console.log('📊 Tracking click:', data.element_text || data.element_type);
    await this.sendEvent('click', data);
  }

  /**
   * Track scroll depth
   */
  async trackScroll(depth) {
    if (depth <= this.scrollDepth) return;
    this.scrollDepth = depth;

    console.log('📊 Tracking scroll:', depth + '%');
    await this.sendEvent('scroll', {
      page_path: window.location.pathname,
      scroll_depth: depth,
    });
  }

  /**
   * Track time on page
   */
  async trackTimeOnPage() {
    const timeSpent = Date.now() - this.pageStartTime;
    
    console.log('📊 Tracking time on page:', Math.round(timeSpent / 1000) + 's');
    await this.sendEvent('time_spent', {
      page_path: window.location.pathname,
      time_ms: timeSpent,
    });
  }

  /**
   * Track form submission
   */
  async trackFormSubmit(formName, formData = {}) {
    console.log('📊 Tracking form submit:', formName);
    await this.sendEvent('form_submit', {
      page_path: window.location.pathname,
      form_name: formName,
      ...formData,
    });
  }

  /**
   * Track CTA click
   */
  async trackCTA(ctaName, metadata = {}) {
    console.log('📊 Tracking CTA click:', ctaName);
    await this.sendEvent('cta_click', {
      page_path: window.location.pathname,
      cta_name: ctaName,
      ...metadata,
    });
  }

  /**
   * Track invite code usage
   */
  async trackInviteCode(code, success = true) {
    console.log('📊 Tracking invite code:', code, success ? '✓' : '✗');
    await this.sendEvent('invite_code', {
      page_path: window.location.pathname,
      invite_code: code,
      success: success,
    });
  }

  /**
   * Track vote
   */
  async trackVote(option, metadata = {}) {
    console.log('📊 Tracking vote:', option);
    await this.sendEvent('vote', {
      page_path: window.location.pathname,
      vote_option: option,
      ...metadata,
    });
  }

  /**
   * Track custom event
   */
  async track(eventType, data = {}) {
    console.log('📊 Tracking custom event:', eventType, data);
    await this.sendEvent(eventType, {
      page_path: window.location.pathname,
      ...data,
    });
  }

  /**
   * Send event to queue
   */
  async sendEvent(eventType, data) {
    const event = {
      id: generateEventId(),
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.eventQueue.push(event);
    console.log('📊 Event queued:', eventType, '| Queue size:', this.eventQueue.length);

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Flush event queue to server
   */
  async flush(sync = false) {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    console.log('📊 Flushing', events.length, 'events to', API_URL);

    try {
      // Use short endpoint name to avoid ad blocker detection
      const url = `${API_URL}/api/v1/t/collect`;
      const body = JSON.stringify({ events });

      if (sync && navigator.sendBeacon) {
        // Use sendBeacon for unload events (more reliable)
        const success = navigator.sendBeacon(url, body);
        console.log('📊 SendBeacon result:', success);
        if (!success) {
          // If sendBeacon fails, re-add events
          this.eventQueue = [...events, ...this.eventQueue];
        }
      } else {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 Flush success:', result);
        } else {
          console.error('📊 Flush failed:', response.status, response.statusText);
          // Re-add events to queue on failure
          this.eventQueue = [...events, ...this.eventQueue];
        }
      }
    } catch (error) {
      console.error('📊 Flush error:', error);
      // Re-add events to queue on failure
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * Setup scroll tracking
   */
  setupScrollTracking() {
    let ticking = false;
    
    const updateScrollDepth = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      
      // Track at 25%, 50%, 75%, 100% milestones
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && this.scrollDepth < milestone) {
          this.trackScroll(milestone);
          break;
        }
      }
      
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    }, { passive: true });
    
    console.log('📊 Scroll tracking setup complete');
  }

  /**
   * Setup click tracking
   */
  setupClickTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [role="button"], [data-track]');
      if (target) {
        this.trackClick(target);
      }
    }, { passive: true });
    
    console.log('📊 Click tracking setup complete');
  }

  /**
   * Setup time tracking
   */
  setupTimeTracking() {
    // Track time when page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackTimeOnPage();
      } else {
        this.pageStartTime = Date.now();
      }
    });

    // Track time on page unload
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
    });
    
    console.log('📊 Time tracking setup complete');
  }

  /**
   * Destroy tracking (cleanup)
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(true);
    this.isInitialized = false;
  }
}

// Singleton instance
const tracking = new TrackingService();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      tracking.init().catch(console.error);
    });
  } else {
    // DOM already loaded
    tracking.init().catch(console.error);
  }
}

export default tracking;
export { tracking, TrackingService };
