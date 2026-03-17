import { pfp_image_mapping, visibilityOptions } from '../constants'

describe('edit-profile constants', () => {
    describe('pfp_image_mapping', () => {
        it('contains mapping for all profile picture indices', () => {
            expect(Object.keys(pfp_image_mapping)).toHaveLength(6)
        })

        it('has correct path for index 0', () => {
            expect(pfp_image_mapping[0]).toBe('/user-profile/pfp_temp.jpg')
        })

        it('has correct path for index 1', () => {
            expect(pfp_image_mapping[1]).toBe('/user-profile/pfp_temp1.png')
        })

        it('has correct path for index 2', () => {
            expect(pfp_image_mapping[2]).toBe('/user-profile/pfp_temp2.png')
        })

        it('has correct path for index 3', () => {
            expect(pfp_image_mapping[3]).toBe('/user-profile/pfp_temp3.png')
        })

        it('has correct path for index 4', () => {
            expect(pfp_image_mapping[4]).toBe('/user-profile/pfp_temp4.png')
        })

        it('has correct path for index 5', () => {
            expect(pfp_image_mapping[5]).toBe('/user-profile/pfp_temp5.png')
        })

        it('returns undefined for invalid indices', () => {
            expect(pfp_image_mapping[6]).toBeUndefined()
            expect(pfp_image_mapping[-1]).toBeUndefined()
        })
    })

    describe('visibilityOptions', () => {
        it('contains three visibility options', () => {
            expect(visibilityOptions).toHaveLength(3)
        })

        it('has public option', () => {
            expect(visibilityOptions).toContainEqual({
                value: 'public',
                label: 'Public'
            })
        })

        it('has private option', () => {
            expect(visibilityOptions).toContainEqual({
                value: 'private',
                label: 'Private'
            })
        })

        it('has friends_only option', () => {
            expect(visibilityOptions).toContainEqual({
                value: 'friends_only',
                label: 'Friends Only'
            })
        })

        it('has correct values', () => {
            const values = visibilityOptions.map((opt) => opt.value)
            expect(values).toEqual(['public', 'private', 'friends_only'])
        })

        it('has correct labels', () => {
            const labels = visibilityOptions.map((opt) => opt.label)
            expect(labels).toEqual(['Public', 'Private', 'Friends Only'])
        })
    })
})
