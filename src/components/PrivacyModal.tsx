import React from 'react';
import { ShieldCheck, X, Heart, Lock, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-twinkle">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-indigo-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-100 via-rose-50 to-pink-100 dark:from-slate-900 dark:to-indigo-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-amber-200">
                سياسة خصوصية الأطفال وحماية العائلة
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                دليل أولياء الأمور لمعايير الأمان والخصوصية في موقع قصة العائلة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/80 dark:bg-slate-800 hover:bg-white text-slate-700 dark:text-slate-300 transition shadow-2xs cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Commitment Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-emerald-900 dark:text-emerald-200 mb-1">
                التزامنا الصارم بخصوصية الطفل
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                موقع قصة العائلة مصمم للأطفال والعائلات. نحن نلتزم التزاماً كاملاً بقانون حماية خصوصية الأطفال على الإنترنت (COPPA) ولائحة حماية البيانات العامة للأطفال (GDPR-K).
              </p>
            </div>
          </div>

          {/* Pillars */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <span>🚫</span>
                <span>عدم جمع أي بيانات شخصية</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                لا نطلب ولا نجمع أسماء الأطفال، أو أعمارهم الدقيقة، أو بريدهم الإلكتروني، أو مواقعهم الجغرافية، أو صورهم. لا يوجد أي نظام لتسجيل الحسابات للأطفال في الموقع.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>مشغل يوتيوب المعزز للخصوصية (Privacy-Enhanced Mode)</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يتم عرض الفيديوهات عبر نطاق يوتيوب المعزز للخصوصية (<code className="text-rose-500 font-mono">youtube-nocookie.com</code>)، والذي يمنع يوتيوب من تخصيص الإعلانات أو حفظ ملفات تعريف الارتباط السلوكية لتتبع زيارات الأطفال.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <span>🎮</span>
                <span>ألعاب آمنة وتخزين محلي فقط</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                جميع الألعاب التفاعلية تعمل بالكامل داخل جهاز المستخدم. لا توجد أي إعلانات داخل الألعاب، ولا غرف محادثة مع الغرباء، ويتم حفظ إعدادات المفضلة والوضع الليلي في التخزين المحلي للمتصفح (localStorage) دون إرسالها لأي خادم خارجي.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <span>👨‍👩‍👧</span>
                <span>بوابة إشراف الوالدين</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                أي روابط تفتح خارج الموقع (مثل زيارة قناة يوتيوب الرسمية) تكون واضحة ومميزة بعلامة خارجية موجهة لأولياء الأمور لتجنب نقر الأطفال العرضي.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-2">
            آخر تحديث للسياسة: نوفمبر 2024 • قناة قصة العائلة (@Qessa-family)
          </p>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md active:scale-95 transition cursor-pointer"
          >
            فهمت ذلك، شكراً لك ✓
          </button>
        </div>
      </div>
    </div>
  );
};
