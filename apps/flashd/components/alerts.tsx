
import React from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';

interface ToastConfig {
    title: string;
    description?: string;
    duration?: number;
}

export const useToastNotifications = () => {
    const toast = useToast();

    const showError = ({ title, description, duration = 5000 }: ToastConfig) => {
        toast.show({
            placement: "bottom left",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="error"
                        variant="solid"
                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    const showSuccess = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom left",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="success"
                        variant="solid"
                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    const showInfo = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom left",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="info"
                        variant="solid"

                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    const showWarning = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom left",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="warning"
                        variant="solid"
                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    return {
        showError,
        showSuccess,
        showInfo,
        showWarning,
    };
};