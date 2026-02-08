import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Source } from "../types"
import { getSources, setReviewSource } from "../utils/api"
import { loadReview } from "../utils/storage"

type Context = {
  selectedSourceId: number | null
  setSelectedSourceId: (id: number | null) => void
}

export default function SourcePage() {
  const navigate = useNavigate()
  const { selectedSourceId, setSelectedSourceId } =
    useOutletContext<Context>()

  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getSources()
      .then(setSources)
      .finally(() => setIsLoading(false))
  }, [])

  const handleNext = async () => {
    if (isSaving || selectedSourceId === null) return

    try {
      setIsSaving(true)
      const review = await loadReview()
      await setReviewSource(review.id, selectedSourceId)
      navigate("/contact")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full max-w-[393px] px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] leading-[90%] font-semibold tracking-[-0.02em] text-[#131927]">
            Откуда вы<br />о нас узнали
          </h1>

          <StepProgress current={4} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">
            Выберите один из вариантов
          </span>
        </div>
      </div>

      <div className="w-full max-w-[393px] flex-1 overflow-y-auto px-4 mt-4">
        <div className="flex flex-col gap-2
                        drop-shadow-[0_0_4px_rgba(0,0,0,0.04)]
                        drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {isLoading ? (
            <div className="w-full min-h-[120px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            sources.filter(source => source.is_enabled).map(source => {
              const isSelected = selectedSourceId === source.id
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`h-14 w-full rounded-[16px] px-5 flex items-center justify-start
                    text-[15px] leading-[18px] tracking-[-0.02em] font-medium
                    ${isSelected
                      ? "bg-[#131927] text-white"
                      : "bg-white text-[#131927]"
                    }`}
                >
                  {source.name}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="w-full max-w-[393px] sticky bottom-0 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md flex items-center justify-center"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={selectedSourceId === null || isSaving}
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
