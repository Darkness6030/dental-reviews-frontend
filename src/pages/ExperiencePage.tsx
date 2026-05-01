import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { setReviewGender, updateReviewExperience } from "../api"
import { Loader } from "../components/Loader"
import { PoetryIndex } from "../components/PoetryIndex"
import { StepProgress } from "../components/StepProgress"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Review } from "../types"
import { calculateWordsRate } from "../utils/words"

const GENDER_OPTIONS = [
  {
    key: "male",
    label: "🧔🏻 Мужчина",
  },
  {
    key: "female",
    label: "👩🏼 Женщина",
  },
]

type Context = {
  currentReview: Review
  isReviewLoading: boolean
  experienceText: string
  setExperienceText: (text: string) => void
}

export function ExperiencePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const indexRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    currentReview,
    isReviewLoading,
    experienceText,
    setExperienceText
  } = useOutletContext<Context>()

  const [isSelectingGender, setIsSelectingGender] = useState(false)
  const [selectedGender, setSelectedGender] = useState<string | null>(null)

  useEffect(() => {
    if (!currentReview) return
    setExperienceText(currentReview.experience_text ?? "")
  }, [currentReview])

  const experienceMutation = useMutation({
    mutationFn: () => updateReviewExperience(currentReview.id, experienceText),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/review")
    }
  })

  const genderMutation = useMutation({
    mutationFn: async (gender: string) => {
      setSelectedGender(gender)
      await setReviewGender(currentReview.id, gender)
      return updateReviewExperience(currentReview.id, experienceText)
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/review")
    }
  })

  const handleFocus = () => {
    setTimeout(() => {
      indexRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 500)
  }

  const wordsRate = useMemo(() => calculateWordsRate(experienceText, 30), [experienceText])
  const easedRate = wordsRate + (Math.sqrt(wordsRate) - wordsRate) * Math.pow(1 - wordsRate, 3)

  const arrowAngle = -120 + easedRate * 240
  const isGreenZone = easedRate > 0.55

  const handleGenerate = () => {
    if (experienceMutation.isPending || genderMutation.isPending) return

    if (!currentReview.selected_gender) {
      setIsSelectingGender(true)
      return
    }

    experienceMutation.mutate()
  }

  const handleSelectGender = (gender: string) => {
    if (genderMutation.isPending) return
    genderMutation.mutate(gender)
  }

  const isSaving = experienceMutation.isPending || genderMutation.isPending

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Опишите свой<br />опыт
          </h1>

          <StepProgress current={5} total={6} />
        </div>

        <div className="flex flex-col text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927]">
          <span>Напишите краткий отзыв, расскажите:</span>
          <ul className="list-disc pl-5 opacity-40">
            <li>почему выбрали Дентал Дейли</li>
            <li>какая была проблема</li>
            <li>общее впечатление от клиники и врача</li>
            <li>соответствовал ли приём ожиданиям</li>
            <li>помогло ли вам лечение</li>
            <li>порекомендуете ли близким</li>
          </ul>
        </div>
      </div>

      <div ref={indexRef} className="mt-4 w-full px-4">
        <PoetryIndex arrowAngle={arrowAngle} isGreenZone={isGreenZone} />
      </div>

      <div className="mt-4 mb-2 w-full flex-1 px-4 flex">
        <div className="relative flex flex-1 flex-col rounded-[24px] bg-white p-4 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
          {isReviewLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            <textarea
              ref={scrollRef}
              value={experienceText}
              onChange={event => setExperienceText(event.target.value)}
              onFocus={handleFocus}
              className="flex-1 w-full resize-none text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] outline-none"
              placeholder="Ваши впечатления от лечения..."
            />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={isSaving}
          onClick={handleGenerate}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {isSaving ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <AIGenerateIcon className="w-5 h-5" />
              Сгенерировать отзыв
            </>
          )}
        </button>
      </div>

      {isSelectingGender && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 px-4 pb-3">
          <div className="w-full">
            <div className="w-full rounded-[20px] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
              <div className="text-[14px] font-medium mb-3 text-center">
                Уточните, от какого лица пишем отзыв
              </div>

              <div className="flex gap-3">
                {GENDER_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    disabled={genderMutation.isPending}
                    onClick={() => handleSelectGender(option.key)}
                    className="flex-1 h-12 rounded-full bg-[#F2F2F2] text-[14px] flex items-center justify-center font-medium"
                  >
                    {genderMutation.isPending && selectedGender === option.key ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    ) : (
                      option.label
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}