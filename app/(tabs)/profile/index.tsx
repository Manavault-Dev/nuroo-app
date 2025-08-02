import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);

  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    initials: 'SJ',
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
    };

    fetchProfile();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={tw`p-4 pt-16 pb-32`}
      showsVerticalScrollIndicator={false}
    >
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
                {user.initials}
              </Text>
            </View>
            <View>
              <Text style={tw`text-primary font-semibold text-lg`}>
                {user.name}
              </Text>
              <Text style={tw`text-gray-500`}>{user.email}</Text>
            </View>
          </View>
          <Pressable style={tw`p-2`}>
            <Ionicons name="create-outline" size={20} color="#1D3557" />
          </Pressable>
        </View>

        <View style={tw`mt-4`}>
          <Text style={tw`text-primary font-bold mb-1`}>
            Child&apos;s Profile
          </Text>

          <Text style={tw`text-gray-600`}>Name: {profile?.name}</Text>
          <Text style={tw`text-gray-600`}>Age: {profile?.age}</Text>
          <Text style={tw`text-gray-600`}>Diagnosis: {profile?.diagnosis}</Text>
        </View>
      </View>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>Account Settings</Text>
        <Option label="Profile Information" />
        <Option label="Child's Profile" />
        <Option label="Privacy & Security" />
      </View>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>App Preferences</Text>
        <Option label="Help & Support" />
      </View>

      <View
        style={tw`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-2`}
      >
        <View style={tw`items-center`}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={tw`w-42 h-22 mb-2`}
            resizeMode="contain"
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
            <Pressable style={tw`border border-primary rounded-full px-4 py-2`}>
              <Text style={tw`text-primary font-medium`}>Rate App</Text>
            </Pressable>
            <Pressable style={tw`border border-primary rounded-full px-4 py-2`}>
              <Text style={tw`text-primary font-medium`}>Share Feedback</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Option = ({ label }: { label: string }) => (
  <Pressable
    style={tw`flex-row justify-between items-center py-3 border-b border-gray-100`}
  >
    <Text style={tw`text-primary`}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
  </Pressable>
);

export default ProfileScreen;
