import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Icon, CloseIcon } from '@/components/ui/icon'
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'
import React from 'react'

export interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  cancelText?: string
  saveText?: string
  onSave?: () => void
  isSaving?: boolean
  showFooter?: boolean
  footerActions?: React.ReactNode
}

export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  cancelText = 'Cancel',
  saveText = 'Save',
  onSave,
  isSaving = false,
  showFooter = true,
  footerActions,
}: AppModalProps) {
  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md" className="text-typography-950">
            {title}
          </Heading>
          {showCloseButton && (
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
              />
            </ModalCloseButton>
          )}
        </ModalHeader>
        
        <ModalBody>{children}</ModalBody>
        
        {showFooter && (
          <ModalFooter>
            {footerActions ? (
              footerActions
            ) : (
              <>
                <Button variant="outline" action="secondary" onPress={onClose}>
                  <ButtonText>{cancelText}</ButtonText>
                </Button>
                {onSave && (
                  <Button onPress={handleSave} disabled={isSaving}>
                    <ButtonText>{isSaving ? 'Saving...' : saveText}</ButtonText>
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}