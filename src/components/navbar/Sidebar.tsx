'use client'

// Next.js
import { usePathname, useRouter } from 'next/navigation'

// Chakra UI
import { Flex, Heading, VStack } from '@chakra-ui/react'

// Child Components
import { Logo } from '@/components/logo/Logo'

// Constants
import { MENU_ITEMS } from './constants'
import { LuStepBack } from 'react-icons/lu'

const Sidebar = () => {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Flex
            color="brand.turtoise"
            background="brand.marigold"
            minWidth="25dvw"
            minHeight="dvh"
            flexDir="column"
            alignItems="flex-start"
            p={8}
        >
            <Flex
                onClick={() => router.back()}
                role="button"
                aria-label="Go back"
                cursor="pointer"
                _hover={{ bgColor: 'whiteAlpha.400' }}
                padding={2}
                borderRadius={8}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.back()
                    }
                }}
            >
                <LuStepBack size={24} />
            </Flex>
            <VStack width="100%" pb={6} alignSelf="center">
                <Logo
                    data-testid="logo"
                    aria-hidden="true"
                    style={{
                        color: '#003B49',
                        width: '5rem',
                        height: '5rem'
                    }}
                />
                <Heading size="2xl" textAlign="center">
                    Kollec
                </Heading>
            </VStack>
            <VStack width="100%" alignItems="flex-start">
                {MENU_ITEMS.map((item) => (
                    <Flex
                        key={item.path}
                        onClick={() =>
                            item.onClick
                                ? item.onClick(router)
                                : router.push(item.path)
                        }
                        bgColor={
                            pathname.startsWith(`${item.path}`)
                                ? 'whiteAlpha.400'
                                : 'transparent'
                        }
                        _hover={{ bgColor: 'whiteAlpha.400' }}
                        padding={2}
                        borderRadius={8}
                        flexDir="row"
                        cursor="pointer"
                        width="100%"
                        mb={5}
                        role="button"
                        aria-label={`Navigate to ${item.name}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') {
                                return
                            }
                            if (item.onClick) {
                                item.onClick(router)
                            } else {
                                router.push(item.path)
                            }
                        }}
                    >
                        {item.icon}
                        <Heading size="2xl" ml={4}>
                            {item.name}
                        </Heading>
                    </Flex>
                ))}
            </VStack>
        </Flex>
    )
}

export default Sidebar
