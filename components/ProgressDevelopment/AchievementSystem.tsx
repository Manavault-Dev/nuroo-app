import tw from '@/lib/design/tw';
import { UserProgress } from '@/lib/home/home.types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

interface AchievementSystemProps {
  progress: UserProgress | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | 'communication'
    | 'motor_skills'
    | 'social'
    | 'cognitive'
    | 'sensory'
    | 'behavior'
    | 'general';
  threshold: number;
  unlocked: boolean;
  progress: number;
  reward: string;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  progress,
}) => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (progress) {
      generateAchievements(progress);
    }
  }, [progress]);

  const generateAchievements = (userProgress: UserProgress) => {
    const allAchievements: Achievement[] = [
      {
        id: 'comm-1',
        title: 'First Words',
        description: t('progress.achievement_descriptions.first_words'),
        icon: '💬',
        category: 'communication',
        threshold: 5,
        unlocked: userProgress.communication >= 25,
        progress: Math.min(100, (userProgress.communication / 25) * 100),
        reward: t('progress.achievement_rewards.communication_badge'),
      },
      {
        id: 'comm-2',
        title: 'Chat Master',
        description: t('progress.achievement_descriptions.chat_master'),
        icon: '🗣️',
        category: 'communication',
        threshold: 50,
        unlocked: userProgress.communication >= 50,
        progress: Math.min(100, (userProgress.communication / 50) * 100),
        reward: t('progress.achievement_rewards.advanced_communication_badge'),
      },
      {
        id: 'comm-3',
        title: 'Eloquent Speaker',
        description: t('progress.achievement_descriptions.eloquent_speaker'),
        icon: '🎭',
        category: 'communication',
        threshold: 80,
        unlocked: userProgress.communication >= 80,
        progress: Math.min(100, (userProgress.communication / 80) * 100),
        reward: t('progress.achievement_rewards.master_communicator_badge'),
      },
      {
        id: 'motor-1',
        title: 'First Steps',
        description: t('progress.achievement_descriptions.first_steps'),
        icon: '🏃',
        category: 'motor_skills',
        threshold: 5,
        unlocked: userProgress.motor_skills >= 25,
        progress: Math.min(100, (userProgress.motor_skills / 25) * 100),
        reward: t('progress.achievement_rewards.motor_skills_badge'),
      },
      {
        id: 'motor-2',
        title: 'Agile Mover',
        description: t('progress.achievement_descriptions.agile_mover'),
        icon: '🤸',
        category: 'motor_skills',
        threshold: 50,
        unlocked: userProgress.motor_skills >= 50,
        progress: Math.min(100, (userProgress.motor_skills / 50) * 100),
        reward: t('progress.achievement_rewards.advanced_motor_skills_badge'),
      },
      {
        id: 'social-1',
        title: 'Social Butterfly',
        description: t('progress.achievement_descriptions.social_butterfly'),
        icon: '👥',
        category: 'social',
        threshold: 5,
        unlocked: userProgress.social >= 25,
        progress: Math.min(100, (userProgress.social / 25) * 100),
        reward: t('progress.achievement_rewards.social_skills_badge'),
      },
      {
        id: 'social-2',
        title: 'Team Player',
        description: t('progress.achievement_descriptions.team_player'),
        icon: '🤝',
        category: 'social',
        threshold: 50,
        unlocked: userProgress.social >= 50,
        progress: Math.min(100, (userProgress.social / 50) * 100),
        reward: t('progress.achievement_rewards.advanced_social_skills_badge'),
      },
      {
        id: 'general-1',
        title: 'Task Champion',
        description: t('progress.achievement_descriptions.task_champion'),
        icon: '🏆',
        category: 'general',
        threshold: 20,
        unlocked:
          Object.values(userProgress).reduce((sum, val) => sum + val, 0) >= 100,
        progress: Math.min(
          100,
          (Object.values(userProgress).reduce((sum, val) => sum + val, 0) /
            100) *
            100,
        ),
        reward: t('progress.achievement_rewards.champion_badge'),
      },
      {
        id: 'general-2',
        title: 'Consistency King',
        description: t('progress.achievement_descriptions.consistency_king'),
        icon: '📅',
        category: 'general',
        threshold: 7,
        unlocked: false,
        progress: 0,
        reward: t('progress.achievement_rewards.consistency_badge'),
      },
      {
        id: 'general-3',
        title: 'All-Rounder',
        description: t('progress.achievement_descriptions.all_rounder'),
        icon: '⭐',
        category: 'general',
        threshold: 40,
        unlocked: Object.values(userProgress).every((val) => val >= 40),
        progress: Math.min(
          100,
          (Math.min(...Object.values(userProgress)) / 40) * 100,
        ),
        reward: t('progress.achievement_rewards.all_rounder_badge'),
      },
    ];

    setAchievements(allAchievements);
  };

  const getUnlockedCount = () => achievements.filter((a) => a.unlocked).length;
  const getTotalCount = () => achievements.length;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      communication: 'bg-blue-100 text-blue-700',
      motor_skills: 'bg-green-100 text-green-700',
      social: 'bg-purple-100 text-purple-700',
      cognitive: 'bg-yellow-100 text-yellow-700',
      sensory: 'bg-pink-100 text-pink-700',
      behavior: 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.blue;
  };

  if (!progress) return null;

  return (
    <View style={tw`bg-white rounded-2xl shadow-sm border border-gray-100`}>
      <View style={tw`flex-row items-center justify-between mb-6 p-6 pb-0`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>
          {t('progress.achievements')}
        </Text>
        <View style={tw`bg-primary px-3 py-1 rounded-full`}>
          <Text style={tw`text-white font-semibold text-sm`}>
            {getUnlockedCount()}/{getTotalCount()}
          </Text>
        </View>
      </View>

      <View style={tw`mb-6 px-6`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {t('progress.overall_progress')}
          </Text>
          <Text style={tw`text-sm font-semibold text-primary`}>
            {Math.round((getUnlockedCount() / getTotalCount()) * 100)}%
          </Text>
        </View>
        <View style={tw`w-full bg-gray-200 rounded-full h-3`}>
          <View
            style={[
              tw`bg-primary h-3 rounded-full`,
              { width: `${(getUnlockedCount() / getTotalCount()) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-6 pb-6`}
      >
        <View style={tw`flex-row space-x-4`}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                tw`w-48 p-4 rounded-xl border-2 min-h-[120px]`,
                achievement.unlocked
                  ? tw`bg-green-50 border-green-300`
                  : tw`bg-gray-50 border-gray-200`,
              ]}
            >
              <View style={tw`items-center mb-3`}>
                <Text style={tw`text-3xl mb-2`}>{achievement.icon}</Text>
                <View
                  style={[
                    tw`px-2 py-1 rounded-full`,
                    tw`${getCategoryColor(achievement.category)}`,
                  ]}
                >
                  <Text style={tw`text-xs font-medium`}>
                    {t(
                      `progress.achievement_categories.${achievement.category}`,
                    )}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  tw`text-sm font-bold mb-1 text-center`,
                  achievement.unlocked ? tw`text-green-800` : tw`text-gray-800`,
                ]}
              >
                {achievement.title}
              </Text>

              <Text
                style={[
                  tw`text-xs text-center mb-2`,
                  achievement.unlocked ? tw`text-green-600` : tw`text-gray-500`,
                ]}
              >
                {achievement.description}
              </Text>

              {achievement.unlocked ? (
                <View style={tw`items-center`}>
                  <Text style={tw`text-green-600 text-xs font-bold`}>
                    ✓ {t('progress.unlocked')}
                  </Text>
                  <Text style={tw`text-green-500 text-xs text-center mt-1`}>
                    {t('progress.reward')}: {achievement.reward}
                  </Text>
                </View>
              ) : (
                <View style={tw`items-center`}>
                  <View style={tw`w-full bg-gray-200 rounded-full h-2 mb-2`}>
                    <View
                      style={[
                        tw`bg-primary h-2 rounded-full`,
                        { width: `${achievement.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={tw`text-gray-500 text-xs text-center`}>
                    {Math.round(achievement.progress)}% {t('progress.complete')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={tw`mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 mx-6 mb-6`}
      >
        <Text style={tw`text-blue-800 text-sm font-medium text-center`}>
          🎯{' '}
          {t('progress.keep_going', {
            count: Math.max(0, getTotalCount() - getUnlockedCount()),
          })}
        </Text>
      </View>
    </View>
  );
};
