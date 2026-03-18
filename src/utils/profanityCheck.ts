import { Filter } from 'bad-words'

const filter = new Filter()

export const profanityChecker = (value: string): boolean => {
    value = value
        .toLowerCase()
        .replace(/[^a-z]/g, ' ')
        .replace(/(.)\1+/g, '$1')
    return filter.isProfane(value)
}
