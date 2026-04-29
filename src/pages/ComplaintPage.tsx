import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { createComplaint, getOwner, getReasons } from "../api"
import { Loader } from "../components/Loader"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import type { Reason, User } from "../types"
import { formatPhone } from "../utils/phone"

type Context = {
  contactName: string
  setContactName: (name: string) => void
  contactPhone: string
  setContactPhone: (phone: string) => void
  complaintText: string
  setComplaintText: (text: string) => void
  selectedReasonIds: number[]
  setSelectedReasonIds: (ids: number[]) => void
}

function ComplaintReasons() {
  const { selectedReasonIds, setSelectedReasonIds } = useOutletContext<Context>()

  const { data: reasons } = useSuspenseQuery<Reason[]>({
    queryKey: ["reasons"],
    queryFn: getReasons,
  })

  const toggleReasonId = (reasonId: number) => {
    setSelectedReasonIds(
      selectedReasonIds.includes(reasonId)
        ? selectedReasonIds.filter(id => id !== reasonId)
        : [...selectedReasonIds, reasonId]
    )
  }

  return (
    <div className="flex gap-[6px] overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
      {reasons
        .filter(reason => reason.is_enabled)
        .map(reason => {
          const isSelected = selectedReasonIds.includes(reason.id)
          return (
            <button
              key={reason.id}
              onClick={() => toggleReasonId(reason.id)}
              className={`h-12 shrink-0 rounded-[16px] px-5 text-[15px] leading-[18px] tracking-[-0.02em]
                ${isSelected ? "bg-[#131927] text-white" : "bg-white text-[#131927]"}`}
            >
              {reason.name}
            </button>
          )
        })}
    </div>
  )
}

export function ComplaintPage() {
  const navigate = useNavigate()
  const {
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    complaintText,
    setComplaintText,
    selectedReasonIds,
  } = useOutletContext<Context>()

  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data: owner } = useQuery<User | null>({
    queryKey: ["owner"],
    queryFn: getOwner,
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: () =>
      createComplaint(
        isAnonymous ? "" : contactName,
        isAnonymous ? "" : contactPhone,
        complaintText,
        selectedReasonIds
      ),
    onSuccess: () => setIsSubmitted(true),
  })

  const isPhoneCompleted = /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)
  const canSubmit =
    complaintText.trim().length > 0 &&
    (isAnonymous || (contactName.trim().length > 0 && isPhoneCompleted))

  const handleSubmit = () => {
    if (!canSubmit || mutation.isPending) return
    mutation.mutate()
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-full justify-center bg-[#F5F5F5]">
        <div className="flex w-full flex-col justify-center gap-3 px-4">
          <div className="flex w-full items-start gap-3">
            <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
              Спасибо за<br />обращение
            </h1>
            <div className="flex w-16 h-16 items-center justify-center shrink-0">
              <div className="flex w-[52px] h-[52px] items-center justify-center rounded-full bg-[#DAE6DA]">
                <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
              </div>
            </div>
          </div>
          <p className="text-[14px] font-medium leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
            Мы рассмотрим ваше обращение и свяжемся с вами в ближайшее время
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="w-full rounded-b-[32px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Напишите<br />директору
          </h1>
          <p className="text-[14px] font-medium leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
            Расскажите, что вам не понравилось и мы обязательно исправим недостатки. Ваше обращение придет мне на личную почту и я незамедлительно начну изучать вашу обратную связь
          </p>
          {owner && (
            <div className="flex items-center gap-3 rounded-[24px] bg-[#F2F2F2] p-1">
              <img
                src={owner.avatar_url || "/placeholder.png"}
                alt="Руководитель"
                className="w-16 aspect-square shrink-0 rounded-[20px] object-cover"
              />
              <div className="flex flex-col justify-center gap-[2px] overflow-hidden">
                <span className="text-[15px] font-medium leading-[18px] tracking-[-0.02em] text-[#191919]">
                  {owner.name}
                </span>
                <span className="text-[12px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
                  Руководитель DENTAL DAILY
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-6 p-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
            Укажите, что вам не понравилось?
          </h2>
          <Suspense
            fallback={
              <div className="flex w-full min-h-[56px] items-center justify-center">
                <Loader />
              </div>
            }
          >
            <ComplaintReasons />
          </Suspense>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
            Опишите пожалуйста подробнее
          </h2>
          <textarea
            value={complaintText}
            onChange={event => setComplaintText(event.target.value)}
            placeholder="Обращение к руководству..."
            className="min-h-[200px] w-full resize-none rounded-[16px] bg-white p-4 text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] placeholder:opacity-40 outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
            Введите имя и номер телефона, для обратной связи с вами
          </h2>
          <input
            value={contactName}
            onChange={event => setContactName(event.target.value)}
            placeholder="Ваше имя"
            disabled={isAnonymous}
            className="w-full h-14 rounded-[16px] bg-white px-4 text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] placeholder:opacity-40 outline-none disabled:opacity-40"
          />
          <input
            value={contactPhone}
            onFocus={() => {
              if (!isAnonymous && !contactPhone) setContactPhone("+7")
            }}
            onChange={event => setContactPhone(formatPhone(event.target.value))}
            onKeyDown={event => {
              if (event.key === "Backspace" && contactPhone === "+7") {
                event.preventDefault()
              }
            }}
            onBlur={() => {
              if (contactPhone === "+7") setContactPhone("")
            }}
            placeholder="Номер телефона"
            disabled={isAnonymous}
            className="w-full h-14 rounded-[16px] bg-white px-4 text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] placeholder:opacity-40 outline-none disabled:opacity-40"
          />
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="sr-only"
            />
            <div
              className={`flex w-6 h-6 shrink-0 items-center justify-center rounded-[6px] border
                ${isAnonymous ? "border-[#F39416] bg-[#F39416]" : "border-[rgba(19,25,39,0.16)] bg-white"}`}
            >
              {isAnonymous && <CheckmarkIcon className="w-4 h-4 text-white" />}
            </div>
            <span className="text-[14px] font-medium leading-[120%] tracking-[-0.02em] text-[#131927]">
              Отправить анонимно
            </span>
          </label>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>
        <button
          disabled={!canSubmit || mutation.isPending}
          onClick={handleSubmit}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white disabled:opacity-30"
        >
          {mutation.isPending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Отправить"
          )}
        </button>
      </div>
    </div>
  )
}