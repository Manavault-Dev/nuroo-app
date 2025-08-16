import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { homeStyles } from '../home.styles';
import { Task } from '../home.types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

export const TaskItem = ({ task, onToggleComplete }: TaskItemProps) => (
  <View style={homeStyles.taskItem(task.completed)}>
    <View style={homeStyles.taskContent}>
      <View style={homeStyles.taskMain}>
        <Text style={homeStyles.taskTitle(task.completed)}>
          {task.emoji} {task.title}
        </Text>
        <Text style={homeStyles.taskDescription(task.completed)}>
          {task.description.length > 100
            ? task.description.substring(0, 100) + '...'
            : task.description}
        </Text>
        <Text style={homeStyles.taskCategory}>
          {task.category} · {task.time}
        </Text>
        <View style={homeStyles.taskMeta}>
          <View style={homeStyles.taskActions}>
            <Pressable
              style={homeStyles.completeButton(task.completed)}
              onPress={() => onToggleComplete(task.id)}
            >
              <Text style={homeStyles.completeButtonText(task.completed)}>
                {task.completed ? 'Completed' : 'Mark Complete'}
              </Text>
            </Pressable>

            <Link href={`/tasks/${task.id}`} asChild>
              <Pressable style={homeStyles.detailsButton}>
                <Text style={homeStyles.detailsButtonText}>Details</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  </View>
);
