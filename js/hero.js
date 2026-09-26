/* =========================================================
   HERO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(".hero");
    const heroImg = document.querySelector(".hero-img");
    const cursor = document.querySelector(".hero-cursor");

    if (!hero || !heroImg) return;

    const cyberLayer = heroImg.querySelector(".cyber-layer");

    cyberLayer?.addEventListener("animationend", (event) => {
        if (event.target === cyberLayer && event.animationName === "hero-cyber-intro") {
            heroImg.classList.add("is-intro-complete");
        }
    });


    /* =====================================================
       SETTINGS
    ===================================================== */

    const BRUSH_SIZE = 180;


    /*
        Hover glitch frequency.
    */

    const HOVER_GLITCH_MIN = 3000;
    const HOVER_GLITCH_MAX = 4000;


    /*
        Ambient glitch frequency.

        Time between complete ambient cycles.
    */

    const AMBIENT_GLITCH_MIN = 2000;
    const AMBIENT_GLITCH_MAX = 4000;


    /*
        Hover glitch duration.
    */

    const HOVER_GLITCH_DURATION = 500;


    /*
        Ambient transition duration.

        Used for:

            Regular → Cyber
            Cyber → Regular
    */

    const AMBIENT_GLITCH_DURATION = 700;


    /*
        How long Cyber stays fully visible.
    */

    const AMBIENT_CYBER_HOLD = 2000;


    /* =====================================================
       STATE
    ===================================================== */

    let isHovering = false;


    /*
        Scheduling timers.
    */

    let hoverGlitchTimer = null;
    let ambientGlitchTimer = null;


    /*
        Animation timers.
    */

    let hoverGlitchTimeout = null;
    let ambientGlitchTimeout = null;
    let ambientHoldTimeout = null;
    let ambientExitTimeout = null;

    let pointerFrame = null;
    let latestPointerEvent = null;


    /* =====================================================
       RANDOM TIME
    ===================================================== */

    function randomTime(min, max) {

        return Math.floor(
            Math.random() * (max - min + 1) + min
        );

    }


    /* =====================================================
       CUSTOM CURSOR
    ===================================================== */

    function renderPointer() {

        pointerFrame = null;

        if (!latestPointerEvent) {
            return;
        }

        const event = latestPointerEvent;

        if (cursor) {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        }

        updateBrush(event);
    }


    function queuePointerUpdate(event) {

        latestPointerEvent = event;

        if (pointerFrame) {
            return;
        }

        pointerFrame = requestAnimationFrame(renderPointer);
    }


    hero.addEventListener("mousemove", queuePointerUpdate);


    /* =====================================================
       UPDATE BRUSH
    ===================================================== */

    function updateBrush(event) {

        const rect = heroImg.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        heroImg.style.setProperty(
            "--mouse-x",
            `${x}px`
        );

        heroImg.style.setProperty(
            "--mouse-y",
            `${y}px`
        );

        heroImg.style.setProperty(
            "--brush-size",
            `${BRUSH_SIZE}px`
        );

    }


    /* =====================================================
       RESET AMBIENT STATE
    ===================================================== */

    function resetAmbientState() {

        clearTimeout(ambientGlitchTimer);
        clearTimeout(ambientGlitchTimeout);
        clearTimeout(ambientHoldTimeout);
        clearTimeout(ambientExitTimeout);

        ambientGlitchTimer = null;
        ambientGlitchTimeout = null;
        ambientHoldTimeout = null;
        ambientExitTimeout = null;

        heroImg.classList.remove(
            "ambient-glitch",
            "ambient-cyber",
            "ambient-exit"
        );

    }


    /* =====================================================
       CANCEL AMBIENT GLITCH
    ===================================================== */

    function cancelAmbientGlitch() {

        resetAmbientState();

    }


    /* =====================================================
       CANCEL HOVER GLITCH
    ===================================================== */

    function cancelHoverGlitch() {

        clearTimeout(hoverGlitchTimeout);

        hoverGlitchTimeout = null;

        heroImg.classList.remove("glitch");

    }


    /* =====================================================
       TRIGGER HOVER GLITCH
    ===================================================== */

    function triggerHoverGlitch() {

        /*
            Hover interaction always wins.

            Ambient mode is cancelled first.
        */

        cancelAmbientGlitch();


        /*
            Restart the animation cleanly.
        */

        heroImg.classList.remove("glitch");

        void heroImg.offsetWidth;


        /*
            Cyber brush glitch only.
        */

        heroImg.classList.add("glitch");


        clearTimeout(hoverGlitchTimeout);

        hoverGlitchTimeout = setTimeout(() => {

            heroImg.classList.remove("glitch");

            hoverGlitchTimeout = null;

        }, HOVER_GLITCH_DURATION);

    }


    /* =====================================================
       SCHEDULE HOVER GLITCH
    ===================================================== */

    function scheduleHoverGlitch() {

        clearTimeout(hoverGlitchTimer);

        hoverGlitchTimer = setTimeout(() => {

            hoverGlitchTimer = null;


            if (!isHovering) {
                return;
            }


            triggerHoverGlitch();

            scheduleHoverGlitch();

        }, randomTime(
            HOVER_GLITCH_MIN,
            HOVER_GLITCH_MAX
        ));

    }


    /* =====================================================
       MOUSE ENTER
    ===================================================== */

    heroImg.addEventListener("mouseenter", (event) => {

        isHovering = true;

        // User interaction takes over even if the one-time intro is still running.
        heroImg.classList.add("is-intro-complete");


        /*
            Immediately cancel any ambient cycle.

            This handles entering during:

                Regular → Cyber
                Cyber hold
                Cyber → Regular
        */

        cancelAmbientGlitch();


        /*
            Stop any hover animation currently running.
        */

        cancelHoverGlitch();


        /*
            Enable the Cyber brush.
        */

        heroImg.classList.add("is-brush-active");


        /*
            Position the brush.
        */

        queuePointerUpdate(event);


        /*
            Immediate hover glitch.
        */

        triggerHoverGlitch();


        /*
            Start hover glitch cycle.
        */

        scheduleHoverGlitch();

    });


    /* =====================================================
       MOUSE MOVE
    ===================================================== */

    heroImg.addEventListener("mousemove", (event) => {

        /*
            Keep the brush following the cursor.
        */

        queuePointerUpdate(event);

    });


    /* =====================================================
       MOUSE LEAVE
    ===================================================== */

    heroImg.addEventListener("mouseleave", () => {

        isHovering = false;


        /*
            Disable the Cyber brush.
        */

        heroImg.classList.remove("is-brush-active");


        /*
            Stop future hover glitches.
        */

        clearTimeout(hoverGlitchTimer);

        hoverGlitchTimer = null;


        /*
            Stop current hover glitch.
        */

        cancelHoverGlitch();


        /*
            Ensure no previous ambient state survives.
        */

        resetAmbientState();


        /*
            Start a fresh ambient timer.
        */

        scheduleAmbientGlitch();

    });


    /* =====================================================
       TRIGGER AMBIENT GLITCH
    ===================================================== */

    function triggerAmbientGlitch() {

        /*
            Never run ambient while hovering.
        */

        if (isHovering) {
            return;
        }


        /*
            Clear any previous animation timers.
        */

        clearTimeout(ambientGlitchTimeout);
        clearTimeout(ambientHoldTimeout);
        clearTimeout(ambientExitTimeout);

        ambientGlitchTimeout = null;
        ambientHoldTimeout = null;
        ambientExitTimeout = null;


        /*
            Remove previous ambient classes.
        */

        heroImg.classList.remove(
            "glitch",
            "ambient-glitch",
            "ambient-cyber",
            "ambient-exit"
        );


        /*
            Force browser to restart the animation.
        */

        void heroImg.offsetWidth;


        /* =================================================
           PHASE 1

           REGULAR
              ↓
           GLITCH
              ↓
           CYBER
        ================================================= */

        heroImg.classList.add(
            "ambient-glitch"
        );


        /*
            Wait for transition to finish.
        */

        ambientGlitchTimeout = setTimeout(() => {

            ambientGlitchTimeout = null;


            /*
                User entered during transition.
            */

            if (isHovering) {

                heroImg.classList.remove(
                    "ambient-glitch"
                );

                return;

            }


            /* =============================================
               PHASE 2

               CYBER HOLD
            ============================================= */

            heroImg.classList.remove(
                "ambient-glitch"
            );

            heroImg.classList.add(
                "ambient-cyber"
            );


            /*
                Hold Cyber completely visible.
            */

            ambientHoldTimeout = setTimeout(() => {

                ambientHoldTimeout = null;


                /*
                    User entered during Cyber hold.
                */

                if (isHovering) {

                    heroImg.classList.remove(
                        "ambient-cyber"
                    );

                    return;

                }


                /* =========================================
                   PHASE 3

                   CYBER
                      ↓
                   GLITCH
                      ↓
                   REGULAR
                ========================================= */

                heroImg.classList.remove(
                    "ambient-cyber",
                    "ambient-exit"
                );


                /*
                    Force a fresh animation.
                */

                void heroImg.offsetWidth;


                /*
                    Start exit glitch.

                    Regular remains hidden.

                    Cyber remains fully visible.
                */

                heroImg.classList.add(
                    "ambient-exit"
                );


                /*
                    Wait for exit glitch.
                */

                ambientExitTimeout = setTimeout(() => {

                    ambientExitTimeout = null;


                    /*
                        User entered during exit.
                    */

                    if (isHovering) {

                        heroImg.classList.remove(
                            "ambient-exit",
                            "ambient-cyber"
                        );

                        return;

                    }


                    /*
                        FINAL STATE

                        Remove ambient classes.

                        This returns to:

                            Regular visible
                            Cyber hidden
                            Brush ready
                    */

                    heroImg.classList.remove(
                        "ambient-exit",
                        "ambient-cyber"
                    );


                    /*
                        Schedule the next ambient cycle.
                    */

                    scheduleAmbientGlitch();

                }, AMBIENT_GLITCH_DURATION);

            }, AMBIENT_CYBER_HOLD);

        }, AMBIENT_GLITCH_DURATION);

    }


    /* =====================================================
       SCHEDULE AMBIENT GLITCH
    ===================================================== */

    function scheduleAmbientGlitch() {

        clearTimeout(ambientGlitchTimer);

        ambientGlitchTimer = setTimeout(() => {

            ambientGlitchTimer = null;


            if (!isHovering) {

                triggerAmbientGlitch();

            } else {

                /*
                    User is hovering.

                    Try again later.
                */

                scheduleAmbientGlitch();

            }

        }, randomTime(
            AMBIENT_GLITCH_MIN,
            AMBIENT_GLITCH_MAX
        ));

    }


    /* =====================================================
       START
    ===================================================== */

    scheduleAmbientGlitch();

});
