
import { SignUpForm } from '@/components/auth/signup-form'
import { Link } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                <SignUpForm />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/(auth)/sign-in" style={styles.link}>
                        <Text style={styles.linkText}>Sign in</Text>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#666',
    },
    link: {
        marginLeft: 4,
    },
    linkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
})