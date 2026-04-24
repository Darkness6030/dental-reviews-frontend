import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { generateReviewText, updateReviewText } from '../api'
import { Loader } from '../components/Loader'
import AIGenerateIcon from '../icons/ai_generate.svg?react'
import CancelIcon from '../icons/cancel.svg?react'
import CheckmarkIcon from '../icons/checkmark.svg?react'
import PencilIcon from '../icons/pencil.svg?react'
import { loadReview } from '../utils/storage'
import type { StylePreset } from '../types'

const STYLE_PRESET_OPTIONS: { value: StylePreset; label: string }[] = [
  { value: 'basic', label: '🤝 Базовый' },
  { value: 'short', label: '🎯 Короткий' },
  { value: 'friendly', label: '🥰 Дружелюбный' }
]

type Context = {
  reviewText: string
  setReviewText: (text: string) => void
  draftText: string
  setDraftText: (text: string) => void
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const reviewIdRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

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
  const [generationsLeft, setGenerationsLeft] = useState<number>(0)
  const [stylePreset, setStylePreset] = useState<StylePreset>('basic')

  useEffect(() => {
    const loadReviewData = async () => {
      const review = await loadReview()
      reviewIdRef.current = review.id
      setReviewText(review.review_text ?? '')
      setDraftText(review.review_text ?? '')
      setGenerationsLeft(review.generations_left)

      if (!reviewText) {
        handleGenerate('basic')
      } else {
        setIsLoading(false)
      }
    }

    loadReviewData()
  }, [])

  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const handleScroll = () => {
      setAtTop(element.scrollTop === 0)
      setAtBottom(
        element.scrollTop + element.clientHeight >= element.scrollHeight - 1
      )
    }

    handleScroll()
    element.addEventListener('scroll', handleScroll)

    return () => element.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGenerate = async (newPreset: StylePreset = stylePreset) => {
    if (!reviewIdRef.current) return

    setIsLoading(true)
    setIsEditing(false)
    setStylePreset(newPreset)

    try {
      const generated = await generateReviewText(
        reviewIdRef.current,
        newPreset
      )

      setReviewText(generated.review_text ?? '')
      setDraftText(generated.review_text ?? '')
      setGenerationsLeft(generated.generations_left)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (isSaving || !reviewIdRef.current) return
    setIsSaving(true)

    try {
      await updateReviewText(reviewIdRef.current, draftText)
      setReviewText(draftText)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex h-screen flex-col items-center bg-[#F5F5F5]'>
      <div className='flex w-full flex-col gap-3 px-4 pt-4 shrink-0'>
        <div className='flex items-start gap-3'>
          <h1 className='flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]'>
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
              <div className='flex w-16 h-16 items-center justify-center p-[6px]'>
                <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DAE6DA]'>
                  <CheckmarkIcon className='w-8 h-8 text-[#298A2C]' />
                </div>
              </div>
            ))}
        </div>

        <p className='text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40'>
          {isEditing
            ? 'Вы можете изменить текст отзыва'
            : isLoading
              ? 'Чтобы он был интересным и информативным'
              : 'Но при желании вы можете его изменить'}
        </p>
      </div>

      <div className='mt-4 flex w-full flex-1 min-h-0 px-4'>
        <div
          className={`relative flex w-full flex-1 flex-col rounded-[24px] bg-white p-6 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)] ${isLoading ? 'mb-6' : 'overflow-hidden'}`}
        >
          {!isEditing && (
            <div className='flex gap-2 mb-2'>
              {STYLE_PRESET_OPTIONS.map(option => {
                const disabled = isLoading || !generationsLeft
                return (
                  <button
                    key={option.value}
                    onClick={() => handleGenerate(option.value)}
                    disabled={disabled}
                    className={`flex-1 px-2 py-1.5 rounded-full text-[12px] whitespace-nowrap text-center ${stylePreset === option.value
                        ? 'bg-[#131927] text-white'
                        : 'bg-[#F0F0F0]'
                      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          {isLoading ? (
            <div className='flex flex-1 items-center justify-center'>
              <div className='flex w-full h-full max-w-[313px] flex-col justify-between gap-3 animate-pulse'>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-full rounded-full bg-gradient-to-r from-[#F8F8F8] via-[#EDEDED] to-[#F8F8F8] ${index % 2 ? 'w-[150px]' : ''}`}
                  />
                ))}
              </div>
            </div>
          ) : isEditing ? (
            <textarea
              value={draftText}
              onChange={event => setDraftText(event.target.value)}
              className='w-full h-full resize-none overflow-y-auto text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927] outline-none'
            />
          ) : (
            <>
              <div
                ref={scrollContainerRef}
                className='relative h-full flex-1 min-h-0 overflow-y-auto'
              >
                <p className='text-[15px] leading-[140%] tracking-[-0.02em] text-[#131927]'>
                  {reviewText}
                </p>
              </div>

              {!atTop && (
                <div className='pointer-events-none absolute top-6 left-6 right-6 h-8 bg-gradient-to-b from-white to-transparent' />
              )}

              {!atBottom && (
                <div className='pointer-events-none absolute bottom-14 left-6 right-6 h-12 bg-gradient-to-t from-white to-transparent' />
              )}

              <button
                onClick={() => setIsEditing(true)}
                className='mt-4 flex items-center gap-2 opacity-40 shrink-0'
              >
                <PencilIcon className='w-5 h-5' />
                <span className='text-[14px]'>Редактировать отзыв</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!isLoading && (
        <div className='flex w-full items-center justify-between px-4 py-3 shrink-0'>
          {!isEditing ? (
            <>
              <button
                onClick={() => handleGenerate(stylePreset)}
                disabled={!generationsLeft}
                className={`flex items-center gap-2 ${!generationsLeft ? 'opacity-20' : ''}`}
              >
                <AIGenerateIcon className='w-5 h-5 text-[#131927]' />
                <span className='text-[15px]'>
                  Сгенерировать ещё ({generationsLeft}/3)
                </span>
              </button>

              <button
                onClick={() => navigate('/rewards')}
                className='flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white'
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
                className='flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md'
              >
                <CancelIcon className='w-6 h-6' />
              </button>

              <button
                disabled={isSaving}
                onClick={handleSaveEdit}
                className='flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold text-white'
              >
                {isSaving ? (
                  <div className='w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  'Сохранить'
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}