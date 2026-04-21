import type { Review } from "../types"
import { createReview, getReview } from "../api"

const reviewIdKey = "review_id"

export const loadReview = async (): Promise<Review> => {
  const reviewId = getReviewId()
  if (reviewId) {
    try {
      return await getReview(reviewId)
    } catch {
      localStorage.removeItem(reviewIdKey)
    }
  }

  const review = await createReview()
  localStorage.setItem(reviewIdKey, String(review.id))
  return review
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
