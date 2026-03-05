'use client'

import React from 'react'

import { Box, Button, Menu, Portal } from '@chakra-ui/react'
import { FiMoreVertical, FiSlash, FiUserX } from 'react-icons/fi'
import { LuStar } from 'react-icons/lu'
import PopupUI from '@/components/ui/PopupUI'
import RatingForm from './RatingForm'
import { UserProfile } from '@/types/personal-profile'
import BlockForm from './BlockForm'
import ReportForm from './ReportForm'

interface AccountOptionsProps {
    user: UserProfile
}

const AccountOptions = ({ user }: AccountOptionsProps) => {
    const userFullName =
        user.firstName || user.lastName
            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
            : user.username

    return (
        <Box>
            <Menu.Root>
                <Menu.Trigger asChild>
                    <Button rounded="sm" variant="ghost" h={'40px'} w={'20px'}>
                        <FiMoreVertical size={24} />
                    </Button>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content>
                            <Menu.Item
                                value="block-user"
                                onClick={() =>
                                    PopupUI.open('block-user', {
                                        title: `Block ${userFullName}?`,
                                        content: (
                                            <BlockForm
                                                onCancel={() =>
                                                    PopupUI.close('block-user')
                                                }
                                                userId={user.id}
                                            />
                                        ),
                                        onClickClose: () =>
                                            PopupUI.close('block-user')
                                    })
                                }
                            >
                                Block{' '}
                                <Menu.ItemCommand>
                                    <FiSlash size={20} />
                                </Menu.ItemCommand>
                            </Menu.Item>
                            <Menu.Item
                                value="rate-user"
                                onClick={() =>
                                    PopupUI.open('rate-user', {
                                        title: `Rate ${userFullName}?`,
                                        content: (
                                            <RatingForm
                                                closeOnSubmit={PopupUI.close}
                                                user={user}
                                            />
                                        ),
                                        onClickClose: () =>
                                            PopupUI.close('rate-user')
                                    })
                                }
                            >
                                Rate{' '}
                                <Menu.ItemCommand>
                                    <LuStar size={20} />
                                </Menu.ItemCommand>
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                value="report-user"
                                onClick={() =>
                                    PopupUI.open('report-user', {
                                        title: `Report ${userFullName}?`,
                                        content: (
                                            <ReportForm
                                                closeOnSubmit={() =>
                                                    PopupUI.close('report-user')
                                                }
                                                userId={user.id}
                                            />
                                        ),
                                        onClickClose: () =>
                                            PopupUI.close('report-user')
                                    })
                                }
                            >
                                Report{' '}
                                <Menu.ItemCommand>
                                    <FiUserX size={20} />
                                </Menu.ItemCommand>
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>
            <PopupUI.Viewport />
        </Box>
    )
}

export default AccountOptions
