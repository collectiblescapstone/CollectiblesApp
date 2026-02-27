'use client'

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
                <Dialog.Positioner>
                    <Dialog.Content>
                        {title && (
                            <Dialog.Header
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Dialog.Title>{title}</Dialog.Title>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onClickClose}
                                >
                                    Close
                                </Button>
                            </Dialog.Header>
                        )}
                        <Dialog.Body spaceY="4">
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
