export function PoetryIndex({ arrowAngle }: { arrowAngle: number }) {
  return (
    <div className="relative flex items-center gap-4 rounded-[16px] bg-white p-4 shadow-[4px_20px_40px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col items-center justify-start w-[90px]">
        <div className="relative w-[72px] h-[72px] flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 230deg, #9AA3B2 0%, #F39416 22%, #2DBE60 44%, #14532D 66%, #14532D 100%)`,
              WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M 12 50 A 28 28 0 1 1 60 50" fill="none" stroke="black" stroke-width="8" stroke-linecap="round" /></svg>')`,
              maskImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M 12 50 A 28 28 0 1 1 60 50" fill="none" stroke="black" stroke-width="8" stroke-linecap="round" /></svg>')`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          <div className="text-[28px] z-10">🚀</div>

          <div
            className="absolute flex items-center justify-center z-20"
            style={{
              transform: `rotate(${arrowAngle}deg) translateY(-28px) rotate(180deg)`,
              transformOrigin: "center",
              transition:
                "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 100 100"
              className="fill-black"
            >
              <path d="M50 87.5H24a10 10 0 0 1-8.65-15l13-22.5 13-22.52a10 10 0 0 1 17.3 0l13 22.52 13 22.52A10 10 0 0 1 76 87.5Z" />
            </svg>
          </div>
        </div>

        <div className="text-[9px] leading-[120%] tracking-[-0.02em] text-black text-center">
          Индекс пользы<br />и поэтичности
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[12px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927]">
          Чем подробнее вы опишете, тем полезнее ваш отзыв будет для других
        </div>
        <div className="text-[12px] leading-[120%] font-medium tracking-[-0.02em] text-[#131927] opacity-40">
          Кстати, каждый месяц мы проводим конкурс на самый поэтичный отзыв.
          Победителю вручаем персональный подарок от руководства клиники 😊
        </div>
      </div>
    </div>
  )
}