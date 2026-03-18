import imgPuller from '../imgPuller'

describe('imgPuller utils', () => {
    it('returns the correct image path for a given folder and image name', () => {
        expect(imgPuller('cards', 'card1')).toBe('/Assets/img/cards/card1.png')
        expect(imgPuller('avatars', 'avatar1')).toBe(
            '/Assets/img/avatars/avatar1.png'
        )
    })
})
