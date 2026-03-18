import { renderWithTheme } from '@/utils/testing-utils'
import { screen } from '@testing-library/react'
import UserSearchList from '../UserSearchList'

jest.mock('../../profiles/StarRating', () => {
    return jest.fn(() => <div>Mocked StarRating</div>)
})

describe('UserSearchList', () => {
    it('renders user information correctly', () => {
        const mockProps = {
            name: 'John Doe',
            username: 'johndoe',
            profile_pic: 1,
            rating: 4.5,
            rating_count: 100,
            location: 'New York, USA'
        }

        renderWithTheme(<UserSearchList {...mockProps} />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('johndoe')).toBeInTheDocument()
        expect(screen.getByText('New York, USA')).toBeInTheDocument()
        expect(screen.getByText('Mocked StarRating')).toBeInTheDocument()
    })

    it('trims long location correctly', () => {
        const mockProps = {
            name: 'Jane Smith',
            username: 'janesmith',
            profile_pic: 2,
            rating: 4.0,
            rating_count: 50,
            location: 'Unit 67, 123 Road, Los Angeles, California, USA'
        }

        renderWithTheme(<UserSearchList {...mockProps} />)

        expect(
            screen.getByText('Los Angeles, California, USA')
        ).toBeInTheDocument()
    })
})
