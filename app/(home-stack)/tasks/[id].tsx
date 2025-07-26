import { useLocalSearchParams } from 'expo-router';
import { View, Text, Button } from 'react-native';

export default function TaskPage() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Task #{id}</Text>
      <Text style={{ marginVertical: 10 }}>
        Task description will go here in the future.
      </Text>
      <Button
        title="Complete"
        onPress={() => console.log('Complete pressed')}
      />
    </View>
  );
}
