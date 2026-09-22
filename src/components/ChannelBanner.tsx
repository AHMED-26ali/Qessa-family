import React from 'react';
import { Youtube, ShieldCheck, Heart, Sparkles, Star, ExternalLink } from 'lucide-react';
import { OFFICIAL_CHANNEL_URL, CHANNEL_HANDLE, CHANNEL_NAME } from '../data/videos';

interface ChannelBannerProps {
  onSoundTrigger: () => void;
}

export const ChannelBanner: React.FC<ChannelBannerProps> = ({ onSoundTrigger }) => {
  return (
    <footer className="mt-12 sm:mt-16 pt-8 pb-12 border-t-2 border-amber-200/60 dark:border-indigo-950/80 bg-gradient-to-b from-transparent via-amber-50/40 to-amber-100/30 dark:via-slate-900/40 dark:to-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Main Channel Highlight Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 p-6 sm:p-9 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-2xl shrink-0 transform hover:rotate-6 transition-transform">
                <img
                  src="/logo.jpg"
                  alt="شعار قصة العائلة"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h3 className="text-2xl sm:text-3xl font-black">{CHANNEL_NAME}</h3>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-xs">
                    {CHANNEL_HANDLE}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-pink-100 max-w-xl font-medium leading-relaxed">
                  عالم سحري من الرسوم المتحركة والحكايات الهادفة قبل النوم لتنمية خيال أطفالنا وزرع القيم النبيلة بأسلوب ترفيهي مشوق وممتع.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs font-black text-amber-200">
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    محتوى آمن 100% للأطفال
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                    رسوم كرتونية مميزة
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    تحديث دائم بالحلقات الجديدة
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto">
              <a
                href={OFFICIAL_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSoundTrigger}
                className="px-7 py-3.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 active:scale-95 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition"
              >
                <Youtube className="w-5 h-5 fill-rose-600" />
                <span>اشترك في القناة على يوتيوب</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>

          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>جميع الحقوق محفوظة لقناة <strong>قصة العائلة | Qessa family</strong> © {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
            <span>صُنع بحب</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>لأجل ابتسامة وخيال كل طفل عربي</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
