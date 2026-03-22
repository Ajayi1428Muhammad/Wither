import BrandLogo from "./BrandLogo";

const WelcomeLoader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-140 h-auto w-[100% - 4rem] flex items-center justify-center bg-cyan-900/40 backdrop-blur-md">
      <div className="rounded-2xl border border-white/20 bg-white/10 px-8 py-7 shadow-2xl backdrop-blur-lg">
        <BrandLogo size={96} assemble withText className="justify-center" />
        <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-white/75">
          Syncing weather feed
        </p>
      </div>
    </div>
  );
};

export default WelcomeLoader;
