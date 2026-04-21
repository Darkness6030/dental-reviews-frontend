import { useEffect, useMemo, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Loader } from "../components/Loader"
import { StepProgress } from "../components/StepProgress"
import ArrowBackIcon from "../icons/arrow_back.svg?react"
import type { Service } from "../types"
import { getServicesByDoctorIds, setReviewServices } from "../api"
import { loadReview } from "../utils/storage"

type Context = {
  selectedServiceIds: number[]
  setSelectedServiceIds: (ids: number[]) => void
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const { selectedServiceIds, setSelectedServiceIds } =
    useOutletContext<Context>()

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadServices = async () => {
      try {
        const review = await loadReview()
        const doctorIds = review.selected_doctors?.map(doctor => doctor.id) ?? []

        if (doctorIds.length === 0) {
          setServices([])
          return
        }

        const services = await getServicesByDoctorIds(doctorIds)
        setServices(services)
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [])

  const groupedServices = useMemo(() => {
    const groupedEntries: Record<string, Service[]> = {}

    for (const service of services) {
      if (!service.is_enabled) continue
      const category = service.category.trim()

      if (!groupedEntries[category]) groupedEntries[category] = []
      groupedEntries[category].push(service)
    }

    return Object.entries(groupedEntries)
      .sort(([a], [b]) => a.localeCompare(b, "ru"))
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name, "ru"))
      }))
  }, [services])

  const toggleServiceId = (serviceId: number) => {
    setSelectedServiceIds(
      selectedServiceIds.includes(serviceId)
        ? selectedServiceIds.filter(id => id !== serviceId)
        : [...selectedServiceIds, serviceId]
    )
  }

  const handleNext = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const review = await loadReview()
      await setReviewServices(review.id, selectedServiceIds)
      navigate("/aspects")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F5F5F5]">
      <div className="flex w-full flex-col gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-[36px] font-semibold leading-[90%] tracking-[-0.02em] text-[#131927]">
            Выберите<br />услугу
          </h1>

          <StepProgress current={2} total={6} />
        </div>

        <div className="flex gap-2 text-[14px] tracking-[-0.02em]">
          <span className="text-[#131927] opacity-40">Можно выбрать несколько</span>
          <span className="text-[#131927]">{selectedServiceIds.length} выбрано</span>
        </div>
      </div>

      <div className="mt-4 w-full flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex min-h-[120px] w-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedServices.map(group => (
              <div key={group.category} className="flex flex-col gap-2">
                <div className="px-1 text-[14px] font-semibold text-[#131927] opacity-60">
                  {group.category}
                </div>

                <div className="flex flex-wrap gap-[6px] drop-shadow-[0_0_4px_rgba(0,0,0,0.04)] drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
                  {group.items.map(service => {
                    const isSelected = selectedServiceIds.includes(service.id)

                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleServiceId(service.id)}
                        className={`flex min-h-[56px] items-center justify-center rounded-[16px] px-4 text-[15px] font-medium leading-[18px] tracking-[-0.02em] ${
                          isSelected ? "bg-[#131927] text-white" : "bg-white text-[#131927]"
                        }`}
                      >
                        {service.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex w-full items-center justify-between bg-[#F5F5F5] px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex w-14 h-14 items-center justify-center rounded-full bg-[rgba(213,213,213,0.4)] backdrop-blur-md"
        >
          <ArrowBackIcon className="w-6 h-6" />
        </button>

        <button
          disabled={selectedServiceIds.length === 0 || isSaving}
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