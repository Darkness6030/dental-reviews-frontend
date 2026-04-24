import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { addReviewPlatform, getPlatforms } from "../api"
import CopiedToast from "../components/CopiedToast"
import { Loader } from "../components/Loader"
import ArrowRightIcon from "../icons/arrow_right.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Platform } from "../types"
import { loadReview } from "../utils/storage"

type Context = {
  reviewText: string
  setReviewText: (text: string) => void
  contactName: string
}

export default function PlatformsPage() {
  const navigate = useNavigate()
  const copyTimeoutRef = useRef<number | null>(null)

  const {
    reviewText,
    setReviewText,
    contactName
  } = useOutletContext<Context>()

  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getPlatforms()
      .then(setPlatforms)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (reviewText) return

    const loadText = async () => {
      const review = await loadReview()
      if (review.review_text) setReviewText(review.review_text)
    }

    loadText()
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

  const handlePlatformClick = async (platform: Platform) => {
    const review = await loadReview()
    await addReviewPlatform(review.id, platform.id)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4 shrink-0">
        <div className="flex w-full items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            {contactName ? (
              <>{contactName},<br />спасибо за<br />уделенное время!</>
            ) : (
              <>Спасибо за<br />уделенное время</>
            )}
          </h1>

          <div className="flex w-16 h-16 items-center justify-center p-[6px]">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#DAE6DA]">
              <CheckmarkIcon className="h-8 w-8 text-[#298A2C]" />
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Остался последний шаг!
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

      <div className="flex w-full flex-1 flex-col px-4 min-h-0">
        <h2 className="mt-6 text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
          Выберите где<br />опубликовать отзыв
        </h2>

        <p className="mt-3 text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          При нажатии на сервис, вас переведет<br />на внешнюю ссылку
        </p>

        <div className="my-6 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex w-full min-h-[120px] items-center justify-center">
              <Loader />
            </div>
          ) : (
            platforms
              .filter(platform => platform.is_enabled)
              .map(platform => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handlePlatformClick(platform)}
                  className="flex w-full min-h-[60px] items-center gap-3 rounded-[24px] bg-white p-1 shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex w-[52px] items-center justify-center overflow-hidden rounded-[20px] bg-[#F2F2F2] aspect-square shrink-0">
                    <img
                      src={platform.image_url ?? "/placeholder.png"}
                      alt={platform.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="flex-1 text-[15px] font-medium leading-[18px] tracking-[-0.02em] text-[#191919]">
                    {platform.name}
                  </span>

                  <ArrowRightIcon className="w-6 h-6 shrink-0" />
                </a>
              ))
          )}
        </div>
      </div>

      {isCopied && <CopiedToast onClose={handleCloseToast} />}
    </div>
  )
}