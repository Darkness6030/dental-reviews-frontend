import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { getManagers, setReviewContacts, setReviewManager } from "../api"
import { Loader } from "../components/Loader"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Manager, Review, Reward } from "../types"
import { formatPhone } from "../utils/phone"

type Context = {
  currentReview: Review
  isReviewLoading: boolean
  contactName: string
  setContactName: (name: string) => void
  contactPhone: string
  setContactPhone: (phone: string) => void
  isCopied: boolean
  setIsCopied: (value: boolean) => void
}

export function ContactsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    currentReview,
    isReviewLoading,
    contactName,
    setContactName,
    contactPhone,
    setContactPhone,
    isCopied,
    setIsCopied
  } = useOutletContext<Context>()

  const { data: managers } = useSuspenseQuery<Manager[]>({
    queryKey: ["managers"],
    queryFn: getManagers,
  })

  const [reviewText, setReviewText] = useState("")
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  const [isEditingName, setIsEditingName] = useState(true)
  const [isEditingPhone, setIsEditingPhone] = useState(true)
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const [isSelectingManager, setIsSelectingManager] = useState(false)

  const isPhoneCompleted = /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)

  useEffect(() => {
    if (!currentReview) return
    setReviewText(currentReview.review_text ?? "")
    setSelectedReward(currentReview.selected_reward ?? null)

    if (currentReview.contact_name) {
      setContactName(currentReview.contact_name)
      setIsEditingName(false)
      setIsPhoneVisible(true)
      setIsEditingPhone(true)
    }

    if (currentReview.contact_phone) {
      setContactPhone(formatPhone(currentReview.contact_phone))
      setIsEditingPhone(false)
    }
  }, [currentReview])

  const mutation = useMutation({
    mutationFn: (managerId?: number) => Promise.all([
      setReviewContacts(currentReview.id, contactName, contactPhone),
      managerId ? setReviewManager(currentReview.id, managerId) : Promise.resolve()
    ]),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/platforms")
    }
  })

  const handleCopyReview = async () => {
    if (!reviewText) return;

    let isSuccess = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(reviewText);
        isSuccess = true;
      } catch {
        isSuccess = false;
      }
    }

    if (!isSuccess) {
      const textArea = document.createElement("textarea");
      textArea.value = reviewText;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      isSuccess = document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (isSuccess) {
      setIsCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleNext = () => {
    if (mutation.isPending || !isPhoneCompleted) return
    setIsSelectingManager(true)
  }

  const handleSkip = () => {
    setIsSelectingManager(true)
  }

  const handleSelectManager = (managerId?: number) => {
    mutation.mutate(managerId)
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
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
        <div className="flex min-h-[104px] items-center justify-center gap-2 rounded-[24px] bg-white p-1 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]">
          {isReviewLoading ? (
            <Loader />
          ) : (
            <>
              <div className="flex-1 overflow-hidden px-3 py-2">
                <p className="line-clamp-4 text-[14px] leading-[140%] tracking-[-0.02em] text-[#131927] opacity-80">
                  {reviewText}
                </p>
              </div>

              <div className="flex w-12 shrink-0">
                <button
                  onClick={() => navigate("/review")}
                  className="flex h-24 w-12 items-center justify-center rounded-[20px] bg-[#EEEEEE] active:opacity-70 transition-opacity"
                >
                  <PencilIcon className="h-5 w-5 text-[#131927]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full px-4 shrink-0">
        <button
          onClick={handleCopyReview}
          className={`flex h-[48px] w-full items-center justify-center gap-[10px] rounded-[16px] border px-4 py-2 transition-all
            ${isCopied
              ? "border-[#298A2C] bg-[#F1F8F1]"
              : "border-[rgba(19,25,39,0.16)] bg-transparent active:bg-gray-100"
            }`}
        >
          {isCopied ? (
            <>
              <CheckmarkIcon className="h-5 w-5 text-[#298A2C]" />
              <span className="text-[15px] font-medium leading-[18px] tracking-[-0.02em] text-[#298A2C]">
                Отзыв скопирован
              </span>
            </>
          ) : (
            <>
              <CopyIcon className="h-5 w-5 text-[#131927]" />
              <span className="text-[15px] font-medium leading-[18px] tracking-[-0.02em] text-[#131927]">
                Скопировать отзыв
              </span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col w-full">
        {(isReviewLoading || selectedReward) && (
          <div className="mt-6 flex w-full flex-col gap-2 px-4">
            <h2 className="text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
              Вы выбрали
            </h2>

            {isReviewLoading ? (
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
        )}

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
            {isReviewLoading ? (
              <div className="flex min-h-[150px] w-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <>
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
                  <div className="flex h-[70px] w-full items-center rounded-[24px] bg-white p-1">
                    <div className="flex w-full flex-col justify-center px-3">
                      {isEditingPhone ? (
                        <input
                          autoFocus
                          value={contactPhone}
                          onFocus={() => {
                            if (!contactPhone) setContactPhone("+7")
                          }}
                          onChange={event => setContactPhone(formatPhone(event.target.value))}
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
                )}
              </>
            )}

            {!isReviewLoading && isPhoneVisible && (
              <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
                Мы никому не передадим ваш номер. Он необходим исключительно для внутренней системы закрепления подарка 😊
              </p>
            )}

            <p className="text-[10px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
              Нажимая «Далее», вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-end justify-between px-4 py-3 shrink-0">
        <button
          disabled={mutation.isPending}
          onClick={handleSkip}
          className="flex h-14 items-center text-[15px] tracking-[-0.02em] text-[#131927] disabled:opacity-30"
        >
          Продолжить без подарка
        </button>

        <button
          disabled={!isPhoneCompleted || isEditingPhone || mutation.isPending}
          onClick={handleNext}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {mutation.isPending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Далее"
          )}
        </button>
      </div>

      {isSelectingManager && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 px-4 pb-3">
          <div className="w-full max-w-md">
            <div className="w-full rounded-[28px] bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
              <div className="mb-3 flex flex-col gap-0.5 px-1">
                <h3 className="text-[18px] font-semibold leading-[110%] tracking-[-0.02em] text-[#131927]">
                  Кто помог вам с отзывом?
                </h3>
                <p className="text-[12px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
                  Выберите администратора
                </p>
              </div>

              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {managers.map(manager => (
                  <button
                    key={manager.id}
                    disabled={mutation.isPending}
                    onClick={() => handleSelectManager(manager.id)}
                    className="flex h-[52px] w-full items-center gap-3 rounded-[16px] bg-[#F8F8F8] p-1 pr-4 active:bg-[#EEEEEE] transition-colors"
                  >
                    <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#F2F2F2]">
                      {manager.avatar_url ? (
                        <img
                          src={manager.avatar_url}
                          alt={manager.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#DAE6DA] text-[15px] font-semibold text-[#298A2C]">
                          {manager.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-left text-[15px] font-medium tracking-[-0.02em] text-[#131927]">
                      {manager.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                disabled={mutation.isPending}
                onClick={() => handleSelectManager()}
                className="mt-2 flex h-[40px] w-full items-center justify-center text-[13px] font-medium text-[#131927] opacity-40 active:opacity-60"
              >
                Пропустить этот шаг
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}