import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/design/tw';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Button } from '@/components/ui/Button';

import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';

import AreaSelector from '@/components/OnboardingScreen/AreaSelector/AreaSelector';

import { useModalPicker } from '@/hooks/useModalPicker';
import ModalPicker from '@/components/ModalPicker/ModalPicker';
import { auth, db } from '@/lib/firebase/firebase';
import { diagnosisOptions } from '@/lib/types/onboarding/onboarding.types';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const ageOptions = Array.from({ length: 18 }, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`,
  }));

  const {
    visible: ageModalVisible,
    options: ageModalOptions,
    open: openAgeModal,
    close: closeAgeModal,
    select: selectAge,
  } = useModalPicker(setChildAge);

  const {
    visible: diagnosisModalVisible,
    options: diagnosisModalOptions,
    open: openDiagnosisModal,
    close: closeDiagnosisModal,
    select: selectDiagnosis,
  } = useModalPicker(setDiagnosis);

  const handleOpenAgeModal = () => openAgeModal(ageOptions);

  const diagnosisOptionsTranslated = diagnosisOptions.map((opt) => ({
    label: t(opt.label),
    value: opt.value,
  }));

  const handleOpenDiagnosisModal = () =>
    openDiagnosisModal(diagnosisOptionsTranslated);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  return (
    <LayoutWrapper>
      <ScrollView contentContainerStyle={tw`p-0`}>
        <View style={tw`w-full items-center mb-2`}>
          <Image
            source={require('@/assets/images/onboard.png')}
            style={tw`w-48 h-48`}
            resizeMode="contain"
          />
        </View>

        <Text style={tw`text-2xl text-center font-bold text-primary mb-2`}>
          {t('onboarding.title')}
        </Text>
        <Text style={tw`text-primary text-center text-gray-600 mb-6`}>
          {t('onboarding.subtitle')}
        </Text>

        <Text style={tw`text-primary font-medium mb-1`}>
          {t('onboarding.child_name_label')}
        </Text>
        <TextInput
          value={childName}
          onChangeText={setChildName}
          placeholder={t('onboarding.child_name_placeholder')}
          style={tw`border border-gray-300 rounded-xl text-md px-4 py-4 mb-4 bg-white`}
        />

        <Text style={tw`text-primary font-medium mb-1`}>
          {t('onboarding.child_age_label')}
        </Text>
        <Pressable
          onPress={handleOpenAgeModal}
          style={tw`border border-gray-300 rounded-xl px-4 py-4 bg-white mb-4 flex-row justify-between items-center`}
        >
          <Text style={tw`text-primary text-md text-gray-700`}>
            {childAge || t('onboarding.child_age_placeholder')}
          </Text>
        </Pressable>

        <ModalPicker
          visible={ageModalVisible}
          options={ageModalOptions}
          onSelect={selectAge}
          onClose={closeAgeModal}
        />

        <Text style={tw`text-primary font-medium mb-1`}>
          {t('onboarding.diagnosis_label')}
        </Text>
        <Pressable
          onPress={handleOpenDiagnosisModal}
          style={tw`border border-gray-300 rounded-xl px-4 py-4 bg-white mb-4 flex-row justify-between items-center`}
        >
          <Text style={tw`text-base text-gray-700`}>
            {diagnosis || t('onboarding.diagnosis_placeholder')}
          </Text>
        </Pressable>

        <ModalPicker
          visible={diagnosisModalVisible}
          options={diagnosisModalOptions}
          onSelect={selectDiagnosis}
          onClose={closeDiagnosisModal}
        />

        <Text style={tw`text-base font-medium mb-2`}>
          {t('onboarding.development_areas')}
        </Text>
        <AreaSelector selectedAreas={selectedAreas} toggleArea={toggleArea} />

        <Button
          title={t('onboarding.create_profile')}
          variant="teal"
          style={tw`w-full mt-6 py-4 rounded-xl`}
          textStyle={tw`text-xl`}
          onPress={() => {
            console.log({
              name: childName,
              age: childAge,
              diagnosis,
              selectedAreas,
            });
            router.replace('/(tabs)/home');
          }}
        />
      </ScrollView>
    </LayoutWrapper>
  );
}
