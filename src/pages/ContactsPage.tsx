import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { setReviewContacts } from "../api"
import { Loader } from "../components/Loader"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopiedIcon from "../icons/copied.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Reward } from "../types"
import { formatPhone } from "../utils/phone"
import { loadReview } from "../utils/storage"

type Context = {
  contactName: string
  setContactName: (name: string) => void
  contactPhone: string
  setContactPhone: (phone: string) => void
  isCopied: boolean
  setIsCopied: (value: boolean) => void
}

export function ContactsPage() {
  const navigate = useNavigate()
  const {
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    isCopied,
    setIsCopied
  } = useOutletContext<Context>()

  const [reviewText, setReviewText] = useState("")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  const [isEditingName, setIsEditingName] = useState(true)
  const [isEditingPhone, setIsEditingPhone] = useState(true)
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const isPhoneCompleted = /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)

  useEffect(() => {
    if (reviewText && selectedReward) return

    const loadReviewData = async () => {
      try {
        const review = await loadReview()
        if (review.review_text) {
          setReviewText(review.review_text)
        }

        setSelectedReward(review.selected_reward ?? null)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviewData()
  }, [])

  const handleCopyReview = async () => {
    await navigator.clipboard.writeText(reviewText)
    setIsCopied(true)
  }

  const handleNext = async () => {
    if (isSaving || !isPhoneCompleted) return
    setIsSaving(true)

    try {
      const review = await loadReview()
      await setReviewContacts(review.id, contactName, contactPhone)
      navigate("/platforms")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4 shrink-0">
        <div className="flex w-full items-start gap-3">
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
        <div className="flex gap-2 rounded-[24px] bg-white p-1 shadow-[0_0_4px_rgba(0,0,0,0.04)]">
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

      <div className="flex flex-1 flex-col">
        <div className="mt-6 flex w-full flex-col gap-2 px-4">
          <h2 className="text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
            Вы выбрали
          </h2>

          {isLoading ? (
            <div className="flex min-h-[72px] w-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            selectedReward && (
              <div className="flex min-h-[72px] w-full items-center gap-3 rounded-[24px] bg-[#131927] p-1 text-white shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
                <div className="flex w-16 h-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[#F2F2F2]">
                  <img
                    src={selectedReward.image_url ?? "/placeholder.png"}
                    alt={selectedReward.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-left text-[15px] font-medium leading-[120%] tracking-[-0.02em]">
                  {selectedReward.name}
                </span>
              </div>
            )
          )}
        </div>

        <div className="mt-6 flex w-full flex-col gap-4 px-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
              Закрепите подарок за собой
            </h2>

            <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
              Введите имя и номер телефона, чтобы мы смогли вас идентифицировать
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex h-[70px] w-full items-center rounded-[24px] bg-white p-1">
              <div className="flex w-full flex-col justify-center px-3">
                {isEditingName ? (
                  <input
                    autoFocus
                    value={contactName}
                    onChange={event => setContactName(event.target.value)}
                    onBlur={() => {
                      if (contactName) {
                        setIsEditingName(false)
                        setIsPhoneVisible(true)
                        setIsEditingPhone(true)
                      }
                    }}
                    onKeyDown={event => {
                      if (event.key === "Enter" && contactName) {
                        event.currentTarget.blur()
                      }
                    }}
                    placeholder="Ваше имя"
                    className="w-full bg-transparent text-[30px] leading-[36px] tracking-[-0.02em] text-[#131927] outline-none placeholder:text-[#131927]/30"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[30px] leading-[36px] tracking-[-0.02em] text-[#131927]">
                      {contactName}
                    </span>

                    <button onClick={() => setIsEditingName(true)}>
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isPhoneVisible && (
              <>
                <div className="flex h-[70px] w-full items-center rounded-[24px] bg-white p-1">
                  <div className="flex w-full flex-col justify-center px-3">
                    {isEditingPhone ? (
                      <input
                        autoFocus
                        value={contactPhone}
                        onFocus={() => {
                          if (!contactPhone) setContactPhone("+7")
                        }}
                        onChange={event =>
                          setContactPhone(formatPhone(event.target.value))
                        }
                        onKeyDown={event => {
                          if (event.key === "Backspace" && contactPhone === "+7") {
                            event.preventDefault()
                          }

                          if (event.key === "Enter" && contactPhone.length > 2) {
                            event.currentTarget.blur()
                          }
                        }}
                        onBlur={() => {
                          if (contactPhone === "+7") {
                            setContactPhone("")
                          } else {
                            setIsEditingPhone(false)
                          }
                        }}
                        placeholder="+7 ___ ___ __ __"
                        className="w-full bg-transparent text-[30px] leading-[36px] tracking-[-0.02em] text-[#131927] outline-none placeholder:text-[#131927]/30"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[30px] leading-[36px] tracking-[-0.02em] text-[#131927]">
                          {contactPhone}
                        </span>

                        <button onClick={() => setIsEditingPhone(true)}>
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
                  Мы никому не передадим ваш номер. Он необходим исключительно для внутренней системы закрепления подарка 😊
                </p>
              </>
            )}

            <p className="text-[10px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
              Нажимая «Далее», вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-end justify-between px-4 py-3 shrink-0">
        <button
          disabled={isSaving}
          onClick={() => navigate("/platforms")}
          className="flex h-14 items-center text-[15px] tracking-[-0.02em] text-[#131927] disabled:opacity-30"
        >
          Продолжить без подарка
        </button>

        <button
          disabled={!isPhoneCompleted || isEditingPhone || isSaving}
          onClick={handleNext}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {isSaving ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Далее"
          )}
        </button>
      </div>
    </div>
  )
}