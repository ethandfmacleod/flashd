import { authClient } from "@/lib/auth";
import { useState } from "react";
import { Button, ButtonIcon, ButtonText } from "../ui/button";

export default function SocialSignIn() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/"
        })
        setIsLoading(false)
    };
    return (
        <Button size="md" variant="solid" action="primary">

            <ButtonIcon as={AntDesign} />
            <ButtonText>Log in with Google</ButtonText>
        </Button>
    )
}