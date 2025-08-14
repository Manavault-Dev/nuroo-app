import ChildProfileForm from '@/components/ChildProfileForm/ChildProfileForm';
import Option from '@/components/ui/Option';
import { useLinks } from '@/hooks/useLinks';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface ProfileData {
  fullName: string;
  initials: string;
  email: string | null;
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const { rateApp, shareFeedback, openPrivacy, openHelp } = useLinks();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as ProfileData;

          console.log('Profile data fetched:', userData);

          const fullName = userData.fullName || '';
          const initials = fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

          setProfile({
            ...userData,
            email: currentUser.email,
            fullName,
            initials,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setChildName(profile.name || '');
      setAge(profile.age || '');
      setDiagnosis(profile.diagnosis || '');
    }
  }, [profile]);

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const profileData = {
      name: childName,
      age,
      diagnosis,
    };

    await setDoc(doc(db, 'users', currentUser.uid), profileData, {
      merge: true,
    });

    setProfile({
      ...profile!,
      ...profileData,
    });

    setIsEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={tw`p-4 pt-16 pb-32`}>
      <Text style={tw`text-2xl font-bold text-primary mb-1`}>Settings</Text>
      <Text style={tw`text-gray-500 mb-4`}>
        Manage your account and preferences
      </Text>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`bg-primary rounded-xl w-12 h-12 items-center justify-center mr-4`}
            >
              <Text style={tw`text-white text-lg font-bold`}>
                {profile?.initials || 'U'}
              </Text>
            </View>
            <View>
              <Text style={tw`text-primary font-semibold text-lg`}>
                {profile?.fullName || 'Unknown User'}
              </Text>
              <Text style={tw`text-gray-500`}>
                {profile?.email || 'no-email@example.com'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Ionicons
              name={isEditing ? 'checkmark-outline' : 'create-outline'}
              size={20}
              color="#1D3557"
            />
          </Pressable>
        </View>

        <View style={tw`mt-4`}>
          <Text style={tw`text-primary font-bold mb-1`}>
            Child&apos;s Profile
          </Text>

          {isEditing ? (
            <ChildProfileForm
              childName={childName}
              setChildName={setChildName}
              age={age}
              setAge={setAge}
              diagnosis={diagnosis}
              setDiagnosis={setDiagnosis}
              onSave={handleSave}
            />
          ) : (
            <>
              <Text style={tw`text-gray-700 mb-1`}>
                Name: {profile?.name || '—'}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                Age: {profile?.age || '—'}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                Diagnosis: {profile?.diagnosis || '—'}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                Development Areas:{' '}
                {profile?.developmentAreas?.join(', ') || '—'}
              </Text>
            </>
          )}
        </View>
      </View>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>Account Settings</Text>
        <Option label="Privacy & Security" onPress={openPrivacy} />
        <Option label="Help & Support" onPress={openHelp} />
      </View>

      <View
        style={tw`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-2`}
      >
        <View style={tw`items-center`}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={tw`w-42 h-22 mb-2`}
            contentFit="contain"
            transition={200}
          />
          <Text style={tw`text-primary text-lg font-bold text-center`}>
            Nuroo
          </Text>
          <Text style={tw`text-gray-500 text-center mb-2`}>Version 1.0.0</Text>
          <Text style={tw`text-gray-500 text-center mb-4`}>
            Helping families support children with special needs through
            personalized development plans.
          </Text>
          <View style={tw`flex-row justify-center gap-4`}>
            <Pressable
              style={tw`border border-primary rounded-full px-4 py-2`}
              onPress={rateApp}
            >
              <Text style={tw`text-primary font-medium`}>Rate App</Text>
            </Pressable>
            <Pressable
              style={tw`border border-primary rounded-full px-4 py-2`}
              onPress={shareFeedback}
            >
              <Text style={tw`text-primary font-medium`}>Share Feedback</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
