import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { getAspects, setReviewAspects } from "../api"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Aspect, Review } from "../types"

type Context = {
  currentReview: Review
  selectedAspectIds: number[]
  setSelectedAspectIds: (ids: number[]) => void
}

function AspectsList() {
  const { selectedAspectIds, setSelectedAspectIds } = useOutletContext<Context>()

  const { data: aspects } = useSuspenseQuery<Aspect[]>({
    queryKey: ["aspects"],
    queryFn: getAspects,
  })

  const enabledAspects = aspects.filter(aspect => aspect.is_enabled)
  const isAllSelected = enabledAspects.length > 0 && selectedAspectIds.length === enabledAspects.length

  const toggleAspectId = (aspectId: number) => {
    setSelectedAspectIds(
      selectedAspectIds.includes(aspectId)
        ? selectedAspectIds.filter(id => id !== aspectId)
        : [...selectedAspectIds, aspectId]
    )
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAspectIds([])
    } else {
      setSelectedAspectIds(enabledAspects.map(aspect => aspect.id))
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-[6px] drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
        {enabledAspects.map(aspect => {
          const isSelected = selectedAspectIds.includes(aspect.id)
          return (
            <button
              key={aspect.id}
              onClick={() => toggleAspectId(aspect.id)}
              className={`flex min-h-[56px] items-center justify-center rounded-[16px] px-4 text-[15px] font-medium leading-[18px] tracking-[-0.02em]
                  ${isSelected ? "bg-[#131927] text-white" : "bg-white text-[#131927]"}`}
            >
              {aspect.name}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSelectAll}
          className="h-12 rounded-[16px] border border-[rgba(19,25,39,0.16)] px-4 text-[15px] font-medium tracking-[-0.02em] text-[#131927]"
        >
          {isAllSelected ? "Сбросить выбор" : "Выбрать все"}
        </button>
      </div>
    </>
  )
}

export function AspectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    currentReview,
    selectedAspectIds
  } = useOutletContext<Context>()

  const mutation = useMutation({
    mutationFn: () => setReviewAspects(currentReview.id, selectedAspectIds),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/source")
    }
  })

  const handleNext = () => {
    if (mutation.isPending) return
    mutation.mutate()
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Что вам<br />понравилось
          </h1>

          <StepProgress current={3} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">Можно выбрать несколько</span>
          <span className="text-[#131927]">{selectedAspectIds.length} выбрано</span>
        </div>
      </div>

      <div className="mt-4 w-full flex-1 overflow-y-auto px-4">
        <Suspense
          fallback={
            <div className="flex min-h-[120px] w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          <AspectsList />
        </Suspense>
      </div>

      <div className="sticky bottom-0 flex w-full items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={selectedAspectIds.length === 0 || mutation.isPending}
          onClick={handleNext}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716] px-6 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)] disabled:opacity-30"
        >
          {mutation.isPending ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Далее"
          )}
        </button>
      </div>
    </div>
  )
}