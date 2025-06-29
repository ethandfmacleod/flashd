import { loginSchema, LoginSchemaType } from '@/constants/schemas'
import { authClient } from '@/lib/auth'
import React, { useState } from 'react'
import { useToastNotifications } from '../alerts'
import { Form, FormInput } from '../forms'

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const { showError, showSuccess } = useToastNotifications();

    const handleSignIn = async (data: LoginSchemaType) => {
        setIsLoading(true)
        try {
            const result = await authClient.signIn.email({
                email: data.email.trim().toLowerCase(),
                password: data.password,
            })

            if (result.error) {
                showError({ title: 'Sign In Failed', description: result.error.message })
            } else {
                showSuccess({ title: 'Welcome back!', description: 'You have been signed in successfully.' })
            }
        } catch (error) {
            console.error(error)
            showError({
                title: 'Sign In Failed',
                description: `An unexpected error occurred: ${error}`
            })
        } finally { setIsLoading(false) }
    }

    return (
        <Form
            schema={loginSchema}
            onSubmit={handleSignIn}
            submitText="Sign In"
            isLoading={isLoading}
        >
            <FormInput
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoCapitalize="none"
            />
        </Form>
    )
}