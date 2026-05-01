import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { addReviewPlatform, getPlatforms } from "../api"
import { Loader } from "../components/Loader"
import ArrowRightIcon from "../icons/arrow_right.svg?react"
import CheckmarkIcon from "../icons/checkmark.svg?react"
import CopyIcon from "../icons/copy.svg?react"
import PencilIcon from "../icons/pencil.svg?react"
import type { Platform, Review } from "../types"

type Context = {
  currentReview: Review
  isReviewLoading: boolean
  reviewText: string
  setReviewText: (text: string) => void
  isCopied: boolean
  setIsCopied: (value: boolean) => void
  contactName: string
}

function PlatformsList() {
  const { currentReview } = useOutletContext<Context>()

  const { data: platforms } = useSuspenseQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  })

  const mutation = useMutation({
    mutationFn: (platformId: number) => addReviewPlatform(currentReview.id, platformId),
  })

  const handlePlatformClick = (platformId: number) => {
    mutation.mutate(platformId)
  }

  return (
    <div className="my-6 flex flex-col gap-2">
      {platforms
        .filter(platform => platform.is_enabled)
        .map(platform => (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handlePlatformClick(platform.id)}
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
        ))}
    </div>
  )
}

export function PlatformsPage() {
  const navigate = useNavigate()
  const {
    currentReview,
    isReviewLoading,
    reviewText,
    setReviewText,
    isCopied,
    setIsCopied,
    contactName,
  } = useOutletContext<Context>()

  useEffect(() => {
    if (!currentReview) return
    setReviewText(currentReview.review_text ?? "")
  }, [currentReview])

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

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4 shrink-0">
        <div className="flex w-full items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            {contactName ? (
              <>
                {contactName},<br />
                спасибо за<br />
                уделенное время!
              </>
            ) : (
              <>
                Спасибо за<br />
                уделенное время
              </>
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

      <div className="flex w-full flex-1 flex-col px-4 min-h-0">
        <h2 className="mt-6 text-[24px] font-medium leading-[110%] tracking-[-0.02em] text-[#131927]">
          Выберите где<br />
          опубликовать отзыв
        </h2>

        <p className="mt-3 text-[14px] leading-[120%] tracking-[-0.02em] text-[#131927] opacity-40">
          При нажатии на сервис, вас переведет<br />
          на внешнюю ссылку
        </p>

        <Suspense
          fallback={
            <div className="flex w-full min-h-[120px] items-center justify-center">
              <Loader />
            </div>
          }
        >
          <PlatformsList />
        </Suspense>
      </div>
    </div>
  )
}