import { Button } from '@/components/ui/Button';
import tw from '@/lib/design/tw';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { InputSanitizer, InputValidator } from '@/lib/utils/sanitization';

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

  const handleNameChange = (value: string) => {
    const sanitized = InputSanitizer.sanitizeName(value);
    setChildName(sanitized);
  };

  const handleAgeChange = (value: string) => {
    const sanitized = InputSanitizer.sanitizeText(value, { maxLength: 10 });
    setAge(sanitized);
  };

  const handleDiagnosisChange = (value: string) => {
    const sanitized = InputSanitizer.sanitizeMedicalInfo(value);
    setDiagnosis(sanitized);
  };

  const handleSave = () => {
    // Validate inputs before saving
    if (!InputValidator.isValidName(childName)) {
      alert(t('profile.invalid_name'));
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!InputValidator.isValidAge(ageNum)) {
      alert(t('profile.invalid_age'));
      return;
    }

    if (!InputValidator.isValidDiagnosis(diagnosis)) {
      alert(t('profile.invalid_diagnosis'));
      return;
    }

    onSave();
  };

  return (
    <>
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholder={t('profile.child_name_placeholder')}
        placeholderTextColor="#A0AEC0"
        value={childName}
        onChangeText={handleNameChange}
        maxLength={50}
      />
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholderTextColor="#A0AEC0"
        placeholder={t('profile.age_placeholder')}
        value={age}
        onChangeText={handleAgeChange}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        style={tw`border rounded-lg p-2 mb-2`}
        placeholderTextColor="#A0AEC0"
        placeholder={t('profile.diagnosis_placeholder')}
        value={diagnosis}
        onChangeText={handleDiagnosisChange}
        multiline
        maxLength={500}
      />
      <Button title={t('profile.save')} onPress={handleSave} />
    </>
  );
};

export default ChildProfileForm;
