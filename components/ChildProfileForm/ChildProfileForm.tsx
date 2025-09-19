import { Button } from '@/components/ui/Button';
import tw from '@/lib/design/tw';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

interface ChildProfileFormProps {
  childName: string;
  setChildName: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  diagnosis: string;
  setDiagnosis: (value: string) => void;
  onSave: () => void;
}

const ChildProfileForm: React.FC<ChildProfileFormProps> = ({
  childName,
  setChildName,
  age,
  setAge,
  diagnosis,
  setDiagnosis,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholder={t('profile.child_name_placeholder')}
        placeholderTextColor="#A0AEC0"
        value={childName}
        onChangeText={setChildName}
      />
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholderTextColor="#A0AEC0"
        placeholder={t('profile.age_placeholder')}
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholderTextColor="#A0AEC0"
        placeholder={t('profile.diagnosis_placeholder')}
        value={diagnosis}
        onChangeText={setDiagnosis}
      />
      <Button title={t('profile.save')} onPress={onSave} />
    </>
  );
};

export default ChildProfileForm;
