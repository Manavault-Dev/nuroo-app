import { useProgressTracking } from '@/hooks/progressHooks/useProgressTracking';
import tw from '@/lib/design/tw';
import { UserProgress } from '@/lib/home/home.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface DevelopmentProgressProps {
  onProgressUpdate?: (progress: UserProgress) => void;
}

export const DevelopmentProgress: React.FC<DevelopmentProgressProps> = ({
  onProgressUpdate,
}) => {
  const { t } = useTranslation();
  const {
    progress,
    loading,
    updateProgress,
    getProgressColor,
    getProgressLabel,
  } = useProgressTracking({
    onProgressUpdate,
  });

  if (loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>
          {t('progress.development_areas')}
        </Text>
        <Text style={tw`text-gray-500`}>{t('progress.loading_progress')}</Text>
      </View>
    );
  }

  if (!progress) {
    return null;
  }

  const progressAreas = [
    {
      key: 'communication' as keyof UserProgress,
      label: t('onboarding.area_speech'),
      icon: '💬',
      description: t('progress.development_areas_descriptions.communication'),
      color: 'blue',
    },
    {
      key: 'motor_skills' as keyof UserProgress,
      label: t('onboarding.area_motor'),
      icon: '🏃',
      description: t('progress.development_areas_descriptions.motor_skills'),
      color: 'green',
    },
    {
      key: 'social' as keyof UserProgress,
      label: t('onboarding.area_social'),
      icon: '👥',
      description: t('progress.development_areas_descriptions.social'),
      color: 'purple',
    },
    {
      key: 'cognitive' as keyof UserProgress,
      label: t('onboarding.area_cognitive'),
      icon: '🧠',
      description: t('progress.development_areas_descriptions.cognitive'),
      color: 'yellow',
    },
    {
      key: 'sensory' as keyof UserProgress,
      label: t('onboarding.area_sensory'),
      icon: '👁️',
      description: t('progress.development_areas_descriptions.sensory'),
      color: 'pink',
    },
    {
      key: 'behavior' as keyof UserProgress,
      label: t('onboarding.area_behavior'),
      icon: '🎯',
      description: t('progress.development_areas_descriptions.behavior'),
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string, progress: number) => {
    const colorMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      },
      yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getProgressBarColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      blue: '#3B82F6',
      green: '#22C55E',
      purple: '#A855F7',
      yellow: '#EAB308',
      pink: '#EC4899',
      orange: '#F97316',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <View style={tw`bg-white rounded-2xl shadow-sm border border-gray-100`}>
      <View
        style={tw`flex-row items-center justify-between mb-6 py-4 px-2 pb-0`}
      >
        <Text style={tw`text-xl font-bold text-gray-800`}>
          {t('progress.development_areas')}
        </Text>
        <View style={tw`bg-primary px-2 py-2 rounded-full shadow-sm`}>
          <Text style={tw`text-white font-semibold text-sm`}>
            {Math.round(
              Object.values(progress).reduce((sum, val) => sum + val, 0) /
                Object.keys(progress).length,
            )}
            % {t('progress.average_progress')}
          </Text>
        </View>
      </View>

      <View style={tw`space-y-8 px-2`}>
        {progressAreas.map(({ key, label, icon, description, color }) => {
          const colorClasses = getColorClasses(color, progress[key]);
          const progressValue = progress[key];
          const progressLabel = getProgressLabel(progressValue);

          return (
            <View
              key={key}
              style={[
                tw`p-4 mb-6 rounded-xl border-2 shadow-sm`,
                tw`${colorClasses.bg} ${colorClasses.border}`,
              ]}
            >
              <View style={tw`flex-row items-start justify-between mb-3`}>
                <View style={tw`flex-row items-start flex-1 mr-4`}>
                  <Text style={tw`text-3xl mr-3 mt-1`}>{icon}</Text>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-bold text-gray-800 mb-1`}>
                      {label}
                    </Text>
                    <Text style={tw`text-xs text-gray-600 leading-5`}>
                      {description}
                    </Text>
                  </View>
                </View>
                <View style={tw`items-end flex-shrink-0`}>
                  <Text style={tw`text-xl font-bold text-primary mb-2`}>
                    {progressValue}/100
                  </Text>
                  <View
                    style={[
                      tw`px-3 py-1 rounded-full shadow-sm`,
                      tw`${getProgressColor(progressValue)}`,
                    ]}
                  >
                    <Text style={tw`text-xs font-semibold`}>
                      {progressLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={tw`w-full bg-gray-200 rounded-full h-3 mb-3`}>
                <View
                  style={[
                    tw`h-3 rounded-full shadow-sm`,
                    {
                      width: `${progressValue}%`,
                      backgroundColor: getProgressBarColor(color),
                    },
                  ]}
                />
              </View>

              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-1 mr-4`}>
                  <Text style={tw`text-xs font-semibold text-gray-700 mb-1`}>
                    {t('progress.current_level')}: {progressLabel}
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {t('progress.next_milestone')}:{' '}
                    {Math.ceil(progressValue / 20) * 20}%
                  </Text>
                </View>

                <View style={tw`flex-row space-x-2 flex-shrink-0`}>
                  <Pressable
                    style={tw`bg-red-100 px-3 py-2 rounded-lg border border-red-200 shadow-sm`}
                    onPress={() =>
                      updateProgress(key, Math.max(0, progressValue - 5))
                    }
                  >
                    <Text style={tw`text-red-700 text-xs font-bold`}>-5</Text>
                  </Pressable>

                  <Pressable
                    style={tw`bg-green-100 px-3 py-2 rounded-lg border border-green-200 shadow-sm`}
                    onPress={() =>
                      updateProgress(key, Math.min(100, progressValue + 5))
                    }
                  >
                    <Text style={tw`text-green-700 text-xs font-bold`}>+5</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View
        style={tw`mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 mx-6 mb-6`}
      >
        <Text style={tw`text-blue-800 text-xs text-center leading-4`}>
          💡 {t('progress.adjust_progress_help')}
        </Text>
      </View>
    </View>
  );
};
