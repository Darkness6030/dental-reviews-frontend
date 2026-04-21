import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import CopiedToast from "../components/CopiedToast"
import { Loader } from "../components/Loader"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Reward } from "../types"
import { getRewards, setReviewReward } from "../api"
import { loadReview } from "../utils/storage"

type Context = {
  reviewText: string
  setReviewText: (text: string) => void
  selectedRewardId: number | null
  setSelectedRewardId: (id: number | null) => void
}

export default function RewardsPage() {
  const navigate = useNavigate()
  const copyTimeoutRef = useRef<number | null>(null)

  const {
    reviewText,
    setReviewText,
    selectedRewardId,
    setSelectedRewardId
  } = useOutletContext<Context>()

  const [rewards, setRewards] = useState<Reward[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getRewards()
      .then(setRewards)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (reviewText) return

    const loadReviewText = async () => {
      const review = await loadReview()
      if (review.review_text) {
        setReviewText(review.review_text)
      }
    }

    loadReviewText()
  }, [])

  const handleCopyReview = async () => {
    await navigator.clipboard.writeText(reviewText)
    setIsCopied(true)

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false)
      copyTimeoutRef.current = null
    }, 2000)
  }

  const handleCloseToast = () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = null
    }
    setIsCopied(false)
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleNext = async (rewardId: number) => {
    if (isSaving) return

    try {
      setIsSaving(true)
      const review = await loadReview()
      await setReviewReward(review.id, rewardId)
      navigate("/contacts")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-4 pt-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Отзыв<br />сгенерирован
          </h1>

          <div className="w-16 h-16 p-[6px] flex items-center justify-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[#DAE6DA] flex items-center justify-center">
              <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Но при желании вы можете его изменить
        </p>
      </div>

      <div className="w-full px-4 mt-4 shrink-0">
        <div className="bg-white rounded-[24px] p-1 flex gap-2 shadow-[0_0_4px_rgba(0,0,0,0.04)]">
          <div className="flex-1 px-3 py-2 overflow-hidden">
            <p className="text-[14px] leading-[140%] tracking-[-0.02em] text-[#131927] line-clamp-4 opacity-80">
              {reviewText}
            </p>
          </div>

          <div className="flex flex-col w-12 shrink-0">
            <button
              onClick={() => navigate("/review")}
              className="w-12 h-12 bg-[#EEEEEE] flex items-center justify-center rounded-t-[20px] border-b border-white"
            >
              <PencilIcon className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={handleCopyReview}
              className="w-12 h-12 bg-[#EEEEEE] flex items-center justify-center rounded-b-[20px]"
            >
              <CopyIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 mt-6 flex-1 min-h-0">
        <h2 className="text-[24px] leading-[110%] font-medium tracking-[-0.02em] text-[#131927]">
          Выберите подарок<br />за публикацию отзыва
        </h2>

        {rewards.length > 0 && (
          <p className="mt-3 text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
            Можно выбрать 1 из {rewards.length} вариантов
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {isLoading ? (
            <div className="w-full min-h-[120px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            rewards.filter(reward => reward.is_enabled).map(reward => {
              const isSelected = selectedRewardId === reward.id
              return (
                <button
                  key={reward.id}
                  onClick={() => setSelectedRewardId(reward.id)}
                  className={`w-full min-h-[72px] p-1 rounded-[24px] flex items-center gap-3
                    shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
                    ${isSelected
                      ? "bg-[#131927] text-white"
                      : "bg-white text-[#191919]"
                    }`}
                >
                  <div className="w-16 aspect-square rounded-[20px] bg-[#F2F2F2] overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={reward.image_url ?? "/placeholder.png"}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-[15px] leading-[120%] tracking-[-0.02em] text-left font-medium">
                    {reward.name}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="w-full px-4 py-3 flex items-end justify-between shrink-0">
        <button
          disabled={isSaving}
          onClick={() => navigate("/contacts")}
          className="h-14 flex items-center text-[15px] tracking-[-0.02em] text-[#131927] disabled:opacity-30"
        >
          Продолжить без подарка
        </button>

        <button
          disabled={isSaving || selectedRewardId === null}
          onClick={() => handleNext(selectedRewardId!)}
          className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
            shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
            text-[16px] font-semibold text-white flex items-center justify-center
            disabled:opacity-30"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Далее"
          )}
        </button>
      </div>

      {isCopied && <CopiedToast onClose={handleCloseToast} />}
    </div>
  )
}
