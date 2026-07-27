"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL } from '@/lib/api';

export default function ResetPasswordPage() {
  const t = useTranslations('Profile');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError(t('resetTokenMissing'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? t('resetFailed'));
      setMessage(t('resetSuccess'));
      setPassword('');
      setConfirmPassword('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('resetFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
        <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
          <div className="mb-8">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#927345]">{t('section')}</div>
            <h1 className="mt-3 text-4xl font-serif text-[#2C2A28]">{t('resetPasswordTitle')}</h1>
            <p className="mt-4 text-sm text-[#2C2A28]/70">{t('resetPasswordDescription')}</p>
          </div>

          {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}
          {message && <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">{message}</div>}

          <form onSubmit={submit} className="grid gap-6">
            <label className="grid gap-2 text-sm font-semibold text-[#2C2A28]">
              {t('password')}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border border-black/10 bg-[#FAF8F5] px-4 text-sm outline-none focus:border-[#667d6b]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#2C2A28]">
              {t('confirmPassword')}
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl border border-black/10 bg-[#FAF8F5] px-4 text-sm outline-none focus:border-[#667d6b]"
              />
            </label>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-full bg-[#26372f] px-6 py-3 text-sm font-semibold uppercase tracking-[.18em] text-white transition hover:bg-[#1c2a22] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? t('saving') : t('resetPasswordButton')}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
