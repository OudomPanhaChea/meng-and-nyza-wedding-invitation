import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Heart, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import OrnateDivider from './OrnateDivider';
import { sendBlessing } from '../api/telegram';

gsap.registerPlugin(ScrollTrigger);

const GOLD = '#b59410';

export default function BlessingSection() {
  const ref = useRef(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const floatUp = (selector, { duration = 1.6, delay = 0, y = 28, start = 'top 88%' } = {}) => {
        gsap.fromTo(
          selector,
          { opacity: 0, y, filter: 'blur(5px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration,
            delay,
            ease: 'power2.out',
            scrollTrigger: { trigger: selector, start, once: true },
          },
        );
      };

      const slideIn = (selector, fromX) => {
        gsap.fromTo(
          selector,
          { opacity: 0, x: fromX, filter: 'blur(5px)' },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: selector, start: 'top 90%', once: true },
          },
        );
      };

      floatUp('.blessing-title', { duration: 1.8, start: 'top 85%' });
      floatUp('.blessing-divider', { delay: 0.2 });
      floatUp('.blessing-subtitle', { delay: 0.35 });
      floatUp('.blessing-card', { y: 36, duration: 1.7 });
      slideIn('.blessing-name-field', -60);
      slideIn('.blessing-msg-field', 60);
      floatUp('.blessing-submit', { y: 24, delay: 0.1 });
    }, section);

    return () => ctx.revert();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    setStatus('sending');
    try {
      await sendBlessing(name, msg);
      setName('');
      setMsg('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  };

  const counterTone =
    msg.length > 450
      ? 'text-pink-600'
      : msg.length > 350
        ? 'text-gold-500'
        : 'text-gold-600/60';

  const isSending = status === 'sending';
  const canSubmit = name.trim().length > 0 && msg.trim().length > 0 && !isSending;

  return (
    <section id="blessings" ref={ref} className="px-5 py-7 mt-12">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Section heading */}
        <div className="blessing-title text-center">
          <h2 className="font-moul text-2xl">ផ្ញើសារជូនពរ</h2>
        </div>

        <OrnateDivider className="blessing-divider" />

        {/* English subtitle — matches the display-italic accents used elsewhere */}
        <p
          className="blessing-subtitle text-center font-display italic text-base tracking-[0.25em]"
        >
          Leave Your Blessings
        </p>

        {/* Form card */}
        <form onSubmit={submit} className="blessing-card bg-black/5 backdrop-blur-xs mt-6 rounded-lg p-5 space-y-5">
          {/* Name field */}
          <div className="blessing-name-field space-y-1.5">
            <label className="flex gap-2 font-hanuman font-semibold text-base">
              <User size={20} strokeWidth={2.25} style={{ color: GOLD }} />
              <span>ឈ្មោះ</span>
            </label>
            <input
              className="blessing-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ឈ្មោះរបស់លោកអ្នក..."
              maxLength={60}
              required
            />
          </div>

          {/* Message field */}
          <div className="blessing-msg-field space-y-1.5">
            <label className="flex gap-2 font-hanuman font-semibold text-base">
              <Heart size={20} strokeWidth={2.25} style={{ color: GOLD }} />
              <span>ពរជ័យ</span>
            </label>
            <textarea
              className="blessing-input resize-none"
              rows={4}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="សរសេរសារជូនពរ..."
              maxLength={500}
              required
            />
            <div className="flex justify-end">
              <span
                className={`font-hanuman font-semibold text-sm italic tracking-wider tabular-nums ${counterTone}`}
              >
                {msg.length} / 500
              </span>
            </div>
          </div>

          {/* Submit — centered, fixed comfortable width */}
          <div className="blessing-submit flex justify-center">
            <button
              type="submit"
              className="btn-open inline-flex items-center gap-2"
              disabled={!canSubmit}
              style={{
                opacity: canSubmit ? 1 : 0.55,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {isSending ? (
                <>
                  <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
                  <span>កំពុងផ្ញើសារ</span>
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.5} />
                  <span>ផ្ញើសារ</span>
                </>
              )}
            </button>
          </div>

          {/* Status banner */}
          {status === 'success' && (
            <div
              className="flex items-center justify-center gap-2 rounded-md py-2.5 px-4 font-hanuman font-semibold text-sm"
              style={{
                background: 'rgba(181,148,16,0.08)',
                border: '1px solid rgba(181,148,16,0.35)',
                color: GOLD,
              }}
            >
              <CheckCircle2 size={18} strokeWidth={2.25} />
              <span>សារត្រូវបានផ្ញើ! សូមអរគុណ</span>
            </div>
          )}
          {status === 'error' && (
            <div
              className="flex items-center justify-center gap-2 rounded-md py-2.5 px-4 font-hanuman font-semibold text-sm"
              style={{
                background: 'rgba(191,42,77,0.08)',
                border: '1px solid rgba(191,42,77,0.35)',
                color: '#BF2A4D',
              }}
            >
              <AlertCircle size={18} strokeWidth={2.25} />
              <span>មានបញ្ហា! សូមព្យាយាមម្ដងទៀត</span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
