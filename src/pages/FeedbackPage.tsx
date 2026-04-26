import { useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import type { Feedback } from "../types"
import { clearReviewId } from "../utils/storage"

export type Context = {
  feedback: Feedback
  setFeedback: (feedback: Feedback) => void
}

const FEEDBACK_OPTIONS = [
  {
    value: true,
    name: "Есть претензия",
    image_url: "/have_complaint.png"
  },
  {
    value: false,
    name: "Все отлично",
    image_url: "/everything_fine.png"
  }
]

export function FeedbackPage() {
  const navigate = useNavigate()
  const { feedback, setFeedback } = useOutletContext<Context>()

  useEffect(() => {
    clearReviewId()
  }, [])

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col items-center gap-6 px-6 pt-6">
        <img src="/logo.png" alt="Dental Daily Logo" className="h-6" />

        <h1 className="max-w-[329px] text-center text-[clamp(28px,8vw,38px)] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
          Поделитесь своим опытом лечения
        </h1>

        <p className="max-w-[329px] text-center text-[14px] leading-[130%] tracking-[-0.02em] text-[#131927] opacity-60">
          Оцените качество работы докторов и сервис клиники Dental Daily
        </p>
      </div>

      <div className="mt-6 flex w-full flex-1 flex-col gap-8 rounded-t-[40px] px-4 pt-8 pb-3">
        <div className="grid w-full grid-cols-2 gap-[5px] drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {FEEDBACK_OPTIONS.map(option => (
            <button
              key={option.name}
              onClick={() => setFeedback(option.value)}
              className={`flex aspect-[178/220] w-full flex-col items-center justify-between rounded-[48px] bg-white p-4 border-[4px] ${feedback === option.value ? "border-[#131927]" : "border-transparent"}`}
            >
              <div className="flex w-full flex-1 items-center justify-center">
                <img
                  src={option.image_url}
                  alt={option.name}
                  className="aspect-square max-w-[130px] object-contain"
                />
              </div>

              <div className="flex min-h-[34px] w-full items-center justify-center">
                <span className="text-[12px] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
                  {option.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            disabled={feedback === null}
            onClick={() => {
              if (feedback === true) navigate("/complaint")
              if (feedback === false) navigate("/doctors")
            }}
            className="h-14 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
          >
            Далее
          </button>

          <div className="flex items-center gap-2 opacity-40">
            <AIGenerateIcon className="w-[26px] h-[26px] shrink-0" />
            <p className="text-[11px] leading-[120%] tracking-[-0.02em] text-[#131927]">
              На основании Ваших ответов мы поможем написать отзыв с помощью искусственного интеллекта
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}