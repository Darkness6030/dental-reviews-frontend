import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useEffect } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { createReview, getDoctorById } from "../api"
import { Loader } from "../components/Loader"
import AIGenerateIcon from "../icons/ai_generate.svg?react"
import type { Feedback } from "../types"
import { setReviewId } from "../utils/storage"

export type Context = {
  feedback: Feedback
  setFeedback: (feedback: Feedback) => void
}

const FEEDBACK_OPTIONS = [
  {
    value: false,
    text: "Есть претензия",
    image_url: "/have_complaint.png"
  },
  {
    value: true,
    text: "Все отлично",
    image_url: "/everything_fine.png"
  }
]

function DoctorCard({ doctorId }: { doctorId: number }) {
  const { setFeedback } = useOutletContext<Context>()

  const { data: doctor } = useSuspenseQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
  })

  useEffect(() => {
    if (doctor) {
      setFeedback(true)
    }
  }, [doctor])

  return (
    <div className="mx-auto flex w-full max-w-[361px] flex-col items-center gap-4 rounded-[16px] bg-white p-6 shadow-[4px_20px_40px_rgba(0,0,0,0.03)]">
      <div className="h-[151px] w-[151px] overflow-hidden rounded-[50px] bg-[#F5F5F5]">
        <img
          src={doctor.avatar_url}
          alt={doctor.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#131927]">
          {doctor.name}
        </h3>
        <p className="text-[14px] leading-[130%] text-[#131927] opacity-40">
          {doctor.role}
        </p>
      </div>
    </div>
  )
}

export function FeedbackPage() {
  const params = useParams<{ doctorId?: string }>()
  const doctorId = params.doctorId ? Number(params.doctorId) : undefined

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    feedback,
    setFeedback
  } = useOutletContext<Context>()

  const mutation = useMutation({
    mutationFn: (doctorId?: number) => createReview(doctorId),
    onSuccess: (review) => {
      setReviewId(review.id)
      queryClient.invalidateQueries()
      navigate(doctorId ? "/services" : "/doctors")
    }
  })

  const handleNext = () => {
    if (mutation.isPending) return

    if (feedback === true) {
      mutation.mutate(doctorId)
    }

    if (feedback === false) {
      navigate("/complaint")
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-auto">
        <div className="flex w-full flex-col items-center gap-6 bg-white px-8 pt-6 pb-8 rounded-b-[32px] shrink-0 overflow-hidden shadow-[0px_0px_4px_rgba(0,0,0,0.04),_0px_4px_8px_rgba(0,0,0,0.06)]">
          <img src="/logo.png" alt="Dental Daily Logo" className="h-6" />

          <h1 className="max-w-[329px] text-center text-[38px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            {doctorId ? "Скажите доктору спасибо" : "Поделитесь своим опытом лечения"}
          </h1>

          <p className="max-w-[329px] text-center text-[14px] leading-[130%] tracking-[-0.02em] text-[#131927] opacity-60">
            {doctorId
              ? "Создайте и опубликуйте отзыв о враче и получите в благодарность подарок на выбор"
              : "Оцените качество работы докторов и сервис клиники Dental Daily"
            }
          </p>
        </div>

        <div className="flex w-full flex-1 flex-col justify-center gap-8 rounded-t-[40px] px-4 pt-4 pb-6">
          {doctorId ? (
            <Suspense
              fallback={
                <div className="flex justify-center py-10">
                  <Loader />
                </div>
              }
            >
              <DoctorCard doctorId={doctorId} />
            </Suspense>
          ) : (
            <div className="mx-auto flex w-full max-w-[500px] items-center justify-center gap-[1.5vw] drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
              {FEEDBACK_OPTIONS.map(option => (
                <button
                  key={option.text}
                  onClick={() => setFeedback(option.value)}
                  className={`flex aspect-[178/220] flex-1 flex-col items-center justify-between rounded-[48px] bg-white p-4 transition-all duration-200
                    ${feedback === option.value ? "border-[4px] border-[#131927]" : "border-[4px] border-transparent"}`}
                >
                  <div className="flex w-full flex-1 items-center justify-center overflow-hidden">
                    <img
                      src={option.image_url}
                      alt={option.text}
                      className="h-full max-h-[130px] w-full max-w-[130px] object-contain transition-transform duration-300"
                      style={{ transform: feedback === option.value ? 'scale(1.05)' : 'scale(1)' }}
                    />
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <span className="text-center text-[12px] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full flex-col gap-4 px-4 pt-3 pb-6">
        <button
          disabled={feedback === null || mutation.isPending}
          onClick={handleNext}
          className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {mutation.isPending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Далее"
          )}
        </button>

        <div className="flex items-center gap-2 opacity-40">
          <AIGenerateIcon className="w-[26px] h-[26px] shrink-0" />
          <p className="text-[11px] leading-[120%] tracking-[-0.02em] text-[#131927]">
            На основании Ваших ответов мы поможем написать отзыв с помощью искусственного интеллекта
          </p>
        </div>
      </div>
    </div>
  )
}