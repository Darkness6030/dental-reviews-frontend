import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import type { Reward } from "../types"
import { formatPhone } from "../utils/phone"
import { loadReview } from "../utils/storage"
import { setReviewContacts } from "../api"
import { Loader } from "../components/Loader"
import CopiedToast from "../components/CopiedToast"

type Context = {
  contactName: string
  setContactName: (name: string) => void
  contactPhone: string
  setContactPhone: (phone: string) => void
}

export default function ContactsPage() {
  const navigate = useNavigate()
  const copyTimeoutRef = useRef<number | null>(null)

  const {
    contactName,
    setContactName,
    contactPhone,
    setContactPhone
  } = useOutletContext<Context>()

  const [reviewText, setReviewText] = useState("")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  const [isEditingName, setIsEditingName] = useState(true)
  const [isEditingPhone, setIsEditingPhone] = useState(true)
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const isPhoneCompleted =
    /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)

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

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false)
      copyTimeoutRef.current = null
    }, 2000)
  }

  const handleCloseToast = () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = null
    }
    setIsCopied(false)
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleNext = async () => {
    if (isSaving || !isPhoneCompleted) return

    try {
      setIsSaving(true)
      const review = await loadReview()
      await setReviewContacts(review.id, contactName, contactPhone)
      navigate("/platforms")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-4 pt-4 flex flex-col gap-3 shrink-0">
        <div className="flex flex-row items-start gap-3 w-full">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Отзыв<br />сгенерирован
          </h1>

          <div className="w-16 h-16 p-[6px] flex items-center justify-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[#DAE6DA] flex items-center justify-center">
              <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Но при желании вы можете его изменить
        </p>
      </div>

      <div className="w-full px-4 mt-4 shrink-0">
        <div className="bg-white rounded-[24px] p-1 flex gap-2 shadow-[0_0_4px_rgba(0,0,0,0.04)]">
          <div className="flex-1 px-3 py-2 overflow-hidden">
            <p className="text-[14px] leading-[140%] tracking-[-0.02em] text-[#131927] line-clamp-4 opacity-80">
              {reviewText}
            </p>
          </div>

          <div className="flex flex-col w-12 shrink-0">
            <button
              onClick={() => navigate("/review")}
              className="w-12 h-12 bg-[#EEEEEE] flex items-center justify-center rounded-t-[20px] border-b border-white"
            >
              <PencilIcon className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={handleCopyReview}
              className="w-12 h-12 bg-[#EEEEEE] flex items-center justify-center rounded-b-[20px]"
            >
              <CopyIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex flex-col px-4 mt-6 gap-2 w-full">
          <h2 className="text-[24px] leading-[110%] font-medium tracking-[-0.02em] text-[#131927]">
            Вы выбрали
          </h2>

          {isLoading ? (
            <div className="w-full min-h-[72px] flex items-center justify-center">
              <Loader />
            </div>
          ) : selectedReward && (
            <div className="w-full min-h-[72px] p-1 rounded-[24px] flex items-center gap-3 bg-[#131927] text-white
              shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]"
            >
              <div className="w-16 aspect-square rounded-[20px] bg-[#F2F2F2] overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={selectedReward.image_url ?? "/placeholder.png"}
                  alt={selectedReward.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-[15px] leading-[120%] tracking-[-0.02em] text-left font-medium">
                {selectedReward.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col px-4 mt-6 gap-4 w-full">
          <div className="flex flex-col gap-3">
            <h2 className="text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
              Закрепите подарок за собой
            </h2>

            <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
              Введите имя и номер телефона, чтобы мы смогли вас идентифицировать
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center bg-white rounded-[24px] p-1 w-full h-[70px]">
              <div className="flex flex-col justify-center w-full px-3">
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
                    className="w-full text-[30px] leading-[36px] outline-none bg-transparent text-[#131927] placeholder:text-[#131927]/30 tracking-[-0.02em]"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[30px] leading-[36px] text-[#131927] tracking-[-0.02em]">
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
                <div className="flex items-center bg-white rounded-[24px] p-1 w-full h-[70px]">
                  <div className="flex flex-col justify-center w-full px-3">
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
                        className="w-full text-[30px] leading-[36px] outline-none bg-transparent text-[#131927] placeholder:text-[#131927]/30 tracking-[-0.02em]"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[30px] leading-[36px] text-[#131927] tracking-[-0.02em]">
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

      <div className="w-full px-4 py-3 flex items-end justify-between shrink-0">
        <button
          disabled={isSaving}
          onClick={() => navigate("/platforms")}
          className="h-14 flex items-center text-[15px] tracking-[-0.02em] text-[#131927] disabled:opacity-30"
        >
          Продолжить без подарка
        </button>

        <button
          disabled={!isPhoneCompleted || isEditingPhone || isSaving}
          onClick={handleNext}
          className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
            shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
            text-[16px] font-semibold text-white flex items-center justify-center
            disabled:opacity-30"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Далее"
          )}
        </button>
      </div>

      {isCopied && <CopiedToast onClose={handleCloseToast} />}
    </div>
  )
}