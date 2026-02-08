import { useNavigate, useOutletContext } from 'react-router-dom'
import AIGenerateIcon from '../icons/ai_generate.svg?react'
import type { Experience } from '../types'

export type Context = {
  experience: Experience
  setExperience: (experience: Experience) => void
}

const EXPERIENCE_OPTIONS = [
  {
    value: true,
    name: 'Есть претензия',
    image_url: '/have_complaint.png'
  },
  {
    value: false,
    name: 'Все отлично',
    image_url: '/everything_fine.png'
  }
]

export default function ExperiencePage() {
  const navigate = useNavigate()
  const { experience, setExperience } = useOutletContext<Context>()

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
      <div className="w-full px-6 pt-6 flex flex-col items-center gap-6">
        <img src="/logo.png" alt="Dental Daily Logo" className="h-6" />

        <h1 className="max-w-[329px] text-[clamp(28px,8vw,38px)] leading-[90%] font-semibold text-center tracking-[-0.02em] text-[#131927]">
          Поделитесь своим опытом лечения
        </h1>

        <p className="max-w-[329px] text-[14px] leading-[130%]
                      text-center tracking-[-0.02em] text-[#131927] opacity-60">
          Оцените качество работы докторов и сервис клиники Dental Daily
        </p>
      </div>

      <div className="w-full mt-6 rounded-t-[40px] px-4 pt-8 pb-3 flex flex-col gap-8 flex-1">
        <div className="grid grid-cols-2 gap-[5px] w-full
                        drop-shadow-[0_0_4px_rgba(0,0,0,0.04)]
                        drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]">
          {EXPERIENCE_OPTIONS.map(option => (
            <button
              key={option.name}
              onClick={() => setExperience(option.value)}
              className={`aspect-[178/220] w-full bg-white rounded-[48px]
                flex flex-col items-center justify-between p-4
                ${experience === option.value
                  ? 'border-[4px] border-[#131927]'
                  : 'border-[4px] border-transparent'
                }`}
            >
              <div className="flex-1 flex items-center justify-center w-full">
                <img
                  src={option.image_url}
                  alt={option.name}
                  className="max-w-[130px] aspect-square object-contain"
                />
              </div>

              <div className="min-h-[34px] flex items-center justify-center w-full">
                <span className="text-[12px] font-medium tracking-[-0.02em]
                                 text-[#131927] opacity-40">
                  {option.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            disabled={experience === null}
            onClick={() => {
              if (experience === true) navigate('/complaint')
              if (experience === false) navigate('/doctors')
            }}
            className="h-14 rounded-full bg-gradient-to-r from-[#F39416] to-[#F33716]
                       text-white font-semibold text-[16px] tracking-[-0.02em]
                       shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
                       disabled:opacity-30"
          >
            Далее
          </button>

          <div className="flex items-center gap-2 opacity-40">
            <AIGenerateIcon className="w-[26px] h-[26px] shrink-0" />
            <p className="text-[11px] leading-[120%] tracking-[-0.02em] text-[#131927]">
              На основании Ваших ответов мы поможем написать отзыв с помощью искусственного интеллекта
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
