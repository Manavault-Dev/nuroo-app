import tw from '@/lib/design/tw';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { developmentAreas } from '@/lib/types/onboarding/onboarding.types';
import { areaButton } from './AreaSelector.styles';

type AreaSelectorProps = {
  selectedAreas: string[];
  toggleArea: (area: string) => void;
};

export default function AreaSelector({
  selectedAreas,
  toggleArea,
}: AreaSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={tw`mx-6 mb-4`}>
      <View style={tw`flex-row flex-wrap gap-2`}>
        {developmentAreas.map(({ label, value }) => {
          const isSelected = selectedAreas.includes(value);

          return (
            <Pressable
              key={value}
              onPress={() => {
                toggleArea(value);
              }}
              style={tw`mb-2`}
            >
              <Text style={tw.style(areaButton({ selected: isSelected }))}>
                {t(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Debug info */}
      <View style={tw`mt-2 p-2 bg-gray-100 rounded`}>
        <Text style={tw`text-xs text-gray-600`}>
          Selected: {selectedAreas.join(', ') || 'None'}
        </Text>
      </View>
    </View>
  );
}
