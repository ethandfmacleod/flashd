import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'
import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import React from 'react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmAction?: 'primary' | 'secondary' | 'positive' | 'negative'
  isLoading?: boolean
  showCloseButton?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmAction = 'primary',
  isLoading = false,
  showCloseButton = true,
}: ConfirmDialogProps) {
  const handleConfirm = () => onConfirm()

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="lg">{title}</Heading>
          {showCloseButton && <AlertDialogCloseButton />}
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text>{message}</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            disabled={isLoading}
          >
            <ButtonText>{cancelText}</ButtonText>
          </Button>
          <Button
            action={confirmAction}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <ButtonText>
              {isLoading ? 'Loading...' : confirmText}
            </ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}