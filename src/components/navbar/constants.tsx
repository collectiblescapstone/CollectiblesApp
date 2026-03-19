import {
    LuCamera,
    LuLibrary,
    LuUser,
    LuHouse,
    LuArrowRightLeft,
    LuFlaskConical
} from 'react-icons/lu'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const MENU_ITEMS: {
    icon: React.ReactNode
    path: string
    name: string
    onClick?: (router: AppRouterInstance) => void
}[] = [
    {
        icon: <LuHouse size={36} />,
        path: '/home',
        name: 'Home'
    },
    {
        icon: <LuArrowRightLeft size={36} />,
        path: '/trade',
        name: 'Trade Post'
    },
    {
        icon: <LuCamera size={36} />,
        path: '/camera',
        name: 'Camera'
    },
    {
        icon: <LuLibrary size={36} />,
        path: '/pokemon-grid',
        name: 'Collections'
    },
    { icon: <LuUser size={36} />, path: '/personal-profile', name: 'Profile' },
    {
        icon: <LuFlaskConical size={36} />,
        path: '/metrics',
        name: 'Metrics'
    }
]

export const PAGE_HEADINGS: Record<string, string> = {
    '/home': 'kollec',
    '/trade': 'TradePost',
    '/pokemon-grid': 'kollections',
    '/camera': 'camera',
    '/personal-profile': 'profile',
    '/metrics': 'Metrics'
}
