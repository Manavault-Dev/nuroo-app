import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/design/tw';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react-native';

export default function OnboardingScreen() {
  const { t } = useTranslation();

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);

  const diagnosisOptions = [
    { label: t('onboarding.diagnosis_options.adhd'), value: 'ADHD' },
    {
      label: t('onboarding.diagnosis_options.down_syndrome'),
      value: 'DownSyndrome',
    },
    { label: t('onboarding.diagnosis_options.autism'), value: 'Autism' },
    {
      label: t('onboarding.diagnosis_options.speech_delay'),
      value: 'SpeechDelay',
    },
    {
      label: t('onboarding.diagnosis_options.prefer_not_to_say'),
      value: 'PreferNotToSay',
    },
    { label: t('onboarding.diagnosis_options.other'), value: 'Other' },
  ];

  const ageOptions = Array.from({ length: 18 }, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`,
  }));

  const renderModal = (
    visible: boolean,
    setVisible: (v: boolean) => void,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void,
  ) => (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable
        style={tw`flex-1 justify-end bg-black bg-opacity-30`}
        onPress={() => setVisible(false)}
      >
        <View style={tw`bg-white rounded-t-2xl p-4 max-h-80`}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={tw`py-3 px-4 border-b border-gray-200`}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                }}
              >
                <Text style={tw`text-base`}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <LayoutWrapper>
      <ScrollView contentContainerStyle={tw`p-4`}>
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
          style={tw`border border-gray-300 rounded-xl px-4 py-4 mb-4 bg-white`}
        />

        <Text style={tw`text-primary font-medium mb-1`}>
          {t('onboarding.child_age_label')}
        </Text>
        <Pressable
          onPress={() => setAgeModalVisible(true)}
          style={tw`border border-gray-300 rounded-xl px-4 py-4 bg-white mb-4 flex-row justify-between items-center`}
        >
          <Text style={tw`text-primary text-gray-700`}>
            {childAge || t('onboarding.child_age_placeholder')}
          </Text>
        </Pressable>
        {renderModal(
          ageModalVisible,
          setAgeModalVisible,
          ageOptions,
          setChildAge,
        )}

        <Text style={tw`text-primary font-medium mb-1`}>
          {t('onboarding.diagnosis_label')}
        </Text>
        <Pressable
          onPress={() => setDiagnosisModalVisible(true)}
          style={tw`border border-gray-300 rounded-xl px-4 py-4 bg-white mb-4 flex-row justify-between items-center`}
        >
          <Text style={tw`text-base text-gray-700`}>
            {diagnosis || t('onboarding.diagnosis_placeholder')}
          </Text>
        </Pressable>
        {renderModal(
          diagnosisModalVisible,
          setDiagnosisModalVisible,
          diagnosisOptions,
          setDiagnosis,
        )}

        <Button
          title={t('onboarding.create_profile')}
          variant="teal"
          style={tw`w-full mt-6 py-4 rounded-xl`}
          textStyle={tw`text-xl`}
          onPress={() => {
            console.log({ name: childName, age: childAge, diagnosis });
          }}
        />
      </ScrollView>
    </LayoutWrapper>
  );
}
