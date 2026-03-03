import { useAuth } from '@/context/AuthProvider'
import { SearchableUser } from '@/types/trade'
import { baseUrl } from '@/utils/constants'
import { CapacitorHttp } from '@capacitor/core'
import {
    Box,
    CloseButton,
    createListCollection,
    Input,
    InputGroup,
    Listbox,
    ListCollection,
    Popover
} from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import UserSearchList from './UserSearchList'

const UserSearch = () => {
    const { session } = useAuth()

    const searchRef = useRef<HTMLInputElement | null>(null)
    const [searchValue, setSearchValue] = useState<string>('')
    const [listboxValue, setListboxValue] = useState<string[]>([])
    const [searchableUsers, setSearchableUsers] = useState<
        ListCollection<SearchableUser>
    >(createListCollection<SearchableUser>({ items: [] }))
    const [open, setOpen] = useState<boolean>(false)

    const handleClear = useCallback(() => {
        setSearchValue('')
        setListboxValue([])
        setOpen(false)
    }, [])
    const clearSearch = searchValue ? (
        <CloseButton size="xs" onClick={handleClear} me={-2} />
    ) : undefined

    useEffect(() => {
        const fetchSearchableUsers = async () => {
            const res = await CapacitorHttp.get({
                url: `${baseUrl}/api/get-searchable-users`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                }
            })
            if (res.status === 200) {
                const searchableUsersData: ListCollection<SearchableUser> =
                    createListCollection({
                        items: res.data.users.map((user: SearchableUser) => ({
                            id: user.id,
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profile_pic: user.profile_pic,
                            rating: user.rating,
                            rating_count: user.rating_count,
                            location: user.location
                        }))
                    })
                setSearchableUsers(searchableUsersData)
            }
        }
        fetchSearchableUsers()
    }, [])

    return (
        <Popover.Root
            autoFocus={false}
            positioning={{ sameWidth: true }}
            open={open}
        >
            <Popover.Trigger asChild>
                <InputGroup endElement={clearSearch} w="11/12">
                    <Input
                        placeholder={`Search user by username or profile name`}
                        ref={searchRef}
                        value={searchValue}
                        onChange={(e) => {
                            const value = e.currentTarget.value
                            setSearchValue(value)
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 100)}
                    />
                </InputGroup>
            </Popover.Trigger>
            <Popover.Positioner>
                <Popover.Content width="auto">
                    <Listbox.Root
                        collection={searchableUsers}
                        value={listboxValue}
                    >
                        {searchableUsers.items.length > 0 ? (
                            <Listbox.Content>
                                {searchableUsers.items.map((item) => (
                                    <Listbox.Item item={item} key={item.id}>
                                        <UserSearchList
                                            name={
                                                (item.firstName ?? '') +
                                                ' ' +
                                                (item.lastName ?? '')
                                            }
                                            username={item.username}
                                            profile_pic={item.profile_pic}
                                            rating={item.rating}
                                            rating_count={item.rating_count}
                                            location={item.location ?? ''}
                                        />
                                    </Listbox.Item>
                                ))}
                            </Listbox.Content>
                        ) : (
                            <Listbox.Content>
                                <Box
                                    display="flex"
                                    height="100px"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    No users found
                                </Box>
                            </Listbox.Content>
                        )}
                    </Listbox.Root>
                </Popover.Content>
            </Popover.Positioner>
        </Popover.Root>
    )
}

export default UserSearch
