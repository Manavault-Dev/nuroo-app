import { db } from '@/lib/firebase/firebase';
import { ChildData } from '@/lib/home/home.types';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';

export const useChildData = () => {
  const [childData, setChildData] = useState<ChildData | null>(null);

  const fetchChildData = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setChildData(data as ChildData);
        console.log('✅ Child data loaded:', data);
      } else {
        console.log('📄 No child data found for user');
      }
    } catch (error) {
      console.error('❌ Error fetching child data:', error);
    }
  }, []);

  return { childData, fetchChildData };
};
