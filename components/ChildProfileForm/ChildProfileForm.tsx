import React from 'react';
import { TextInput } from 'react-native';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';

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
}) => (
  <>
    <TextInput
      style={tw`border rounded-lg p-2 mb-2`}
      placeholder="Child's Name"
      placeholderTextColor="#A0AEC0"
      value={childName}
      onChangeText={setChildName}
    />
    <TextInput
      style={tw`border rounded-lg p-2 mb-2`}
      placeholderTextColor="#A0AEC0"
      placeholder="Age"
      value={age}
      onChangeText={setAge}
    />
    <TextInput
      style={tw`border rounded-lg p-2 mb-2`}
      placeholderTextColor="#A0AEC0"
      placeholder="Diagnosis"
      value={diagnosis}
      onChangeText={setDiagnosis}
    />
    <Button title="Save" onPress={onSave} />
  </>
);

export default ChildProfileForm;
