import React from 'react';
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';

interface GenderSelectionProps {
    onSelect: (gender: string) => void;
}

const GenderSelection: React.FC<GenderSelectionProps> = ({ onSelect }) => {
    return (
        <div style={{ textAlign: 'center', width: '100%' }}>
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '900' }} className="gradient-text">
                    Cinsiyetinizi Seçin
                </h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '4rem' }}>
                    Size en uygun eşleşmeleri bulmamıza yardımcı olun
                </p>
            </motion.div>

            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                    { id: 'erkek', label: 'Erkek', icon: <User size={64} />, color: '#3b82f6', secondary: '#1d4ed8' },
                    { id: 'kadin', label: 'Kadın', icon: <Users size={64} />, color: '#ec4899', secondary: '#be185d' }
                ].map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.08, y: -10, boxShadow: `0 20px 40px ${item.color}33` }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(item.id)}
                        className="glass-card"
                        style={{
                            width: '240px',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2rem',
                            border: `1px solid ${item.color}33`,
                            padding: '2rem',
                            cursor: 'pointer',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            position: 'absolute', bottom: '-20%', right: '-20%',
                            width: '120px', height: '120px',
                            background: item.color, filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%'
                        }} />

                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            style={{
                                color: item.color,
                                background: `linear-gradient(135deg, ${item.color}22, ${item.secondary}44)`,
                                padding: '2rem',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {item.icon}
                        </motion.div>
                        <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '1px' }}>{item.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default GenderSelection;
