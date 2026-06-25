

export const hello = 12


export type UserModel = {
    username: string,
    email: string
}

export interface LoginSuccess {
    userId: number,
    email: string,
    token: string,
    username: string,
    avatar: string
}


export interface UserProfile {
    fullName: string,
    avatarUrl: string,
    bio: string,
    mutualFriend: number,
    numberFriend: number,
    statusFriend?: string,
    friend: boolean
}