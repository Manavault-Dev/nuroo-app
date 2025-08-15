import { generateDevelopmentTask } from '@/lib/api/openai';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { Link } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  emoji: string;
  completed: boolean;
  createdAt: Date;
  developmentArea: string;
}

interface ChildData {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const generateDailyTasks = useCallback(async () => {
    if (
      !childData?.developmentAreas ||
      childData.developmentAreas.length === 0
    ) {
      console.log('No development areas found, cannot generate tasks');
      return;
    }

    setGenerating(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const newTasks: Task[] = [];
      const areas = childData.developmentAreas;

      for (let i = 0; i < Math.min(areas.length, 6); i++) {
        const area = areas[i];

        try {
          const taskDescription = await generateDevelopmentTask(
            area,
            childData,
          );

          const task = parseTaskFromAI(area, taskDescription, i + 1);
          newTasks.push(task);

          const taskRef = doc(collection(db, 'tasks'));
          await setDoc(taskRef, {
            ...task,
            id: taskRef.id,
            userId: currentUser.uid,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error(`Error generating task for ${area}:`, error);

          const fallbackTask = createFallbackTask(area, i + 1);
          newTasks.push(fallbackTask);
        }
      }

      setTasks(newTasks);
    } catch (error) {
      console.error('Error generating daily tasks:', error);
    } finally {
      setGenerating(false);
    }
  }, [childData]);

  // Fetch child data and existing tasks
  const fetchData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Fetch child profile
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setChildData({
          name: userData.name,
          age: userData.age,
          diagnosis: userData.diagnosis,
          developmentAreas: userData.developmentAreas,
        });
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('createdAt', '>=', todayStart),
        where('createdAt', '<=', todayEnd),
        orderBy('createdAt', 'desc'),
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      if (!tasksSnapshot.empty) {
        const existingTasks = tasksSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
        })) as Task[];
        setTasks(existingTasks);
      } else {
        // No tasks for today, generate them
        await generateDailyTasks();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [generateDailyTasks]);

  // Parse AI response into structured task
  const parseTaskFromAI = (
    area: string,
    aiResponse: string,
    taskNumber: number,
  ): Task => {
    const emojis = ['🌅', '😊', '🧱', '🎨', '🎵', '📚'];
    const emoji = emojis[taskNumber - 1] || '✨';

    const lines = aiResponse.split('\n');
    let title = lines[0] || `Daily ${area} Activity`;

    // Clean up title
    title = title.replace(/^[#*•\s]+/, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    return {
      id: `task-${Date.now()}-${taskNumber}`,
      title,
      description: aiResponse,
      category: area.charAt(0).toUpperCase() + area.slice(1) + ' Development',
      time: '10-15 min',
      emoji,
      completed: false,
      createdAt: new Date(),
      developmentArea: area,
    };
  };

  // Create fallback task if AI fails
  const createFallbackTask = (area: string, taskNumber: number): Task => {
    const fallbackTasks = {
      speech: {
        title: 'Daily Speech Practice',
        description:
          'Practice saying simple words and phrases together. Use picture books or everyday objects to encourage conversation.',
        time: '10 min',
        emoji: '🗣️',
      },
      social: {
        title: 'Social Skills Game',
        description:
          'Play a simple turn-taking game like "Simon Says" or "Follow the Leader" to practice social interaction.',
        time: '15 min',
        emoji: '👥',
      },
      motor: {
        title: 'Motor Skills Activity',
        description:
          'Build with blocks, draw with crayons, or practice throwing and catching soft balls.',
        time: '15 min',
        emoji: '🏃',
      },
      cognitive: {
        title: 'Thinking Exercise',
        description:
          'Sort objects by color, shape, or size. Practice counting and simple problem-solving.',
        time: '12 min',
        emoji: '🧠',
      },
      sensory: {
        title: 'Sensory Exploration',
        description:
          'Explore different textures, sounds, and smells in a safe, controlled environment.',
        time: '10 min',
        emoji: '👂',
      },
      behavior: {
        title: 'Calm Down Practice',
        description:
          'Practice deep breathing exercises and relaxation techniques for emotional regulation.',
        time: '8 min',
        emoji: '✨',
      },
    };

    const fallback =
      fallbackTasks[area as keyof typeof fallbackTasks] || fallbackTasks.speech;

    return {
      id: `fallback-${Date.now()}-${taskNumber}`,
      title: fallback.title,
      description: fallback.description,
      category: area.charAt(0).toUpperCase() + area.slice(1) + ' Development',
      time: fallback.time,
      emoji: fallback.emoji,
      completed: false,
      createdAt: new Date(),
      developmentArea: area,
    };
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Find the current task to get the correct completion state
      const currentTask = tasks.find((t) => t.id === taskId);
      if (!currentTask) return;

      const newCompletedState = !currentTask.completed;

      // Update local state first
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: newCompletedState } : task,
      );
      setTasks(updatedTasks);

      // Update in Firebase
      const taskRef = doc(db, 'tasks', taskId);
      await setDoc(taskRef, { completed: newCompletedState }, { merge: true });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert local state if Firebase update failed
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  // Temporary mock mode for testing without OpenAI API
  const generateMockTasks = async () => {
    if (
      !childData?.developmentAreas ||
      childData.developmentAreas.length === 0
    ) {
      Alert.alert(
        'No Development Areas',
        'Please complete onboarding first to set development areas.',
      );
      return;
    }

    setGenerating(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const newTasks: Task[] = [];
      const areas = childData.developmentAreas;

      // Generate 1 mock task per development area (max 6 tasks)
      for (let i = 0; i < Math.min(areas.length, 6); i++) {
        const area = areas[i];
        const mockTask = createFallbackTask(area, i + 1);
        newTasks.push(mockTask);

        // Save to Firebase
        const taskRef = doc(collection(db, 'tasks'));
        await setDoc(taskRef, {
          ...mockTask,
          id: taskRef.id,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
      }

      setTasks(newTasks);
      Alert.alert(
        'Success',
        `Generated ${newTasks.length} mock tasks for testing!`,
      );
    } catch (error) {
      console.error('Error generating mock tasks:', error);
      Alert.alert('Error', 'Failed to generate mock tasks. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#1D3557" />
        <Text style={tw`text-gray-600 mt-4`}>Loading today&apos;s plan...</Text>
      </View>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={tw`flex-1 bg-white px-4 pt-14`}>
      <View style={tw`mb-6`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-primary font-bold text-lg`}>Nuroo</Text>
          </View>
          {childData?.name && (
            <Text style={tw`text-sm text-gray-600`}>for {childData.name}</Text>
          )}
        </View>

        <Text style={tw`text-2xl font-bold text-primary`}>
          Today&apos;s Plan
        </Text>
        <Text style={tw`text-sm text-gray-400 mt-1`}>{today}</Text>

        <View style={tw`mt-2`}>
          <Text style={tw`text-sm text-gray-400`}>
            Progress{' '}
            <Text style={tw`text-primary`}>
              {completedTasks}/{totalTasks}
            </Text>
          </Text>
          <View style={tw`h-2 bg-gray-200 rounded-full mt-1`}>
            <View
              style={[
                tw`h-2 bg-primary rounded-full transition-all duration-300`,
                {
                  width:
                    totalTasks > 0
                      ? `${(completedTasks / totalTasks) * 100}%`
                      : '0%',
                },
              ]}
            />
          </View>
        </View>

        {/* Generate New Tasks Button */}
        {totalTasks === 0 && (
          <View style={tw`mt-4 space-y-3`}>
            <Pressable
              style={tw`bg-blue-500 py-3 px-6 rounded-xl self-start`}
              onPress={generateMockTasks}
              disabled={generating}
            >
              {generating ? (
                <View style={tw`flex-row items-center`}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={tw`text-white font-bold ml-2`}>
                    Generating Mock Tasks...
                  </Text>
                </View>
              ) : (
                <Text style={tw`text-white font-bold`}>
                  🎯 Generate Mock Tasks (Test Mode)
                </Text>
              )}
            </Pressable>

            <Pressable
              style={tw`bg-primary py-3 px-6 rounded-xl self-start opacity-50`}
              onPress={() =>
                Alert.alert(
                  'OpenAI API Required',
                  'Please add your OpenAI API key to .env file to generate AI-powered tasks.\n\nFor now, use Mock Tasks to test the app functionality.',
                )
              }
              disabled={true}
            >
              <Text style={tw`text-white font-bold`}>
                🤖 Generate AI Tasks (Coming Soon)
              </Text>
            </Pressable>

            <Text style={tw`text-xs text-gray-500 mt-2`}>
              💡 Mock tasks let you test the app without OpenAI API. Add your
              API key to unlock AI-generated personalized tasks!
            </Text>
          </View>
        )}
        {/* Debug Info (remove in production) */}
        {__DEV__ && (
          <View style={tw`mt-4 p-3 bg-gray-100 rounded-lg`}>
            <Text style={tw`text-xs font-mono text-gray-600 mb-2`}>
              🔍 Debug Info:
            </Text>
            <Text style={tw`text-xs text-gray-600`}>
              Child: {childData?.name || 'None'} ({childData?.age || 'N/A'})
            </Text>
            <Text style={tw`text-xs text-gray-600`}>
              Areas: {childData?.developmentAreas?.join(', ') || 'None'}
            </Text>
            <Text style={tw`text-xs text-gray-600`}>
              Tasks: {totalTasks} (Completed: {completedTasks})
            </Text>
            <Text style={tw`text-xs text-gray-600`}>
              User ID: {auth.currentUser?.uid?.substring(0, 8) || 'None'}...
            </Text>

            {totalTasks > 0 && (
              <Pressable
                onPress={() => {
                  Alert.alert(
                    'Clear All Tasks',
                    'This will remove all tasks for testing. Continue?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear',
                        style: 'destructive',
                        onPress: () => setTasks([]),
                      },
                    ],
                  );
                }}
                style={tw`mt-2 bg-red-100 px-3 py-1 rounded self-start`}
              >
                <Text style={tw`text-red-600 text-xs`}>
                  🗑️ Clear Tasks (Test)
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`pb-12`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View
            style={[
              tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border`,
              item.completed
                ? tw`border-green-200 bg-green-50`
                : tw`border-gray-100`,
            ]}
          >
            <View style={tw`flex-row items-start justify-between`}>
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    tw`text-lg font-semibold`,
                    item.completed
                      ? tw`text-green-700 line-through`
                      : tw`text-primary`,
                  ]}
                >
                  {item.emoji} {item.title}
                </Text>
                <Text
                  style={[
                    tw`mt-1`,
                    item.completed ? tw`text-green-600` : tw`text-gray-500`,
                  ]}
                >
                  {item.description.length > 100
                    ? item.description.substring(0, 100) + '...'
                    : item.description}
                </Text>
                <View style={tw`flex-row items-center justify-between mt-3`}>
                  <Text style={tw`text-sm text-gray-400`}>
                    {item.category} · {item.time}
                  </Text>

                  <View style={tw`flex-row items-center gap-2`}>
                    <Pressable
                      style={[
                        tw`px-3 py-2 rounded-lg`,
                        item.completed ? tw`bg-green-200` : tw`bg-blue-100`,
                      ]}
                      onPress={() => toggleTaskCompletion(item.id)}
                    >
                      <Text
                        style={[
                          tw`font-medium`,
                          item.completed
                            ? tw`text-green-700`
                            : tw`text-blue-700`,
                        ]}
                      >
                        {item.completed ? 'Completed' : 'Mark Complete'}
                      </Text>
                    </Pressable>

                    <Link href={`/tasks/${item.id}`} asChild>
                      <Pressable style={tw`bg-primary px-4 py-2 rounded-lg`}>
                        <Text style={tw`text-white font-medium`}>Details</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
