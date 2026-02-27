import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getAuthToken, getCurrentUser } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useMagic } from '../providers/MagicProvider';
import { useTheme } from '../providers/ThemeProvider';

/**
 * Admin Dashboard - Stunning design for ParagonDAO administrators
 * Features: Invite management, Analytics overview, User tracking
 */
export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useMagic();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check both Magic.link auth and localStorage auth
  const storedUser = getCurrentUser();
  const isAuthenticated = isLoggedIn || !!storedUser;
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('invites');
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  
  // New invite form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvite, setNewInvite] = useState({
    prefix: 'PARAGON',
    type: 'user',
    max_uses: 1,
    notes: ''
  });

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBgHover: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  // Styles
  const styles = {
    page: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      transition: 'background 0.3s ease',
    },
    header: {
      background: isDark ? 'rgba(10, 10, 18, 0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: isDark ? '1px solid rgba(0, 212, 255, 0.1)' : '1px solid rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerInner: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '12px 16px' : '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '12px' : '0',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '10px' : '16px',
    },
    logoIcon: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '20px' : '24px',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
      flexShrink: 0,
    },
    logoText: {
      display: 'flex',
      flexDirection: 'column',
    },
    logoTitle: {
      fontSize: isMobile ? '16px' : '20px',
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: '-0.5px',
    },
    logoSubtitle: {
      fontSize: isMobile ? '11px' : '13px',
      color: colors.textSecondary,
      maxWidth: isMobile ? '140px' : 'none',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '16px',
    },
    backButton: {
      padding: isMobile ? '8px 12px' : '10px 20px',
      borderRadius: '10px',
      background: colors.cardBgHover,
      border: `1px solid ${colors.cardBorder}`,
      color: colors.textSecondary,
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    logoutButton: {
      padding: isMobile ? '8px 12px' : '10px 20px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    main: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '20px 16px' : '32px 24px',
    },
    welcomeSection: {
      marginBottom: isMobile ? '24px' : '32px',
    },
    welcomeTitle: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: '8px',
      letterSpacing: '-1px',
    },
    welcomeSubtitle: {
      fontSize: isMobile ? '14px' : '16px',
      color: colors.textMuted,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: isMobile ? '12px' : '20px',
      marginBottom: isMobile ? '24px' : '32px',
    },
    statCard: {
      background: isDark 
        ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(30, 30, 50, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      borderRadius: isMobile ? '14px' : '20px',
      padding: isMobile ? '16px' : '28px',
      border: `1px solid ${colors.cardBorder}`,
      position: 'relative',
      overflow: 'hidden',
    },
    statCardGlow: (color) => ({
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '150px',
      height: '150px',
      background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      pointerEvents: 'none',
    }),
    statLabel: {
      fontSize: isMobile ? '10px' : '14px',
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: isMobile ? '0.5px' : '1px',
      marginBottom: isMobile ? '6px' : '12px',
    },
    statValue: (color) => ({
      fontSize: isMobile ? '28px' : '48px',
      fontWeight: '700',
      color: color,
      letterSpacing: '-2px',
      lineHeight: '1',
    }),
    statTrend: {
      marginTop: isMobile ? '6px' : '12px',
      fontSize: isMobile ? '10px' : '13px',
      color: colors.textMuted,
      display: isMobile ? 'none' : 'block',
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      marginBottom: isMobile ? '16px' : '24px',
      background: isDark ? 'rgba(20, 20, 35, 0.5)' : 'rgba(0,0,0,0.03)',
      padding: '4px',
      borderRadius: '12px',
      width: isMobile ? '100%' : 'fit-content',
      overflowX: 'auto',
    },
    tab: (active) => ({
      padding: isMobile ? '10px 14px' : '12px 24px',
      borderRadius: '10px',
      background: active ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'transparent',
      color: active ? '#ffffff' : colors.textMuted,
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      flex: isMobile ? 1 : 'none',
    }),
    actionBar: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      marginBottom: isMobile ? '16px' : '24px',
      flexWrap: 'wrap',
      gap: isMobile ? '12px' : '16px',
      flexDirection: isMobile ? 'column' : 'row',
    },
    sectionTitle: {
      fontSize: isMobile ? '18px' : '24px',
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: '-0.5px',
    },
    createButton: {
      padding: isMobile ? '12px 20px' : '14px 28px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
      color: colors.textPrimary,
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 8px 32px rgba(0, 212, 255, 0.25)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: isMobile ? '100%' : 'auto',
    },
    formCard: {
      background: isDark 
        ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '20px' : '32px',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      marginBottom: isMobile ? '16px' : '24px',
      boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.1)',
    },
    formTitle: {
      fontSize: isMobile ? '16px' : '20px',
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: isMobile ? '16px' : '24px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '14px' : '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      padding: '14px 18px',
      borderRadius: '12px',
      background: colors.inputBg,
      border: `1px solid ${colors.inputBorder}`,
      color: colors.textPrimary,
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    select: {
      padding: '14px 18px',
      borderRadius: '12px',
      background: colors.inputBg,
      border: `1px solid ${colors.inputBorder}`,
      color: colors.textPrimary,
      fontSize: '15px',
      outline: 'none',
      cursor: 'pointer',
    },
    submitButton: {
      padding: '16px 32px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
      color: colors.textPrimary,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      marginTop: '24px',
    },
    tableCard: {
      background: isDark 
        ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(30, 30, 50, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      borderRadius: isMobile ? '16px' : '20px',
      overflow: 'hidden',
      border: `1px solid ${colors.cardBorder}`,
    },
    tableWrapper: {
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: isMobile ? '600px' : 'auto',
    },
    th: {
      padding: isMobile ? '12px 14px' : '18px 24px',
      textAlign: 'left',
      fontSize: isMobile ? '10px' : '12px',
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
      borderBottom: `1px solid ${colors.cardBorder}`,
      whiteSpace: 'nowrap',
    },
    td: {
      padding: isMobile ? '14px' : '20px 24px',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}`,
    },
    codeCell: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '14px',
      color: '#00d4ff',
      cursor: 'pointer',
      padding: '8px 12px',
      background: 'rgba(0, 212, 255, 0.1)',
      borderRadius: '8px',
      display: 'inline-block',
      transition: 'all 0.2s ease',
    },
    badge: (type) => {
      const colors = {
        admin: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
        company: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
        user: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
        active: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
        inactive: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      };
      const c = colors[type] || colors.user;
      return {
        padding: '6px 14px',
        borderRadius: '20px',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize',
      };
    },
    usageBar: {
      width: '120px',
      height: '8px',
      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    usageFill: (percent) => ({
      width: `${Math.min(percent, 100)}%`,
      height: '100%',
      background: percent >= 80 ? '#ef4444' : percent >= 50 ? '#f59e0b' : '#22c55e',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    }),
    actionButton: (variant) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : colors.cardBgHover,
      border: `1px solid ${variant === 'danger' ? 'rgba(239, 68, 68, 0.3)' : colors.cardBorder}`,
      color: variant === 'danger' ? '#ef4444' : colors.textSecondary,
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    emptyState: {
      padding: '60px 24px',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '16px',
      color: colors.textMuted,
    },
    alert: (type) => ({
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '24px',
      background: type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      border: `1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
      color: type === 'error' ? '#fca5a5' : '#86efac',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }),
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '3px solid rgba(0, 212, 255, 0.1)',
      borderTopColor: '#00d4ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    // Analytics styles
    analyticsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '16px' : '24px',
      marginBottom: isMobile ? '24px' : '32px',
    },
    chartCard: {
      background: isDark 
        ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(30, 30, 50, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '16px' : '24px',
      border: `1px solid ${colors.cardBorder}`,
    },
    chartTitle: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: isMobile ? '14px' : '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    periodSelector: {
      display: 'flex',
      gap: '4px',
      background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
      padding: '4px',
      borderRadius: '10px',
    },
    periodButton: (active) => ({
      padding: isMobile ? '6px 12px' : '8px 16px',
      borderRadius: '8px',
      background: active ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
      border: active ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
      color: active ? '#00d4ff' : colors.textMuted,
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    barChart: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      height: '120px',
      marginTop: '16px',
    },
    bar: (height, color) => ({
      flex: 1,
      height: `${height}%`,
      background: `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`,
      borderRadius: '4px 4px 0 0',
      transition: 'height 0.3s ease',
      minHeight: '4px',
    }),
    barLabel: {
      fontSize: '10px',
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: '8px',
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    },
    listLabel: {
      fontSize: '14px',
      color: colors.textSecondary,
    },
    listValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: colors.textPrimary,
    },
    eventRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}`,
      gap: '16px',
    },
    eventType: (type) => {
      const colors = {
        pageview: '#00d4ff',
        click: '#f59e0b',
        scroll: '#22c55e',
        form_submit: '#a855f7',
        cta_click: '#f472b6',
      };
      return {
        padding: '4px 10px',
        borderRadius: '6px',
        background: `${colors[type] || '#6b7280'}20`,
        color: colors[type] || '#6b7280',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
      };
    },
    eventPath: {
      fontSize: '13px',
      color: colors.textSecondary,
      fontFamily: "'JetBrains Mono', monospace",
    },
    eventTime: {
      fontSize: '12px',
      color: colors.textMuted,
      marginLeft: 'auto',
    },
  };

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login?redirect=/admin');
        return;
      }

      try {
        const result = await api.checkAdmin();
        if (result.is_admin) {
          setIsAdmin(true);
          setUser(getCurrentUser() || { email: result.email });
          await loadInvites();
        } else {
          setError('You do not have admin access');
        }
      } catch (err) {
        setError('Failed to verify admin access');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  // Load analytics when tab changes
  useEffect(() => {
    if (activeTab === 'analytics' && isAdmin) {
      loadAnalytics();
    }
  }, [activeTab, selectedPeriod, isAdmin]);

  const loadInvites = async () => {
    try {
      const result = await api.listInvites({ limit: 100 });
      if (result.invite_codes) {
        setInvites(result.invite_codes);
      }
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [summaryResult, eventsResult] = await Promise.all([
        api.getAnalyticsSummary(selectedPeriod),
        api.getAnalyticsEvents({ limit: 50 })
      ]);
      
      if (summaryResult.success) {
        setAnalytics(summaryResult);
      }
      if (eventsResult.success) {
        setRecentEvents(eventsResult.events || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await api.createInvite(newInvite);
      if (result.success) {
        setSuccess(`🎉 Invite code created: ${result.invite_code.code}`);
        setShowCreateForm(false);
        setNewInvite({ prefix: 'PARAGON', type: 'user', max_uses: 1, notes: '' });
        await loadInvites();
      } else {
        setError(result.error || 'Failed to create invite');
      }
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    }
  };

  const handleToggleActive = async (invite) => {
    try {
      await api.updateInvite(invite.id, { is_active: !invite.is_active });
      await loadInvites();
      setSuccess(`Invite ${invite.is_active ? 'disabled' : 'enabled'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update invite');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invite code?')) return;
    
    try {
      await api.deleteInvite(id);
      await loadInvites();
      setSuccess('Invite deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete invite');
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess(`📋 Copied: ${code}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Calculate stats
  const totalCodes = invites.length;
  const activeCodes = invites.filter(i => i.is_active).length;
  const totalUses = invites.reduce((sum, i) => sum + (i.used_count || 0), 0);
  const adminCodes = invites.filter(i => i.type === 'admin').length;

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '24px', color: colors.textMuted, fontSize: '15px' }}>
          Verifying admin access...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary, marginBottom: '12px' }}>
            Access Denied
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '24px' }}>
            {error || 'You do not have admin access to this dashboard.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={styles.createButton}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        input::placeholder { color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}; }
        button:hover { transform: translateY(-1px); }
        .code-cell:hover { background: rgba(0, 212, 255, 0.2); }
      `}</style>
      
      {/* Shared Header */}
      <Header 
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/login')}
      />

      {/* Main Content */}
      <main style={{ ...styles.main, paddingTop: '80px' }}>
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.welcomeSection}
        >
          <h1 style={styles.welcomeTitle}>Welcome back, Admin 👋</h1>
          <p style={styles.welcomeSubtitle}>
            Manage invite codes, track analytics, and oversee the ParagonDAO ecosystem.
          </p>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={styles.alert('error')}
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={styles.alert('success')}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.statCard}
          >
            <div style={styles.statCardGlow('#00d4ff')}></div>
            <p style={styles.statLabel}>Total Invite Codes</p>
            <p style={styles.statValue('#ffffff')}>{totalCodes}</p>
            <p style={styles.statTrend}>All time codes generated</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.statCard}
          >
            <div style={styles.statCardGlow('#22c55e')}></div>
            <p style={styles.statLabel}>Active Codes</p>
            <p style={styles.statValue('#22c55e')}>{activeCodes}</p>
            <p style={styles.statTrend}>{totalCodes > 0 ? Math.round((activeCodes / totalCodes) * 100) : 0}% of total</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.statCard}
          >
            <div style={styles.statCardGlow('#00d4ff')}></div>
            <p style={styles.statLabel}>Total Uses</p>
            <p style={styles.statValue('#00d4ff')}>{totalUses}</p>
            <p style={styles.statTrend}>Members joined via codes</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={styles.statCard}
          >
            <div style={styles.statCardGlow('#a855f7')}></div>
            <p style={styles.statLabel}>Admin Codes</p>
            <p style={styles.statValue('#a855f7')}>{adminCodes}</p>
            <p style={styles.statTrend}>Privileged access codes</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === 'invites')} onClick={() => setActiveTab('invites')}>
            🎫 Invite Codes
          </button>
          <button style={styles.tab(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </button>
          <button style={styles.tab(activeTab === 'users')} onClick={() => setActiveTab('users')}>
            👥 Users
          </button>
        </div>

        {/* Invite Codes Tab */}
        {activeTab === 'invites' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Action Bar */}
            <div style={styles.actionBar}>
              <h2 style={styles.sectionTitle}>Invite Codes</h2>
              <button onClick={() => setShowCreateForm(!showCreateForm)} style={styles.createButton}>
                {showCreateForm ? '✕ Cancel' : '+ Create Invite'}
              </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.formCard}
                >
                  <h3 style={styles.formTitle}>Create New Invite Code</h3>
                  <form onSubmit={handleCreateInvite}>
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Prefix</label>
                        <select
                          value={newInvite.prefix}
                          onChange={(e) => setNewInvite({ ...newInvite, prefix: e.target.value })}
                          style={styles.select}
                        >
                          <option value="PARAGON">PARAGON</option>
                          <option value="DAO">DAO</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Type</label>
                        <select
                          value={newInvite.type}
                          onChange={(e) => setNewInvite({ ...newInvite, type: e.target.value })}
                          style={styles.select}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="company">Company</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Max Uses</label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={newInvite.max_uses}
                          onChange={(e) => setNewInvite({ ...newInvite, max_uses: parseInt(e.target.value) })}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Notes</label>
                        <input
                          type="text"
                          value={newInvite.notes}
                          onChange={(e) => setNewInvite({ ...newInvite, notes: e.target.value })}
                          placeholder="e.g., For early adopters"
                          style={styles.input}
                        />
                      </div>
                    </div>
                    <button type="submit" style={styles.submitButton}>
                      ✨ Generate Invite Code
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Usage</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Notes</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🎫</div>
                        <p style={styles.emptyText}>No invite codes yet. Create one above.</p>
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite) => {
                      const usagePercent = invite.max_uses > 0 
                        ? (invite.used_count / invite.max_uses) * 100 
                        : 0;
                      return (
                        <tr key={invite.id}>
                          <td style={styles.td}>
                            <span
                              className="code-cell"
                              onClick={() => copyToClipboard(invite.code)}
                              style={styles.codeCell}
                              title="Click to copy"
                            >
                              {invite.code}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(invite.type)}>{invite.type}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '500' }}>
                                {invite.used_count} / {invite.max_uses}
                              </span>
                              <div style={styles.usageBar}>
                                <div style={styles.usageFill(usagePercent)}></div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(invite.is_active ? 'active' : 'inactive')}>
                              {invite.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: colors.textMuted, fontSize: '14px' }}>
                            {invite.notes || '—'}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => handleToggleActive(invite)}
                                style={styles.actionButton('default')}
                              >
                                {invite.is_active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleDelete(invite.id)}
                                style={styles.actionButton('danger')}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.actionBar}>
              <h2 style={styles.sectionTitle}>Analytics Dashboard</h2>
              <div style={styles.periodSelector}>
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    style={styles.periodButton(selectedPeriod === days)}
                    onClick={() => setSelectedPeriod(days)}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ ...styles.spinner, margin: '0 auto 16px' }}></div>
                <p style={{ color: colors.textMuted }}>Loading analytics...</p>
              </div>
            ) : analytics ? (
              <>
                {/* Analytics Stats */}
                <div style={styles.statsGrid}>
                  <motion.div style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={styles.statCardGlow('#00d4ff')}></div>
                    <p style={styles.statLabel}>Total Sessions</p>
                    <p style={styles.statValue('#00d4ff')}>{analytics.totals?.total_sessions || 0}</p>
                    <p style={styles.statTrend}>Last {selectedPeriod} days</p>
                  </motion.div>
                  <motion.div style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={styles.statCardGlow('#22c55e')}></div>
                    <p style={styles.statLabel}>Page Views</p>
                    <p style={styles.statValue('#22c55e')}>{analytics.totals?.total_pageviews || 0}</p>
                    <p style={styles.statTrend}>Last {selectedPeriod} days</p>
                  </motion.div>
                  <motion.div style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div style={styles.statCardGlow('#f59e0b')}></div>
                    <p style={styles.statLabel}>Total Clicks</p>
                    <p style={styles.statValue('#f59e0b')}>{analytics.totals?.total_clicks || 0}</p>
                    <p style={styles.statTrend}>Last {selectedPeriod} days</p>
                  </motion.div>
                  <motion.div style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={styles.statCardGlow('#a855f7')}></div>
                    <p style={styles.statLabel}>Form Submissions</p>
                    <p style={styles.statValue('#a855f7')}>{analytics.totals?.total_form_submissions || 0}</p>
                    <p style={styles.statTrend}>Last {selectedPeriod} days</p>
                  </motion.div>
                </div>

                {/* Charts Row */}
                <div style={styles.analyticsGrid}>
                  {/* Daily Trend Chart */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>
                      <span>📈</span> Daily Traffic
                    </h3>
                    {analytics.daily_trends?.length > 0 ? (
                      <div>
                        <div style={styles.barChart}>
                          {analytics.daily_trends.slice(-7).map((day, i) => {
                            const maxViews = Math.max(...analytics.daily_trends.map(d => d.pageviews || 0), 1);
                            const height = ((day.pageviews || 0) / maxViews) * 100;
                            return (
                              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={styles.bar(height, '#00d4ff')}></div>
                                <div style={styles.barLabel}>{day.date?.slice(-5)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
                        No data yet
                      </p>
                    )}
                  </div>

                  {/* Top Pages */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>
                      <span>🔥</span> Top Pages
                    </h3>
                    {analytics.top_pages?.length > 0 ? (
                      <div>
                        {analytics.top_pages.slice(0, 5).map((page, i) => (
                          <div key={i} style={styles.listItem}>
                            <span style={styles.listLabel}>{page.page_path || '/'}</span>
                            <span style={styles.listValue}>{page.views} views</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
                        No data yet
                      </p>
                    )}
                  </div>

                  {/* Traffic Sources */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>
                      <span>🌐</span> Traffic Sources
                    </h3>
                    {analytics.referrers?.length > 0 ? (
                      <div>
                        {analytics.referrers.slice(0, 5).map((ref, i) => (
                          <div key={i} style={styles.listItem}>
                            <span style={styles.listLabel}>{ref.referrer_source || 'direct'}</span>
                            <span style={styles.listValue}>{ref.count} visits</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
                        No data yet
                      </p>
                    )}
                  </div>

                  {/* Device Types */}
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>
                      <span>📱</span> Devices
                    </h3>
                    {analytics.devices?.length > 0 ? (
                      <div>
                        {analytics.devices.map((device, i) => (
                          <div key={i} style={styles.listItem}>
                            <span style={styles.listLabel}>
                              {device.device_type === 'desktop' ? '💻' : device.device_type === 'mobile' ? '📱' : '📟'} {device.device_type || 'unknown'}
                            </span>
                            <span style={styles.listValue}>{device.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
                        No data yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Events */}
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>
                    <span>⚡</span> Live Event Stream
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event, i) => (
                        <div key={i} style={styles.eventRow}>
                          <span style={styles.eventType(event.event_type)}>{event.event_type}</span>
                          <span style={styles.eventPath}>{event.page_path}</span>
                          {event.element_text && (
                            <span style={{ fontSize: '12px', color: colors.textMuted }}>
                              "{event.element_text?.slice(0, 30)}"
                            </span>
                          )}
                          <span style={styles.eventTime}>{formatTimeAgo(event.created_at)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: colors.textMuted, textAlign: 'center', padding: '40px' }}>
                        No events recorded yet. Events will appear here as users interact with the site.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ ...styles.tableCard, padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>📊</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary, marginBottom: '12px' }}>
                  No Analytics Data
                </h3>
                <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '400px', margin: '0 auto' }}>
                  Analytics tracking is active. Data will appear here as users visit and interact with the site.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.actionBar}>
              <h2 style={styles.sectionTitle}>User Management</h2>
            </div>
            <div style={{ ...styles.tableCard, padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>👥</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.textPrimary, marginBottom: '12px' }}>
                Coming Soon
              </h3>
              <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '400px', margin: '0 auto' }}>
                View all registered users, manage roles, and monitor activity.
                User management is being developed.
              </p>
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
