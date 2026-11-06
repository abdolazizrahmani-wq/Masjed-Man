import {
  Activity,
  AppNotification,
  AppSettings,
  Badge,
  MonthlyPeriod,
  Mosque,
  MotivationalQuote,
  Reward,
  User,
  AttendanceRecord,
  PointTransaction,
  StudentBadge,
} from '../types';

export const INITIAL_MOSQUES: Mosque[] = [
  {
    id: 'mosque-1',
    name: 'مسجد ابوبکر صدیق',
    village: 'کنخ',
    managerId: '',
    managerName: 'تعیین نشده',
    active: true,
    address: 'روستای کنخ، محله بالا، جنب دارالقرآن',
    qrCodeKey: 'KANKH-MSQ-01-ABUBAKR',
    createdAt: '2026-01-01',
  },
  {
    id: 'mosque-2',
    name: 'مسجد سلمان فارسی',
    village: 'کنخ',
    managerId: '',
    managerName: 'تعیین نشده',
    active: true,
    address: 'روستای کنخ، محله ساحلی',
    qrCodeKey: 'KANKH-MSQ-02-SALMAN',
    createdAt: '2026-01-01',
  },
  {
    id: 'mosque-3',
    name: 'مسجد علی بن ابیطالب',
    village: 'کنخ',
    managerId: '',
    managerName: 'تعیین نشده',
    active: true,
    address: 'روستای کنخ، خیابان وحدت',
    qrCodeKey: 'KANKH-MSQ-03-ALI',
    createdAt: '2026-01-01',
  },
  {
    id: 'mosque-4',
    name: 'مسجد خدیجه کبری',
    village: 'کنخ',
    managerId: '',
    managerName: 'تعیین نشده',
    active: true,
    address: 'روستای کنخ، بخش شرقی',
    qrCodeKey: 'KANKH-MSQ-04-KHADIJAH',
    createdAt: '2026-01-01',
  },
  {
    id: 'mosque-5',
    name: 'مسجد النبی',
    village: 'کنخ',
    managerId: '',
    managerName: 'تعیین نشده',
    active: true,
    address: 'روستای کنخ، ورودی روستا',
    qrCodeKey: 'KANKH-MSQ-05-NABI',
    createdAt: '2026-01-01',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-fajr',
    name: 'نماز صبح',
    defaultPoints: 25,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز بافضیلت صبح به جماعت در مسجد',
  },
  {
    id: 'act-dhuhr',
    name: 'نماز ظهر',
    defaultPoints: 15,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز ظهر به جماعت در مسجد',
  },
  {
    id: 'act-asr',
    name: 'نماز عصر',
    defaultPoints: 15,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز عصر به جماعت در مسجد',
  },
  {
    id: 'act-maghrib',
    name: 'نماز مغرب',
    defaultPoints: 15,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز مغرب به جماعت در مسجد',
  },
  {
    id: 'act-isha',
    name: 'نماز عشا',
    defaultPoints: 20,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز عشا به جماعت در مسجد',
  },
  {
    id: 'act-juma',
    name: 'نماز جمعه',
    defaultPoints: 30,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'حضور در نماز جمعه و استماع خطبه‌ها',
  },
  {
    id: 'act-janaza',
    name: 'نماز جنازه',
    defaultPoints: 20,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 2,
    description: 'شرکت در نماز جنازه برادران مسلمان',
  },
  {
    id: 'act-quran-halagha',
    name: 'شرکت در حلقات قرآن',
    defaultPoints: 30,
    category: 'quran',
    active: true,
    dailyMaxTimes: 2,
    description: 'حضور منظم در حلقه تلاوت و حفظ دارالقرآن',
  },
  {
    id: 'act-tarawih',
    name: 'نماز تراویح',
    defaultPoints: 25,
    category: 'prayer',
    active: true,
    dailyMaxTimes: 1,
    description: 'نماز تراویح و قیام شب‌های ماه مبارک',
  },
  {
    id: 'act-special-event',
    name: 'برنامه‌های ویژه مسجد',
    defaultPoints: 20,
    category: 'special',
    active: true,
    dailyMaxTimes: 3,
    description: 'مسابقات، سخنرانی‌های تربیتی، نظافت مسجد و اردوی مذهبی',
  },
];

