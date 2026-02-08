import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Loader } from "../components/Loader"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import type { User, Reason } from "../types"
import { createComplaint, getOwner, getReasons } from "../utils/api"
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

export default function ComplaintPage() {
  const navigate = useNavigate()
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    complaintText,
    setComplaintText,
    selectedReasonIds,
    setSelectedReasonIds,
  } = useOutletContext<Context>()

  const [owner, setOwner] = useState<User | null>(null)
  const [reasons, setReasons] = useState<Reason[]>([])

  useEffect(() => {
    getOwner()
      .then(setOwner)
      .catch(() => setOwner(null))
      .finally(() => {
        getReasons()
          .then(setReasons)
          .finally(() => setIsLoading(false));
      });
  }, []);

  const toggleReasonId = (reasonId: number) => {
    setSelectedReasonIds(
      selectedReasonIds.includes(reasonId)
        ? selectedReasonIds.filter(id => id !== reasonId)
        : [...selectedReasonIds, reasonId]
    )
  }

  const isPhoneCompleted =
    /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)

  const canSubmit =
    complaintText.trim() &&
    (isAnonymous || (contactName.trim() && isPhoneCompleted))

  const handleSubmit = async () => {
    if (!canSubmit || isSaving) return

    try {
      setIsSaving(true)
      await createComplaint(
        isAnonymous ? "" : contactName,
        isAnonymous ? "" : contactPhone,
        complaintText,
        selectedReasonIds
      )
      setIsSubmitted(true)
    } finally {
      setIsSaving(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
        <div className="w-full px-4 flex flex-col justify-center gap-3">
          <div className="flex items-start gap-3">
            <h1 className="text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927] flex-1">
              Спасибо за<br />обращение
            </h1>

            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <div className="w-[52px] h-[52px] rounded-full bg-[#DAE6DA] flex items-center justify-center">
                <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
              </div>
            </div>
          </div>

          <p className="text-[14px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
            Мы рассмотрим ваше обращение и свяжемся с вами в ближайшее время
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div
        className="w-full bg-white rounded-b-[32px]
        shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]"
      >
        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Напишите<br />директору
          </h1>

          <p className="text-[14px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
            Расскажите, что вам не понравилось и мы обязательно исправим
            недостатки. Ваше обращение придет мне на личную почту и я
            незамедлительно начну изучать вашу обратную связь
          </p>

          {owner && (
            <div className="flex items-center gap-3 p-1 bg-[#F2F2F2] rounded-[24px]">
              <img
                src={owner.avatar_url || "/placeholder.png"}
                alt="Руководитель"
                className="w-16 aspect-square rounded-[20px] object-cover shrink-0"
              />
              <div className="flex flex-col justify-center gap-[2px] overflow-hidden">
                <span className="text-[15px] leading-[18px] font-medium tracking-[-0.02em] text-[#191919]">
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

      <div className="w-full p-4 flex flex-col gap-8 flex-1">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] leading-[110%] font-semibold tracking-[-0.02em] text-[#131927]">
            Укажите, что вам не понравилось?
          </h2>

          <div
            className="flex gap-[6px] overflow-x-auto whitespace-nowrap
              drop-shadow-[0_0_4px_rgba(0,0,0,0.04)]
              drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]
              [-ms-overflow-style:none] [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden"
          >
            {isLoading ? (
              <div className="w-full min-h-[56px] flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              reasons.filter(reason => reason.is_enabled).map(reason => {
                const isSelected = selectedReasonIds.includes(reason.id)
                return (
                  <button
                    key={reason.id}
                    onClick={() => toggleReasonId(reason.id)}
                    className={`h-12 px-5 rounded-[16px] shrink-0
                      text-[15px] leading-[18px] font-normal tracking-[-0.02em]
                      ${isSelected
                        ? "bg-[#131927] text-white"
                        : "bg-white text-[#131927]"
                      }`}
                  >
                    {reason.name}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] leading-[110%] font-semibold tracking-[-0.02em] text-[#131927]">
            Опишите пожалуйста подробнее
          </h2>

          <textarea
            value={complaintText}
            onChange={event => setComplaintText(event.target.value)}
            placeholder="Обращение к руководству..."
            className="w-full min-h-[200px] p-4 bg-white rounded-[16px]
              text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]
              placeholder:opacity-40 resize-none outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] leading-[110%] font-semibold tracking-[-0.02em] text-[#131927]">
            Введите имя и номер телефона, для обратной связи с вами
          </h2>

          <input
            value={contactName}
            onChange={event => setContactName(event.target.value)}
            placeholder="Ваше имя"
            disabled={isAnonymous}
            className="h-14 px-4 bg-white rounded-[16px]
              text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]
              placeholder:opacity-40 outline-none disabled:opacity-40"
          />

          <input
            value={contactPhone}
            onFocus={() => {
              if (!isAnonymous && !contactPhone) {
                setContactPhone("+7")
              }
            }}
            onChange={event => {
              setContactPhone(formatPhone(event.target.value))
            }}
            onKeyDown={event => {
              if (event.key === "Backspace" && contactPhone === "+7") {
                event.preventDefault()
              }
            }}
            onBlur={() => {
              if (contactPhone === "+7") {
                setContactPhone("")
              }
            }}
            placeholder="Номер телефона"
            disabled={isAnonymous}
            className="h-14 px-4 bg-white rounded-[16px]
              text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]
              placeholder:opacity-40 outline-none disabled:opacity-40"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="sr-only"
            />

            <div
              className={`w-6 h-6 rounded-[6px] border flex items-center justify-center shrink-0
                ${isAnonymous
                  ? "bg-[#F39416] border-[#F39416]"
                  : "bg-white border-[rgba(19,25,39,0.16)]"
                }`}
            >
              {isAnonymous && (
                <CheckmarkIcon className="w-4 h-4 text-white" />
              )}
            </div>

            <span className="text-[14px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927]">
              Отправить анонимно
            </span>
          </label>
        </div>
      </div>

      <div className="w-full px-4 py-3 flex justify-between items-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 rounded-full
            bg-[rgba(213,213,213,0.4)]
            backdrop-blur-md
            flex items-center justify-center"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="h-14 px-6 rounded-full
            bg-gradient-to-r from-[#F39416] to-[#F33716]
            text-white font-semibold text-[16px] tracking-[-0.02em]
            disabled:opacity-30"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Отправить"
          )}
        </button>
      </div>
    </div>
  )
}
