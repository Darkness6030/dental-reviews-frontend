import { useState } from "react"
import { Outlet } from "react-router-dom"
import type { Feedback } from "./types"

export default function App() {
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
  const [reviewText, setReviewText] = useState("")
  const [draftText, setDraftText] = useState("")

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[393px] min-h-screen">
        <Outlet
          context={{
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
            reviewText,
            setReviewText,
            draftText,
            setDraftText
          }}
        />
      </div>
    </div>
  )
}
