'use client'

// React
import { useRef } from 'react'

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

    // Ensure close side-effects run once regardless of how the dialog closes.
    const hasHandledClose = useRef(false)
    const handleClose = () => {
        if (hasHandledClose.current) return
        hasHandledClose.current = true
        onClickClose()
    }

    return (
        <Dialog.Root
            {...rest}
            onOpenChange={({ open }) => {
                if (open) {
                    hasHandledClose.current = false
                    return
                }

                handleClose()
            }}
        >
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
                                    onClick={handleClose}
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
