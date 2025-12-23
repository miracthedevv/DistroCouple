import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Search, Cpu } from 'lucide-react';

declare global {
    interface Window {
        require: (module: string) => any;
    }
}

const POPULAR_DISTROS = [
    "Windows 11", "Windows 10", "Windows 8.1", "Windows 7",
    "Ubuntu", "Fedora", "Arch Linux", "Debian", "Manjaro", "Linux Mint", "EndeavourOS", "Pop!_OS", "Zorin OS", "elementary OS",
    "Kali Linux", "CentOS", "openSUSE", "Garuda Linux", "Solus", "Gentoo", "Void Linux", "NixOS", "Pardus", "Red Hat Enterprise Linux"
];

interface OSSelectionProps {
    onComplete: (os: string) => void;
}

const OSSelection: React.FC<OSSelectionProps> = ({ onComplete }) => {
    const [detectedOS, setDetectedOS] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const detect = async () => {
            try {
                const { ipcRenderer } = window.require('electron');
                const info = await ipcRenderer.invoke('detect-os');
                setDetectedOS(`${info.distro} ${info.release}`);
            } catch (e) {
                setDetectedOS("İşletim Sistemi Belirlenemedi");
            }
        };
        detect();
    }, []);

    const filteredDistros = POPULAR_DISTROS.filter(d =>
        d.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.div
                        key="detected"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="glass-card"
                        style={{ padding: '4rem', textAlign: 'center', position: 'relative' }}
                    >
                        <div style={{
                            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                            width: '300px', height: '300px',
                            background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%', zIndex: -1
                        }} />

                        <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--glass)', borderRadius: '24px', marginBottom: '2.5rem', color: 'var(--primary)' }}>
                            <Cpu size={48} />
                        </div>

                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>İşletim Sisteminizi Tespit Ettik</h2>
                        <p style={{ fontSize: '1.1rem', opacity: 0.6, marginBottom: '3rem' }}>Eşleşmeleriniz bu sisteme göre filtrelenecektir.</p>

                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            marginBottom: '4rem',
                            padding: '2rem',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '24px',
                            color: 'var(--primary)',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                        }}>
                            {detectedOS || 'Tespit ediliyor...'}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onComplete(detectedOS || 'Bilinmiyor')}
                                style={confirmButtonStyle}
                            >
                                <Check size={24} /> Doğru, Devam Et
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(true)}
                                style={editButtonStyle}
                            >
                                <Edit2 size={24} /> Düzenle
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="glass-card"
                        style={{ padding: '3rem' }}
                    >
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Sisteminizi Seçin</h2>
                        <p style={{ opacity: 0.6, marginBottom: '2.5rem' }}>Listeden kullandığınız dağıtımı veya versiyonu seçin.</p>

                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <Search size={22} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="text"
                                placeholder="Dağıtım ara (Windows, Arch, Ubuntu...)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={searchInputStyle}
                            />
                        </div>

                        <div style={listScrollStyle}>
                            {filteredDistros.map((distro, idx) => (
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    key={distro}
                                    onClick={() => onComplete(distro)}
                                    style={distroItemStyle}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    {distro}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const confirmButtonStyle: React.CSSProperties = {
    padding: '1.25rem 2.5rem', borderRadius: '18px', border: 'none', background: 'var(--primary)',
    color: 'white', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
};

const editButtonStyle: React.CSSProperties = {
    padding: '1.25rem 2rem', borderRadius: '18px', border: '1px solid var(--glass-border)',
    background: 'var(--glass)', color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer'
};

const searchInputStyle: React.CSSProperties = {
    width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.75rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white', outline: 'none',
    fontSize: '1.1rem', transition: 'all 0.3s ease'
};

const listScrollStyle: React.CSSProperties = {
    maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', paddingRight: '0.75rem'
};

const distroItemStyle: React.CSSProperties = {
    textAlign: 'center', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.03)', color: 'white', transition: 'all 0.2s ease', cursor: 'pointer',
    fontWeight: '600', fontSize: '1rem'
};

export default OSSelection;
