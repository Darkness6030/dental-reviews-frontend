import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Loader } from "../components/Loader"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import CancelIcon from "../icons/cancel.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import { generateReviewText, updateReviewText } from "../api"
import { loadReview } from "../utils/storage"

type Context = {
  reviewText: string
  setReviewText: (text: string) => void
  draftText: string
  setDraftText: (text: string) => void
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const {
    reviewText,
    setReviewText,
    draftText,
    setDraftText
  } = useOutletContext<Context>()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!reviewText) {
      handleGenerate()
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const handleScroll = () => {
      setAtTop(element.scrollTop === 0)
      setAtBottom(
        element.scrollTop + element.clientHeight >=
        element.scrollHeight - 1
      )
    }

    handleScroll()
    element.addEventListener("scroll", handleScroll)
    return () => element.removeEventListener("scroll", handleScroll)
  }, [isLoading, isEditing])

  const handleGenerate = async () => {
    setIsLoading(true)
    setIsEditing(false)

    try {
      const review = await loadReview()
      const generated = await generateReviewText(review.id)
      setReviewText(generated.review_text ?? "")
      setDraftText(generated.review_text ?? "")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      const review = await loadReview()
      await updateReviewText(review.id, draftText)
      setReviewText(draftText)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-4 pt-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            {isEditing
              ? <>Редактировать<br />отзыв</>
              : isLoading
                ? <>Пишем<br />отзыв…</>
                : <>Отзыв<br />сгенерирован</>}
          </h1>

          {!isEditing &&
            (isLoading ? (
              <Loader />
            ) : (
              <div className="w-16 h-16 p-[6px] flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full bg-[#DAE6DA] flex items-center justify-center">
                  <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
                </div>
              </div>
            ))}
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          {isEditing
            ? "Вы можете изменить текст отзыва"
            : isLoading
              ? "Чтобы он был интересным и информативным"
              : "Но при желании вы можете его изменить"}
        </p>
      </div>

      <div className="w-full px-4 mt-4 flex flex-1 min-h-0">
        <div
          className={`relative w-full flex flex-col flex-1 rounded-[24px] bg-white p-6
          shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
          ${isLoading ? "mb-6" : "overflow-hidden"}`}
        >
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[313px] h-full flex flex-col justify-between gap-3 animate-pulse">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-full rounded-full bg-gradient-to-r from-[#F8F8F8] via-[#EDEDED] to-[#F8F8F8]
                      ${index % 2 ? "w-[150px]" : ""}`}
                  />
                ))}
              </div>
            </div>
          ) : isEditing ? (
            <textarea
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              className="w-full h-full resize-none outline-none overflow-y-auto
                text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]"
            />
          ) : (
            <>
              <div
                ref={scrollContainerRef}
                className="relative flex-1 min-h-0 h-full overflow-y-auto"
              >
                <p className="text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]  ">
                  {reviewText}
                </p>
              </div>

              {!atTop && (
                <div className="pointer-events-none absolute top-6 left-6 right-6 h-8 bg-gradient-to-b from-white to-transparent" />
              )}

              {!atBottom && (
                <div className="pointer-events-none absolute bottom-14 left-6 right-6 h-12 bg-gradient-to-t from-white to-transparent" />
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex items-center gap-2 opacity-40 shrink-0"
              >
                <PencilIcon className="w-5 h-5" />
                <span className="text-[14px]">Редактировать отзыв</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!isLoading && (
        <div className="w-full px-4 py-3 flex items-center justify-between shrink-0">
          {!isEditing ? (
            <>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2"
              >
                <AIGenerateIcon className="w-5 h-5 text-[#131927]" />
                <span className="text-[15px]">Сгенерировать ещё</span>
              </button>

              <button
                onClick={() => navigate("/rewards")}
                className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
                  text-[16px] font-semibold text-white"
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
                className="w-14 h-14 rounded-full bg-[rgba(213,213,213,0.4)]
                  backdrop-blur-md flex items-center justify-center"
              >
                <CancelIcon className="w-6 h-6" />
              </button>

              <button
                disabled={isSaving}
                onClick={handleSaveEdit}
                className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
                  text-[16px] font-semibold text-white flex items-center justify-center"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
