import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ShoppingBag, ShieldCheck, User as UserIcon, Phone, MapPin, ArrowRight, ArrowLeft, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegister: (newUser: User) => void;
  onUpdatePassword: (email: string, newPassword: string) => boolean;
}

export default function Login({ users, onLoginSuccess, onRegister, onUpdatePassword }: LoginProps) {
  const [isAdminTab, setIsAdminTab] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verification from the dynamic users list
    const matchedUser = users.find(
      (u) =>
        (u.email.toLowerCase() === email.trim().toLowerCase() || u.id.toLowerCase() === email.trim().toLowerCase()) &&
        u.role === (isAdminTab ? 'admin' : 'user')
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== password) {
        setError('Maling password. Pakisubukang muli.');
        return;
      }
      onLoginSuccess(matchedUser);
    } else {
      setError(
        `Hindi nahanap ang account na ito bilang ${
          isAdminTab ? 'Admin' : 'User'
        }.`
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Kinakailangan ang iyong pangalan.');
      return;
    }
    if (!email.trim()) {
      setError('Kinakailangan ang iyong email.');
      return;
    }
    if (!password) {
      setError('Kinakailangan ang password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hindi tugma ang nakumpirmang password.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailExists) {
      setError('Mayroon nang account na gumagamit ng email na ito.');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      role: 'user',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      phone: phone.trim() || 'N/A',
      address: address.trim() || 'N/A',
      joinedDate: new Date().toISOString().split('T')[0],
      password: password
    };

    onRegister(newUser);
    setSuccess('Matagumpay ang iyong pagpaparehistro! Pwede ka nang mag-login.');
    setIsRegisterMode(false);
    setEmail(newUser.email);
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      onLoginSuccess(matchedUser);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail.trim()) {
      setError('Kinakailangan ang email o username.');
      return;
    }
    if (!verificationPhone.trim()) {
      setError('Kinakailangan ang rehistradong numero ng telepono.');
      return;
    }
    if (!newPassword) {
      setError('Kinakailangan ang bagong password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Hindi tugma ang nakumpirmang bagong password.');
      return;
    }

    // Clean phone number from non-digit characters for robust matching
    const cleanSearchPhone = verificationPhone.replace(/[^0-9]/g, '');

    // Verify user exists with matching phone
    const targetUser = users.find((u) => {
      const isEmailMatch = u.email.toLowerCase() === forgotEmail.trim().toLowerCase() || u.id.toLowerCase() === forgotEmail.trim().toLowerCase();
      const cleanUserPhone = u.phone.replace(/[^0-9]/g, '');
      return isEmailMatch && cleanUserPhone === cleanSearchPhone;
    });

    if (!targetUser) {
      setError('Hindi tugma ang email/username at telepono. Mangyaring subukan muli.');
      return;
    }

    // Perform update
    const updated = onUpdatePassword(targetUser.email, newPassword);
    if (updated) {
      setSuccess('Matagumpay na na-update ang iyong password! Maaari ka nang mag-login gamit ang iyong bagong password.');
      setIsForgotPassword(false);
      setForgotEmail('');
      setVerificationPhone('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Autofill to login form
      setEmail(targetUser.email);
      setPassword('');
    } else {
      setError('Nagkaroon ng problema sa pag-update ng password.');
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
            Online Shopping
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isForgotPassword 
            ? 'I-reset ang Password'
            : isRegisterMode 
            ? 'Lumikha ng Account' 
            : 'Maligayang Pagdating!'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isForgotPassword
            ? 'I-verify ang iyong account upang makagawa ng bagong password.'
            : isRegisterMode 
            ? 'Sumali sa Online Shopping upang makapamili ng mga de-kalidad na produkto.'
            : 'Sari-sari at de-kalidad na produkto para sa iyo.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Custom Switch Tab (only visible when not in register mode or forgot password mode) */}
          {!isRegisterMode && !isForgotPassword && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                id="login-user-tab"
                type="button"
                onClick={() => {
                  setIsAdminTab(false);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  !isAdminTab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Customer Login
              </button>
              <button
                id="login-admin-tab"
                type="button"
                onClick={() => {
                  setIsAdminTab(true);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isAdminTab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 text-sm text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-medium">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {isForgotPassword ? (
            // FORGOT PASSWORD FORM
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700">
                  Email Address o Username ng Account <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="forgot-email"
                    name="forgotEmail"
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="clarkjustin_algarme@smccnasipit.edu.ph"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="forgot-phone" className="block text-sm font-medium text-slate-700">
                  Rehistradong Numero ng Telepono <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="forgot-phone"
                    name="forgotPhone"
                    type="tel"
                    required
                    value={verificationPhone}
                    onChange={(e) => setVerificationPhone(e.target.value)}
                    placeholder="Hal. 09123456789"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Ito ay gagamitin para sa seguridad upang patunayang pagmamay-ari mo ang account.</p>
              </div>

              <div>
                <label htmlFor="forgot-new-password" className="block text-sm font-medium text-slate-700">
                  Bagong Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="forgot-new-password"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="forgot-confirm-new-password" className="block text-sm font-medium text-slate-700">
                  Kumpirmahin ang Bagong Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="forgot-confirm-new-password"
                    name="confirmNewPassword"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="forgot-submit-btn"
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  I-update ang Aking Password
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1.5 mx-auto transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Bumalik sa Pag-login
                </button>
              </div>
            </form>
          ) : isRegisterMode ? (
            // REGISTRATION FORM
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">
                  Buong Pangalan <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Clark Justin"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.trim().toLowerCase())}
                    placeholder="email@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700">
                  Numero ng Telepono
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-address" className="block text-sm font-medium text-slate-700">
                  Tirahan (Address)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nasipit, Agusan del Norte"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-slate-700">
                  Kumpirmahin ang Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <button
                  id="register-submit-btn"
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  I-register ang Account
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
                >
                  May account ka na ba? Mag-sign In
                </button>
              </div>
            </form>
          ) : (
            // STANDARD LOGIN FORM
            <form className="space-y-6" onSubmit={handleManualLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {isAdminTab ? 'Username o Email ng Admin' : 'Email Address'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      isAdminTab ? '' : 'clarkjustin_algarme@smccnasipit.edu.ph'
                    }
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccess('');
                      // Pre-fill email for ease of password recovery
                      setForgotEmail(email);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition"
                  >
                    Nakalimutan ang password?
                  </button>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAdminTab ? '' : '••••••••'}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <button
                  id="login-submit-btn"
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Mag-sign In
                </button>
              </div>

              {!isAdminTab && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1 mx-auto transition"
                  >
                    Wala pang account? Mag-register dito
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
