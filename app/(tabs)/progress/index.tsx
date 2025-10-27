// External Imports
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

// Internal Imports
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { AchievementSystem } from '@/components/ProgressDevelopment/AchievementSystem';
import { DevelopmentProgress } from '@/components/ProgressDevelopment/DevelopmentProgress';
import { LevelProgress } from '@/components/ProgressDevelopment/LevelProgress';
import { WeeklyCalendar } from '@/components/ProgressDevelopment/WeeklyCalendar';
import { useProgressTracking } from '@/hooks/progressHooks/useProgressTracking';
import tw from '@/lib/design/tw';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { progress, loading, refreshProgress } = useProgressTracking();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProgress();
    setRefreshing(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-lg text-gray-600`}>
            {t('progress.loading_progress')}
          </Text>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ScrollView
        style={tw`flex-1 bg-gray-50`}
        contentContainerStyle={tw`pb-6`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={tw`bg-white px-4 py-6 border-b border-gray-100`}>
          <Text style={tw`text-3xl font-bold text-primary mb-2`}>
            {t('progress.dashboard_title')}
          </Text>
          <Text style={tw`text-gray-600 text-base`}>
            {t('progress.dashboard_subtitle')}
          </Text>
        </View>

        <View style={tw`px-4 py-4`}>
          <LevelProgress progress={progress} />
        </View>

        <View style={tw`px-4 py-2`}>
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            progress={progress}
          />
        </View>

        <View style={tw`px-4 py-2`}>
          <DevelopmentProgress onProgressUpdate={(progress) => {}} />
        </View>

        <View style={tw`px-4 py-4`}>
          <AchievementSystem progress={progress} />
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}
