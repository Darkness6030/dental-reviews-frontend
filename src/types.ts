export type Feedback = boolean | null
export type StylePreset =
    | "friendly"
    | "short"
    | "business"

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
    contact_name?: string
    contact_phone?: string
    selected_gender?: string
    last_style_preset?: StylePreset
    experience_text?: string
    review_text?: string
    generations_spent: number
    generations_limit: number
    target_doctor?: Doctor
    selected_doctors: Doctor[]
    selected_services: Service[]
    selected_aspects: Aspect[]
    selected_source?: Source
    selected_reward?: Reward
    published_platforms: Platform[]
}