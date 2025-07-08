import { create } from 'twrnc';
import { designTokens } from './tokens';

const tw = create({
  theme: {
    extend: {
      colors: designTokens.colors,
      fontSize: designTokens.fontSize,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      fontFamily: designTokens.fontFamily,
    },
  },
});

export default tw;
