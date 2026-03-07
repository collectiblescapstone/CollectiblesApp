'use client'

// React
import { IoMdClose } from 'react-icons/io'

// Chakra UI
import { Button, Dialog, Portal, createOverlay } from '@chakra-ui/react'

interface DialogProps {
    title: string
    description?: string
    content?: React.ReactNode
    onClickClose: () => void
}

const PopupUI = createOverlay<DialogProps>((props) => {
    const { title, description, content, onClickClose, ...rest } = props
    return (
        <Dialog.Root {...rest}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner justifyContent="center" alignItems="center">
                    <Dialog.Content>
                        {title && (
                            <Dialog.Header
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Dialog.Title>{title}</Dialog.Title>
                                <Button
                                    size="sm"
                                    onClick={onClickClose}
                                    aspectRatio={1}
                                    background={'none'}
                                >
                                    <IoMdClose size={48} fill="black" />
                                </Button>
                            </Dialog.Header>
                        )}
                        <Dialog.Body spaceY="4" gap={2}>
                            {description && (
                                <Dialog.Description>
                                    {description}
                                </Dialog.Description>
                            )}
                            {content}
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
})

export default PopupUI
