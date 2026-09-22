import React from 'react';
import { Bell, BellOff, X, Sparkles, Youtube, CheckCircle2 } from 'lucide-react';
import { AppNotification } from '../types';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onSelectVideoById: (videoId: string) => void;
  onSoundTrigger: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  notificationsEnabled,
  onToggleNotifications,
  onSelectVideoById,
  onSoundTrigger,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-rose-500 text-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">تنبيهات الحلقات الجديدة</h3>
              <p className="text-xs text-amber-100">كن أول من يشاهد حكايات قصة العائلة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Notification Permission */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
              إشعارات الحلقات الفورية
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              {notificationsEnabled
                ? 'التنبيهات مفعلة، سنرسل لك إشعاراً فور صدور حكاية جديدة!'
                : 'فعّل التنبيهات لتصلك رسالة أول ما تنزل حلقة جديدة'}
            </p>
          </div>
          <button
            onClick={() => {
              onSoundTrigger();
              onToggleNotifications();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              notificationsEnabled
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-xs'
            }`}
          >
            {notificationsEnabled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مفعلة</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5" />
                <span>تفعيل الآن</span>
              </>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.videoId) {
                  onSoundTrigger();
                  onSelectVideoById(n.videoId);
                  onClose();
                }
              }}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-600 cursor-pointer transition space-y-1.5 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-800 dark:text-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {n.message}
              </p>
              {n.videoId && (
                <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 group-hover:underline pt-0.5">
                  اضغط هنا لمشاهدة الحلقة فوراً ←
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subscribe Footer Banner */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center">
          <a
            href={OFFICIAL_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
          >
            <Youtube className="w-4 h-4 fill-red-600" />
            <span>يمكنك أيضاً تفعيل الجرس مباشرة على صفحة يوتيوب</span>
          </a>
        </div>

      </div>
    </div>
  );
};
