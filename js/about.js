/* =========================================================
   ABOUT
   ---------------------------------------------------------
   IDENTITY PHOTO
   - Hover brush reveal
   - Hover glitch
   - Ambient idle glitch
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const identityPhotos =
        document.querySelectorAll(".identity-photo");


    if (!identityPhotos.length) {
        return;
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    /*
        Brush size.

        The actual responsive size is controlled by CSS.
        This value only exists as a JS fallback.
    */

    const BRUSH_SIZE = 70;


    /*
        Hover glitch frequency.

        While hovering, the profile can glitch
        repeatedly every 3–4 seconds.
    */

    const HOVER_GLITCH_MIN = 3000;
    const HOVER_GLITCH_MAX = 4000;


    /*
        Ambient glitch frequency.

        Time between complete idle cycles.
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
        How long Cyber remains fully visible.
    */

    const AMBIENT_CYBER_HOLD = 2000;


    /* =====================================================
       RANDOM TIME
    ===================================================== */

    function randomTime(min, max) {

        return Math.floor(
            Math.random() * (max - min + 1) + min
        );

    }


    /* =====================================================
       INITIALIZE EACH IDENTITY PHOTO
    ===================================================== */

    identityPhotos.forEach((photo) => {

        let isHovering = false;


        /* =================================================
           TIMERS
        ================================================= */

        let hoverGlitchTimer = null;
        let ambientGlitchTimer = null;


        let hoverGlitchTimeout = null;

        let ambientGlitchTimeout = null;
        let ambientHoldTimeout = null;
        let ambientExitTimeout = null;


        /* =================================================
           UPDATE BRUSH
        ================================================= */

        function updateBrush(event) {

            const rect =
                photo.getBoundingClientRect();


            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;


            photo.style.setProperty(
                "--mouse-x",
                `${x}px`
            );


            photo.style.setProperty(
                "--mouse-y",
                `${y}px`
            );


            /*
                Only apply JS brush size if CSS
                has not already provided one.
            */

            if (!photo.style.getPropertyValue("--brush-size")) {

                photo.style.setProperty(
                    "--brush-size",
                    `${BRUSH_SIZE}px`
                );

            }

        }


        /* =================================================
           RESET AMBIENT STATE
        ================================================= */

        function resetAmbientState() {

            clearTimeout(ambientGlitchTimer);
            clearTimeout(ambientGlitchTimeout);
            clearTimeout(ambientHoldTimeout);
            clearTimeout(ambientExitTimeout);


            ambientGlitchTimer = null;
            ambientGlitchTimeout = null;
            ambientHoldTimeout = null;
            ambientExitTimeout = null;


            photo.classList.remove(
                "ambient-glitch",
                "ambient-cyber",
                "ambient-exit"
            );

        }


        /* =================================================
           CANCEL AMBIENT
        ================================================= */

        function cancelAmbientGlitch() {

            resetAmbientState();

        }


        /* =================================================
           CANCEL HOVER GLITCH
        ================================================= */

        function cancelHoverGlitch() {

            clearTimeout(hoverGlitchTimeout);

            hoverGlitchTimeout = null;


            photo.classList.remove(
                "glitch"
            );

        }


        /* =================================================
           TRIGGER HOVER GLITCH
        ================================================= */

        function triggerHoverGlitch() {

            /*
                Hover always wins.

                Ambient animation is cancelled first.
            */

            cancelAmbientGlitch();


            /*
                Restart animation cleanly.
            */

            photo.classList.remove(
                "glitch"
            );


            void photo.offsetWidth;


            photo.classList.add(
                "glitch"
            );


            /*
                Force cleanup.

                This prevents the class from getting stuck
                if animationend is interrupted.
            */

            clearTimeout(
                hoverGlitchTimeout
            );


            hoverGlitchTimeout = setTimeout(() => {

                photo.classList.remove(
                    "glitch"
                );


                hoverGlitchTimeout = null;

            }, HOVER_GLITCH_DURATION);

        }


        /* =================================================
           SCHEDULE HOVER GLITCH
        ================================================= */

        function scheduleHoverGlitch() {

            clearTimeout(
                hoverGlitchTimer
            );


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


        /* =================================================
           TRIGGER AMBIENT GLITCH
        ================================================= */

        function triggerAmbientGlitch() {

            /*
                Never run ambient animation
                while the user is hovering.
            */

            if (isHovering) {
                return;
            }


            /*
                Clear any previous animation timers.
            */

            clearTimeout(
                ambientGlitchTimeout
            );

            clearTimeout(
                ambientHoldTimeout
            );

            clearTimeout(
                ambientExitTimeout
            );


            ambientGlitchTimeout = null;
            ambientHoldTimeout = null;
            ambientExitTimeout = null;


            /*
                Remove all previous states.
            */

            photo.classList.remove(
                "glitch",
                "ambient-glitch",
                "ambient-cyber",
                "ambient-exit"
            );


            /*
                Force animation restart.
            */

            void photo.offsetWidth;


            /* =============================================
               PHASE 1

               REGULAR
                  ↓
               GLITCH
                  ↓
               CYBER
            ============================================= */

            photo.classList.add(
                "ambient-glitch"
            );


            ambientGlitchTimeout = setTimeout(() => {

                ambientGlitchTimeout = null;


                /*
                    User entered during transition.
                */

                if (isHovering) {

                    photo.classList.remove(
                        "ambient-glitch"
                    );

                    return;

                }


                /* =========================================
                   PHASE 2

                   CYBER HOLD
                ========================================= */

                photo.classList.remove(
                    "ambient-glitch"
                );


                photo.classList.add(
                    "ambient-cyber"
                );


                /*
                    Keep Cyber completely visible.
                */

                ambientHoldTimeout = setTimeout(() => {

                    ambientHoldTimeout = null;


                    /*
                        User entered during Cyber hold.
                    */

                    if (isHovering) {

                        photo.classList.remove(
                            "ambient-cyber"
                        );

                        return;

                    }


                    /* =====================================
                       PHASE 3

                       CYBER
                          ↓
                       GLITCH
                          ↓
                       REGULAR
                    ===================================== */

                    photo.classList.remove(
                        "ambient-cyber",
                        "ambient-exit"
                    );


                    /*
                        Force fresh animation.
                    */

                    void photo.offsetWidth;


                    /*
                        Start exit glitch.
                    */

                    photo.classList.add(
                        "ambient-exit"
                    );


                    /*
                        Wait until transition finishes.
                    */

                    ambientExitTimeout = setTimeout(() => {

                        ambientExitTimeout = null;


                        /*
                            User entered during exit.
                        */

                        if (isHovering) {

                            photo.classList.remove(
                                "ambient-exit",
                                "ambient-cyber"
                            );

                            return;

                        }


                        /*
                            Return to normal state.
                        */

                        photo.classList.remove(
                            "ambient-exit",
                            "ambient-cyber"
                        );


                        /*
                            Start another idle cycle.
                        */

                        scheduleAmbientGlitch();

                    }, AMBIENT_GLITCH_DURATION);

                }, AMBIENT_CYBER_HOLD);

            }, AMBIENT_GLITCH_DURATION);

        }


        /* =================================================
           SCHEDULE AMBIENT GLITCH
        ================================================= */

        function scheduleAmbientGlitch() {

            clearTimeout(
                ambientGlitchTimer
            );


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


        /* =================================================
           POINTER ENTER
        ================================================= */

        photo.addEventListener(
            "pointerenter",
            (event) => {

                isHovering = true;


                /*
                    Cancel any ambient cycle.

                    This handles entering during:

                        Regular → Cyber
                        Cyber hold
                        Cyber → Regular
                */

                cancelAmbientGlitch();


                /*
                    Stop current hover animation.
                */

                cancelHoverGlitch();


                /*
                    Enable brush.
                */

                photo.classList.add(
                    "is-brush-active"
                );


                /*
                    Position brush immediately.
                */

                updateBrush(event);


                /*
                    Immediate hover glitch.
                */

                triggerHoverGlitch();


                /*
                    Start repeating hover glitches.
                */

                scheduleHoverGlitch();

            }
        );


        /* =================================================
           POINTER MOVE
        ================================================= */

        photo.addEventListener(
            "pointermove",
            (event) => {

                updateBrush(event);

            }
        );


        /* =================================================
           POINTER LEAVE
        ================================================= */

        photo.addEventListener(
            "pointerleave",
            () => {

                isHovering = false;


                /*
                    Disable brush.
                */

                photo.classList.remove(
                    "is-brush-active"
                );


                /*
                    Remove cursor position.
                */

                photo.style.removeProperty(
                    "--mouse-x"
                );

                photo.style.removeProperty(
                    "--mouse-y"
                );


                /*
                    Stop future hover glitches.
                */

                clearTimeout(
                    hoverGlitchTimer
                );

                hoverGlitchTimer = null;


                /*
                    Stop current hover glitch.
                */

                cancelHoverGlitch();


                /*
                    Stop any ambient cycle.
                */

                resetAmbientState();


                /*
                    Start a fresh idle cycle.
                */

                scheduleAmbientGlitch();

            }
        );


        /* =================================================
           ANIMATION END
        ================================================= */

        photo.addEventListener(
            "animationend",
            (event) => {

                /*
                    Hover glitch.
                */

                if (
                    event.animationName ===
                    "cyber-brush-glitch"
                ) {

                    photo.classList.remove(
                        "glitch"
                    );

                }

            }
        );


        /* =================================================
           START IDLE SYSTEM
        ================================================= */

        scheduleAmbientGlitch();

    });

});