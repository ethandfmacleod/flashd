// import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // const { user, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <Box className="flex-1 justify-center items-center">
  //       <Spinner size="large" />
  //     </Box>
  //   );
  // }

  // if (user) {
  //   return <Redirect href="/(tabs)" />;
  // }

  // return <Redirect href="/(auth)" />;

  // TODO: Remove
  return <Redirect href="/(tabs)" />;

}