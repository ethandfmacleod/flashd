import { trpc } from '@/lib/trpc'
import { useQueryClient } from '@tanstack/react-query'

export const useAuth = () => {
  const queryClient = useQueryClient()

  const sessionQuery = trpc.auth.getSession.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      console.error('Sign in failed:', error)
    },
  })

  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      console.error('Sign up failed:', error)
    },
  })

  const signOutMutation = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Sign out failed:', error)
    },
  })

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['auth', 'getSession']] })
    },
    onError: (error) => {
      console.error('Profile update failed:', error)
    },
  })

  return {
    // Session
    user: sessionQuery.data?.user || null,
    session: sessionQuery.data?.session || null,

    // Loading
    isLoading: sessionQuery.isLoading,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Erro
    sessionError: sessionQuery.error,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    updateProfileError: updateProfileMutation.error,

    isAuthenticated: !!sessionQuery.data?.user,

    // Actions
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    refetchSession: sessionQuery.refetch,

    // Reset mutations
    resetSignInError: signInMutation.reset,
    resetSignUpError: signUpMutation.reset,
    resetSignOutError: signOutMutation.reset,
    resetUpdateProfileError: updateProfileMutation.reset,
  }
}
