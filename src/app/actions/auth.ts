'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function setGoogleToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('googleAccessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour token lifetime
  });
}

export async function removeGoogleToken() {
  const cookieStore = await cookies();
  cookieStore.delete('googleAccessToken');
  cookieStore.delete('user_tier');
}

export async function verifyTier(email: string, uid: string) {
  const cookieStore = await cookies();
  let tier = 'public';

  if (email.endsWith('@nsru.ac.th')) {
    tier = 'nu';
  } else {
    // Check whitelist
    try {
      const whitelistRef = doc(db, 'whitelist', email);
      const whitelistSnap = await getDoc(whitelistRef);
      if (whitelistSnap.exists() && whitelistSnap.data().approved === true) {
        tier = 'nu';
      }
    } catch (e) {
      console.error('Failed to check whitelist:', e);
    }
  }

  // Set tier cookie
  cookieStore.set('user_tier', tier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Update user profile in Firestore
  try {
    const userRef = doc(db, 'users', uid, 'profile', 'info');
    await setDoc(userRef, {
      tier,
      email,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error('Failed to update user profile tier:', e);
  }

  return tier;
}
