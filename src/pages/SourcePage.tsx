import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { getSources, setReviewSource } from "../api"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Source } from "../types"
import { loadReview } from "../utils/storage"

type Context = {
  selectedSourceId: number | null
  setSelectedSourceId: (id: number | null) => void
}

export function SourcePage() {
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
    setIsSaving(true)

    try {
      const review = await loadReview()
      await setReviewSource(review.id, selectedSourceId)
      navigate("/experience")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Откуда вы<br />о нас узнали
          </h1>

          <StepProgress current={4} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">Выберите один из вариантов</span>
        </div>
      </div>

      <div className="mt-4 w-full flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-2 drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {isLoading ? (
            <div className="flex min-h-[120px] w-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            sources
              .filter(source => source.is_enabled)
              .map(source => {
                const isSelected = selectedSourceId === source.id

                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSourceId(source.id)}
                    className={`flex h-14 w-full items-center justify-start rounded-[16px] px-5 text-[15px] font-medium leading-[18px] tracking-[-0.02em] ${isSelected ? "bg-[#131927] text-white" : "bg-white text-[#131927]"}`}
                  >
                    {source.name}
                  </button>
                )
              })
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={selectedSourceId === null || isSaving}
          onClick={handleNext}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
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