import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Key,
  Settings,
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
  Sun,
  Moon,
  Lock,
  LogOut,
  Users,
  UserPlus,
  Pencil,
} from 'lucide-react';
import type { SmsLog } from './lib/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const DEFAULT_APP_LOCK_PIN = '6144';
const PIN_LENGTH = 4;

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

type Tab = 'send' | 'contacts' | 'logs' | 'quota' | 'settings';

interface Contact {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

type Language = 'bm' | 'en';

const I18N = {
  bm: {
    tabSend: 'Hantar SMS',
    tabContacts: 'Contact',
    tabLogs: 'Log Mesej',
    tabQuota: 'Kunci & Kuota',
    tabSettings: 'Tetapan',
    appLockTitle: 'Masukkan Kod Laluan',
    appLocked: 'Aplikasi dikunci. Masukkan PIN 4 digit.',
    useKeyboardPin: 'Gunakan papan kekunci atau keypad di bawah',
    keyActive: 'Kunci Aktif',
    noKey: 'Tiada Kunci',
    settingsLanguageTitle: 'Bahasa Aplikasi',
    settingsLanguageDesc: 'Pilih bahasa antara Bahasa Melayu dan English.',
    languageBm: 'Bahasa Melayu',
    languageEn: 'English',
    settingsThemeTitle: 'Paparan Tema',
    settingsThemeDesc: 'Tukar antara Light mode dan Dark mode.',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    settingsPinTitle: 'Tukar PIN Aplikasi',
    settingsPinDesc: 'PIN perlu 4 digit nombor.',
    currentPin: 'PIN Semasa',
    currentPinExample: 'Contoh: 6144',
    newPin: 'PIN Baru',
    confirmNewPin: 'Sahkan PIN Baru',
    saveNewPin: 'Simpan PIN Baru',
    lockNow: 'Kunci Sekarang',
    logout: 'Log Out',
    pinWrong: 'PIN salah. Sila cuba lagi.',
    currentPinWrong: 'PIN semasa tidak tepat.',
    newPinInvalid: 'PIN baru mesti 4 digit nombor.',
    confirmPinMismatch: 'Pengesahan PIN baru tidak sepadan.',
    pinUpdated: 'PIN berjaya dikemas kini.',
    deleteDigit: 'Padam',
    installApp: 'Pasang App',
    asiaPriority: 'Asia Priority',
    noApiConfigured: 'Tiada kunci API dikonfigurasi. Pergi ke tab',
    toSetOne: 'untuk menetapkan satu. Gunakan',
    forFreeMsg: 'untuk 1 mesej percuma sehari.',
    composeMessage: 'Tulis Mesej',
    sendViaTextbelt: 'Hantar SMS melalui Textbelt API - sokongan penuh Asia',
    selectContactOptional: 'Pilih Contact (Opsyenal)',
    manageContacts: 'Urus Contact',
    chooseContact: 'Pilih contact daripada senarai',
    noContactsYet: 'Tiada contact lagi. Buka tab Contact untuk tambah penerima.',
    receiverPhone: 'Nombor Telefon Penerima',
    fullNumber: 'Nombor penuh:',
    enterWithoutCountryCode: 'Masukkan nombor tanpa kod negara',
    isSelected: 'dipilih',
    messageBody: 'Kandungan Mesej',
    typeMessage: 'Taip mesej anda di sini...',
    smsSegment: 'segmen SMS',
    sending: 'Menghantar...',
    sendMessage: 'Hantar Mesej',
    freeKey: 'Kunci Percuma',
    asianCountries: 'Negara Asia',
    supported: 'disokong',
    statusTracker: 'Penjejak Status',
    liveDelivery: 'penghantaran langsung',
    manageContactTitle: 'Urus Contact',
    manageContactDesc: 'Tambah, kemas kini, atau padam contact penerima SMS.',
    contactName: 'Nama Contact',
    contactNameExample: 'Contoh: Ali Bin Abu',
    phoneNumber: 'Nombor Telefon',
    contactRequired: 'Nama dan nombor telefon diperlukan.',
    contactUpdated: 'Contact berjaya dikemas kini.',
    contactAdded: 'Contact berjaya ditambah.',
    contactDeleted: 'Contact berjaya dipadam.',
    saveChanges: 'Simpan Perubahan',
    addContact: 'Tambah Contact',
    cancelEdit: 'Batal Edit',
    searchContact: 'Cari nama atau nombor contact...',
    noContactFound: 'Tiada contact dijumpai',
    addContactHint: 'Tambah contact baru untuk gunakan semasa hantar mesej.',
    useContact: 'Guna',
    editContact: 'Edit contact',
    deleteContact: 'Padam contact',
    searchLogs: 'Cari nombor, mesej atau status...',
    reload: 'Muat Semula',
    loadingLogs: 'Memuatkan log...',
    noMessages: 'Tiada mesej',
    noSearchMatch: 'Tiada hasil sepadan carian.',
    firstMessageHint: 'Hantar mesej pertama anda untuk melihatnya di sini.',
    checkDeliveryStatus: 'Semak status penghantaran',
    delete: 'Padam',
    phoneLabel: 'Nombor Telefon',
    textId: 'Text ID',
    apiKeyLabel: 'Kunci API',
    quotaRemaining: 'Baki Kuota',
    sentAt: 'Dihantar Pada',
    errorLabel: 'Ralat',
    messageContent: 'Kandungan Mesej',
    apiKeyTitle: 'Kunci API',
    apiKeyDesc: 'Kunci Textbelt anda. Gunakan',
    forOneFreeDaily: 'untuk 1 mesej percuma sehari.',
    enterApiKey: 'Masukkan kunci Textbelt API anda...',
    hide: 'Sembunyikan',
    show: 'Tunjukkan',
    copyKey: 'Salin kunci',
    saveKey: 'Simpan Kunci',
    unsavedChanges: 'Perubahan belum disimpan',
    keySaved: 'Kunci API berjaya disimpan.',
    keyRemoved: 'Kunci API telah dipadam.',
    storedLocally: 'Disimpan setempat di pelayar anda. Tidak dihantar ke mana-mana kecuali Textbelt.',
    checking: 'Memeriksa...',
    checkQuota: 'Semak Kuota',
    messagesRemaining: 'mesej berbaki dalam kuota',
    aboutTextbelt: 'Tentang Textbelt API',
    freePlan: 'Pelan Percuma',
    paidKey: 'Kunci Berbayar',
    testMode: 'Mod Ujian',
    deliveryStatus: 'Status Penghantaran',
    freePlanDesc: 'Gunakan kunci "textbelt" untuk hantar 1 SMS percuma sehari, tanpa pendaftaran.',
    paidKeyDesc: 'Beli kredit untuk penghantaran boleh dipercayai ke semua pembawa Asia dan antarabangsa.',
    testModeDesc: 'Tambah "_test" pada kunci anda untuk mengesahkan tanpa menggunakan kredit.',
    deliveryStatusDesc: 'Jejaki status mesej: DELIVERED, SENT, SENDING, FAILED atau UNKNOWN.',
    asiaCoverage: 'Liputan Asia',
    asiaCoverageDesc: 'Negara-negara Asia yang disokong oleh gateway ini',
    deleteContactTitle: 'Padam Contact?',
    deleteContactConfirm: 'Anda pasti mahu padam contact',
    irreversibleAction: 'Tindakan ini tidak boleh dibatalkan.',
    cancel: 'Batal',
    yesDelete: 'Ya, Padam',
  },
  en: {
    tabSend: 'Send SMS',
    tabContacts: 'Contacts',
    tabLogs: 'Message Logs',
    tabQuota: 'API Key & Quota',
    tabSettings: 'Settings',
    appLockTitle: 'Enter Passcode',
    appLocked: 'App is locked. Enter your 4-digit PIN.',
    useKeyboardPin: 'Use keyboard or keypad below',
    keyActive: 'Key Active',
    noKey: 'No Key',
    settingsLanguageTitle: 'App Language',
    settingsLanguageDesc: 'Choose between Bahasa Melayu and English.',
    languageBm: 'Bahasa Melayu',
    languageEn: 'English',
    settingsThemeTitle: 'Theme',
    settingsThemeDesc: 'Switch between Light mode and Dark mode.',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    settingsPinTitle: 'Change App PIN',
    settingsPinDesc: 'PIN must be 4 digits.',
    currentPin: 'Current PIN',
    currentPinExample: 'Example: 6144',
    newPin: 'New PIN',
    confirmNewPin: 'Confirm New PIN',
    saveNewPin: 'Save New PIN',
    lockNow: 'Lock Now',
    logout: 'Log Out',
    pinWrong: 'Incorrect PIN. Please try again.',
    currentPinWrong: 'Current PIN is incorrect.',
    newPinInvalid: 'New PIN must be 4 digits.',
    confirmPinMismatch: 'New PIN confirmation does not match.',
    pinUpdated: 'PIN updated successfully.',
    deleteDigit: 'Delete',
    installApp: 'Install App',
    asiaPriority: 'Asia Priority',
    noApiConfigured: 'No API key configured. Go to tab',
    toSetOne: 'to set one. Use',
    forFreeMsg: 'for 1 free message daily.',
    composeMessage: 'Compose Message',
    sendViaTextbelt: 'Send SMS via Textbelt API - full Asia support',
    selectContactOptional: 'Select Contact (Optional)',
    manageContacts: 'Manage Contacts',
    chooseContact: 'Select a contact from the list',
    noContactsYet: 'No contacts yet. Open Contact tab to add recipients.',
    receiverPhone: 'Recipient Phone Number',
    fullNumber: 'Full number:',
    enterWithoutCountryCode: 'Enter number without country code',
    isSelected: 'selected',
    messageBody: 'Message Content',
    typeMessage: 'Type your message here...',
    smsSegment: 'SMS segments',
    sending: 'Sending...',
    sendMessage: 'Send Message',
    freeKey: 'Free Key',
    asianCountries: 'Asian Countries',
    supported: 'supported',
    statusTracker: 'Status Tracker',
    liveDelivery: 'live delivery tracking',
    manageContactTitle: 'Manage Contacts',
    manageContactDesc: 'Add, update, or delete SMS recipient contacts.',
    contactName: 'Contact Name',
    contactNameExample: 'Example: Ali Bin Abu',
    phoneNumber: 'Phone Number',
    contactRequired: 'Contact name and phone number are required.',
    contactUpdated: 'Contact updated successfully.',
    contactAdded: 'Contact added successfully.',
    contactDeleted: 'Contact deleted successfully.',
    saveChanges: 'Save Changes',
    addContact: 'Add Contact',
    cancelEdit: 'Cancel Edit',
    searchContact: 'Search contact name or number...',
    noContactFound: 'No contacts found',
    addContactHint: 'Add a new contact to use while sending messages.',
    useContact: 'Use',
    editContact: 'Edit contact',
    deleteContact: 'Delete contact',
    searchLogs: 'Search number, message, or status...',
    reload: 'Reload',
    loadingLogs: 'Loading logs...',
    noMessages: 'No messages',
    noSearchMatch: 'No results match your search.',
    firstMessageHint: 'Send your first message to see it here.',
    checkDeliveryStatus: 'Check delivery status',
    delete: 'Delete',
    phoneLabel: 'Phone Number',
    textId: 'Text ID',
    apiKeyLabel: 'API Key',
    quotaRemaining: 'Quota Remaining',
    sentAt: 'Sent At',
    errorLabel: 'Error',
    messageContent: 'Message Content',
    apiKeyTitle: 'API Key',
    apiKeyDesc: 'Your Textbelt key. Use',
    forOneFreeDaily: 'for 1 free message daily.',
    enterApiKey: 'Enter your Textbelt API key...',
    hide: 'Hide',
    show: 'Show',
    copyKey: 'Copy key',
    saveKey: 'Save Key',
    unsavedChanges: 'Unsaved changes',
    keySaved: 'API key saved successfully.',
    keyRemoved: 'API key removed.',
    storedLocally: 'Stored locally in your browser. Not sent anywhere except Textbelt.',
    checking: 'Checking...',
    checkQuota: 'Check Quota',
    messagesRemaining: 'messages remaining in quota',
    aboutTextbelt: 'About Textbelt API',
    freePlan: 'Free Plan',
    paidKey: 'Paid Key',
    testMode: 'Test Mode',
    deliveryStatus: 'Delivery Status',
    freePlanDesc: 'Use key "textbelt" to send 1 free SMS per day, no signup required.',
    paidKeyDesc: 'Buy credits for reliable delivery to Asian and international carriers.',
    testModeDesc: 'Append "_test" to your key to validate without consuming credits.',
    deliveryStatusDesc: 'Track statuses: DELIVERED, SENT, SENDING, FAILED, or UNKNOWN.',
    asiaCoverage: 'Asia Coverage',
    asiaCoverageDesc: 'Asian countries supported by this gateway',
    deleteContactTitle: 'Delete Contact?',
    deleteContactConfirm: 'Are you sure you want to delete contact',
    irreversibleAction: 'This action cannot be undone.',
    cancel: 'Cancel',
    yesDelete: 'Yes, Delete',
  },
} as const;

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

function splitPhoneToCountry(phone: string): { country: Country; localPhone: string } {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned.replace(/^0+/, '')}`;
  const sortedCountries = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  const matchedCountry = sortedCountries.find((c) => normalized.startsWith(c.dial)) ?? COUNTRIES[0];
  const localPhone = normalized.slice(matchedCountry.dial.length).replace(/\D/g, '');

  return { country: matchedCountry, localPhone };
}

function StatusBadge({ status, language }: { status: string; language: Language }) {
  const labels = language === 'en'
    ? {
        delivered: 'Delivered',
        sent: 'Sent',
        sending: 'Sending',
        pending: 'Pending',
        failed: 'Failed',
        unknown: 'Unknown',
      }
    : {
        delivered: 'Dihantar',
        sent: 'Terhantar',
        sending: 'Menghantar',
        pending: 'Menunggu',
        failed: 'Gagal',
        unknown: 'Tidak Diketahui',
      };

  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    DELIVERED: {
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={12} />,
      label: labels.delivered,
    },
    SENT: {
      color: 'bg-sky-100 text-sky-700 border-sky-200',
      icon: <CheckCircle size={12} />,
      label: labels.sent,
    },
    SENDING: {
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <Clock size={12} />,
      label: labels.sending,
    },
    PENDING: {
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Clock size={12} />,
      label: labels.pending,
    },
    FAILED: {
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: <XCircle size={12} />,
      label: labels.failed,
    },
    UNKNOWN: {
      color: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: <AlertCircle size={12} />,
      label: labels.unknown,
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

function timeAgo(iso: string, language: Language) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return language === 'en' ? `${s}s ago` : `${s}s lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return language === 'en' ? `${m}m ago` : `${m}min lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return language === 'en' ? `${h}h ago` : `${h}j lalu`;
  return new Date(iso).toLocaleDateString(language === 'en' ? 'en-MY' : 'ms-MY');
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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
  const [appPin, setAppPin] = useState(() => {
    const savedPin = localStorage.getItem('tb_app_pin');
    return /^\d{4}$/.test(savedPin ?? '') ? (savedPin as string) : DEFAULT_APP_LOCK_PIN;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('tb_theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('tb_language');
    return savedLanguage === 'en' ? 'en' : 'bm';
  });
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem('app_unlocked') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinShaking, setPinShaking] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinUpdateMsg, setPinUpdateMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<Tab>('send');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tb_api_key') ?? '');
  const [apiKeyDraft, setApiKeyDraft] = useState(() => localStorage.getItem('tb_api_key') ?? '');
  const [apiKeySaveMsg, setApiKeySaveMsg] = useState<{ success: boolean; text: string } | null>(null);
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
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const raw = localStorage.getItem('tb_contacts');
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as Contact[];
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (contact) =>
          typeof contact?.id === 'string' &&
          typeof contact?.name === 'string' &&
          typeof contact?.phone === 'string' &&
          typeof contact?.created_at === 'string'
      );
    } catch {
      return [];
    }
  });
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactCountry, setContactCountry] = useState<Country>(COUNTRIES[0]);
  const [contactLocalPhone, setContactLocalPhone] = useState('');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [contactResult, setContactResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const fullPhone = localPhone ? `${country.dial}${localPhone.replace(/^0+/, '')}` : '';
  const contactFullPhone = contactLocalPhone
    ? `${contactCountry.dial}${contactLocalPhone.replace(/^0+/, '')}`
    : '';
  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch.replace(/\s/g, ''))
  );
  const t = I18N[language];

  const contactToDelete = deleteContactId ? contacts.find((c) => c.id === deleteContactId) : null;

  useEffect(() => {
    localStorage.setItem('tb_contacts', JSON.stringify(contacts));
  }, [contacts]);

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
        setSelectedContactId('');
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

  function saveApiKey() {
    const normalizedKey = apiKeyDraft.trim();
    setApiKey(normalizedKey);

    if (normalizedKey) {
      localStorage.setItem('tb_api_key', normalizedKey);
      setApiKeySaveMsg({ success: true, text: t.keySaved });
      return;
    }

    localStorage.removeItem('tb_api_key');
    setApiKeySaveMsg({ success: true, text: t.keyRemoved });
  }

  function handleCountryChange(nextCountry: Country) {
    setCountry(nextCountry);
    setSelectedContactId('');
  }

  function handleContactSelect(contactId: string) {
    setSelectedContactId(contactId);
    if (!contactId) return;

    const selected = contacts.find((c) => c.id === contactId);
    if (!selected) return;

    const parsed = splitPhoneToCountry(selected.phone);
    setCountry(parsed.country);
    setLocalPhone(parsed.localPhone);
  }

  function resetContactForm() {
    setEditingContactId(null);
    setContactName('');
    setContactCountry(COUNTRIES[0]);
    setContactLocalPhone('');
  }

  function handleEditContact(contact: Contact) {
    const parsed = splitPhoneToCountry(contact.phone);
    setEditingContactId(contact.id);
    setContactName(contact.name);
    setContactCountry(parsed.country);
    setContactLocalPhone(parsed.localPhone);
    setContactResult(null);
  }

  function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();

    if (!contactName.trim() || !contactFullPhone.trim()) {
      setContactResult({ success: false, msg: t.contactRequired });
      return;
    }

    if (editingContactId) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContactId
            ? {
                ...c,
                name: contactName.trim(),
                phone: contactFullPhone,
              }
            : c
        )
      );
      setContactResult({ success: true, msg: t.contactUpdated });
    } else {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: contactName.trim(),
        phone: contactFullPhone,
        created_at: new Date().toISOString(),
      };
      setContacts((prev) => [newContact, ...prev]);
      setContactResult({ success: true, msg: t.contactAdded });
    }

    resetContactForm();
  }

  function confirmDeleteContact() {
    if (!deleteContactId) return;

    setContacts((prev) => prev.filter((c) => c.id !== deleteContactId));
    if (selectedContactId === deleteContactId) {
      setSelectedContactId('');
    }
    setDeleteContactId(null);
    setContactResult({ success: true, msg: t.contactDeleted });
  }

  const filteredLogs = logs.filter(
    (l) =>
      l.phone.includes(searchQuery) ||
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const hasApiKeyChanges = apiKeyDraft.trim() !== apiKey;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'send', label: t.tabSend, icon: <Send size={15} /> },
    { id: 'contacts', label: t.tabContacts, icon: <Users size={15} /> },
    { id: 'logs', label: t.tabLogs, icon: <MessageSquare size={15} /> },
    { id: 'quota', label: t.tabQuota, icon: <Key size={15} /> },
    { id: 'settings', label: t.tabSettings, icon: <Settings size={15} /> },
  ];

  useEffect(() => {
    localStorage.setItem('tb_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tb_language', language);
  }, [language]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tb_app_pin', appPin);
  }, [appPin]);

  useEffect(() => {
    if (isUnlocked) {
      sessionStorage.setItem('app_unlocked', 'true');
    } else {
      sessionStorage.removeItem('app_unlocked');
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (pinInput.length !== PIN_LENGTH || isUnlocked) return;

    if (pinInput === appPin) {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
      return;
    }

    setPinError(t.pinWrong);
    setPinShaking(true);
    setTimeout(() => setPinShaking(false), 350);
    setTimeout(() => setPinInput(''), 120);
  }, [pinInput, isUnlocked, appPin]);

  useEffect(() => {
    if (isUnlocked) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (/^\d$/.test(e.key)) {
        setPinError('');
        setPinInput((prev) => (prev.length < PIN_LENGTH ? `${prev}${e.key}` : prev));
        return;
      }

      if (e.key === 'Backspace') {
        setPinError('');
        setPinInput((prev) => prev.slice(0, -1));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked]);

  function inputPinDigit(digit: string) {
    setPinError('');
    setPinInput((prev) => (prev.length < PIN_LENGTH ? `${prev}${digit}` : prev));
  }

  function removePinDigit() {
    setPinError('');
    setPinInput((prev) => prev.slice(0, -1));
  }

  function handlePinChange(e: React.FormEvent) {
    e.preventDefault();

    if (currentPinInput !== appPin) {
      setPinUpdateMsg({ success: false, text: t.currentPinWrong });
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinUpdateMsg({ success: false, text: t.newPinInvalid });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinUpdateMsg({ success: false, text: t.confirmPinMismatch });
      return;
    }

    setAppPin(newPinInput);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinUpdateMsg({ success: true, text: t.pinUpdated });
  }

  function handleLogout() {
    setIsUnlocked(false);
    setTab('send');
    setPinInput('');
    setPinError('');
    setPinUpdateMsg(null);
  }

  async function handleInstallApp() {
    if (!installPrompt) return;

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsStandalone(true);
      return;
    }

    setInstallPrompt(null);
  }

  const isDark = theme === 'dark';

  if (!isUnlocked) {
    return (
      <div className={`${isDark ? 'theme-dark bg-[radial-gradient(circle_at_top,#1d4ed8,transparent_38%),linear-gradient(165deg,#020617_0%,#0f172a_56%,#111827_100%)]' : 'bg-[radial-gradient(circle_at_top,#dbeafe,transparent_52%),linear-gradient(160deg,#f8fafc_0%,#f1f5f9_100%)]'} min-h-screen px-4 py-8 flex items-center justify-center transition-colors`}>
        <div className="w-full max-w-sm bg-white/95 backdrop-blur rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/70 p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md shadow-sky-200 mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t.appLockTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.appLocked}</p>
          </div>

          <div className={`flex items-center justify-center gap-3 mb-5 ${pinShaking ? 'animate-[wiggle_0.35s_ease-in-out]' : ''}`}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full border transition-all ${i < pinInput.length ? 'bg-slate-900 border-slate-900 scale-110' : 'bg-transparent border-slate-300'}`}
              />
            ))}
          </div>

          <p className={`text-center text-xs h-5 mb-3 ${pinError ? 'text-red-500' : 'text-slate-400'}`}>
            {pinError || t.useKeyboardPin}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[...'123456789'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => inputPinDigit(digit)}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-semibold text-slate-800 transition"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => inputPinDigit('0')}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-semibold text-slate-800 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={removePinDigit}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-sm font-semibold text-slate-700 transition"
            >
              {t.deleteDigit}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'theme-dark bg-[radial-gradient(circle_at_top,#0b3b6f_0%,transparent_40%),linear-gradient(160deg,#020617_0%,#0f172a_50%,#111827_100%)]' : 'bg-[#f0f4f8]'} min-h-screen font-sans transition-colors`}>
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
                <span className="text-xs text-slate-400 font-medium">{t.asiaPriority}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isStandalone && installPrompt && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                <Globe size={11} />
                {t.installApp}
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${apiKey ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {apiKey ? t.keyActive : t.noKey}
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
                  {t.noApiConfigured}{' '}
                  <button className="font-semibold underline underline-offset-2" onClick={() => setTab('quota')}>
                    {t.tabQuota}
                  </button>{' '}
                  {t.toSetOne}{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">textbelt</code>{' '}
                  {t.forFreeMsg}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">{t.composeMessage}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.sendViaTextbelt}</p>
              </div>

              <form onSubmit={handleSend} className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-sm font-semibold text-slate-700">{t.selectContactOptional}</label>
                    <button
                      type="button"
                      onClick={() => setTab('contacts')}
                      className="text-xs font-medium text-sky-600 hover:text-sky-700"
                    >
                      {t.manageContacts}
                    </button>
                  </div>
                  <select
                    value={selectedContactId}
                    onChange={(e) => handleContactSelect(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                  >
                    <option value="">{t.chooseContact}</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.phone}
                      </option>
                    ))}
                  </select>
                  {contacts.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      {t.noContactsYet}
                    </p>
                  )}
                </div>

                {/* Phone number input with country selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t.receiverPhone}
                  </label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-300 focus-within:border-transparent transition-all bg-white">
                    <CountrySelector selected={country} onSelect={handleCountryChange} />
                    <input
                      type="tel"
                      value={localPhone}
                      onChange={(e) => {
                        setLocalPhone(e.target.value.replace(/[^\d\s\-]/g, ''));
                        setSelectedContactId('');
                      }}
                      placeholder="11 1234 5678"
                      className="flex-1 px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                  {fullPhone && (
                    <p className="text-xs text-sky-600 mt-1.5 font-medium font-mono">
                      {t.fullNumber} {fullPhone}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {t.enterWithoutCountryCode} — {country.flag} {country.name} ({country.dial}) {t.isSelected}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.messageBody}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.typeMessage}
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition resize-none"
                    required
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-slate-400">
                      {smsSegments > 1 ? (
                        <span className="text-amber-500 font-medium">{smsSegments} {t.smsSegment}</span>
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
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      {t.sendMessage}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Zap size={16} className="text-amber-500" />, label: t.freeKey, value: 'textbelt', sub: '1 mesej/hari', bg: 'bg-amber-50 border-amber-100' },
                { icon: <Phone size={16} className="text-sky-500" />, label: t.asianCountries, value: '20+', sub: t.supported, bg: 'bg-sky-50 border-sky-100' },
                { icon: <BarChart3 size={16} className="text-emerald-500" />, label: t.statusTracker, value: 'Live', sub: t.liveDelivery, bg: 'bg-emerald-50 border-emerald-100' },
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
        {tab === 'contacts' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">{t.manageContactTitle}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.manageContactDesc}</p>
              </div>

              <form onSubmit={handleSaveContact} className="p-6 space-y-4 border-b border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.contactName}</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={t.contactNameExample}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.phoneNumber}</label>
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-300 focus-within:border-transparent transition-all bg-white">
                    <CountrySelector selected={contactCountry} onSelect={setContactCountry} />
                    <input
                      type="tel"
                      value={contactLocalPhone}
                      onChange={(e) => setContactLocalPhone(e.target.value.replace(/[^\d\s\-]/g, ''))}
                      placeholder="11 1234 5678"
                      className="flex-1 px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                  {contactFullPhone && (
                    <p className="text-xs text-sky-600 mt-1.5 font-medium font-mono">{t.fullNumber} {contactFullPhone}</p>
                  )}
                </div>

                {contactResult && (
                  <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${contactResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {contactResult.success ? (
                      <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    )}
                    {contactResult.msg}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm shadow-sky-200"
                  >
                    {editingContactId ? <Pencil size={14} /> : <UserPlus size={14} />}
                    {editingContactId ? t.saveChanges : t.addContact}
                  </button>
                  {editingContactId && (
                    <button
                      type="button"
                      onClick={resetContactForm}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                    >
                      {t.cancelEdit}
                    </button>
                  )}
                </div>
              </form>

              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder={t.searchContact}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white transition"
                  />
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <Users size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-600 font-medium">{t.noContactFound}</p>
                    <p className="text-slate-400 text-sm mt-1">{t.addContactHint}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{contact.phone}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleContactSelect(contact.id)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                          >
                            {t.useContact}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditContact(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                            title={t.editContact}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteContactId(contact.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                            title={t.deleteContact}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchLogs}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent bg-white transition"
                />
              </div>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{t.reload}</span>
              </button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
                <RefreshCw size={16} className="animate-spin text-sky-400" />
                {t.loadingLogs}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
                <MessageSquare size={40} className="text-slate-200 mb-3" />
                <p className="text-slate-600 font-semibold">{t.noMessages}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery ? t.noSearchMatch : t.firstMessageHint}
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
                          <StatusBadge status={log.status} language={language} />
                          <span className="text-xs text-slate-400 ml-auto">{timeAgo(log.created_at, language)}</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-0.5">{log.message}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {log.text_id && (
                          <button
                            onClick={() => checkMessageStatus(log)}
                            disabled={checkingStatus === log.id}
                            title={t.checkDeliveryStatus}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                          >
                            <Wifi size={14} className={checkingStatus === log.id ? 'animate-pulse' : ''} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLog(log.id)}
                          title={t.delete}
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
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.phoneLabel}</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.phone}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.textId}</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.text_id || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.apiKeyLabel}</span>
                            <p className="text-slate-700 font-mono mt-0.5">{log.api_key_hint || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.quotaRemaining}</span>
                            <p className="text-slate-700 mt-0.5">{log.quota_remaining >= 0 ? log.quota_remaining : '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.sentAt}</span>
                            <p className="text-slate-700 mt-0.5">{new Date(log.created_at).toLocaleString('ms-MY')}</p>
                          </div>
                          {log.error && (
                            <div className="col-span-2">
                              <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.errorLabel}</span>
                              <p className="text-red-600 mt-0.5">{log.error}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{t.messageContent}</span>
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
                <h2 className="font-bold text-slate-900 text-lg">{t.apiKeyTitle}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t.apiKeyDesc}{' '}
                  <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-xs text-slate-700 border border-slate-200">textbelt</code>{' '}
                  {t.forOneFreeDaily}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.apiKeyLabel}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKeyDraft}
                        onChange={(e) => {
                          setApiKeyDraft(e.target.value);
                          setApiKeySaveMsg(null);
                        }}
                        placeholder={t.enterApiKey}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition font-mono pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
                      >
                        {showKey ? t.hide : t.show}
                      </button>
                    </div>
                    {apiKey && (
                      <button
                        onClick={copyApiKey}
                        title={t.copyKey}
                        className="border border-slate-200 rounded-xl px-3 hover:bg-slate-50 text-slate-500 transition"
                      >
                        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={saveApiKey}
                      disabled={!hasApiKeyChanges}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-2 px-4 rounded-xl text-xs transition"
                    >
                      {t.saveKey}
                    </button>
                    {hasApiKeyChanges && (
                      <span className="text-xs text-amber-600">{t.unsavedChanges}</span>
                    )}
                  </div>

                  {apiKeySaveMsg && (
                    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm mt-3 ${apiKeySaveMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {apiKeySaveMsg.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
                      {apiKeySaveMsg.text}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={11} className="text-slate-400" />
                    <p className="text-xs text-slate-400">{t.storedLocally}</p>
                  </div>
                </div>

                <button
                  onClick={checkQuota}
                  disabled={!apiKey.trim() || quota.loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm shadow-sky-200 disabled:shadow-none"
                >
                  {quota.loading ? (
                    <><RefreshCw size={14} className="animate-spin" /> {t.checking}</>
                  ) : (
                    <><Key size={14} /> {t.checkQuota}</>
                  )}
                </button>

                {quota.remaining !== null && (
                  <div className="flex items-center gap-5 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle size={26} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-emerald-700 leading-none">{quota.remaining}</p>
                      <p className="text-sm text-emerald-600 mt-1 font-medium">{t.messagesRemaining}</p>
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
                <h2 className="font-bold text-slate-900">{t.aboutTextbelt}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Zap size={16} className="text-amber-500" />,
                      title: t.freePlan,
                      desc: t.freePlanDesc,
                      color: 'bg-amber-50 border-amber-100',
                    },
                    {
                      icon: <BarChart3 size={16} className="text-sky-500" />,
                      title: t.paidKey,
                      desc: t.paidKeyDesc,
                      color: 'bg-sky-50 border-sky-100',
                    },
                    {
                      icon: <Shield size={16} className="text-slate-500" />,
                      title: t.testMode,
                      desc: t.testModeDesc,
                      color: 'bg-slate-50 border-slate-100',
                    },
                    {
                      icon: <Wifi size={16} className="text-emerald-500" />,
                      title: t.deliveryStatus,
                      desc: t.deliveryStatusDesc,
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
                <h2 className="font-bold text-slate-900">{t.asiaCoverage}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t.asiaCoverageDesc}</p>
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

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">{t.settingsLanguageTitle}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.settingsLanguageDesc}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('bm')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      language === 'bm'
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.languageBm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      language === 'en'
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.languageEn}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">{t.settingsThemeTitle}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.settingsThemeDesc}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      theme === 'light'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sun size={15} />
                    {t.lightMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Moon size={15} />
                    {t.darkMode}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
                <h2 className="font-bold text-slate-900 text-lg">{t.settingsPinTitle}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.settingsPinDesc}</p>
              </div>
              <form onSubmit={handlePinChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.currentPin}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={t.currentPinExample}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.newPin}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 digit"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.confirmNewPin}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Ulang 4 digit"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition font-mono"
                    required
                  />
                </div>

                {pinUpdateMsg && (
                  <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${pinUpdateMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {pinUpdateMsg.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
                    {pinUpdateMsg.text}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm shadow-sky-200"
                  >
                    <Lock size={14} />
                    {t.saveNewPin}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                  >
                    {t.lockNow}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                  >
                    <LogOut size={14} />
                    {t.logout}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {deleteContactId && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={17} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.deleteContactTitle}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {t.deleteContactConfirm}
                  {contactToDelete ? <span className="font-semibold text-slate-700"> {contactToDelete.name}</span> : null}
                  ? {t.irreversibleAction}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteContactId(null)}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl text-sm transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDeleteContact}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition"
              >
                {t.yesDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
