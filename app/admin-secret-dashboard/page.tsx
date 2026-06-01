'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Lock, Mail, Eye, EyeOff, ShieldAlert, 
  Settings, Flame, Users, LogOut, ArrowLeft, Check, Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard values
  const [stats, setStats] = useState<{ total_visitors: number; total_cvs_roasted: number } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

  // 1. Session check on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch data once session exists and email is validated
  useEffect(() => {
    if (session && user && (!adminEmail || user.email === adminEmail)) {
      fetchDashboardData();
    }
  }, [session, user]);

  const fetchDashboardData = async () => {
    setConfigLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch config API key from database
      const configRes = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const configData = await configRes.json();
      if (configData.success) {
        setApiKey(configData.value);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  // 3. Authenticate admin
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSession(data.session);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setStats(null);
    setApiKey('');
    setError(null);
  };

  // 4. Update config API key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setSubmitLoading(true);
    setConfigSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ value: apiKey }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل حفظ مفتاح الـ API');
      }

      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 5. Rendering logic
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-amber-400" size={40} />
          <p className="text-sm text-slate-400">جاري فحص صلاحيات الإتش آر...</p>
        </div>
      </div>
    );
  }

  // LOGIN PAGE (If user is not signed in)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a] text-slate-100 font-sans relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl"></div>

          {/* Return link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors">
            <ArrowLeft size={14} />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-amber-500/20 shadow-md mx-auto mb-2">
              <Image 
                src="/A_high-end,_minimalist_professional_vector_202606011023.jpeg" 
                alt="الدولي HR Logo" 
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <h2 className="font-extrabold text-xl">بوابة الإتش آر السرية 🔐</h2>
            <p className="text-xs text-slate-400">خاص بالأدمن فقط، ممنوع دخول الكائنات الفضائية.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">البريد الإلكتروني للأدمن</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eldawly-hr.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/60 focus:outline-none rounded-xl py-3 px-4 pl-10 text-sm transition-colors text-left"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/60 focus:outline-none rounded-xl py-3 px-4 pl-10 text-sm transition-colors text-left"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitLoading ? <Loader2 className="animate-spin text-slate-950" size={18} /> : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ACCESS DENIED (If logged in but email does not match admin email)
  if (adminEmail && user.email !== adminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a] text-slate-100 font-sans">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-2xl border border-red-500/20 p-8 shadow-2xl text-center space-y-6">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 w-16 h-16 flex items-center justify-center mx-auto">
            <ShieldAlert size={36} />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-extrabold text-xl text-red-400">دخول غير مصرح! 🛑</h2>
            <p className="text-sm text-slate-300">
              حسابك الحالي (<strong className="text-amber-400">{user.email}</strong>) مش هو الإتش آر الدولي! مفيش ترويق لوحات تحكم ليك النهاردة.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <LogOut size={16} />
              <span>تسجيل خروج</span>
            </button>
            <Link 
              href="/" 
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-center transition-colors flex items-center justify-center"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0f172a] text-slate-100 font-sans relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Admin Header */}
      <header className="w-full border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Settings size={22} className="animate-spin" />
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg text-slate-100">لوحة تحكم الأدمن السرية</h1>
              <p className="text-[10px] text-slate-400">إدارة الدولي HR والتحكم في مفاتيح الـ AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <Link 
              href="/" 
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5"
            >
              <ArrowLeft size={12} />
              <span>عرض الموقع</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 transition-colors py-1.5 px-3 rounded-lg bg-red-950/10 border border-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={12} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro */}
        <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-bold text-lg text-slate-200">أهلاً بك يا فخر الـ HR الدولي! 👋</h2>
            <p className="text-xs text-slate-400 mt-1">مسجل دخول بحساب: <strong className="text-amber-400">{user.email}</strong></p>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-full font-bold">
            حالة النظام: متصل وجاهز للفرم 🟢
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Total Visitors */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-xl"></div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">إجمالي زوار طابور الجلد</p>
              <h3 className="text-3xl md:text-4xl font-black text-emerald-400">
                {stats ? stats.total_visitors.toLocaleString() : '...'}
              </h3>
              <p className="text-[10px] text-slate-500">تم التحديث تلقائياً عند الدخول</p>
            </div>
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
          </div>

          {/* Card 2: Total CVs Roasted */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 flex items-center justify-between relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.02] rounded-full blur-xl"></div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">سير ذاتية متسفف بيها (Roasts)</p>
              <h3 className="text-3xl md:text-4xl font-black text-orange-400">
                {stats ? stats.total_cvs_roasted.toLocaleString() : '...'}
              </h3>
              <p className="text-[10px] text-slate-500">تم حرق كرامتهم بنجاح</p>
            </div>
            <div className="p-4 rounded-full bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
              <Flame size={32} />
            </div>
          </div>

        </div>

        {/* Configuration Panel */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-6 relative">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-200">إدارة مفتاح محرك الـ AI (OpenRouter) ⚙️</h3>
            <p className="text-xs text-slate-400 mt-1">
              مفتاح الـ API بيتحفظ مباشرة في جدول <code className="text-amber-400 bg-slate-950 py-0.5 px-1.5 rounded">config</code> بقاعدة بيانات Supabase، وبيسحب منه سيرفر الـ API في كل طلب بشكل آمن، مش من متغيرات البيئة المحلية.
            </p>
          </div>

          {configLoading ? (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="animate-spin text-amber-400" size={24} />
              <p className="text-sm text-slate-400">جاري سحب مفتاح الـ API من الخزنة...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">OpenRouter API Key (sk-or-...)</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 focus:outline-none rounded-xl py-3 px-4 pl-10 text-sm transition-colors text-left font-mono"
                  />
                  <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {configSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>تم حفظ مفتاح الـ API وتحديثه في السيرفر بنجاح! 🎉</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                {submitLoading ? <Loader2 className="animate-spin text-slate-950" size={16} /> : 'حفظ التعديلات'}
              </button>
            </form>
          )}
        </div>

      </main>

      {/* Admin Footer */}
      <footer className="w-full py-6 border-t border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} الدولي HR - لوحة التحكم السرية الفاخرة.</p>
      </footer>
    </div>
  );
}
