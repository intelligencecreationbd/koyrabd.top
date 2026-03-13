import React, { useEffect, useState } from 'react';
import { getVisitorStats } from '../../services/analyticsService';
import { Users, Calendar, BarChart3, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisitorStatsProps {
  onClose: () => void;
}

const VisitorStats: React.FC<VisitorStatsProps> = ({ onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getVisitorStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const dailyVisits = stats?.daily?.[today] || 0;
  const monthlyVisits = stats?.monthly?.[thisMonth] || 0;
  const totalVisits = stats?.totalVisits || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            ভিজিটর পরিসংখ্যান
          </h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
            title="রিফ্রেশ করুন"
          >
            <RotateCcw className={`w-5 h-5 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {/* Daily Visits */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">আজকের ভিজিটর</p>
                      <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{dailyVisits}</h3>
                    </div>
                    <Calendar className="w-8 h-8 text-emerald-500/50" />
                  </div>
                </div>

                {/* Monthly Visits */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">এই মাসের ভিজিটর</p>
                      <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{monthlyVisits}</h3>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500/50" />
                  </div>
                </div>

                {/* Total Visits */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">সর্বমোট ভিজিটর</p>
                      <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalVisits}</h3>
                    </div>
                    <Users className="w-8 h-8 text-purple-500/50" />
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  * ভিজিটর কাউন্ট করা হয় মেইন ডোমেইন ভিজিটের ভিত্তিতে।
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VisitorStats;
