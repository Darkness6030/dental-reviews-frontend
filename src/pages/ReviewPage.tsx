import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { generateReviewText, updateReviewText } from "../api"
import { Loader } from "../components/Loader"
import { Switch } from "../components/Switch"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import CancelIcon from "../icons/cancel.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Review, StylePreset } from "../types"

const STYLE_PRESET_OPTIONS: { value: StylePreset; label: string }[] = [
  { value: "friendly", label: "🥰 Дружелюбный" },
  { value: "short", label: "🎯 Короткий" },
  { value: "business", label: "🤝 Деловой" }
]

const getCacheKey = (stylePreset: StylePreset, useEmojis: boolean) => {
  return `${stylePreset}_${useEmojis}`
}

type Context = {
  currentReview: Review
  isReviewLoading: boolean
  reviewText: string
  setReviewText: (text: string) => void
  draftText: string
  setDraftText: (text: string) => void
}

export function ReviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const initializedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    currentReview,
    reviewText,
    setReviewText,
    draftText,
    setDraftText
  } = useOutletContext<Context>()

  const [isEditing, setIsEditing] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)
  const [useEmojis, setUseEmojis] = useState(false)

  const [generationsLeft, setGenerationsLeft] = useState(0)
  const [generationsLimit, setGenerationsLimit] = useState(0)
  const [styleCache, setStyleCache] = useState<Record<string, string>>({})

  const [stylePreset, setStylePreset] = useState<StylePreset>(() => {
    const randomIndex = Math.floor(Math.random() * STYLE_PRESET_OPTIONS.length);
    return STYLE_PRESET_OPTIONS[randomIndex].value;
  });

  const generateMutation = useMutation({
    mutationFn: () => generateReviewText(currentReview.id, stylePreset, useEmojis),
    onSuccess: review => {
      const newText = review.review_text ?? ""
      setReviewText(newText)
      setDraftText(newText)

      const cacheKey = getCacheKey(stylePreset, useEmojis)
      setStyleCache(value => ({ ...value, [cacheKey]: newText }))

      setGenerationsLeft(review.generations_limit - review.generations_spent)
      setGenerationsLimit(review.generations_limit)

      setIsEditing(false)
      queryClient.invalidateQueries()
    }
  })

  const saveEditMutation = useMutation({
    mutationFn: () => updateReviewText(currentReview.id, draftText),
    onSuccess: review => {
      const newText = review.review_text ?? ""
      setReviewText(newText)
      setDraftText(newText)

      const cacheKey = getCacheKey(stylePreset, useEmojis)
      setStyleCache(value => ({ ...value, [cacheKey]: newText }))

      setIsEditing(false)
      queryClient.invalidateQueries()
    }
  })

  useEffect(() => {
    if (initializedRef.current || !currentReview) return;

    const initialText = currentReview.review_text ?? ""
    setReviewText(initialText)
    setDraftText(initialText)

    setGenerationsLeft(currentReview.generations_limit - currentReview.generations_spent)
    setGenerationsLimit(currentReview.generations_limit)

    if (initialText) {
      if (currentReview.last_style_preset) {
        setStylePreset(currentReview.last_style_preset)
      }

      const cacheKey = getCacheKey(currentReview.last_style_preset || stylePreset, useEmojis)
      setStyleCache(value => ({ ...value, [cacheKey]: initialText }))
    } else {
      generateMutation.mutate()
    }

    initializedRef.current = true;
  }, [currentReview])

  useEffect(() => {
    if (!initializedRef.current || !currentReview) return;

    const cachedText = styleCache[getCacheKey(stylePreset, useEmojis)]
    if (cachedText) {
      setReviewText(cachedText)
      setDraftText(cachedText)
      setIsEditing(false)
      return
    }

    generateMutation.mutate()
  }, [stylePreset, useEmojis])

  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const handleScroll = () => {
      setAtTop(element.scrollTop === 0)
      setAtBottom(element.scrollTop + element.clientHeight >= element.scrollHeight - 1)
    }

    handleScroll()
    element.addEventListener("scroll", handleScroll)

    const observer = new ResizeObserver(handleScroll)
    observer.observe(element)

    return () => {
      element.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [reviewText, isEditing])

  const handleSaveEdit = () => {
    if (saveEditMutation.isPending) return
    saveEditMutation.mutate()
  }

  return (
    <div className="flex h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full shrink-0 flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            {isEditing
              ? <>Редактировать<br />отзыв</>
              : generateMutation.isPending ?
                <>Пишем<br />отзыв…</> :
                <>Отзыв<br />сгенерирован</>
            }
          </h1>

          {!isEditing &&
            (generateMutation.isPending ? (
              <Loader />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center p-[6px]">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DAE6DA]">
                  <CheckmarkIcon className="h-8 w-8 text-[#298A2C]" />
                </div>
              </div>
            ))}
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          {isEditing
            ? "Вы можете изменить текст отзыва"
            : generateMutation.isPending
              ? "Чтобы он был интересным и информативным"
              : "Но при желании вы можете его изменить"
          }
        </p>
      </div>

      <div className="mt-4 flex min-h-0 w-full flex-1 px-4">
        <div
          className={`relative flex w-full flex-1 flex-col rounded-[24px] bg-white p-6 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
            ${generateMutation.isPending ? "mb-6" : "overflow-hidden"}`}
        >
          {!isEditing && (
            <>
              <span className="mb-2 text-[13px] font-medium text-[#131927] opacity-60">
                Выберите стиль отзыва
              </span>
              <div className="mb-2 flex gap-1">
                {STYLE_PRESET_OPTIONS.map(option => {
                  const isDisabled = generateMutation.isPending || !generationsLeft
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStylePreset(option.value)}
                      disabled={isDisabled}
                      className={`flex-1 whitespace-nowrap rounded-full px-1.5 py-1.5 text-center text-[11px]
                        ${stylePreset === option.value
                          ? "bg-[#131927] text-white"
                          : "bg-[#F0F0F0]"
                        } ${isDisabled ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#131927] opacity-60">
                  Использовать эмодзи
                </span>

                <Switch
                  checked={useEmojis}
                  handleChange={() => setUseEmojis(value => !value)}
                  disabled={generateMutation.isPending || !generationsLeft}
                />
              </div>
            </>
          )}

          {generateMutation.isPending ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-full w-full animate-pulse flex-col justify-between gap-3">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-full rounded-full bg-gradient-to-r from-[#F8F8F8] via-[#EDEDED] to-[#F8F8F8]
                      ${index % 2 ? "w-40" : ""}`}
                  />
                ))}
              </div>
            </div>
          ) : isEditing ? (
            <textarea
              value={draftText}
              onChange={event => setDraftText(event.target.value)}
              className="h-full w-full resize-none overflow-y-auto text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] outline-none"
            />
          ) : (
            <>
              <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="h-full w-full overflow-y-auto"
                >
                  <p className="text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]">
                    {reviewText}
                  </p>
                </div>
              </div>

              {!atTop && (
                <div className="pointer-events-none absolute top-[5.5rem] left-6 right-6 h-8 bg-gradient-to-b from-white to-transparent" />
              )}

              {!atBottom && (
                <div className="pointer-events-none absolute bottom-14 left-6 right-6 h-12 bg-gradient-to-t from-white to-transparent" />
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex shrink-0 items-center gap-2 opacity-40"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="text-[14px]">
                  Редактировать отзыв
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {!generateMutation.isPending && (
        <div className="flex w-full shrink-0 items-center justify-between px-4 py-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !generationsLeft}
                className={`flex items-center gap-2
                  ${(generateMutation.isPending || !generationsLeft) ? "opacity-20" : ""}`}
              >
                <AIGenerateIcon className="h-5 w-5 text-[#131927]" />
                <span className="text-[15px]">
                  Сгенерировать ещё ({generationsLeft}/{generationsLimit})
                </span>
              </button>

              <button
                onClick={() => navigate("/rewards")}
                className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white"
              >
                Далее
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setDraftText(reviewText)
                  setIsEditing(false)
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
              >
                <CancelIcon className="h-6 w-6" />
              </button>

              <button
                disabled={saveEditMutation.isPending}
                onClick={handleSaveEdit}
                className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white"
              >
                {saveEditMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Сохранить"
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}