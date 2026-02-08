import CheckmarkIcon from '../icons/checkmark.svg?react'

type CopiedToastProps = {
  onClose: () => void
}

export default function CopiedToast({ onClose }: CopiedToastProps) {
  return (
    <div className="fixed left-1/2 bottom-[60px] -translate-x-1/2 z-50">
      <div className="w-[361px] h-12 px-3 flex items-center gap-3 bg-[#131927] rounded-[24px]">
        <div className="w-6 h-6 rounded-full bg-[#298A2C] flex items-center justify-center">
          <CheckmarkIcon className="w-3.5 h-3.5 text-white" />
        </div>

        <span className="flex-1 text-[15px] leading-[120%] tracking-[-0.02em] font-medium text-white">
          Отзыв скопирован
        </span>

        <button
          onClick={onClose}
          className="w-6 h-6 opacity-30 flex items-center justify-center"
        >
          <span className="block w-[14px] h-[14px] relative">
            <span className="absolute inset-0 rotate-45 bg-white h-[2px] top-1/2" />
            <span className="absolute inset-0 -rotate-45 bg-white h-[2px] top-1/2" />
          </span>
        </button>
      </div>
    </div>
  )
}
