import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";


const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (

      <div className="relative min-h-screen overflow-hidden">

        {/* CONTEÚDO */}
        <div className="relative z-10 min-h-screen px-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center"
          >
            {/* 404 */}
            <div className="flex flex-1 items-center justify-center">
              <h2
                className="
                  font-family font-black tracking-tight leading-none
                  text-[clamp(120px,18vw,320px)]
                  flex items-center justify-center
                  text-black
                "
              >
                <span className="gradient-text">4</span>{" "}

                {/* LOGO/VÍDEO = 0 (SEM BORDA) */}
                <span
                  aria-hidden="true"
                  className="
                    mx-[0.10em] inline-flex items-center justify-center
                    align-middle
                    h-[1.1em] w-[1.1em]
                    overflow-hidden
                  "
                >
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  >
                    <source
                      src="/images/not-found/video-not-found3.mp4"
                      type="video/mp4"
                    />
                  </video>
                </span>

                <span className="gradient-text">4</span>{" "}
              </h2>
            </div>

            {/* TEXTO + BOTÕES */}
            <div className="pb-20 text-center">

              <div className="mt-10 flex items-center justify-center gap-3">
                <a
                  href="/"
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/80 transition"
                >
                  Voltar para Home
                </a>
                <a
                  href="/contact"
                  className="rounded-xl border border-black/30 bg-black/5 px-5 py-3 text-sm font-semibold text-black hover:bg-black/10 transition"
                >
                  Fale Conosco
                </a>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
  );
};

export default NotFound;
