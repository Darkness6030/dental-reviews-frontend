import { useEffect, useRef, useState, useMemo } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { updateReviewExperience } from "../api"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import { loadReview } from "../utils/storage"
import { calculateWordsRate } from "../utils/words"

type Context = {
  experienceText: string
  setExperienceText: (text: string) => void
}

export default function ExperiencePage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLTextAreaElement | null>(null)

  const { experienceText, setExperienceText } =
    useOutletContext<Context>()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (experienceText) {
      setIsLoading(false)
      return
    }

    const loadExperienceText = async () => {
      try {
        const review = await loadReview()
        if (review.experience_text) {
          setExperienceText(review.experience_text)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadExperienceText()
  }, [])

  const wordsRate = useMemo(() => calculateWordsRate(experienceText, 50), [experienceText]);
  const arrowAngle = -120 + wordsRate * 240;

  const handleGenerate = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const review = await loadReview()
      await updateReviewExperience(review.id, experienceText)
      navigate("/review")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
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

      <div className="mt-4 w-full px-4">
        <div className="relative flex items-center gap-4 rounded-[16px] bg-white p-4 shadow-[4px_20px_40px_rgba(0,0,0,0.03)]">

          <div className="flex flex-col items-center justify-start w-[90px]">
            <div className="relative w-[72px] h-[72px] flex items-center justify-center">
              <div
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from 230deg, #9AA3B2 0%, #F39416 22%, #2DBE60 44%, #14532D 66%, #14532D 100%)`,
                  WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M 12 50 A 28 28 0 1 1 60 50" fill="none" stroke="black" stroke-width="8" stroke-linecap="round" /></svg>')`,
                  maskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M 12 50 A 28 28 0 1 1 60 50" fill="none" stroke="black" stroke-width="8" stroke-linecap="round" /></svg>')`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                }}
              />

              <div className="text-[28px] z-10">🚀</div>

              <div
                className="absolute flex items-center justify-center z-20"
                style={{
                  transform: `rotate(${arrowAngle}deg) translateY(-28px) rotate(180deg)`,
                  transformOrigin: "center",
                  transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" // Плавный отскок (back-out)
                }}
              >
                <svg width="16" height="16" viewBox="0 0 100 100" className="fill-black">
                  <path d="M50 87.5H24a10 10 0 0 1-8.65-15l13-22.5 13-22.52a10 10 0 0 1 17.3 0l13 22.52 13 22.52A10 10 0 0 1 76 87.5Z" />
                </svg>
              </div>
            </div>

            <div className="text-[9px] leading-[120%] tracking-[-0.02em] text-black text-center">
              Индекс пользы<br />и поэтичности
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[12px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927]">
              Чем подробнее вы опишете, тем полезнее ваш отзыв будет для других
            </div>
            <div className="text-[12px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
              Кстати, каждый месяц мы проводим конкурс на самый поэтичный отзыв.
              Победителю вручаем персональный подарок от руководства клиники 😊
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 w-full flex-1 px-4 flex">
        <div className="relative flex flex-1 flex-col rounded-[24px] bg-white p-4 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            <textarea
              ref={scrollRef}
              value={experienceText}
              onChange={event => setExperienceText(event.target.value)}
              className="flex-1 w-full resize-none text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] outline-none"
              placeholder="Ваши впечатления от лечения..."
            />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full items-center justify-between bg-[#F5F5F5] px-4 py-3">
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
    </div>
  )
}