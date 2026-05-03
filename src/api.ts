import axios from "axios"
import qs from "qs"
import type {
  Aspect,
  Doctor,
  Manager,
  Platform,
  Reason,
  Review,
  Reward,
  Service,
  Source,
  StylePreset,
  User,
} from "./types"

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getDoctors = async (): Promise<Doctor[]> => {
  const { data } = await client.get("/doctors")
  return data
}

export const getDoctorById = async (doctorId: number): Promise<Doctor> => {
  const { data } = await client.get(`/doctors/${doctorId}`)
  return data
}

export const getServices = async (): Promise<Service[]> => {
  const { data } = await client.get("/services")
  return data
}

export const getServicesByDoctorIds = async (doctorIds: number[]): Promise<Service[]> => {
  const { data } = await client.get("/services/doctors", {
    params: { doctor_ids: doctorIds },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" }),
  })

  return data
}

export const getAspects = async (): Promise<Aspect[]> => {
  const { data } = await client.get("/aspects")
  return data
}

export const getSources = async (): Promise<Source[]> => {
  const { data } = await client.get("/sources")
  return data
}

export const getRewards = async (): Promise<Reward[]> => {
  const { data } = await client.get("/rewards")
  return data
}

export const getManagers = async (): Promise<Manager[]> => {
  const { data } = await client.get("/managers")
  return data
}

export const getPlatforms = async (): Promise<Platform[]> => {
  const { data } = await client.get("/platforms")
  return data
}

export const getReasons = async (): Promise<Reason[]> => {
  const { data } = await client.get("/reasons")
  return data
}

export const getOwner = async (): Promise<User> => {
  const { data } = await client.get("/owner")
  return data
}

export const createReview = async (doctorId?: number): Promise<Review> => {
  const { data } = await client.post("/reviews", {
    target_doctor_id: doctorId
  })
  return data
}

export const getReview = async (reviewId: number): Promise<Review> => {
  const { data } = await client.get(`/reviews/${reviewId}`)
  return data
}

export const setReviewDoctors = async (
  reviewId: number,
  doctorIds: number[]
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/doctors`, {
    doctor_ids: doctorIds,
  })
  return data
}

export const setReviewServices = async (
  reviewId: number,
  serviceIds: number[]
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/services`, {
    service_ids: serviceIds,
  })
  return data
}

export const setReviewAspects = async (
  reviewId: number,
  aspectIds: number[]
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/aspects`, {
    aspect_ids: aspectIds,
  })
  return data
}

export const setReviewSource = async (
  reviewId: number,
  sourceId: number
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/source`, {
    source_id: sourceId,
  })
  return data
}

export const setReviewGender = async (
  reviewId: number,
  gender: string
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/gender`, {
    gender,
  })
  return data
}

export const updateReviewExperience = async (
  reviewId: number,
  experienceText: string
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/experience`, {
    experience_text: experienceText,
  })
  return data
}

export const updateReviewText = async (
  reviewId: number,
  reviewText: string
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/text`, {
    review_text: reviewText,
  })
  return data
}

export const generateReviewText = async (
  reviewId: number,
  stylePreset: StylePreset,
  useEmojis: boolean
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/generate`, {
    style_preset: stylePreset,
    use_emojis: useEmojis
  })
  return data
}

export const setReviewReward = async (
  reviewId: number,
  rewardId: number
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/reward`, {
    reward_id: rewardId,
  })
  return data
}

export const setReviewContacts = async (
  reviewId: number,
  contactName?: string,
  contactPhone?: string
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/contacts`, {
    contact_name: contactName,
    contact_phone: contactPhone,
  })
  return data
}

export const setReviewManager = async (
  reviewId: number,
  managerId: number
): Promise<Review> => {
  const { data } = await client.post(`/reviews/${reviewId}/manager`, {
    manager_id: managerId,
  })
  return data
}

export const addReviewPlatform = async (
  reviewId: number,
  platformId: number
): Promise<Review> => {
  const { data } = await client.post(
    `/reviews/${reviewId}/platforms/${platformId}`
  )
  return data
}

export const createComplaint = async (
  contactName: string,
  contactPhone: string,
  complaintText: string,
  reasonIds: number[]
): Promise<Review> => {
  const { data } = await client.post("/reviews/complaint", {
    contact_name: contactName,
    contact_phone: contactPhone,
    complaint_text: complaintText,
    reason_ids: reasonIds,
  })
  return data
}