import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Aspect } from "../types"
import { getAspects, setReviewAspects } from "../utils/api"
import { loadReview } from "../utils/storage"

type Context = {
  selectedAspectIds: number[]
  setSelectedAspectIds: (ids: number[]) => void
}

export default function AspectsPage() {
  const navigate = useNavigate()
  const { selectedAspectIds, setSelectedAspectIds } =
    useOutletContext<Context>()

  const [aspects, setAspects] = useState<Aspect[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getAspects()
      .then(setAspects)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleAspectId = (aspectId: number) => {
    setSelectedAspectIds(
      selectedAspectIds.includes(aspectId)
        ? selectedAspectIds.filter(id => id !== aspectId)
        : [...selectedAspectIds, aspectId]
    )
  }

  const clearAllAspectIds = () => {
    setSelectedAspectIds([])
  }

  const handleNext = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const review = await loadReview()
      await setReviewAspects(review.id, selectedAspectIds)
      navigate("/source")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Что вам<br />понравилось
          </h1>

          <StepProgress current={3} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">
            Можно выбрать несколько
          </span>
          <span className="text-[#131927]">
            {selectedAspectIds.length} выбрано
          </span>
        </div>
      </div>

      <div className="w-full flex-1 overflow-y-auto px-4 mt-4">
        <div className="flex flex-wrap gap-[6px]
                        drop-shadow-[0_0_4px_rgba(0,0,0,0.04)]
                        drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {isLoading ? (
            <div className="w-full min-h-[120px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            aspects.filter(aspect => aspect.is_enabled).map(aspect => {
              const isSelected = selectedAspectIds.includes(aspect.id)
              return (
                <button
                  key={aspect.id}
                  onClick={() => toggleAspectId(aspect.id)}
                  className={`min-h-[56px] px-4 rounded-[16px] flex items-center justify-center
                    text-[15px] leading-[18px] tracking-[-0.02em] font-medium
                    ${isSelected
                      ? "bg-[#131927] text-white"
                      : "bg-white text-[#131927]"
                    }`}
                >
                  {aspect.name}
                </button>
              )
            })
          )}
        </div>

        {!isLoading && selectedAspectIds.length > 0 && (
          <div className="mt-6">
            <button
              onClick={clearAllAspectIds}
              className="h-12 px-4 rounded-[16px]
                border border-[rgba(19,25,39,0.16)]
                text-[15px] font-medium tracking-[-0.02em]
                text-[#131927]"
            >
              Очистить все
            </button>
          </div>
        )}
      </div>

      <div className="w-full sticky bottom-0 px-4 py-3 flex justify-between items-center bg-[#F5F5F5]">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md flex items-center justify-center"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={selectedAspectIds.length === 0 || isSaving}
          onClick={handleNext}
          className="h-14 px-6 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
            text-white font-semibold text-[16px] tracking-[-0.02em]
            shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
            disabled:opacity-30 flex items-center justify-center"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Далее"
          )}
        </button>
      </div>
    </div>
  )
}
