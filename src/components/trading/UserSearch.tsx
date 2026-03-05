import { useAuth } from '@/context/AuthProvider'
import { SearchableUser } from '@/types/user-management'
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
import { useRouter } from 'next/navigation'
import { useProfileSelected } from '@/context/ProfileSelectionProvider'

const UserSearch = () => {
    const { session } = useAuth()
    const { push } = useRouter()
    const { setProfileSelected } = useProfileSelected()

    const searchRef = useRef<HTMLInputElement | null>(null)
    const [searchValue, setSearchValue] = useState<string>('')
    const [listboxValue, setListboxValue] = useState<string[]>([])
    const [searchableUsers, setSearchableUsers] = useState<SearchableUser[]>([])
    const [filteredUsers, setFilteredUsers] = useState<
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

    const handleSelect = (username: string) => {
        setOpen(false)
        setProfileSelected(username)
        push('/user-profile')
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value
        setSearchValue(value)
        const filtered = searchableUsers.filter((user) => {
            const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`
            return (
                user.username.toLowerCase().includes(value.toLowerCase()) ||
                fullName.toLowerCase().includes(value.toLowerCase())
            )
        })
        setFilteredUsers(createListCollection({ items: filtered }))
    }

    useEffect(() => {
        if (!session?.access_token) return
        const fetchSearchableUsers = async () => {
            const res = await CapacitorHttp.post({
                url: `${baseUrl}/api/get-searchable-users`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                }
            })
            if (res.status === 200) {
                const searchableUsersData: ListCollection<SearchableUser> =
                    createListCollection({
                        items: res.data.users
                            .map((user: SearchableUser) => ({
                                id: user.id,
                                username: user.username,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                profile_pic: user.profile_pic,
                                rating: user.rating,
                                rating_count: user.rating_count,
                                location: user.location
                            }))
                            .sort((a: SearchableUser, b: SearchableUser) =>
                                a.username.localeCompare(b.username)
                            )
                    })
                setFilteredUsers(searchableUsersData)
                setSearchableUsers(
                    res.data.users.sort(
                        (a: SearchableUser, b: SearchableUser) =>
                            a.username.localeCompare(b.username)
                    )
                )
            }
        }
        fetchSearchableUsers()
    }, [session?.access_token])

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
                        onChange={handleSearchChange}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 100)}
                    />
                </InputGroup>
            </Popover.Trigger>
            <Popover.Positioner>
                <Popover.Content width="auto">
                    <Listbox.Root
                        collection={filteredUsers}
                        value={listboxValue}
                    >
                        {filteredUsers.items.length > 0 &&
                        searchValue.length > 0 ? (
                            <Listbox.Content>
                                {filteredUsers.items.map((item) => (
                                    <Listbox.Item
                                        item={item}
                                        key={item.id}
                                        onClick={() =>
                                            handleSelect(item.username)
                                        }
                                    >
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
                                    {searchValue.length > 0
                                        ? 'No users found'
                                        : 'Search for users'}
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
