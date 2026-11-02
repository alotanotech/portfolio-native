(() => {
    const trigger = document.querySelector('.cv-trigger');
    const dialog = document.querySelector('#cv-dialog');
    if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

    const panel = dialog.querySelector('.t-modal');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let closing = false;
    let backdropPointer = false;

    function closeDialog() {
        if (!dialog.open || closing) return;
        closing = true;
        panel.classList.remove('is-open');
        panel.classList.add('is-closing');
        const closeMs = reducedMotion.matches ? 0 : (parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--modal-close-dur')
        ) || 150);
        setTimeout(() => {
            dialog.close();
            panel.classList.remove('is-closing');
            closing = false;
        }, closeMs);
    }

    trigger.hidden = false;
    trigger.addEventListener('click', () => {
        dialog.showModal();
        document.documentElement.classList.add('cv-modal-open');
        // Commit the resting state before starting the opening transition.
        void panel.offsetWidth;
        panel.classList.add('is-open');
    });
    dialog.querySelector('.cv-close').addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeDialog();
    });
    dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const controls = [...dialog.querySelectorAll('button, a[href]')];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    // Require both ends of the click outside the panel, so dragging out won't close it.
    dialog.addEventListener('pointerdown', (event) => { backdropPointer = event.target === dialog; });
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog && backdropPointer) closeDialog();
        backdropPointer = false;
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('cv-modal-open');
        panel.classList.remove('is-open', 'is-closing');
        trigger.focus({ preventScroll: true });
    });
})();
