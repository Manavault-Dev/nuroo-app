import { Task } from './home.types';

export const parseTaskFromAI = (
  area: string,
  aiResponse: string,
  taskNumber: number,
): Task => {
  const emojis = ['🌅', '😊', '🧱', '🎨', '🎵', '📚'];
  const emoji = emojis[taskNumber - 1] || '✨';

  const lines = aiResponse.split('\n');
  let title = lines[0] || `Daily ${area} Activity`;

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

export const getTodayDateRange = () => {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  return { todayStart, todayEnd };
};

export const filterTodaysTasks = (tasks: Task[]) => {
  const { todayStart, todayEnd } = getTodayDateRange();
  return tasks.filter((task) => {
    const taskDate = task.createdAt;
    return taskDate >= todayStart && taskDate < todayEnd;
  });
};

export const formatProgressPercentage = (completed: number, total: number) => {
  return total > 0 ? `${(completed / total) * 100}%` : '0%';
};
