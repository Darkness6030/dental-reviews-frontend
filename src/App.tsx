import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import type { Feedback, Review } from "./types"
import { loadReview } from "./utils/storage"

export function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const shouldLoadReview =
    !location.pathname.startsWith("/feedback") &&
    !location.pathname.startsWith("/complaint")

  const {
    data: currentReview,
    isLoading: isReviewLoading,
  } = useQuery<Review | null>({
    queryKey: ["review"],
    queryFn: loadReview,
    enabled: shouldLoadReview,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  })

  const shouldRedirect =
    shouldLoadReview &&
    !isReviewLoading &&
    !currentReview

  useEffect(() => {
    if (shouldRedirect) {
      navigate("/", { replace: true })
    }
  }, [shouldRedirect, navigate])

  const [feedback, setFeedback] = useState<Feedback>(null)
  const [selectedReasonIds, setSelectedReasonIds] = useState<number[]>([])
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [selectedAspectIds, setSelectedAspectIds] = useState<number[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null)
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null)
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [complaintText, setComplaintText] = useState("")
  const [experienceText, setExperienceText] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [draftText, setDraftText] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  return (
    <div className="w-full min-h-[100dvh] bg-[#F5F5F5] flex justify-center">
      <div className="w-full min-h-full">
        <Outlet
          context={{
            currentReview,
            isReviewLoading,
            feedback,
            setFeedback,
            selectedReasonIds,
            setSelectedReasonIds,
            selectedDoctorIds,
            setSelectedDoctorIds,
            selectedServiceIds,
            setSelectedServiceIds,
            selectedAspectIds,
            setSelectedAspectIds,
            selectedSourceId,
            setSelectedSourceId,
            selectedRewardId,
            setSelectedRewardId,
            contactName,
            setContactName,
            contactPhone,
            setContactPhone,
            complaintText,
            setComplaintText,
            experienceText,
            setExperienceText,
            reviewText,
            setReviewText,
            draftText,
            setDraftText,
            isCopied,
            setIsCopied,
          }}
        />
      </div>
    </div>
  )
}