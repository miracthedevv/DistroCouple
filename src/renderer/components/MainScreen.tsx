import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, Monitor, MessageCircle, AlertCircle, Loader2, User } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
    id: string;
    name: string;
    os: string;
    gender: string;
    age: number;
    bio?: string;
    image: string;
}

const MatchCard: React.FC<{ profile: UserProfile; onSwipe: (dir: 'left' | 'right') => void }> = ({ profile, onSwipe }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 120) onSwipe('right');
        else if (info.offset.x < -120) onSwipe('left');
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity, position: 'absolute', cursor: 'grab', zIndex: 1 }}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
        >
            <div className="glass-card" style={{
                width: '400px',
                height: '600px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}>
                <motion.div style={{ opacity: likeOpacity, position: 'absolute', top: '40px', left: '40px', border: '6px solid #10b981', color: '#10b981', padding: '10px 20px', borderRadius: '15px', fontWeight: '900', fontSize: '3rem', transform: 'rotate(-25deg)', zIndex: 10 }}>BEĞEN</motion.div>
                <motion.div style={{ opacity: nopeOpacity, position: 'absolute', top: '40px', right: '40px', border: '6px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '15px', fontWeight: '900', fontSize: '3rem', transform: 'rotate(25deg)', zIndex: 10 }}>PAS</motion.div>

                <img src={profile.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600'} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '3rem 2rem 2rem 2rem',
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 40%, rgba(15, 23, 42, 0) 100%)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: '800' }}>{profile.name}, {profile.age}</h3>
                        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '12px' }}>
                            <Monitor size={20} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{profile.os}</span>
                    </div>

                    <p style={{ fontSize: '1rem', opacity: 0.7, lineHeight: '1.6', marginBottom: 0 }}>
                        {profile.bio || 'Henüz bir biyografi eklenmemiş.'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const MainScreen: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [matches, setMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMatch, setShowMatch] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');

    useEffect(() => {
        const fetchMatches = async () => {
            if (!auth.currentUser) return;

            try {
                // Get current user's OS and gender to filter
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                const userData = userDoc.data();

                if (!userData) return;

                // Query for users with same OS and opposite gender
                const targetGender = userData.gender === 'erkek' ? 'kadin' : 'erkek';
                const q = query(
                    collection(db, 'users'),
                    where('gender', '==', targetGender),
                    where('os', '==', userData.os),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const fetchedProfiles: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (doc.id !== auth.currentUser?.uid) {
                        fetchedProfiles.push({
                            id: doc.id,
                            name: data.name,
                            os: data.os,
                            gender: data.gender,
                            age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
                            bio: data.bio,
                            image: data.image
                        });
                    }
                });

                setProfiles(fetchedProfiles);
            } catch (err) {
                console.error("Error fetching matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    useEffect(() => {
        const fetchMatchesList = async () => {
            if (!auth.currentUser || activeTab !== 'matches') return;

            setLoading(true);
            try {
                // Get likes FROM me
                const likesFromMe = await getDocs(query(collection(db, 'likes'), where('from', '==', auth.currentUser.uid)));
                const myLikes = likesFromMe.docs.map(d => d.data().to);

                // Get likes TO me
                const likesToMe = await getDocs(query(collection(db, 'likes'), where('to', '==', auth.currentUser.uid)));
                const usersLikingMe = likesToMe.docs.map(d => d.data().from);

                // Find intersection (matches)
                const matchedUserIds = myLikes.filter(id => usersLikingMe.includes(id));

                if (matchedUserIds.length === 0) {
                    setMatches([]);
                    return;
                }

                const matchedProfiles: UserProfile[] = [];
                for (const id of matchedUserIds) {
                    const d = await getDoc(doc(db, 'users', id));
                    if (d.exists()) {
                        const data = d.data();
                        matchedProfiles.push({
                            id: d.id,
                            name: data.name,
                            os: data.os,
                            gender: data.gender,
                            age: new Date().getFullYear() - new Date(data.birthDate).getFullYear(),
                            bio: data.bio,
                            image: data.image
                        });
                    }
                }
                setMatches(matchedProfiles);
            } catch (err) {
                console.error("Error fetching match list:", err);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'matches') fetchMatchesList();
    }, [activeTab]);

    const handleSwipe = async (direction: 'left' | 'right') => {
        const swipedProfile = profiles[currentIndex];
        if (!auth.currentUser || !swipedProfile) return;

        if (direction === 'right') {
            // Save like
            try {
                await addDoc(collection(db, 'likes'), {
                    from: auth.currentUser.uid,
                    to: swipedProfile.id,
                    timestamp: serverTimestamp()
                });

                // Check for match
                const matchQuery = query(
                    collection(db, 'likes'),
                    where('from', '==', swipedProfile.id),
                    where('to', '==', auth.currentUser.uid)
                );
                const matchSnapshot = await getDocs(matchQuery);
                if (!matchSnapshot.empty) {
                    setShowMatch(swipedProfile);
                }
            } catch (err) {
                console.error("Error saving like:", err);
            }
        }

        setCurrentIndex(prev => prev + 1);
    };

    const renderContent = () => {
        if (activeTab === 'discover') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem', width: '100%' }}>
                    <div style={{ position: 'relative', width: '400px', height: '600px' }}>
                        <AnimatePresence initial={false}>
                            {currentIndex < profiles.length ? (
                                <MatchCard
                                    key={profiles[currentIndex].id}
                                    profile={profiles[currentIndex]}
                                    onSwipe={handleSwipe}
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card"
                                    style={{
                                        width: '400px', height: '600px', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', padding: '3rem',
                                        textAlign: 'center', position: 'absolute'
                                    }}
                                >
                                    <div style={{
                                        background: 'rgba(236, 72, 153, 0.1)', padding: '2.5rem', borderRadius: '50%',
                                        marginBottom: '2.5rem', border: '1px solid rgba(236, 72, 153, 0.2)'
                                    }}>
                                        <Heart size={80} color="var(--secondary)" fill="var(--secondary)" />
                                    </div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 1rem 0' }} className="gradient-text">Etrafında kimse kalmadı!</h3>
                                    <p style={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: '1.5' }}>
                                        Tercihlerini değiştirmeyi veya daha sonra tekrar kontrol etmeyi dene.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', gap: '2.5rem', zIndex: 10 }}>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => currentIndex < profiles.length && handleSwipe('left')}
                            style={actionButtonStyle('#ef4444')}
                        >
                            <X size={36} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={infoButtonStyle}
                        >
                            <MessageCircle size={30} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => currentIndex < profiles.length && handleSwipe('right')}
                            style={actionButtonStyle('#10b981')}
                        >
                            <Heart size={36} fill="currentColor" />
                        </motion.button>
                    </div>
                </div>
            );
        }

        if (activeTab === 'matches') {
            return (
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }} className="gradient-text">Eşleşmelerin</h2>
                    {matches.length === 0 ? (
                        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                            <MessageCircle size={60} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                            <p style={{ fontSize: '1.2rem', opacity: 0.6 }}>Henüz hiç eşleşmen yok. Kaydırmaya devam et!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                            {matches.map(profile => (
                                <motion.div
                                    key={profile.id}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="glass-card"
                                    style={{ padding: '0.75rem', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                >
                                    <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                        <img src={profile.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', fontSize: '1.2rem' }}>{profile.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <Monitor size={14} />
                                            {profile.os}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'profile') {
            return (
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 2.5rem', border: '4px solid var(--primary)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}>
                            <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>{auth.currentUser?.displayName}</h2>
                        <p style={{ opacity: 0.6, fontSize: '1.1rem', marginBottom: '3rem' }}>{auth.currentUser?.email}</p>

                        <button
                            onClick={() => auth.signOut()}
                            style={{
                                ...submitButtonStyle,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                width: '100%',
                                boxShadow: 'none'
                            }}
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}>
            {/* Top Bar / Nav */}
            <div style={{
                position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(24px)',
                padding: '0.75rem', borderRadius: '24px', display: 'flex', gap: '1rem',
                border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <NavButton active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} icon={<Monitor size={22} />} label="Keşfet" />
                <NavButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={<Heart size={22} />} label="Eşleşmeler" />
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} />} label="Profil" />
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '10rem' }}>
                {(loading && activeTab !== 'discover') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '10rem' }}>
                        <Loader2 size={60} className="spinner" color="var(--primary)" />
                    </div>
                ) : renderContent()}
            </div>

            <AnimatePresence>
                {showMatch && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 100, background: 'rgba(15, 23, 42, 0.95)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.h2
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            style={{ fontSize: '4.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '3rem', letterSpacing: '-2px' }}
                        >
                            EŞLEŞTİNİZ!
                        </motion.h2>

                        <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3.5rem' }}>
                            <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', border: '5px solid var(--primary)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' }}>
                                <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', border: '5px solid var(--secondary)', boxShadow: '0 0 30px rgba(236, 72, 153, 0.5)' }}>
                                <img src={showMatch.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>

                        <p style={{ fontSize: '1.6rem', marginBottom: '3.5rem', fontWeight: '600', opacity: 0.9 }}>
                            {showMatch.name} ile harika bir uyum yakaladınız!
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <button
                                onClick={() => setShowMatch(null)}
                                style={{ ...submitButtonStyle, background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.1)', width: '250px', boxShadow: 'none' }}
                            >
                                Kaydırmaya Devam Et
                            </button>
                            <button
                                style={{ ...submitButtonStyle, width: '250px' }}
                            >
                                Mesaj Gönder
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const submitButtonStyle: React.CSSProperties = {
    padding: '1.25rem', borderRadius: '16px', border: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white',
    fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.75rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
};

const actionButtonStyle = (color: string): React.CSSProperties => ({
    width: '85px', height: '85px', borderRadius: '50%',
    background: 'var(--glass)', border: `2px solid ${color}44`,
    color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: `0 10px 30px ${color}22`
});

const infoButtonStyle: React.CSSProperties = {
    width: '65px', height: '65px', borderRadius: '50%',
    background: 'var(--glass)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: '10px', cursor: 'pointer'
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            background: active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
            border: 'none', color: active ? 'white' : 'rgba(255,255,255,0.5)',
            padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: '700'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.9rem' }}>{label}</span>
    </motion.button>
);

export default MainScreen;
