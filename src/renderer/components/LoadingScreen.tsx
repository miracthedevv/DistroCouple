import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Server, Search, Users, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
    onComplete: () => void;
    status?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { label: "Veriler bulut ile senkronize ediliyor...", icon: <Server size={32} /> },
        { label: "OS uyumluluğu analiz ediliyor...", icon: <Search size={32} /> },
        { label: "Potansiyel eşleşmeler taranıyor...", icon: <Users size={32} /> },
        { label: "Veri güvenliği doğrulanıyor...", icon: <ShieldCheck size={32} /> }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(timer);
                    setTimeout(onComplete, 1200);
                    return prev;
                }
                return prev + 1;
            });
        }, 2500);

        return () => clearInterval(timer);
    }, [onComplete, steps.length]);

    return (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '5rem' }}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    style={{
                        color: 'var(--primary)',
                        filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.4))'
                    }}
                >
                    <Loader2 size={120} strokeWidth={1} />
                </motion.div>

                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '60px', height: '60px', background: 'var(--secondary)', filter: 'blur(40px)', opacity: 0.5, borderRadius: '50%'
                }} />
            </div>

            <div style={{ height: '80px', marginBottom: '3rem' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ color: 'var(--secondary)' }}
                        >
                            {steps[step].icon}
                        </motion.div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.5px' }}>{steps[step].label}</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }}
                />
            </div>

            <p style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.9rem', fontStyle: 'italic' }}>
                Lütfen bekleyin, bu işlem biraz zaman alabilir.
            </p>
        </div>
    );
};

export default LoadingScreen;
