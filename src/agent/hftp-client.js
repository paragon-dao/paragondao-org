/**
 * HFTP Client — Browser Edition
 *
 * Connects to the HFTP registry for live network stats.
 * Used by NetworkPage to show connected nodes and aggregates.
 *
 * Protocol: speaks the unified HFTP protocol (register/health/heartbeat).
 * Registry responds with welcome/peers/aggregate messages.
 *
 * Raw health data NEVER leaves the device — only GLE coefficients (512 bytes).
 *
 * @see paragon-node/src/network/hftp/types.ts for protocol spec
 */

// Registry URL priority: env var > production > localhost
const REGISTRY_URL = import.meta.env.VITE_HFTP_REGISTRY_URL
  || (import.meta.env.PROD ? 'wss://paragon-polaris.fly.dev' : 'ws://localhost:8775');

export class HFTPClient {
  constructor(hubUrl = REGISTRY_URL, userId = null) {
    this.hubUrl = hubUrl;

    // Persist node ID per browser session so reconnects don't create new nodes
    if (!userId) {
      const stored = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('hftp-node-id');
      if (stored) {
        this.userId = stored;
      } else {
        this.userId = this.generateNodeId();
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('hftp-node-id', this.userId);
      }
    } else {
      this.userId = userId;
    }

    this.ws = null;
    this.connected = false;
    this.peers = new Map();
    this.networkAggregates = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;

    // Callbacks — set by consumer
    this.onPeersUpdate = null;
    this.onAggregateUpdate = null;
    this.onConnectionChange = null;
  }

  generateNodeId() {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return 'browser-' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Connect to HFTP registry.
   * Resolves when connected, rejects on initial failure.
   * Auto-reconnects on disconnect.
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.hubUrl);

        this.ws.onopen = () => {
          this.connected = true;
          if (this.onConnectionChange) this.onConnectionChange(true);

          // Register as a browser observer (haven type for phone nodes, builder for dev tools)
          this.send({
            type: 'register',
            nodeId: this.userId,
            nodeType: 'haven',
            region: this.detectRegion(),
            timestamp: Date.now(),
          });

          // Start heartbeat every 15s
          this.heartbeatTimer = setInterval(() => {
            this.send({ type: 'heartbeat', nodeId: this.userId, timestamp: Date.now() });
          }, 15000);

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleMessage(msg);
          } catch {
            // Ignore malformed messages
          }
        };

        this.ws.onclose = () => {
          const wasConnected = this.connected;
          this.connected = false;
          this.clearHeartbeat();
          if (wasConnected && this.onConnectionChange) this.onConnectionChange(false);
          this.scheduleReconnect();
        };

        this.ws.onerror = () => {
          if (!this.connected) reject(new Error('connection failed'));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Handle incoming messages from registry.
   */
  handleMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        // Registry confirms registration
        break;

      case 'peers':
        this.peers.clear();
        for (const peer of msg.peers) {
          this.peers.set(peer.nodeId, {
            nodeId: peer.nodeId,
            type: peer.type,
            region: peer.region,
            lastSeen: peer.lastSeen,
            breathingAttested: peer.breathingAttested,
            healthSummary: peer.healthSummary,
          });
        }
        if (this.onPeersUpdate) this.onPeersUpdate(this.getPeerList());
        break;

      case 'aggregate':
        this.networkAggregates = {
          activeAgents: msg.activeAgents,
          avgStressLevel: msg.avgStressLevel,
          avgBreathingDepth: msg.avgBreathingDepth,
          dominantClassification: msg.dominantClassification,
          timestamp: msg.timestamp,
        };
        if (this.onAggregateUpdate) this.onAggregateUpdate(this.networkAggregates);
        break;

      case 'error':
        console.warn(`[hftp] registry error [${msg.code}]: ${msg.message}`);
        break;
    }
  }

  /**
   * Send a health packet (called after GLE encoding completes on-device).
   *
   * @param {object} packet - { coefficients: number[128], breathingAttested, healthSummary }
   */
  sendHealthPacket(packet) {
    this.send({
      type: 'health',
      nodeId: this.userId,
      coefficients: packet.coefficients,
      breathingAttested: packet.breathingAttested,
      healthSummary: packet.healthSummary,
      timestamp: Date.now(),
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  getPeerCount() {
    return this.peers.size;
  }

  getPeerList() {
    return [...this.peers.values()];
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        // Will retry on next cycle
      });
    }, 5000);
  }

  clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  disconnect() {
    this.clearHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  /**
   * Auto-detect region from browser timezone.
   * Returns a rough region string for display purposes.
   */
  detectRegion() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Map common timezones to short region codes
      if (tz.includes('America/New_York') || tz.includes('America/Chicago')) return 'us-east';
      if (tz.includes('America/Denver') || tz.includes('America/Boise')) return 'us-mountain';
      if (tz.includes('America/Los_Angeles')) return 'us-west';
      if (tz.includes('Africa/Johannesburg')) return 'za-jhb';
      if (tz.includes('Africa/Nairobi')) return 'ke-nbi';
      if (tz.includes('Africa/Addis_Ababa')) return 'eth-addis';
      if (tz.includes('Europe/London')) return 'uk';
      if (tz.includes('Asia/Ho_Chi_Minh') || tz.includes('Asia/Saigon')) return 'vn-hcm';
      // Fallback: use first part of timezone
      return tz.split('/').pop()?.toLowerCase().slice(0, 16) || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
