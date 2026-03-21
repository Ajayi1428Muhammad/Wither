
// const WeatherCard = ({ title, icon: Icon, children, extra }) => {
const Card = ({children, title,additionals, icon: Icon, extra}) => {
  const isSpecialCard = additionals;
  return (
    <div>
      <div
        className={`flex flex-col justify-between rounded-lg backdrop-blur-md p-4 h-44 ${isSpecialCard ? "bg-white/15 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]" : "  shadow-2xl border border-white/10 bg-white/10"}`}
      >
        {isSpecialCard && (
          <div className="absolute top-0 right-0">
            <div className="bg-orange-500 text-[8px] text-white font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">
              {additionals}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-white/70">
          {Icon && <Icon size={18} className="opacity-80" />}
          <span className=" text-[11px] font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>

        {/* Content Area (The Children) */}
        <div className="mt-2 grow flex flex-col justify-end">{children}</div>

        {/* Bottom Footer Area */}
        {extra && (
          <p className="text-white/80 text-[10px] mt-2 border-t border-white/10 pt-2 italic">
            {extra}
          </p>
        )}
      {/* {isSpecialCard && (
        <div className=" absolute inset-0 bg-linear-to-t from-orange-500/50 to-transparent pointer-events-none rounded-lg" />
      )} */}
      </div>
    </div>
  );
}

export default Card
