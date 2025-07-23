import { cva } from 'class-variance-authority';

export const areaButton = cva('px-4 py-2 rounded-full border text-md', {
  variants: {
    selected: {
      true: 'bg-green-200 border-teal-600 text-primary',
      false: 'bg-white border-gray-300 text-gray-800',
    },
  },
});
