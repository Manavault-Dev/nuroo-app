import { useAuth } from '@/context/AuthContext';
import tw from '@/lib/design/tw';
import { UserProgress } from '@/lib/home/home.types';
import { ProgressService } from '@/lib/services/progressService';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  progress: UserProgress | null;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onDateSelect,
  progress,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [dailyProgress, setDailyProgress] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const generateWeekDates = useCallback((centerDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(centerDate);
    startOfWeek.setDate(centerDate.getDate() - centerDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const loadDailyProgress = useCallback(
    async (dates: Date[]) => {
      try {
        setLoading(true);
        const progressData: Record<string, number> = {};

        for (const date of dates) {
          const dateStr = date.toISOString().split('T')[0];
          const tasksCompleted = await ProgressService.getTasksCompletedForDate(
            user!.uid,
            dateStr,
          );

          const maxTasksPerDay = 4;
          const progress = Math.min(
            100,
            (tasksCompleted / maxTasksPerDay) * 100,
          );
          progressData[dateStr] = progress;
        }

        setDailyProgress(progressData);
      } catch (error) {
        console.error('Error loading daily progress:', error);
      } finally {
        setLoading(false);
      }
    },
    [user?.uid],
  );

  useEffect(() => {
    if (user?.uid) {
      const newWeekDates = generateWeekDates(selectedDate);
      setWeekDates(newWeekDates);
      loadDailyProgress(newWeekDates);
    }
  }, [selectedDate, user?.uid, generateWeekDates, loadDailyProgress]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getDateProgress = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dailyProgress[dateStr] || 0;
  };

  const getDateColor = (date: Date) => {
    const progress = getDateProgress(date);
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateSelect(newDate);
  };

  if (loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}
      >
        <Text style={tw`text-lg text-gray-600 text-center`}>
          {t('progress.loading_weekly_progress')}
        </Text>
      </View>
    );
  }

  return (
    <View style={tw`bg-white rounded-2xl shadow-sm border border-gray-100`}>
      <View style={tw`flex-row items-center justify-between mb-6 p-6 pb-0`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          {t('progress.weekly_progress')}
        </Text>
        <View style={tw`flex-row items-center`}>
          <Pressable onPress={() => navigateWeek('prev')} style={tw`p-2 mr-2`}>
            <Text style={tw`text-2xl text-gray-400`}>‹</Text>
          </Pressable>
          <Text style={tw`text-sm font-medium text-gray-600`}>
            {weekDates[0]?.toLocaleDateString('en-US', { month: 'short' })}{' '}
            {weekDates[0]?.getDate()} -{' '}
            {weekDates[6]?.toLocaleDateString('en-US', { month: 'short' })}{' '}
            {weekDates[6]?.getDate()}
          </Text>
          <Pressable onPress={() => navigateWeek('next')} style={tw`p-2 ml-2`}>
            <Text style={tw`text-2xl text-gray-400`}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={tw`flex-row justify-between px-6`}>
        {weekDates.map((date, index) => (
          <Pressable
            key={index}
            onPress={() => onDateSelect(date)}
            style={[
              tw`items-center p-3 rounded-xl min-w-[40px]`,
              isSelected(date) && tw`bg-blue-50 border-2 border-blue-300`,
              isToday(date) &&
                !isSelected(date) &&
                tw`bg-green-50 border border-green-200`,
            ]}
          >
            <Text
              style={[
                tw`text-xs font-medium mb-1`,
                isSelected(date) ? tw`text-blue-700` : tw`text-gray-500`,
                isToday(date) && !isSelected(date) && tw`text-green-700`,
              ]}
            >
              {formatDate(date)}
            </Text>

            <Text
              style={[
                tw`text-lg font-bold mb-2`,
                isSelected(date) ? tw`text-blue-800` : tw`text-gray-800`,
                isToday(date) && !isSelected(date) && tw`text-green-800`,
              ]}
            >
              {formatDay(date)}
            </Text>

            <View style={tw`w-3 h-3 rounded-full mb-2`}>
              <View
                style={[
                  tw`w-full h-full rounded-full`,
                  tw`${getDateColor(date)}`,
                ]}
              />
            </View>

            <Text
              style={[
                tw`text-xs font-medium`,
                isSelected(date) ? tw`text-blue-600` : tw`text-gray-400`,
              ]}
            >
              {Math.round(getDateProgress(date))}%
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={tw`mt-6 p-4 bg-gray-50 rounded-xl mx-6 mb-6`}>
        <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-sm text-gray-600`}>
            {t('progress.daily_progress')}:{' '}
            {Math.round(getDateProgress(selectedDate))}%
          </Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-2 h-2 rounded-full bg-green-500 mr-2`} />
            <Text style={tw`text-xs text-gray-500`}>
              {Math.round(getDateProgress(selectedDate) / 25)} tasks completed
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`flex-row justify-between items-center px-6 pb-6`}>
        <View>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {t('progress.week_average')}
          </Text>
          <Text style={tw`text-lg font-bold text-primary`}>
            {Math.round(
              weekDates.reduce((sum, date) => sum + getDateProgress(date), 0) /
                7,
            )}
            %
          </Text>
        </View>
        <View style={tw`items-end`}>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {t('progress.best_day')}
          </Text>
          <Text style={tw`text-lg font-bold text-green-600`}>
            {Math.round(
              Math.max(...weekDates.map((date) => getDateProgress(date))),
            )}
            %
          </Text>
        </View>
      </View>
    </View>
  );
};
