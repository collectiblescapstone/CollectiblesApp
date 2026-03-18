import {
    cardConditions,
    cardConditionsMap,
    gradeDetailsMap,
    gradingCompanies,
    gradingCompaniesMap,
    parseGradeLevel
} from '../cardGrading'

describe('cardGrading utils', () => {
    it('exposes card conditions and map labels', () => {
        expect(cardConditions).toHaveLength(5)
        expect(cardConditionsMap['near-mint']).toBe('Near Mint')
        expect(cardConditionsMap['damaged']).toBe('Damaged')
    })

    it('exposes grading companies and map labels', () => {
        expect(gradingCompanies).toHaveLength(6)
        expect(gradingCompaniesMap.psa).toBe('PSA')
        expect(gradingCompaniesMap.ungraded).toBe('Ungraded')
    })

    it('returns parsed grade label when a level exists', () => {
        expect(parseGradeLevel('psa', 'psa-10')).toBe('10')
        expect(parseGradeLevel('tag', 'tag-pristine-10')).toBe('Pristine 10')
        expect(parseGradeLevel('cgc', 'cgc-au')).toBe('AU')
        expect(parseGradeLevel('beckett', 'beckett-blacklabel-10')).toBe(
            'Black Label 10'
        )
    })

    it('returns original grade level when it is not found', () => {
        expect(parseGradeLevel('psa', 'psa-11')).toBe('psa-11')
        expect(parseGradeLevel('ungraded', 'custom')).toBe('custom')
    })

    it('contains expected grade detail lists', () => {
        expect(gradeDetailsMap.ungraded).toEqual([])
        expect(gradeDetailsMap.psa[0]).toEqual({ label: '10', value: 'psa-10' })
        expect(gradeDetailsMap.ace.at(-1)).toEqual({
            label: '1',
            value: 'ace-1'
        })
    })
})
