import { UserProfile } from './personal-profile'

export type SearchableUser = Pick<
    UserProfile,
    | 'id'
    | 'username'
    | 'firstName'
    | 'lastName'
    | 'profile_pic'
    | 'rating'
    | 'rating_count'
    | 'location'
>

export interface ReportFormValues {
    isVerbalAbuse: boolean
    isSpamming: boolean
    isHarassment: boolean
    isScamming: boolean
    isBadName: boolean
    isBadBio: boolean
    reason: string
}
