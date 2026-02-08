export type Experience = boolean | null

export type User = {
    id: number
    name: string
    avatar_url?: string
}

export type Doctor = {
    id: number
    name: string
    role: string
    is_enabled: boolean
    avatar_url?: string
}

export type Service = {
    id: number
    name: string
    category: string
    is_enabled: boolean
}

export type Aspect = {
    id: number
    name: string
    is_enabled: boolean
}

export type Source = {
    id: number
    name: string
    is_enabled: boolean
}

export type Reward = {
    id: number
    name: string
    is_enabled: boolean
    image_url?: string
}

export type Platform = {
    id: number
    name: string
    url: string
    is_enabled: boolean
    image_url?: string
}

export type Reason = {
    id: number
    name: string
    is_enabled: boolean
}

export type Review = {
    id: number
    contact_name?: string | null
    contact_phone?: string | null
    review_text?: string | null
    selected_doctors: Doctor[]
    selected_services: Service[]
    selected_aspects: Aspect[]
    selected_source?: Source | null
    selected_reward?: Reward | null
    published_platforms: Platform[]
}