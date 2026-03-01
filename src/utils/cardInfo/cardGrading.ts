export const cardConditions = [
    { label: 'Near Mint', value: 'near-mint' },
    { label: 'Lightly Played', value: 'lightly-played' },
    { label: 'Moderately Played', value: 'moderately-played' },
    { label: 'Heavily Played', value: 'heavily-played' },
    { label: 'Damaged', value: 'damaged' }
]

export const gradingCompanies = [
    { label: 'Ungraded', value: 'ungraded' },
    { label: 'PSA', value: 'psa' },
    { label: 'TAG', value: 'tag' },
    { label: 'CGC', value: 'cgc' },
    { label: 'Beckett', value: 'beckett' },
    { label: 'ACE', value: 'ace' }
]

export const gradeDetailsMap: Record<
    string,
    { label: string; value: string }[]
> = {
    ungraded: [],
    psa: [
        { label: '10', value: 'psa-10' },
        { label: '9', value: 'psa-9' },
        { label: '8', value: 'psa-8' },
        { label: '7', value: 'psa-7' },
        { label: '6', value: 'psa-6' },
        { label: '5', value: 'psa-5' },
        { label: '4', value: 'psa-4' },
        { label: '3', value: 'psa-3' },
        { label: '2', value: 'psa-2' },
        { label: '1', value: 'psa-1' }
    ],
    tag: [
        { label: '10*', value: 'tag-pristine-10' },
        { label: '10', value: 'tag-10' },
        { label: '9', value: 'tag-9' },
        { label: '8.5', value: 'tag-8.5' },
        { label: '8', value: 'tag-8' },
        { label: '7.5', value: 'tag-7.5' },
        { label: '7', value: 'tag-7' },
        { label: '6.5', value: 'tag-6.5' },
        { label: '6', value: 'tag-6' },
        { label: '5.5', value: 'tag-5.5' },
        { label: '5', value: 'tag-5' },
        { label: '4.5', value: 'tag-4.5' },
        { label: '4', value: 'tag-4' },
        { label: '3.5', value: 'tag-3.5' },
        { label: '3', value: 'tag-3' },
        { label: '2.5', value: 'tag-2.5' },
        { label: '2', value: 'tag-2' },
        { label: '1.5', value: 'tag-1.5' },
        { label: '1', value: 'tag-1' }
    ],
    cgc: [
        { label: '10*', value: 'cgc-pristine-10' },
        { label: '10', value: 'cgc-10' },
        { label: '9.5', value: 'cgc-9.5' },
        { label: '9', value: 'cgc-9' },
        { label: '8.5', value: 'cgc-8.5' },
        { label: '8', value: 'cgc-8' },
        { label: '7.5', value: 'cgc-7.5' },
        { label: '7', value: 'cgc-7' },
        { label: '6.5', value: 'cgc-6.5' },
        { label: '6', value: 'cgc-6' },
        { label: '5.5', value: 'cgc-5.5' },
        { label: '5', value: 'cgc-5' },
        { label: '4.5', value: 'cgc-4.5' },
        { label: '4', value: 'cgc-4' },
        { label: '3.5', value: 'cgc-3.5' },
        { label: '3', value: 'cgc-3' },
        { label: '2.5', value: 'cgc-2.5' },
        { label: '2', value: 'cgc-2' },
        { label: '1.5', value: 'cgc-1.5' },
        { label: '1', value: 'cgc-1' },
        { label: 'AU', value: 'cgc-au' }
    ],
    beckett: [
        { label: '10**', value: 'beckett-blacklabel-10' },
        { label: '10*', value: 'beckett-pristine-10' },
        { label: '10', value: 'beckett-10' },
        { label: '9', value: 'beckett-9' },
        { label: '9.5', value: 'beckett-9.5' },
        { label: '8', value: 'beckett-8' },
        { label: '7', value: 'beckett-7' },
        { label: '6', value: 'beckett-6' },
        { label: '5', value: 'beckett-5' },
        { label: '4', value: 'beckett-4' },
        { label: '3', value: 'beckett-3' },
        { label: '2', value: 'beckett-2' },
        { label: '1', value: 'beckett-1' }
    ],
    ace: [
        { label: '10', value: 'ace-10' },
        { label: '9', value: 'ace-9' },
        { label: '8', value: 'ace-8' },
        { label: '7', value: 'ace-7' },
        { label: '6', value: 'ace-6' },
        { label: '5', value: 'ace-5' },
        { label: '4', value: 'ace-4' },
        { label: '3', value: 'ace-3' },
        { label: '2', value: 'ace-2' },
        { label: '1', value: 'ace-1' }
    ]
}
