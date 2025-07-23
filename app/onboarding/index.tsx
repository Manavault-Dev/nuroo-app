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
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import tw from '@/lib/design/tw';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Button } from '@/components/ui/Button';

export default function OnboardingScreen() {
  const { t } = useTranslation();

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

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

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

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
      <ScrollView contentContainerStyle={tw`p-0`}>
        <View style={tw`w-full items-center  mb-2`}>
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
          onPress={() => setAgeModalVisible(true)}
          style={tw`border border-gray-300 rounded-xl px-4 py-4 bg-white mb-4 flex-row justify-between items-center`}
        >
          <Text style={tw`text-primary text-md text-gray-700`}>
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

        <Text style={tw`text-base font-medium mb-2`}>
          {t('onboarding.development_areas')}
        </Text>

        <View style={tw`flex flex-wrap flex-row gap-2 mb-6 item-center`}>
          {[
            { label: t('onboarding.area_speech'), value: 'speech' },
            { label: t('onboarding.area_social'), value: 'social' },
            { label: t('onboarding.area_motor'), value: 'motor' },
            { label: t('onboarding.area_cognitive'), value: 'cognitive' },
            { label: t('onboarding.area_sensory'), value: 'sensory' },
            { label: t('onboarding.area_behavior'), value: 'behavior' },
          ].map(({ label, value }) => {
            const selected = selectedAreas.includes(value);
            return (
              <Pressable
                key={value}
                onPress={() => toggleArea(value)}
                style={tw.style(
                  `px-4 py-2 rounded-full border`,
                  selected
                    ? 'bg-green-200 border-teal-600'
                    : 'bg-white border-gray-300',
                )}
              >
                <Text
                  style={tw.style(
                    `text-md`,
                    selected ? 'text-primary' : 'text-gray-800',
                  )}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
