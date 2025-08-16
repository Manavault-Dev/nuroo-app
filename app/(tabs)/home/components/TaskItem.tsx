import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { homeStyles } from '../home.styles';
import { Task } from '../home.types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

export const TaskItem = ({ task, onToggleComplete }: TaskItemProps) => {
  const { t } = useTranslation();

  return (
    <View style={homeStyles.taskItem(task.completed)}>
      <View style={homeStyles.taskContent}>
        <View style={homeStyles.taskMain}>
          <Text style={homeStyles.taskTitle(task.completed)}>
            {task.emoji} {task.title}
          </Text>
          <Text
            style={homeStyles.taskDescription(task.completed)}
            numberOfLines={2}
          >
            {task.description}
          </Text>

          <View style={homeStyles.taskMeta}>
            <Text style={homeStyles.taskCategory}>
              {task.category} · {task.time}
            </Text>

            <View style={homeStyles.taskActions}>
              <Pressable
                style={homeStyles.completeButton(task.completed)}
                onPress={() => onToggleComplete(task.id)}
              >
                <Text style={homeStyles.completeButtonText(task.completed)}>
                  {task.completed
                    ? t('tasks.completed_status')
                    : t('tasks.mark_complete')}
                </Text>
              </Pressable>

              <Link href={`/tasks/${task.id}`} asChild>
                <Pressable style={homeStyles.detailsButton}>
                  <Text style={homeStyles.detailsButtonText}>
                    {t('tasks.task_details')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
