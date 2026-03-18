import { render } from '@testing-library/react'
import { ChakraUIProvider } from '@/context/ChakraUIProvider'

export const renderWithTheme = (ui: React.ReactNode) => {
    return render(ui, {
        wrapper: ChakraUIProvider
    })
}

type TransactionCallback = (tx: any) => Promise<unknown>

export const mockPrisma = {
    $transaction: jest.fn(),
    collectionEntry: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn()
    },
    wishlistEntry: {
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn()
    },
    card: {
        findFirst: jest.fn(),
        findMany: jest.fn()
    },
    set: {
        findMany: jest.fn()
    },
    subset: {
        findMany: jest.fn()
    },
    blockList: {
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn()
    },
    reportedUser: {
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn()
    },
    user: {
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
    }
}

export const mockSupabase = {
    auth: {
        getUser: jest.fn()
    }
}

export const mockSupabaseAdmin = {
    auth: {
        admin: {
            getUserById: jest.fn(),
            deleteUser: jest.fn()
        }
    }
}

export const createTxMock = () => ({
    collectionEntry: { deleteMany: jest.fn() },
    wishlistEntry: { deleteMany: jest.fn() },
    blockList: { deleteMany: jest.fn() },
    reportedUser: { deleteMany: jest.fn() },
    user: { delete: jest.fn() }
})

export const runTransactionWith = (tx = createTxMock()) => {
    mockPrisma.$transaction.mockImplementation(
        async (callback: TransactionCallback) => callback(tx)
    )

    return tx
}

export const resetApiMocks = () => {
    jest.clearAllMocks()
}

export const jsonRequest = (
    url: string,
    method: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
) =>
    new Request(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined
    })

export const authHeader = (token = 'token') => ({
    authorization: `Bearer ${token}`
})

export const mockAuthSuccess = (userId = 'user-1') => {
    mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null
    })
}
