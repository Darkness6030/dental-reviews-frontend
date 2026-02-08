import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { StepProgress } from '../components/StepProgress'
import AIGenerateIcon from '../icons/ai_generate.svg?react'
import ArrowBackIcon from '../icons/arrow_back.svg?react'
import PencilIcon from '../icons/pencil.svg?react'
import { formatPhone } from '../utils/phone'
import { loadReview } from '../utils/storage'
import { setReviewContacts } from '../utils/api'

type Context = {
  contactName: string
  setContactName: (name: string) => void
  contactPhone: string
  setContactPhone: (phone: string) => void
}

export default function ContactPage() {
  const navigate = useNavigate()
  const {
    contactName,
    setContactName,
    contactPhone,
    setContactPhone
  } = useOutletContext<Context>()

  const [isEditingName, setIsEditingName] = useState(true)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isPhoneVisible, setIsPhoneVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isPhoneCompleted =
    /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(contactPhone)

  const handleGenerate = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      const review = await loadReview()
      await setReviewContacts(review.id, contactName, contactPhone)
      navigate('/review')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full max-w-[393px] px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Ваши<br />данные
          </h1>
          <StepProgress current={5} total={6} />
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Введите имя и номер телефона, чтобы закрепить за собой подарок
        </p>
      </div>

      <div className="w-full max-w-[393px] px-4 mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
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
                if (event.key === 'Enter' && contactName) {
                  event.currentTarget.blur()
                }
              }}
              placeholder="Ваше имя"
              className="w-full bg-transparent outline-none
                text-[44px] leading-[90%] tracking-[-0.02em] text-[#131927]"
            />
          ) : (
            <>
              <span className="text-[24px] leading-[90%] tracking-[-0.02em] text-[#131927]">
                {contactName}
              </span>
              <button
                onClick={() => setIsEditingName(true)}
                className="w-8 h-8 rounded-full bg-white
                  shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
                  flex items-center justify-center"
              >
                <PencilIcon />
              </button>
            </>
          )}
        </div>

        {isPhoneVisible && (
          <div className="flex items-center justify-between">
            {isEditingPhone ? (
              <input
                autoFocus
                value={contactPhone}
                onFocus={() => {
                  if (!contactPhone) setContactPhone('+7')
                }}
                onChange={event =>
                  setContactPhone(formatPhone(event.target.value))
                }
                onKeyDown={event => {
                  if (event.key === 'Backspace' && contactPhone === '+7') {
                    event.preventDefault()
                  }
                  if (event.key === 'Enter' && contactPhone.length > 2) {
                    event.currentTarget.blur()
                  }
                }}
                onBlur={() => {
                  if (contactPhone === '+7') {
                    setContactPhone('')
                  } else {
                    setIsEditingPhone(false)
                  }
                }}
                placeholder="+7 ___ ___ __ __"
                className="w-full bg-transparent outline-none
                  text-[44px] leading-[90%] tracking-[-0.02em] text-[#131927]
                  placeholder:text-[#131927]/30"
              />
            ) : (
              <>
                <span className="text-[24px] leading-[90%] tracking-[-0.02em] text-[#131927]">
                  {contactPhone}
                </span>
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="w-8 h-8 rounded-full bg-white
                    shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]
                    flex items-center justify-center"
                >
                  <PencilIcon />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-[393px] sticky bottom-0 px-4 py-3 flex justify-between items-end mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md flex items-center justify-center"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        {isPhoneVisible && !isEditingPhone && isPhoneCompleted && (
          <button
            disabled={isSaving}
            onClick={handleGenerate}
            className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
              text-white font-semibold text-[16px] tracking-[-0.02em]
              shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
              flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <AIGenerateIcon className="w-5 h-5" />
                Сгенерировать отзыв
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
