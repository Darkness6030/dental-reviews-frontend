import type { Review } from "../types"
import { getReview } from "../api"

const reviewIdKey = "review_id"

export const loadReview = async (): Promise<Review | null> => {
  const reviewId = getReviewId()
  if (!reviewId) return null

  try {
    return await getReview(reviewId)
  } catch {
    clearReviewId()
    return null
  }
}

export const getReviewId = (): number | null => {
  const storedReviewId = localStorage.getItem(reviewIdKey)
  return storedReviewId ? Number(storedReviewId) : null
}

export const setReviewId = (reviewId: number) => {
  localStorage.setItem(reviewIdKey, String(reviewId))
}

export const clearReviewId = () => {
  localStorage.removeItem(reviewIdKey)
}