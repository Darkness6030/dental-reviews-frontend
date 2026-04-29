import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { getRewards, setReviewReward } from "../api"
import { Loader } from "../components/Loader"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopiedIcon from "../icons/copied.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Review, Reward } from "../types"

type Context = {
  currentReview: Review
  isReviewLoading: boolean
  reviewText: string
  setReviewText: (text: string) => void
  selectedRewardId: number | null
  setSelectedRewardId: (id: number) => void
  isCopied: boolean
  setIsCopied: (value: boolean) => void
}

function RewardsList() {
  const { selectedRewardId, setSelectedRewardId } = useOutletContext<Context>()

  const { data: rewards } = useSuspenseQuery<Reward[]>({
    queryKey: ["rewards"],
    queryFn: getRewards,
  })

  const enabledRewards = rewards.filter(reward => reward.is_enabled)
  return (
    <div className="mt-6 flex w-full flex-1 min-h-0 flex-col">
      <h2 className="text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
        Выберите подарок<br />за публикацию отзыва
      </h2>

      {enabledRewards.length > 0 && (
        <p className="mt-3 text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Можно выбрать 1 из {enabledRewards.length} вариантов
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {enabledRewards.map(reward => {
          const isSelected = selectedRewardId === reward.id
          return (
            <button
              key={reward.id}
              onClick={() => setSelectedRewardId(reward.id)}
              className={`flex min-h-[72px] w-full items-center gap-3 rounded-[24px] p-1 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
                ${isSelected ? "bg-[#131927] text-white" : "bg-white text-[#191919]"}`}
            >
              <div className="flex w-16 h-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[#F2F2F2]">
                <img
                  src={reward.image_url ?? "/placeholder.png"}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-left text-[15px] font-medium leading-[120%] tracking-[-0.02em]">
                {reward.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function RewardsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    currentReview,
    isReviewLoading,
    reviewText,
    setReviewText,
    selectedRewardId,
    isCopied,
    setIsCopied
  } = useOutletContext<Context>()

  useEffect(() => {
    if (!currentReview) return
    setReviewText(currentReview.review_text ?? "")
  }, [currentReview])

  const mutation = useMutation({
    mutationFn: (rewardId: number) => setReviewReward(currentReview.id, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/contacts")
    }
  })

  const handleCopyReview = async () => {
    await navigator.clipboard.writeText(reviewText)
    setIsCopied(true)
  }

  const handleNext = () => {
    if (mutation.isPending || selectedRewardId === null) return
    mutation.mutate(selectedRewardId)
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4 shrink-0">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Отзыв<br />сгенерирован
          </h1>

          <div className="flex w-16 h-16 items-center justify-center p-[6px]">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DAE6DA]">
              <CheckmarkIcon className="h-8 w-8 text-[#298A2C]" />
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Но при желании вы можете его изменить
        </p>
      </div>

      <div className="mt-4 w-full px-4 shrink-0">
        <div className="flex min-h-[104px] items-center justify-center gap-2 rounded-[24px] bg-white p-1 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
          {isReviewLoading ? (
            <Loader />
          ) : (
            <>
              <div className="flex-1 overflow-hidden px-3 py-2">
                <p className="line-clamp-4 text-[14px] leading-[140%] tracking-[-0.02em] text-[#131927] opacity-80">
                  {reviewText}
                </p>
              </div>

              <div className="flex w-12 flex-col shrink-0">
                <button
                  onClick={() => navigate("/review")}
                  className="flex w-12 h-12 items-center justify-center rounded-t-[20px] border-b border-white bg-[#EEEEEE]"
                >
                  <PencilIcon className="w-[18px] h-[18px]" />
                </button>

                <button
                  onClick={handleCopyReview}
                  className="flex w-12 h-12 items-center justify-center rounded-b-[20px] bg-[#EEEEEE]"
                >
                  <CopyIcon className="w-[18px] h-[18px]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex w-full items-center gap-2 px-4 justify-start h-6">
        {isCopied ? (
          <>
            <CopiedIcon className="w-6 h-6" />
            <span className="text-[13px] font-medium leading-[120%] tracking-[-0.02em] text-[#F39416]">
              Отзыв скопирован
            </span>
          </>
        ) : (
          <span className="text-[13px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
            Не забудьте скопировать готовый отзыв ⬆️
          </span>
        )}
      </div>

      <div className="mt-0 w-full flex-1 overflow-y-auto px-4">
        <Suspense
          fallback={
            <div className="flex min-h-[120px] w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          <RewardsList />
        </Suspense>
      </div>

      <div className="flex w-full items-end justify-between px-4 py-3 shrink-0">
        <button
          disabled={mutation.isPending}
          onClick={() => {
            queryClient.invalidateQueries()
            navigate("/platforms")
          }}
          className="flex h-14 items-center text-[15px] tracking-[-0.02em] text-[#131927] disabled:opacity-30"
        >
          Продолжить без подарка
        </button>

        <button
          disabled={mutation.isPending || selectedRewardId === null}
          onClick={handleNext}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {mutation.isPending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Далее"
          )}
        </button>
      </div>
    </div>
  )
}