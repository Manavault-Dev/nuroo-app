import tw from '@/lib/design/tw';

export const homeStyles = {
  container: tw`flex-1 bg-white px-4 pt-14`,
  header: tw`mb-6`,
  headerRow: tw`flex-row items-center justify-between mb-2`,
  headerTitle: tw`text-2xl font-bold text-primary`,
  headerSubtitle: tw`text-sm text-gray-400 mt-1`,
  progressContainer: tw`mt-2`,
  progressText: tw`text-sm text-gray-400`,
  progressBar: tw`h-2 bg-gray-200 rounded-full mt-1`,
  progressFill: tw`h-2 bg-primary rounded-full transition-all duration-300`,
  generateButton: tw`bg-primary py-3 px-6 rounded-xl self-start`,
  generateButtonText: tw`text-white font-bold`,
  generateButtonDisabled: tw`bg-gray-400`,
  helpText: tw`text-xs text-gray-500 mt-2`,
  taskList: tw`pb-12`,
  taskItem: (completed: boolean) => [
    tw`bg-white rounded-xl p-3 mb-3 shadow-sm border`,
    completed ? tw`border-green-200 bg-green-50` : tw`border-gray-100`,
  ],
  taskContent: tw`flex-row items-start justify-between`,
  taskMain: tw`flex-1`,
  taskTitle: (completed: boolean) => [
    tw`text-base font-semibold`,
    completed ? tw`text-green-700 line-through` : tw`text-primary`,
  ],
  taskDescription: (completed: boolean) => [
    tw`mt-1 text-sm`,
    completed ? tw`text-green-600` : tw`text-gray-500`,
  ],
  taskMeta: tw`flex-row items-center justify-between mt-2`,
  taskCategory: tw`text-xs text-gray-400`,
  taskActions: tw`flex-row items-center gap-2`,
  completeButton: (completed: boolean) => [
    tw`px-2 py-1 rounded-md`,
    completed ? tw`bg-green-200` : tw`bg-blue-100`,
  ],
  completeButtonText: (completed: boolean) => [
    tw`text-xs font-medium`,
    completed ? tw`text-green-700` : tw`text-blue-700`,
  ],
  detailsButton: tw`bg-primary px-3 py-1 rounded-md`,
  detailsButtonText: tw`text-white font-medium text-xs`,
  loadingContainer: tw`flex-1 bg-white justify-center items-center`,
  loadingText: tw`text-gray-600 mt-4`,
};
