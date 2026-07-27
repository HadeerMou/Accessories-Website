"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL, clearCustomerSession, customerToken, saveCustomerSession } from '@/lib/api';

type Address = {
  id: string;
  country: string;
  city: string;
  street: string;
  postalCode?: string | null;
  apartment?: string | null;
  isDefault?: boolean | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  product?: {
    id: string;
    nameEn: string;
    nameAr: string;
  } | null;
  productVariant?: { color?: string | null; size?: string | null } | null;
};

type Order = {
  id: string;
  createdAt: string;
  total: string | number;
  orderStatus: string;
  paymentStatus: string;
  address?: Address | null;
  items: OrderItem[];
};

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
};

type AddressForm = {
  country: string;
  city: string;
  street: string;
  postalCode: string;
  apartment: string;
  isDefault: boolean;
};

type Tab = 'personal' | 'addresses' | 'orders';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const locale = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({ fullName: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [addressForm, setAddressForm] = useState<AddressForm>({ country: '', city: '', street: '', postalCode: '', apartment: '', isDefault: false });

  const token = customerToken();
  const localeTag = locale === 'ar' ? 'ar-EG' : 'en-EG';

  const orderStatusLabels: Record<string, string> = {
    PENDING: t('orderStatusPending'),
    CONFIRMED: t('orderStatusConfirmed'),
    PROCESSING: t('orderStatusProcessing'),
    SHIPPED: t('orderStatusShipped'),
    DELIVERED: t('orderStatusDelivered'),
    CANCELLED: t('orderStatusCancelled'),
    REFUNDED: t('orderStatusRefunded'),
  };

  const paymentStatusLabels: Record<string, string> = {
    PENDING: t('paymentStatusPending'),
    PAID: t('paymentStatusPaid'),
    FAILED: t('paymentStatusFailed'),
    REFUNDED: t('paymentStatusRefunded'),
  };

  const addressUrl = `${API_URL}/addresses`;
  const ordersUrl = `${API_URL}/orders?limit=50`;

  useEffect(() => {
    if (!token) {
      setError(t('signInRequired'));
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(addressUrl, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(ordersUrl, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([profileResponse, addressesResponse, ordersResponse]) => {
        const profileBody = await profileResponse.json();
        if (!profileResponse.ok) throw new Error(profileBody.error ?? t('loadError'));
        const addressesBody = await addressesResponse.json();
        if (!addressesResponse.ok) throw new Error(addressesBody.error ?? t('loadAddressesError'));
        const ordersBody = await ordersResponse.json();
        if (!ordersResponse.ok) throw new Error(ordersBody.error ?? t('loadOrdersError'));

        setProfile(profileBody.data as UserProfile);
        setForm({ fullName: profileBody.data.fullName, email: profileBody.data.email, phone: profileBody.data.phone ?? '' });
        setAddresses(addressesBody.data as Address[]);
        setOrders(ordersBody.data as Order[]);
        setError('');
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : t('loadError'));
      })
      .finally(() => setLoading(false));
  }, [addressUrl, ordersUrl, t, token]);

  const changeField = (field: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const changeAddressField = (field: keyof AddressForm, value: string | boolean) => setAddressForm((current) => ({ ...current, [field]: value }));

  const startEditProfile = () => {
    if (!profile) return;
    setForm({ fullName: profile.fullName, email: profile.email, phone: profile.phone ?? '' });
    setIsEditingProfile(true);
    setError('');
    setMessage('');
  };

  const cancelEditProfile = () => {
    setIsEditingProfile(false);
    if (profile) {
      setForm({ fullName: profile.fullName, email: profile.email, phone: profile.phone ?? '' });
    }
    setError('');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: form.fullName, email: form.email, phone: form.phone }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? t('saveError'));
      const user = body.data as UserProfile;
      setProfile(user);
      saveCustomerSession(token, { id: user.id, fullName: user.fullName, email: user.email, role: user.role });
      setIsEditingProfile(false);
      setMessage(t('saveSuccess'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveError'));
    } finally {
      setSavingProfile(false);
    }
  };

  const requestPasswordResetEmail = async () => {
    if (!profile?.email) return;
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? t('passwordResetError'));
      setMessage(t('passwordResetSent'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('passwordResetError'));
    }
  };

  const loadAddresses = async () => {
    if (!token) return;
    try {
      const response = await fetch(addressUrl, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? t('loadAddressesError'));
      setAddresses(body.data as Address[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('loadAddressesError'));
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    try {
      const response = await fetch(ordersUrl, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? t('loadOrdersError'));
      setOrders(body.data as Order[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('loadOrdersError'));
    }
  };

  const startEditAddress = (address: Address) => {
    setAddressForm({
      country: address.country,
      city: address.city,
      street: address.street,
      postalCode: address.postalCode ?? '',
      apartment: address.apartment ?? '',
      isDefault: Boolean(address.isDefault),
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
    setError('');
    setMessage('');
  };

  const clearAddressForm = () => {
    setAddressForm({ country: '', city: '', street: '', postalCode: '', apartment: '', isDefault: false });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const saveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSavingAddress(true);
    setMessage('');
    setError('');

    try {
      const body = {
        country: addressForm.country,
        city: addressForm.city,
        street: addressForm.street,
        postalCode: addressForm.postalCode || null,
        apartment: addressForm.apartment || null,
        isDefault: addressForm.isDefault,
      };
      const url = editingAddressId ? `${addressUrl}/${editingAddressId}` : addressUrl;
      const method = editingAddressId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(data?.error ?? t('saveAddressError'));
      await loadAddresses();
      setMessage(editingAddressId ? t('addressUpdated') : t('addressAdded'));
      clearAddressForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveAddressError'));
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!token) return;
    setError('');
    try {
      const response = await fetch(`${addressUrl}/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? t('deleteAddressError'));
      }
      await loadAddresses();
      setMessage(t('addressDeleted'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('deleteAddressError'));
    }
  };

  const handleSignOut = () => {
    clearCustomerSession();
    window.location.href = '/';
  };

  const createdAt = useMemo(
    () => profile ? new Date(profile.createdAt).toLocaleDateString(localeTag, { year: 'numeric', month: 'short', day: 'numeric' }) : '',
    [profile, localeTag],
  );

  const updatedAt = useMemo(
    () => profile && profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString(localeTag, { year: 'numeric', month: 'short', day: 'numeric' }) : '',
    [profile, localeTag],
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#927345]">{t('section')}</div>
            <h1 className="mt-3 font-serif text-5xl text-[#2C2A28]">{t('title')}</h1>
            <p className="mt-4 max-w-2xl text-sm text-[#2C2A28]/70">{t('description')}</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-[#2C2A28]">{t('accountOverview')}</div>
            <div className="mt-6 grid gap-3 text-sm text-[#2C2A28]/80">
              <div><span className="font-semibold text-[#2C2A28]">{t('fullName')}:</span> {profile?.fullName ?? '—'}</div>
              <div><span className="font-semibold text-[#2C2A28]">{t('email')}:</span> {profile?.email ?? '—'}</div>
              <div><span className="font-semibold text-[#2C2A28]">{t('phone')}:</span> {profile?.phone ?? t('notProvided')}</div>
              <div><span className="font-semibold text-[#2C2A28]">{t('role')}:</span> {profile?.role ?? '—'}</div>
              <div><span className="font-semibold text-[#2C2A28]">{t('verified')}:</span> {profile?.isVerified ? t('yes') : t('no')}</div>
              <div><span className="font-semibold text-[#2C2A28]">{t('joined')}:</span> {createdAt}</div>
              {updatedAt && <div><span className="font-semibold text-[#2C2A28]">{t('updated')}:</span> {updatedAt}</div>}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-white/70 p-10 text-center text-sm text-[#2C2A28]">{t('loading')}</div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="space-y-6 border-b border-black/10 pb-6">
                <div className="text-xs font-semibold uppercase tracking-[.24em] text-[#927345]">{t('section')}</div>
                <div className="text-2xl font-serif text-[#2C2A28]">{t('title')}</div>
              </div>
              <nav className="mt-6 space-y-2">
                <button type="button" onClick={() => setActiveTab('personal')} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'personal' ? 'bg-[#faf8f5] text-[#2C2A28]' : 'text-[#2C2A28] hover:bg-[#f5f2eb]'}`}>
                  {t('profileTabPersonal')}
                </button>
                <button type="button" onClick={() => setActiveTab('addresses')} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'addresses' ? 'bg-[#faf8f5] text-[#2C2A28]' : 'text-[#2C2A28] hover:bg-[#f5f2eb]'}`}>
                  {t('profileTabAddresses')}
                </button>
                <button type="button" onClick={() => setActiveTab('orders')} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'orders' ? 'bg-[#faf8f5] text-[#2C2A28]' : 'text-[#2C2A28] hover:bg-[#f5f2eb]'}`}>
                  {t('profileTabOrders')}
                </button>
              </nav>
              <div className="mt-8 border-t border-black/10 pt-6">
                <button type="button" onClick={handleSignOut} className="inline-flex w-full items-center justify-center rounded-full bg-[#df4d4d] px-4 py-3 text-sm font-semibold uppercase tracking-[.18em] text-white transition hover:bg-[#b93b3b]">
                  {t('profileTabSignOut')}
                </button>
              </div>
            </aside>

            <div className="space-y-8">
              {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}
              {message && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">{message}</div>}

              {activeTab === 'personal' && (
                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[.24em] text-[#927345]">{t('personalSection')}</div>
                      <h2 className="mt-3 text-2xl font-serif text-[#2C2A28]">{t('personalTitle')}</h2>
                    </div>
                    {!isEditingProfile ? (
                      <button type="button" onClick={startEditProfile} className="rounded-full border border-black/10 bg-[#faf8f5] px-5 py-3 text-sm font-semibold text-[#2C2A28] transition hover:bg-[#f5f2eb]">
                        {t('editProfile')}
                      </button>
                    ) : null}
                  </div>
                  <p className="text-sm text-[#2C2A28]/70">{t('personalHint')}</p>

                  {!isEditingProfile ? (
                    <div className="mt-8 grid gap-6 lg:grid-cols-2 text-sm text-[#2C2A28]">
                      <div className="rounded-3xl border border-black/10 bg-[#faf8f5] p-6">
                        <div className="font-semibold text-[#2C2A28]">{t('fullName')}</div>
                        <div className="mt-3 text-sm text-[#2C2A28]/80">{profile?.fullName ?? '—'}</div>
                      </div>
                      <div className="rounded-3xl border border-black/10 bg-[#faf8f5] p-6">
                        <div className="font-semibold text-[#2C2A28]">{t('email')}</div>
                        <div className="mt-3 text-sm text-[#2C2A28]/80">{profile?.email ?? '—'}</div>
                      </div>
                      <div className="rounded-3xl border border-black/10 bg-[#faf8f5] p-6">
                        <div className="font-semibold text-[#2C2A28]">{t('phone')}</div>
                        <div className="mt-3 text-sm text-[#2C2A28]/80">{profile?.phone ?? t('notProvided')}</div>
                      </div>
                      <div className="rounded-3xl border border-black/10 bg-[#faf8f5] p-6">
                        <div className="font-semibold text-[#2C2A28]">{t('role')}</div>
                        <div className="mt-3 text-sm text-[#2C2A28]/80">{profile?.role ?? '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={saveProfile} className="mt-8 grid gap-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <LabelInput label={t('fullName')} value={form.fullName} onChange={(value) => changeField('fullName', value)} />
                        <LabelInput label={t('email')} value={form.email} type="email" onChange={(value) => changeField('email', value)} />
                        <LabelInput label={t('phone')} value={form.phone} type="tel" onChange={(value) => changeField('phone', value)} />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button type="submit" disabled={savingProfile} className="inline-flex items-center justify-center rounded-full bg-[#26372f] px-6 py-3 text-sm font-semibold uppercase tracking-[.18em] text-white transition hover:bg-[#1c2a22] disabled:cursor-not-allowed disabled:opacity-60">
                          {savingProfile ? t('saving') : t('saveChanges')}
                        </button>
                        <button type="button" onClick={cancelEditProfile} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[.18em] text-[#2C2A28] transition hover:bg-[#f5f2eb]">
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="mt-8 rounded-3xl border border-black/10 bg-[#faf8f5] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold text-[#2C2A28]">{t('passwordReset')}</div>
                        <p className="mt-2 text-sm text-[#2C2A28]/70">{t('passwordResetNote')}</p>
                      </div>
                      <button type="button" onClick={requestPasswordResetEmail} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#2C2A28] transition hover:bg-[#f5f2eb]">
                        {t('passwordReset')}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'addresses' && (
                <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
                  <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[.24em] text-[#927345]">{t('addressesSection')}</div>
                        <h2 className="mt-3 text-2xl font-serif text-[#2C2A28]">{t('addressesTitle')}</h2>
                      </div>
                      <button onClick={() => { clearAddressForm(); setShowAddressForm(true); }} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#faf8f5] px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-[#2C2A28] transition hover:bg-[#f5f2eb]">{t('addAddress')}</button>
                    </div>
                    {addresses.length ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="rounded-3xl border border-black/10 bg-[#f8f6f2] p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="font-semibold text-[#2C2A28]">{address.country}, {address.city}</div>
                                <div className="mt-1 text-sm text-[#2C2A28]/70">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</div>
                                <div className="text-sm text-[#2C2A28]/70">{address.postalCode ?? t('noPostalCode')}</div>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {address.isDefault && <span className="rounded-full bg-[#26372f] px-3 py-1 text-white">{t('defaultAddress')}</span>}
                                <button type="button" onClick={() => startEditAddress(address)} className="rounded-full border border-black/10 bg-white px-3 py-1 text-[#2C2A28] transition hover:bg-[#f5f2eb]">{t('edit')}</button>
                                <button type="button" onClick={() => deleteAddress(address.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 transition hover:bg-rose-100">{t('delete')}</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-black/15 bg-[#faf9f7] p-8 text-sm text-[#2C2A28]/70">{t('noAddresses')}</div>
                    )}
                  </div>
                  <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                    <div className="mb-6">
                      <div className="text-xs font-semibold uppercase tracking-[.24em] text-[#927345]">{t('addressFormSection')}</div>
                      <h2 className="mt-3 text-2xl font-serif text-[#2C2A28]">{showAddressForm ? t('addressFormTitle') : t('addressFormHint')}</h2>
                    </div>
                    {showAddressForm ? (
                      <form onSubmit={saveAddress} className="grid gap-5">
                        <LabelInput label={t('country')} value={addressForm.country} onChange={(value) => changeAddressField('country', value)} />
                        <LabelInput label={t('city')} value={addressForm.city} onChange={(value) => changeAddressField('city', value)} />
                        <LabelInput label={t('street')} value={addressForm.street} onChange={(value) => changeAddressField('street', value)} />
                        <LabelInput label={t('apartment')} value={addressForm.apartment} onChange={(value) => changeAddressField('apartment', value)} required={false} />
                        <LabelInput label={t('postalCode')} value={addressForm.postalCode} onChange={(value) => changeAddressField('postalCode', value)} required={false} />
                        <label className="inline-flex items-center gap-2 text-sm text-[#2C2A28]">
                          <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => changeAddressField('isDefault', event.target.checked)} className="h-4 w-4 rounded border-black/10 text-[#26372f] focus:ring-[#26372f]" />
                          <span>{t('setAsDefault')}</span>
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <button type="submit" disabled={savingAddress} className="inline-flex items-center justify-center rounded-full bg-[#26372f] px-6 py-3 text-sm font-semibold uppercase tracking-[.18em] text-white transition hover:bg-[#1c2a22] disabled:cursor-not-allowed disabled:opacity-60">
                            {savingAddress ? t('saving') : editingAddressId ? t('updateAddress') : t('saveAddress')}
                          </button>
                          <button type="button" onClick={clearAddressForm} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[.18em] text-[#2C2A28] transition hover:bg-[#f5f2eb]">{t('cancel')}</button>
                        </div>
                      </form>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-black/15 bg-[#faf9f7] p-8 text-sm text-[#2C2A28]/70">{t('addressFormPlaceholder')}</div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'orders' && (
                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                  <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[.24em] text-[#927345]">{t('ordersSection')}</div>
                    <h2 className="mt-3 text-2xl font-serif text-[#2C2A28]">{t('ordersTitle')}</h2>
                    <p className="mt-2 text-sm text-[#2C2A28]/70">{t('ordersHint')}</p>
                  </div>
                  {orders.length ? (
                    <div className="space-y-5">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-3xl border border-black/10 bg-[#f8f6f2] p-6">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-semibold text-[#2C2A28]">{t('orderNumber')} #{order.id.slice(0, 8).toUpperCase()}</div>
                              <div className="text-sm text-[#2C2A28]/70">{new Date(order.createdAt).toLocaleString(localeTag, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[.18em] text-[#2C2A28]">
                              <span className="rounded-full bg-[#e8e3d6] px-3 py-1">{orderStatusLabels[order.orderStatus] ?? order.orderStatus}</span>
                              <span className="rounded-full bg-[#e3f0e9] px-3 py-1">{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</span>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
                            <div>
                              <div className="text-sm font-semibold text-[#2C2A28]">{t('shippingAddress')}</div>
                              <div className="mt-2 text-sm text-[#2C2A28]/70">{order.address?.street}, {order.address?.city}, {order.address?.country}</div>
                            </div>
                            <div className="rounded-3xl border border-black/10 bg-white p-4 text-right">
                              <div className="text-xs uppercase tracking-[.16em] text-[#927345]">{t('orderTotal')}</div>
                              <div className="mt-2 font-semibold text-[#2C2A28]">{new Intl.NumberFormat(localeTag, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(Number(order.total))}</div>
                            </div>
                          </div>
                          <div className="mt-5 rounded-3xl border border-black/10 bg-white p-4 text-sm text-[#2C2A28]">
                            <div className="font-semibold text-[#2C2A28]">{t('items')}</div>
                            <div className="mt-3 space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-[#faf8f5] p-3">
                                  <div className="font-semibold text-[#2C2A28]">{locale === 'ar' ? item.product?.nameAr ?? item.product?.nameEn : item.product?.nameEn}</div>
                                  <div className="text-xs text-[#2C2A28]/70">{item.quantity} x {new Intl.NumberFormat(localeTag, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(Number(item.price))}</div>
                                  {item.productVariant && <div className="text-xs text-[#2C2A28]/70">{t('variant')}: {item.productVariant.color ?? t('noVariant')}{item.productVariant.size ? ` / ${item.productVariant.size}` : ''}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-black/15 bg-[#faf9f7] p-8 text-sm text-[#2C2A28]/70">{t('noOrders')}</div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

function LabelInput({ label, value, onChange, type = 'text', placeholder, required = true }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#2C2A28]">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-xl border border-black/10 bg-[#FAF8F5] px-4 text-sm outline-none focus:border-[#667d6b]"
      />
    </label>
  );
}
