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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pb-safe sm:pb-0">
        
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
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Notification Permission */}
        <div className="p-3.5 sm:p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
              إشعارات الحلقات الفورية
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              {notificationsEnabled
                ? 'التنبيهات مفعلة، ستصلك الحكايات فور نزولها!'
                : 'فعّل التنبيهات لتصلك رسالة أول ما تنزل حلقة'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSoundTrigger();
              onToggleNotifications();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 min-h-[40px] ${
              notificationsEnabled
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-3.5 h-3.5 fill-white" />
                <span>مفعلة</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5" />
                <span>تفعيل</span>
              </>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-3 space-y-2 flex-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.videoId) {
                  onSoundTrigger();
                  onSelectVideoById(notif.videoId);
                  onClose();
                }
              }}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 hover:bg-amber-50/80 dark:hover:bg-slate-800/80 active:scale-[0.99] ${
                notif.read
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-rose-50/40 dark:bg-slate-800/40 border border-rose-100 dark:border-rose-950'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                    {notif.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{notif.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {notif.message}
                </p>
                {notif.videoId && (
                  <span className="inline-block text-[11px] font-black text-rose-500 pt-1">
                    اضغط لمشاهدة الحكاية الآن ←
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <a
            href={OFFICIAL_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSoundTrigger}
            aria-label="زيارة قناة قصة العائلة على يوتيوب"
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline min-h-[40px]"
          >
            <Youtube className="w-4 h-4 fill-red-600" />
            <span>قناة قصة العائلة على يوتيوب</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 min-h-[40px]"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