// بدون کاربر نمونه: اولین بار، صفحه‌ی «ساخت مدیر» باز می‌شود.
export const INITIAL_USERS: User[] = [];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-star',
    name: 'ستاره مسجد',
    description: 'حضور پرشور و منظم در نمازهای جماعت',
    icon: 'star',
    category: 'prayer',
    criteriaText: 'کسب بیش از ۲۰۰ امتیاز در ماه جاری',
  },
  {
    id: 'badge-fajr-hero',
    name: 'پیشتاز نماز صبح',
    description: 'بیدارباش با اذان صبح و اقامه نماز در مسجد',
    icon: 'sunrise',
    category: 'prayer',
    criteriaText: 'ثبت حداقل ۱۰ نماز صبح در ماه',
  },
  {
    id: 'badge-quran-friend',
    name: 'دوست قرآن',
    description: 'انس با کلام وحی و حضور مداوم در حلقات تلاوت',
    icon: 'book-open',
    category: 'quran',
    criteriaText: 'ثبت حداقل ۸ جلسه در حلقات قرآن',
  },
  {
    id: 'badge-champion',
    name: 'قهرمان ماه',
    description: 'درخشش در رتبه‌بندی کلی روستای کنخ',
    icon: 'trophy',
    category: 'consistency',
    criteriaText: 'قرارگیری در بین ۵ نفر برتر روستای کنخ',
  },
  {
    id: 'badge-top-inviter',
    name: 'دعوت‌گر برتر',
    description: 'تشویق دوستان و هم‌کلاسی‌ها به مسجد و دارالقرآن',
    icon: 'users',
    category: 'referral',
    criteriaText: 'دعوت موفق حداقل ۲ دوست جدید',
  },
  {
    id: 'badge-everlasting-companion',
    name: 'یار همیشگی مسجد',
    description: 'حضور مستمر در نماز جمعه و فعالیت‌های مسجد',
    icon: 'heart-handshake',
    category: 'consistency',
    criteriaText: 'حضور در تمامی نمازهای جمعه ماه',
  },
];

export const INITIAL_STUDENT_BADGES: StudentBadge[] = [];

export const INITIAL_PERIODS: MonthlyPeriod[] = [
  {
    id: 'period-1405-08',
    title: 'دوره آبان ماه ۱۴۰۵',
    year: 1405,
    month: 8,
    monthName: 'آبان',
    startDate: '1405/08/01',
    endDate: '1405/08/30',
    isCurrent: true,
  },
  {
    id: 'period-1405-07',
    title: 'دوره مهر ماه ۱۴۰۵',
    year: 1405,
    month: 7,
    monthName: 'مهر',
    startDate: '1405/07/01',
    endDate: '1405/07/30',
    isCurrent: false,
  },
];

export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    periodId: 'period-1405-08',
    periodTitle: 'مسابقه بهار قرآنی کنخ - آبان ۱۴۰۵',
    title: 'جوایز بزرگ مسابقه ماهانه دارالقرآن کنخ',
    description: 'تشویق قهرمانان نماز و قرآن روستای کنخ با هدایای نفیس',
    place1Prize: 'یک دستگاه دوچرخه کوهستان حرفه‌ای',
    place2Prize: 'ساعت هوشمند ورزشی ضدآب',
    place3Prize: 'تبلت ویژه مطالعه قرآن کریم و کتاب‌های دینی',
    place4Prize: 'بسته ورزشی کامل با آرم دارالقرآن کنخ',
    place5Prize: 'بن خرید کتاب و نوشت‌افزار به ارزش ۲ میلیون ریال',
    prizes: [
      { rank: 1, prizeName: 'یک دستگاه دوچرخه کوهستان حرفه‌ای' },
      { rank: 2, prizeName: 'ساعت هوشمند ورزشی ضدآب' },
      { rank: 3, prizeName: 'تبلت ویژه مطالعه قرآن کریم و تفاسیر' },
      { rank: 4, prizeName: 'ست کامل ورزشی با نشان دارالقرآن کنخ' },
      { rank: 5, prizeName: 'بن خرید کتاب و نوشت‌افزار به ارزش ۲ میلیون ریال' },
      { rank: 6, prizeName: 'کوله پشتی و جامدادی نفیس قرآنی' },
      { rank: 7, prizeName: 'تندیس بلورین قهرمان مسجد و لوح تقدیر' },
      { rank: 8, prizeName: 'کارت هدیه نقدی ۱ میلیون ریالی' },
    ],
    ceremonyPlace: 'مسجد ابوبکر صدیق - در مراسم باشکوه نماز جمعه',
    status: 'active',
  },
];

export const INITIAL_QUOTES: MotivationalQuote[] = [
  { id: 'q-1', text: 'مسجد خانه آرامش دل‌هاست.', source: 'دارالقرآن کنخ', active: true },
  { id: 'q-2', text: 'هر قدم به سوی مسجد، قدمی به سوی نور و سعادت است.', source: 'احادیث نبوی', active: true },
  { id: 'q-3', text: 'خوشا آنان که دلشان با مسجد و خانه خدا زنده است.', source: 'کلام بزرگان', active: true },
  { id: 'q-4', text: 'دل را به یاد خدا آرام کن؛ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', source: 'سوره رعد', active: true },
  { id: 'q-5', text: 'بهترین دوستی‌ها در مسیر خوبی‌ها و مساجد شکل می‌گیرند.', source: 'پیام تربیتی دارالقرآن', active: true },
  { id: 'q-6', text: 'الصلاة عماد الدین - نماز ستون استوار دین و روشنایی زندگی است.', source: 'حدیث شریف', active: true },
];

export const INITIAL_SETTINGS: AppSettings = {
  qrEnabled: false, // Default disabled as requested; only General Admin can toggle
  defaultReferralPoints: 50,
  currentPeriodId: 'period-1405-08',
  quotesEnabled: true,
  allowGuestAttendance: true,
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    recipientUserId: 'all',
    title: 'به سامانه «مسجد من» خوش آمدید',
    message: 'ثبت حضور و امتیازدهی دارالقرآن کنخ آغاز شد. موفق باشید.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [];

export const INITIAL_TRANSACTIONS: PointTransaction[] = [];
