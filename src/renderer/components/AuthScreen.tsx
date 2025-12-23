import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';

interface AuthScreenProps {
    onAuthComplete: (uid: string, additionalData?: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log("Attempting auth. IsLogin:", isLogin, "Email:", email);

        try {
            if (isLogin) {
                console.log("Calling signInWithEmailAndPassword...");
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Login success, checking verification:", userCredential.user.emailVerified);
                if (!userCredential.user.emailVerified) {
                    console.log("User not verified yet.");
                    setError('Lütfen e-posta adresinizi doğrulayın. Doğrulama bağlantısı e-postanıza gönderildi.');
                    setLoading(false);
                    return;
                }
                console.log("Login verified. Triggering onAuthComplete...");
                onAuthComplete(userCredential.user.uid);
            } else {
                console.log("Calling createUserWithEmailAndPassword...");
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("Signup success, updating profile...");
                await updateProfile(userCredential.user, { displayName: name });
                console.log("Sending verification email...");
                await sendEmailVerification(userCredential.user);

                onAuthComplete(userCredential.user.uid, { name, birthDate });
                setVerificationSent(true);
            }
        } catch (err: any) {
            console.error("Auth error detail:", err);
            if (err.message && err.message.includes('BLOCKED_BY_CLIENT')) {
                setError('Bağlantı bir reklam engelleyici veya güvenlik duvarı tarafından engellendi. Lütfen AdBlocker kapatın veya sayfayı yenileyip tekrar deneyin.');
            } else if (err.code === 'auth/email-already-in-use') setError('Bu e-posta adresi zaten kullanımda.');
            else if (err.code === 'auth/wrong-password') setError('Hatalı şifre.');
            else if (err.code === 'auth/user-not-found') setError('Kullanıcı bulunamadı.');
            else if (err.code === 'auth/invalid-credential') setError('Hatalı e-posta veya şifre.');
            else setError('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            console.log("Auth attempt finished.");
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}
            >
                <CheckCircle2 size={80} color="#10b981" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '800' }} className="gradient-text">Doğrulama Gönderildi!</h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.8, lineHeight: '1.6', marginBottom: '3rem' }}>
                    <strong>{email}</strong> adresine bir doğrulama bağlantısı gönderdik. Devam etmek için lütfen e-postanızı kontrol edin ve bağlantıya tıklayın.
                </p>
                <button
                    onClick={() => {
                        setVerificationSent(false);
                        setIsLogin(true);
                    }}
                    style={submitButtonStyle}
                >
                    Giriş Ekranına Dön
                </button>
            </motion.div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.8rem', marginBottom: '0.75rem', fontWeight: '900' }} className="gradient-text">
                        {isLogin ? 'Tekrar Hoş Geldin' : 'Yeni Bir Başlangıç'}
                    </h2>
                    <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>
                        {isLogin ? 'Distro Couple dünyasına giriş yapın' : 'Topluluğumuza bugün katılın'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#ef4444'
                            }}
                        >
                            <AlertCircle size={20} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {!isLogin && (
                        <>
                            <div style={inputGroupStyle}>
                                <User size={20} style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder="Ad Soyad"
                                    required
                                    style={inputStyle}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div style={inputGroupStyle}>
                                <Calendar size={20} style={iconStyle} />
                                <input
                                    type="date"
                                    placeholder="Doğum Tarihi"
                                    required
                                    style={inputStyle}
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <div style={inputGroupStyle}>
                        <Mail size={20} style={iconStyle} />
                        <input
                            type="email"
                            placeholder="E-posta Adresi"
                            required
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={inputGroupStyle}>
                        <Lock size={20} style={iconStyle} />
                        <input
                            type="password"
                            placeholder="Şifre"
                            required
                            style={inputStyle}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{ ...submitButtonStyle, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'İşlem yapılıyor...' : (isLogin ? <><LogIn size={20} /> Giriş Yap</> : <><UserPlus size={20} /> Kayıt Ol</>)}
                    </motion.button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--secondary)',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isLogin ? "Henüz hesabınız yok mu? Hemen Kayıt Ol" : "Zaten hesabınız var mı? Giriş Yap"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const inputGroupStyle: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle: React.CSSProperties = { position: 'absolute', left: '1.25rem', opacity: 0.5, color: 'white' };
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', color: 'white',
    outline: 'none', fontSize: '1rem', transition: 'all 0.3s ease'
};
const submitButtonStyle: React.CSSProperties = {
    width: '100%', padding: '1.25rem', borderRadius: '16px', border: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white',
    fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
};

export default AuthScreen;
