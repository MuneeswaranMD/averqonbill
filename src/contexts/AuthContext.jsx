import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

// Platform owner email - automatically gets super_admin role
const SUPER_ADMIN_EMAIL = 'muneeswaran@averqon.in';

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchUserData(uid) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            // Also fetch company data if the user belongs to one
            if (data.companyId && data.companyId !== 'platform') {
                await fetchCompanyData(data.companyId);
            }
            return data;
        }
        return null;
    }

    async function fetchCompanyData(companyId) {
        if (!companyId || companyId === 'platform') return;
        try {
            const companyDoc = await getDoc(doc(db, 'companies', companyId));
            if (companyDoc.exists()) {
                setCompanyData({ id: companyDoc.id, ...companyDoc.data() });
            }
        } catch (e) {
            console.warn('Could not fetch company data:', e);
        }
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function register(email, password, name) {
        const res = await createUserWithEmailAndPassword(auth, email, password);

        // Automatically assign super_admin for platform owner email
        const role = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
            ? 'super_admin'
            : 'admin';

        await setDoc(doc(db, 'users', res.user.uid), {
            uid: res.user.uid,
            email,
            name,
            role,
            // Super admin links to the platform itself, not a company
            companyId: role === 'super_admin' ? 'platform' : null,
            createdAt: serverTimestamp(),
        });

        return res;
    }

    function logout() {
        setCompanyData(null);
        return signOut(auth);
    }

    // Call this after onboarding to refresh userData + companyData without full page reload
    async function refreshUserData() {
        if (currentUser) {
            await fetchUserData(currentUser.uid);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
                setCompanyData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        companyData,       // Full company document (includes industry, modules, plan, etc.)
        loading,
        login,
        register,
        logout,
        refreshUserData,
        isAdmin: userData?.role === 'admin' || userData?.role === 'super_admin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase(),
        isSuperAdmin: userData?.role === 'super_admin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase(),
        companyId: userData?.companyId,
        industry: companyData?.industry || null,         // e.g. 'retail', 'tours', etc.
        activeModules: companyData?.modules || [],       // e.g. ['Dashboard', 'Products', ...]
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
