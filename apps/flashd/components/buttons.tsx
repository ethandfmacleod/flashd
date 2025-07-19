import React, { useState } from "react";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "./ui/button";

export interface LoadingButtonProps {
    Icon?: React.ComponentType<any>;
    iconProps?: any;
    children: React.ReactNode;
    onPress: () => Promise<void> | void;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "solid" | "outline" | "link";
    action?: "primary" | "secondary" | "positive" | "negative";
    isDisabled?: boolean;
    loadingText?: string;
    spinnerColor?: string;
    [key: string]: any;
}

export default function LoadingButton({
    Icon,
    iconProps,
    children,
    onPress,
    size = "md",
    variant = "solid",
    action = "primary",
    isDisabled = false,
    loadingText,
    spinnerColor,
    ...buttonProps
}: LoadingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePress = async () => {
        if (isLoading || isDisabled) return;
        try {
            setIsLoading(true);
            await onPress();
        } catch (error) {
            console.error("Button action failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size={size}
            variant={variant}
            action={action}
            onPress={handlePress}
            isDisabled={isLoading || isDisabled}
            {...buttonProps}
        >
            {isLoading ? (
                <ButtonSpinner />
            ) : (
                Icon && (<ButtonIcon as={Icon} {...iconProps} />)
            )}

            <ButtonText>
                {isLoading && loadingText ? loadingText : children}
            </ButtonText>
        </Button>
    );
}