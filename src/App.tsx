import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Receipt, 
  User, 
  Settings, 
  Plus, 
  FileText, 
  PieChart, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  LogOut,
  LogIn
} from "lucide-react";
import { useAuth, supabase } from "./supabase";

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"receipts" | "profiles" | "settings">("receipts");
  const [receipts, setReceipts] = useState<any[]>([]);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch initial receipts
    const fetchReceipts = async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('telegram_id', user.user_metadata?.telegram_id || user.id) // Fallback to user.id if telegram_id not linked
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching receipts:", error);
      } else {
        setReceipts(data || []);
      }
    };

    fetchReceipts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('receipts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'receipts',
        filter: `telegram_id=eq.${user.user_metadata?.telegram_id || user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReceipts(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setReceipts(prev => prev.filter(r => r.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setReceipts(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Receipt className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">ScanLogic AI Ledger</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The conversational command center for your documents. Snap receipts, fill forms, and track expenses directly from Telegram.
          </p>
          <div className="space-y-4">
            <a 
              href="https://t.me/Mybillsaibot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <MessageSquare className="w-5 h-5" />
              Open Telegram Bot
            </a>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ScanLogic</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<Receipt className="w-5 h-5" />} 
            label="Receipts" 
            active={activeTab === "receipts"} 
            onClick={() => setActiveTab("receipts")} 
          />
          <NavItem 
            icon={<User className="w-5 h-5" />} 
            label="Profiles" 
            active={activeTab === "profiles"} 
            onClick={() => setActiveTab("profiles")} 
          />
          <NavItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || 'User'}`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Receipt
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "receipts" && (
              <motion.div
                key="receipts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {receipts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No receipts yet</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-6">
                      Send a photo of a receipt to your Telegram bot to see it here.
                    </p>
                    <a 
                      href="https://t.me/Mybillsaibot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                    >
                      Go to Telegram <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {receipts.map((receipt) => (
                      <ReceiptCard key={receipt.id} receipt={receipt} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "profiles" && (
              <motion.div
                key="profiles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Personal Profiles</h3>
                    <button className="text-blue-600 font-semibold text-sm hover:underline">Add Profile</button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <ProfileItem name="Personal" email={user.email || ""} tin="123456789" />
                    <ProfileItem name="Work" email="work@example.com" tin="987654321" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active 
          ? "bg-blue-50 text-blue-600" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ReceiptCard({ receipt, key }: { receipt: any, key?: any }) {
  return (
    <div key={key} className="bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <Receipt className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{receipt.category || "General"}</span>
      </div>
      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{receipt.merchant}</h4>
      <p className="text-sm text-gray-500 mb-4">{new Date(receipt.created_at).toLocaleDateString()}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total</p>
          <p className="text-2xl font-black text-gray-900">{receipt.currency || "$"} {receipt.total.toFixed(2)}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function ProfileItem({ name, email, tin }: { name: string, email: string, tin: string }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 font-bold uppercase">TIN</p>
        <p className="text-sm font-semibold text-gray-900">{tin}</p>
      </div>
    </div>
  );
}
