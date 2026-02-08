import { useEffect, useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import CopiedToast from "../components/CopiedToast"
import { Loader } from "../components/Loader"
import ArrowRightIcon from "../icons/arrow_right.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Platform } from "../types"
import { addReviewPlatform, getPlatforms } from "../utils/api"
import { loadReview } from "../utils/storage"

type Context = {
  reviewText: string
  setReviewText: (text: string) => void
}

export default function PlatformsPage() {
  const navigate = useNavigate()
  const copyTimeoutRef = useRef<number | null>(null)

  const {
    reviewText,
    setReviewText
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
      if (review.review_text) {
        setReviewText(review.review_text)
      }
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

  const handlePlatformClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    platform: Platform
  ) => {
    event.preventDefault()

    try {
      const review = await loadReview()
      await addReviewPlatform(review.id, platform.id)
    } finally {
      window.open(platform.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-4 pt-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Спасибо за<br />уделенное время
          </h1>

          <div className="w-16 h-16 p-[6px] flex items-center justify-center shrink-0">
            <div className="w-[52px] h-[52px] rounded-full bg-[#DAE6DA] flex items-center justify-center">
              <CheckmarkIcon className="w-8 h-8 text-[#298A2C]" />
            </div>
          </div>
        </div>

        <p className="text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          Остался последний шаг!
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

      <div className="w-full px-4 mt-8 flex-1 min-h-0">
        <h2 className="text-[24px] leading-[110%] font-semibold tracking-[-0.02em] text-[#131927]">
          Выберите где<br />опубликовать отзыв
        </h2>

        <p className="mt-3 text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          При нажатии на сервис вас переведет<br />на внешнюю ссылку
        </p>

        <div className="my-6 flex flex-col gap-2">
          {isLoading ? (
            <div className="w-full min-h-[120px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            platforms.filter(platform => platform.is_enabled).map(platform => {
              return (
                <a
                  key={platform.id}
                  href={platform.url}
                  onClick={event => handlePlatformClick(event, platform)}
                  className="w-full min-h-[60px] p-1 rounded-[24px] flex items-center gap-3
                    bg-white shadow-[0_0_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06)]"
                >
                  <div className="w-[52px] aspect-square rounded-[20px] bg-[#F2F2F2] overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={platform.image_url ?? "/placeholder.png"}
                      alt={platform.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="flex-1 text-[15px] leading-[18px] tracking-[-0.02em] font-medium text-[#191919]">
                    {platform.name}
                  </span>

                  <ArrowRightIcon className="w-6 h-6 shrink-0" />
                </a>
              )
            })
          )}
        </div>
      </div>

      {isCopied && <CopiedToast onClose={handleCloseToast} />}
    </div>
  )
}
