import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-sky-100 to-sky-200 p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="space-y-8">
          <div className="space-y-4 animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500">
              Fish Can Climb
            </h1>
            <p className="text-xl text-blue-700 italic">
              "Some limits exist only because we believe them."
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="rounded-2xl border border-blue-300 bg-white/80 backdrop-blur-sm p-8 shadow-2xl">
              <div className="space-y-6">
                <p className="text-lg text-slate-700">
                  A vertical endless runner where a fish climbs an infinite tree trunk. 
                  Avoid rocks 🪨 and collect stars ⭐ to score points!
                </p>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="rounded-lg bg-blue-100 p-4">
                    <h3 className="font-bold text-blue-700 mb-2">Controls</h3>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>↑ ↓ Vertical movement</p>
                      <p>← → Lateral shift</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-sky-100 p-4">
                    <h3 className="font-bold text-sky-700 mb-2">Goal</h3>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>Collect stars ⭐</p>
                      <p>Avoid rocks 🪨</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/game"
                  className="block w-full max-w-xs mx-auto"
                >
                  <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white text-xl font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95">
                    Play Now
                  </button>
                </Link>

                <p className="text-sm text-slate-500/70 mt-4">
                  Desktop-first · Responsive · Emoji-based graphics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
