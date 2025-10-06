import tw from '@/lib/design/tw';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface TaskTimerProps {
  userId?: string;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [timeUntilNext, setTimeUntilNext] = useState<string>(
    t('timer.calculating'),
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilNext(t('timer.available_now'));
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeUntilNext(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilNext(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <View
      style={tw`mb-4  px-2 py-1 bg-blue-50 border border-blue-200 rounded min-h-6`}
    >
      <View style={tw`flex-row justify-between items-center`}>
        <Text style={tw`text-sm text-blue-700 font-medium`}>
          {t('timer.next_tasks_in')}
        </Text>
        <Text style={tw`text-sm text-blue-700 font-bold`}>{timeUntilNext}</Text>
      </View>
    </View>
  );
};
