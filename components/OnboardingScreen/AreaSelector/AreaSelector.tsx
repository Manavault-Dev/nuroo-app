import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/design/tw';
import { developmentAreas } from '@/app/onboarding/onboarding.types';
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {developmentAreas.map(({ label, value }) => (
        <Pressable key={value} onPress={() => toggleArea(value)}>
          <Text
            style={tw.style(
              areaButton({ selected: selectedAreas.includes(value) }),
            )}
          >
            {t(label)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
