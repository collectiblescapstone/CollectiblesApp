'use client'

// Next.js
import { usePathname, useRouter } from 'next/navigation'

// Chakra UI
import { HStack, Flex, Heading } from '@chakra-ui/react'

// Child Components
import { Logo } from '@/components/logo/Logo'

// Constants
import { MENU_ITEMS } from './constants'

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
            <HStack width="100%" pb={6} alignSelf="center">
                <Logo
                    data-testid="logo"
                    aria-hidden="true"
                    style={{
                        color: '#003B49',
                        width: '50%',
                        height: '50%'
                    }}
                />
                <Heading size="2xl" textAlign="center">
                    Kollec
                </Heading>
            </HStack>
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
                    padding={2}
                    borderRadius={8}
                    flexDir="row"
                    cursor="pointer"
                    width="100%"
                    mb={5}
                    role="button"
                    aria-label={`Navigate to ${item.name}`}
                    tabIndex={0}
                    onKeyDown={(e) =>
                        (e.key === 'Enter' || e.key === ' ') && item.onClick
                            ? item.onClick(router)
                            : router.push(item.path)
                    }
                >
                    {item.icon}
                    <Heading size="2xl" ml={4}>
                        {item.name}
                    </Heading>
                </Flex>
            ))}
        </Flex>
    )
}

export default Sidebar
