import { useRouter } from "expo-router"
import { Undo2 } from "lucide-react-native"
import { Button } from "./ui/button"
import { HStack } from "./ui/hstack"
import { Text } from './ui/text'


export const BackButton = () => {
    const router = useRouter()

    return (
        <Button
            variant="solid"
            onPress={() => router.back()}
            className="px-4 py-2 rounded bg-blue-500"
        >
            <HStack className="gap-2 items-center">
                <Undo2 size={18} color="white" />
                <Text className="text-lg text-white font-bold">Back</Text>
            </HStack>
        </Button>
    )
}