import { auth, db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface OnboardingStatus {
  isCompleted: boolean;
  isLoading: boolean;
  userData: any | null;
}

export const useOnboardingStatus = (): OnboardingStatus => {
  const [status, setStatus] = useState<OnboardingStatus>({
    isCompleted: false,
    isLoading: true,
    userData: null,
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setStatus({
            isCompleted: false,
            isLoading: false,
            userData: null,
          });
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isCompleted = !!(
            userData.onboardingCompleted &&
            userData.name &&
            userData.age &&
            userData.diagnosis &&
            userData.developmentAreas
          );

          setStatus({
            isCompleted,
            isLoading: false,
            userData,
          });
        } else {
          setStatus({
            isCompleted: false,
            isLoading: false,
            userData: null,
          });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setStatus({
          isCompleted: false,
          isLoading: false,
          userData: null,
        });
      }
    };

    checkOnboardingStatus();
  }, []);

  return status;
};
