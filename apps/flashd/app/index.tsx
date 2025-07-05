import { authClient } from '@/lib/auth';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { data: session } = authClient.useSession();

  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
