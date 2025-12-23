import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import GenderSelection from './components/GenderSelection';
import OSSelection from './components/OSSelection';
import LoadingScreen from './components/LoadingScreen';
import MainScreen from './components/MainScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type Screen = 'auth' | 'gender' | 'os' | 'loading' | 'main';

interface UserData {
    uid: string;
    name: string;
    gender: string;
    os: string;
    birthDate?: string;
}

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData>({
        uid: '',
        name: '',
        gender: '',
        os: '',
    });

    useEffect(() => {
        console.log("App mounted. Listener starting...");
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth event:", user ? `User: ${user.email} (Verified: ${user.emailVerified})` : "No User");

            if (user) {
                setCurrentUser(user);
                if (user.emailVerified) {
                    console.log("Verification OK. Fetching Firestore profile...");

                    // Set a timeout for Firestore to prevent complete app hang
                    const fetchTimeout = setTimeout(() => {
                        console.warn("Firestore fetch timed out. Moving to setup as fallback.");
                        setCurrentScreen('gender');
                    }, 5000);

                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        clearTimeout(fetchTimeout);

                        if (userDoc.exists()) {
                            console.log("Profile found.");
                            setUserData(userDoc.data() as UserData);
                            setCurrentScreen('main');
                        } else {
                            console.log("No profile found. Starting setup.");
                            setUserData(prev => ({ ...prev, uid: user.uid, name: user.displayName || '' }));
                            setCurrentScreen('gender');
                        }
                    } catch (err) {
                        clearTimeout(fetchTimeout);
                        console.error("Firestore error:", err);
                        // Even if firestore fails, we might want to let them into setup or show error
                        setCurrentScreen('gender');
                    }
                } else {
                    console.log("Waiting for email verification...");
                    setCurrentScreen('auth');
                }
            } else {
                setCurrentUser(null);
                setCurrentScreen('auth');
            }
        });

        return () => unsubscribe();
    }, []);

    const nextScreen = (screen: Screen) => setCurrentScreen(screen);

    const saveToFirestore = async (finalData: UserData) => {
        try {
            await setDoc(doc(db, 'users', finalData.uid), {
                ...finalData,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Firestore saving error:", error);
        }
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'auth':
                return <AuthScreen onAuthComplete={(uid, additionalData) => {
                    console.log("onAuthComplete triggered in App. Manual check starting...");
                    if (additionalData) {
                        setUserData(prev => ({ ...prev, uid, ...additionalData }));
                    }

                    // If we just logged in and verified, move to loading immediately
                    if (auth.currentUser && auth.currentUser.emailVerified) {
                        console.log("User is verified. Manually shifting to loading screen.");
                        setCurrentScreen('loading');
                    }
                }} />;
            case 'gender':
                return <GenderSelection onSelect={(gender: string) => {
                    setUserData(prev => ({ ...prev, gender }));
                    nextScreen('os');
                }} />;
            case 'os':
                return <OSSelection onComplete={async (os: string) => {
                    const updated = { ...userData, os };
                    setUserData(updated);
                    nextScreen('loading');
                    await saveToFirestore(updated);
                }} />;
            case 'loading':
                return <LoadingScreen onComplete={() => nextScreen('main')} />;
            case 'main':
                return <MainScreen />;
            default:
                return null;
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-darker)',
            padding: '2rem',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute', top: '10%', left: '10%',
                width: '40vw', height: '40vw',
                background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '10%',
                width: '40vw', height: '40vw',
                background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', zIndex: 0
            }} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentScreen}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 1 }}
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                style={{
                    position: 'absolute', bottom: '2rem',
                    fontWeight: '900', letterSpacing: '6px', fontSize: '0.8rem',
                    textTransform: 'uppercase', color: 'white'
                }}
            >
                Distro Couple <span style={{ color: 'var(--primary)' }}>•</span> Premium
            </motion.div>
        </div>
    );
};

export default App;
