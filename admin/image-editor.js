const imageEditor = (() => {
    const dialog = document.getElementById("crop-dialog");
    const canvas = document.getElementById("crop-canvas");
    const stage = dialog.querySelector(".crop-stage");
    const context = canvas.getContext("2d");
    const ratioInput = document.getElementById("crop-ratio");
    const zoomInput = document.getElementById("crop-zoom");
    const note = document.getElementById("crop-note");
    const suggestedRatios = { cover: "16:9", "social-post": "4:5", story: "9:16", square: "1:1", landscape: "16:9", other: "original" };
    let image;
    let sourceUrl;
    let sourceFile;
    let offsetX = 0;
    let offsetY = 0;
    let pointer;
    let finish;

    function currentRatio() {
        if (ratioInput.value === "original") return image.naturalWidth / image.naturalHeight;
        const [width, height] = ratioInput.value.split(":").map(Number);
        return width / height;
    }

    function draw() {
        if (!image) return;
        const ratio = currentRatio();
        canvas.width = 800;
        canvas.height = Math.round(800 / ratio);
        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * Number(zoomInput.value);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        offsetX = Math.max((canvas.width - width) / 2, Math.min((width - canvas.width) / 2, offsetX));
        offsetY = Math.max((canvas.height - height) / 2, Math.min((height - canvas.height) / 2, offsetY));
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, (canvas.width - width) / 2 + offsetX, (canvas.height - height) / 2 + offsetY, width, height);
        fitCanvas();
    }

    function fitCanvas() {
        const style = getComputedStyle(stage);
        const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
        if (!Number.isFinite(scale) || scale <= 0) return;
        canvas.style.width = `${Math.floor(canvas.width * scale)}px`;
        canvas.style.height = `${Math.floor(canvas.height * scale)}px`;
    }

    function settle(result) {
        dialog.close();
        URL.revokeObjectURL(sourceUrl);
        sourceUrl = null;
        image = null;
        finish?.(result);
        finish = null;
    }

    canvas.addEventListener("pointerdown", (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
        if (!pointer) return;
        offsetX += (event.clientX - pointer.x) * canvas.width / canvas.clientWidth;
        offsetY += (event.clientY - pointer.y) * canvas.height / canvas.clientHeight;
        pointer = { x: event.clientX, y: event.clientY };
        draw();
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(name, () => { pointer = null; });
    ratioInput.addEventListener("change", () => { offsetX = 0; offsetY = 0; draw(); });
    zoomInput.addEventListener("input", draw);
    window.addEventListener("resize", fitCanvas);
    document.getElementById("use-original").addEventListener("click", () => settle({ file: sourceFile, edited: false }));
    document.getElementById("cancel-crop").addEventListener("click", () => settle(null));
    document.getElementById("close-crop").addEventListener("click", () => settle(null));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); settle(null); });
    document.getElementById("use-crop").addEventListener("click", () => {
        const scale = Math.min(image.naturalWidth / canvas.width, image.naturalHeight / canvas.height, 2400 / canvas.width, 2400 / canvas.height);
        const output = document.createElement("canvas");
        output.width = Math.max(1, Math.round(canvas.width * scale));
        output.height = Math.max(1, Math.round(canvas.height * scale));
        const cropScale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * Number(zoomInput.value);
        const drawnWidth = image.naturalWidth * cropScale;
        const drawnHeight = image.naturalHeight * cropScale;
        const outputScale = output.width / canvas.width;
        output.getContext("2d").drawImage(image,
            ((canvas.width - drawnWidth) / 2 + offsetX) * outputScale,
            ((canvas.height - drawnHeight) / 2 + offsetY) * outputScale,
            drawnWidth * outputScale, drawnHeight * outputScale);
        const button = document.getElementById("use-crop");
        button.disabled = true;
        output.toBlob((blob) => {
            button.disabled = false;
            if (!blob) { note.textContent = "Could not export this image. Try the original file."; return; }
            if (blob.size > 10 * 1024 * 1024) { note.textContent = "The crop exceeds 10 MB. Zoom in more or use a smaller original."; return; }
            const extension = blob.type === "image/webp" ? "webp" : "png";
            const file = new File([blob], `${sourceFile.name.replace(/\.[^.]+$/, "")}-crop.${extension}`, { type: blob.type });
            settle({ file, edited: true });
        }, "image/webp", 0.88);
    });

    return {
        async open(file, category) {
            if (!file?.type.startsWith("image/")) throw new Error("Choose an image file.");
            sourceFile = file;
            sourceUrl = URL.createObjectURL(file);
            image = new Image();
            image.src = sourceUrl;
            try { await image.decode(); } catch {
                URL.revokeObjectURL(sourceUrl);
                image = null;
                throw new Error("This image could not be opened. Try a different file.");
            }
            ratioInput.value = suggestedRatios[category] || "original";
            zoomInput.value = "1";
            offsetX = 0;
            offsetY = 0;
            note.textContent = file.type === "image/gif" ? "Cropping an animated GIF saves a still frame. Use the original to keep its animation." : "Cropped images are exported as optimized WebP when supported.";
            dialog.showModal();
            draw();
            return new Promise((resolve) => { finish = resolve; });
        }
    };
})();
