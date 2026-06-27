import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Key,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Search,
  Wifi,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Phone,
  Globe,
  Zap,
  BarChart3,
  Shield,
} from 'lucide-react';
import type { SmsLog } from './lib/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function apiFetch(path: string, init?: RequestInit) {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const route = path.startsWith('/') ? path : `/${path}`;

  return fetch(`${base}${route}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

type Tab = 'send' | 'logs' | 'quota';

interface Country {
  code: string;
  name: string;
  flag: string;
  dial: string;
  region: string;
}

const COUNTRIES: Country[] = [
  // Asia-Pacific (prioritized)
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dial: '+60', region: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dial: '+65', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dial: '+62', region: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dial: '+66', region: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dial: '+63', region: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dial: '+84', region: 'Asia' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dial: '+880', region: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91', region: 'Asia' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dial: '+92', region: 'Asia' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dial: '+94', region: 'Asia' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dial: '+95', region: 'Asia' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', dial: '+855', region: 'Asia' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', dial: '+856', region: 'Asia' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', dial: '+673', region: 'Asia' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dial: '+86', region: 'Asia' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dial: '+81', region: 'Asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dial: '+82', region: 'Asia' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dial: '+886', region: 'Asia' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dial: '+852', region: 'Asia' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', dial: '+853', region: 'Asia' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dial: '+977', region: 'Asia' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', dial: '+960', region: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dial: '+61', region: 'Asia Pacific' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dial: '+64', region: 'Asia Pacific' },
  // Middle East
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dial: '+966', region: 'Middle East' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dial: '+971', region: 'Middle East' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dial: '+974', region: 'Middle East' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dial: '+965', region: 'Middle East' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dial: '+973', region: 'Middle East' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dial: '+968', region: 'Middle East' },
  // Rest of world
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '+1', region: 'Americas' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dial: '+1', region: 'Americas' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dial: '+49', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '+33', region: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dial: '+39', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dial: '+34', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dial: '+31', region: 'Europe' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dial: '+27', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dial: '+234', region: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dial: '+254', region: 'Africa' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dial: '+55', region: 'Americas' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dial: '+52', region: 'Americas' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dial: '+54', region: 'Americas' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    DELIVERED: {
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={12} />,
      label: 'Dihantar',
    },
    SENT: {
      color: 'bg-sky-100 text-sky-700 border-sky-200',
      icon: <CheckCircle size={12} />,
      label: 'Terhantar',
    },
    SENDING: {
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <Clock size={12} />,
      label: 'Menghantar',
    },
    PENDING: {
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Clock size={12} />,
      label: 'Menunggu',
    },
    FAILED: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: <XCircle size={12} />,
      label: 'Gagal',
    },
    UNKNOWN: {
      color: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: <AlertCircle size={12} />,
      label: 'Tidak Diketahui',
    },
  };
  const s = map[status] ?? map.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return new Date(iso).toLocaleDateString('ms-MY');
}

function CountrySelector({
  selected,
  onSelect,
}: {
  selected: Country;
  onSelect: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Country[]>>((acc, c) => {
    acc[c.region] = acc[c.region] ?? [];
    acc[c.region].push(c);
    return acc;
  }, {});

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-full px-3 border-r border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-l-xl min-w-[90px]"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-mono text-slate-600">{selected.dial}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari negara..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {Object.entries(grouped).map(([region, countries]) => (
              <div key={region}>
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 sticky top-0">
                  {region}
                </div>
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onSelect(c); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-sky-50 transition-colors text-left ${selected.code === c.code ? 'bg-sky-50' : ''}`}
                  >
                    <span className="text-lg leading-none w-7 text-center">{c.flag}</span>
                    <span className="flex-1 text-slate-700 font-medium">{c.name}</span>
                    <span className="font-mono text-slate-400 text-xs">{c.dial}</span>
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm">Tiada hasil</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('send');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tb_api_key') ?? '');
  const [country, setCountry] = useState<Country>(() => {
    const saved = localStorage.getItem('tb_country');
    return saved ? JSON.parse(saved) : COUNTRIES[0]; // Default Malaysia +60
  });
  const [localPhone, setLocalPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [quota, setQuota] = useState<{ remaining: number | null; loading: boolean; error: string }>({
    remaining: null,
    loading: false,
    error: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const fullPhone = localPhone ? `${country.dial}${localPhone.replace(/^0+/, '')}` : '';
  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  useEffect(() => {
    if (apiKey) localStorage.setItem('tb_api_key', apiKey);
    else localStorage.removeItem('tb_api_key');
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('tb_country', JSON.stringify(country));
  }, [country]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await apiFetch('/sms-logs?limit=100');
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = (await res.json()) as SmsLog[];
      setLogs(data ?? []);
    } catch {
      setLogs([]);
    }
    setLogsLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'logs') fetchLogs();
  }, [tab, fetchLogs]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !fullPhone.trim() || !message.trim()) return;
    setSending(true);
    setSendResult(null);

    const keyHint = apiKey.length > 6 ? `${apiKey.slice(0, 3)}...${apiKey.slice(-3)}` : '***';

    try {
      const res = await apiFetch('/sms/send', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone, message, key: apiKey }),
      });
      const data = await res.json();

      await apiFetch('/sms-logs', {
        method: 'POST',
        body: JSON.stringify({
          phone: fullPhone,
          message,
          api_key_hint: keyHint,
          status: data.success ? 'SENT' : 'FAILED',
          text_id: data.textId ? String(data.textId) : '',
          quota_remaining: data.quotaRemaining ?? -1,
          error: data.error ?? '',
        }),
      });

      if (data.success) {
        setSendResult({ success: true, msg: `Mesej berjaya dihantar! Baki kuota: ${data.quotaRemaining}` });
        setLocalPhone('');
        setMessage('');
      } else {
        setSendResult({ success: false, msg: data.error ?? 'Gagal menghantar mesej.' });
      }
    } catch {
      setSendResult({ success: false, msg: 'Ralat rangkaian. Sila cuba semula.' });
    } finally {
      setSending(false);
    }
  }

  async function checkQuota() {
    if (!apiKey.trim()) return;
    setQuota({ remaining: null, loading: true, error: '' });
    try {
      const res = await apiFetch(`/sms/quota/${encodeURIComponent(apiKey)}`);
      const data = await res.json();
      if (data.success !== false) {
        setQuota({ remaining: data.quotaRemaining, loading: false, error: '' });
      } else {
        setQuota({ remaining: null, loading: false, error: data.error ?? 'Kunci tidak sah.' });
      }
    } catch {
      setQuota({ remaining: null, loading: false, error: 'Ralat rangkaian.' });
    }
  }

  async function checkMessageStatus(log: SmsLog) {
    if (!log.text_id) return;
    setCheckingStatus(log.id);
    try {
      const res = await apiFetch(`/sms/status/${log.text_id}`);
      const data = await res.json();
      const newStatus = data.status ?? 'UNKNOWN';
      await apiFetch(`/sms-logs/${log.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setLogs((prev) => prev.map((l) => (l.id === log.id ? { ...l, status: newStatus } : l)));
    } catch {
      // silent
    } finally {
      setCheckingStatus(null);
    }
  }

  async function deleteLog(id: string) {
    await apiFetch(`/sms-logs/${id}`, { method: 'DELETE' });
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filteredLogs = logs.filter(
    (l) =>
      l.phone.includes(searchQuery) ||
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'send', label: 'Hantar SMS', icon: <Send size={15} /> },
    { id: 'logs', label: 'Log Mesej', icon: <MessageSquare size={15} /> },
    { id: 'quota', label: 'Kunci & Kuota', icon: <Key size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md shadow-sky-200">
              <MessageSquare size={17} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-none">SMS Gateway</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Globe size={10} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Asia Priority</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${apiKey ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {apiKey ? 'Kunci Aktif' : 'Tiada Kunci'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* SEND TAB */}
        {tab === 'send' && (
          <div className="space-y-5">
            {!apiKey && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  Tiada kunci API dikonfigurasi. Pergi ke tab{' '}
                  <button className="font-semibold underline underline-offset-2" onClick={() => setTab('quota')}>
                    Kunci &amp; Kuota
                  </button>{' '}
                  untuk menetapkan satu. Gunakan{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">textbelt</code>{' '}
                  untuk 1 mesej percuma sehari.
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">Tulis Mesej</h2>
                <p className="text-sm text-slate-500 mt-0.5">Hantar SMS melalui Textbelt API — sokongan penuh Asia</p>
              </div>

              <form onSubmit={handleSend} className="p-6 space-y-5">
                {/* Phone number input with country selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombor Telefon Penerima
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-300 focus-within:border-transparent transition-all bg-white">
                    <CountrySelector selected={country} onSelect={setCountry} />
                    <input
                      type="tel"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value.replace(/[^\d\s\-]/g, ''))}
                      placeholder="11 1234 5678"
                      className="flex-1 px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                  {fullPhone && (
                    <p className="text-xs text-sky-600 mt-1.5 font-medium font-mono">
                      Nombor penuh: {fullPhone}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Masukkan nombor tanpa kod negara — {country.flag} {country.name} ({country.dial}) dipilih
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kandungan Mesej</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Taip mesej anda di sini..."
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition resize-none"
                    required
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-slate-400">
                      {smsSegments > 1 ? (
                        <span className="text-amber-500 font-medium">{smsSegments} segmen SMS</span>
                      ) : null}
                    </p>
                    <p className={`text-xs font-semibold tabular-nums ${charCount > 320 ? 'text-red-500' : charCount > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {charCount} / 160
                    </p>
                  </div>
                </div>

                {sendResult && (
                  <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${sendResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {sendResult.success ? (
                      <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    )}
                    {sendResult.msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || !apiKey.trim() || !fullPhone.trim() || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-sm shadow-sky-200 disabled:shadow-none"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Menghantar...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Hantar Mesej
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Zap size={16} className="text-amber-500" />, label: 'Kunci Percuma', value: 'textbelt', sub: '1 mesej/hari', bg: 'bg-amber-50 border-amber-100' },
                { icon: <Phone size={16} className="text-sky-500" />, label: 'Negara Asia', value: '20+', sub: 'disokong', bg: 'bg-sky-50 border-sky-100' },
                { icon: <BarChart3 size={16} className="text-emerald-500" />, label: 'Penjejak Status', value: 'Live', sub: 'penghantaran langsung', bg: 'bg-emerald-50 border-emerald-100' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
                  <div className="flex justify-center mb-1.5">{s.icon}</div>
                  <div className="text-base font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {tab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nombor, mesej atau status..."
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white transition"
                />
              </div>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Muat Semula</span>
              </button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
                <RefreshCw size={16} className="animate-spin text-sky-400" />
                Memuatkan log...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
                <MessageSquare size={40} className="text-slate-200 mb-3" />
                <p className="text-slate-600 font-semibold">Tiada mesej</p>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery ? 'Tiada hasil sepadan carian.' : 'Hantar mesej pertama anda untuk melihatnya di sini.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Phone size={15} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900 tabular-nums">{log.phone}</span>
                          <StatusBadge status={log.status} />
                          <span className="text-xs text-slate-400 ml-auto">{timeAgo(log.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-0.5">{log.message}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {log.text_id && (
                          <button
                            onClick={() => checkMessageStatus(log)}
                            disabled={checkingStatus === log.id}
                            title="Semak status penghantaran"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <Wifi size={14} className={checkingStatus === log.id ? 'animate-pulse' : ''} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLog(log.id)}
                          title="Padam"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                        >
                          {expandedLog === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {expandedLog === log.id && (
                      <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Nombor Telefon</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.phone}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Text ID</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.text_id || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Kunci API</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.api_key_hint || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Baki Kuota</span>
                            <p className="text-slate-700 mt-0.5">{log.quota_remaining >= 0 ? log.quota_remaining : '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Dihantar Pada</span>
                            <p className="text-slate-700 mt-0.5">{new Date(log.created_at).toLocaleString('ms-MY')}</p>
                          </div>
                          {log.error && (
                            <div className="col-span-2">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Ralat</span>
                              <p className="text-red-600 mt-0.5">{log.error}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">Kandungan Mesej</span>
                          <p className="text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{log.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUOTA / API KEY TAB */}
        {tab === 'quota' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">Kunci API</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Kunci Textbelt anda. Gunakan{' '}
                  <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-xs text-slate-700 border border-slate-200">textbelt</code>{' '}
                  untuk 1 mesej percuma sehari.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kunci API</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Masukkan kunci Textbelt API anda..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition font-mono pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
                      >
                        {showKey ? 'Sembunyikan' : 'Tunjukkan'}
                      </button>
                    </div>
                    {apiKey && (
                      <button
                        onClick={copyApiKey}
                        title="Salin kunci"
                        className="border border-slate-200 rounded-xl px-3 hover:bg-slate-50 text-slate-500 transition"
                      >
                        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={11} className="text-slate-400" />
                    <p className="text-xs text-slate-400">Disimpan setempat di pelayar anda. Tidak dihantar ke mana-mana kecuali Textbelt.</p>
                  </div>
                </div>

                <button
                  onClick={checkQuota}
                  disabled={!apiKey.trim() || quota.loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm shadow-sky-200 disabled:shadow-none"
                >
                  {quota.loading ? (
                    <><RefreshCw size={14} className="animate-spin" /> Memeriksa...</>
                  ) : (
                    <><Key size={14} /> Semak Kuota</>
                  )}
                </button>

                {quota.remaining !== null && (
                  <div className="flex items-center gap-5 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle size={26} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-emerald-700 leading-none">{quota.remaining}</p>
                      <p className="text-sm text-emerald-600 mt-1 font-medium">mesej berbaki dalam kuota</p>
                    </div>
                  </div>
                )}

                {quota.error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <XCircle size={15} className="shrink-0 text-red-500" />
                    {quota.error}
                  </div>
                )}
              </div>
            </div>

            {/* Info cards */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Tentang Textbelt API</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Zap size={16} className="text-amber-500" />,
                      title: 'Pelan Percuma',
                      desc: 'Gunakan kunci "textbelt" untuk hantar 1 SMS percuma sehari, tanpa pendaftaran.',
                      color: 'bg-amber-50 border-amber-100',
                    },
                    {
                      icon: <BarChart3 size={16} className="text-sky-500" />,
                      title: 'Kunci Berbayar',
                      desc: 'Beli kredit untuk penghantaran boleh dipercayai ke semua pembawa Asia dan antarabangsa.',
                      color: 'bg-sky-50 border-sky-100',
                    },
                    {
                      icon: <Shield size={16} className="text-slate-500" />,
                      title: 'Mod Ujian',
                      desc: 'Tambah "_test" pada kunci anda untuk mengesahkan tanpa menggunakan kredit.',
                      color: 'bg-slate-50 border-slate-100',
                    },
                    {
                      icon: <Wifi size={16} className="text-emerald-500" />,
                      title: 'Status Penghantaran',
                      desc: 'Jejaki status mesej: DELIVERED, SENT, SENDING, FAILED atau UNKNOWN.',
                      color: 'bg-emerald-50 border-emerald-100',
                    },
                  ].map((c) => (
                    <div key={c.title} className={`rounded-2xl border p-4 ${c.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {c.icon}
                        <p className="font-bold text-slate-800 text-sm">{c.title}</p>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Country coverage highlight */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Liputan Asia</h2>
                <p className="text-xs text-slate-400 mt-0.5">Negara-negara Asia yang disokong oleh gateway ini</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter((c) => c.region === 'Asia' || c.region === 'Asia Pacific').map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c); setTab('send'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-medium text-slate-600 hover:text-sky-700 transition-colors"
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="text-slate-400 font-mono">{c.dial}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
