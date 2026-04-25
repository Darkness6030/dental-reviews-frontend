import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { getDoctors, setReviewDoctors } from "../api"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Doctor } from "../types"
import { loadReview } from "../utils/storage"

export type Context = {
  selectedDoctorIds: number[]
  setSelectedDoctorIds: (ids: number[]) => void
}

export function DoctorsPage() {
  const navigate = useNavigate()
  const { selectedDoctorIds, setSelectedDoctorIds } = useOutletContext<Context>()

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleDoctorId = (doctorId: number) => {
    setSelectedDoctorIds(
      selectedDoctorIds.includes(doctorId)
        ? selectedDoctorIds.filter(id => id !== doctorId)
        : [...selectedDoctorIds, doctorId]
    )
  }

  const handleNext = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const review = await loadReview()
      await setReviewDoctors(review.id, selectedDoctorIds)
      navigate("/services")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Выберите<br />врача
          </h1>
          <StepProgress current={1} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">Можно выбрать несколько</span>
          <span className="text-[#131927]">{selectedDoctorIds.length} выбрано</span>
        </div>
      </div>

      <div className="mt-4 w-full flex-1 overflow-y-auto px-4">
        <div className="flex flex-col gap-2 drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader />
            </div>
          ) : (
            doctors
              .filter(doctor => doctor.is_enabled)
              .map(doctor => {
                const isSelected = selectedDoctorIds.includes(doctor.id)

                return (
                  <button
                    key={doctor.id}
                    onClick={() => toggleDoctorId(doctor.id)}
                    className={`flex min-h-[72px] w-full gap-3 rounded-[24px] p-1
                      ${isSelected ? "bg-[#131927]" : "bg-white"}`}
                  >
                    <div
                      className={`w-16 h-16 flex-shrink-0 overflow-hidden rounded-[20px] box-border
                        ${isSelected ? "border-4 border-[#131927]" : "border-0"}`}
                    >
                      <img
                        src={doctor.avatar_url ?? "/placeholder.png"}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-center gap-[2px] overflow-hidden text-left">
                      <span
                        className={`truncate text-[15px] font-medium leading-[18px] tracking-[-0.02em]
                          ${isSelected ? "text-white" : "text-[#191919]"}`}
                      >
                        {doctor.name}
                      </span>

                      <span
                        className={`text-[12px] font-medium leading-[120%] tracking-[-0.02em] opacity-40
                          ${isSelected ? "text-white" : "text-[#131927]"}`}
                      >
                        {doctor.role}
                      </span>
                    </div>
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
          disabled={selectedDoctorIds.length === 0 || isSaving}
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