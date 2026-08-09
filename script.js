const galleryWrapper = document.getElementById("galleryWrapper");
const gallery = document.getElementById("gallery");

const items = document.querySelectorAll(".gallery-item");

const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxNumber = document.getElementById("lightboxNumber");
const lightboxClose = document.getElementById("lightboxClose");


/* ========================================
   DRAGGING
======================================== */

let isDragging = false;

let startX = 0;
let startScroll = 0;

let previousX = 0;
let velocity = 0;

let movedDuringDrag = false;


galleryWrapper.addEventListener("pointerdown", (event) => {

    if (event.button !== 0) {
        return;
    }

    isDragging = true;

    movedDuringDrag = false;

    startX = event.clientX;

    previousX = event.clientX;

    startScroll = galleryWrapper.scrollLeft;

    velocity = 0;

    galleryWrapper.classList.add("dragging");

    galleryWrapper.setPointerCapture(event.pointerId);

});


galleryWrapper.addEventListener("pointermove", (event) => {

    if (!isDragging) {
        return;
    }

    const movement =
        event.clientX - startX;

    if (Math.abs(movement) > 5) {
        movedDuringDrag = true;
    }

    galleryWrapper.scrollLeft =
        startScroll - movement;

    velocity =
        event.clientX - previousX;

    previousX =
        event.clientX;

});


function stopDragging() {

    if (!isDragging) {
        return;
    }

    isDragging = false;

    galleryWrapper.classList.remove("dragging");

    applyMomentum();

}


galleryWrapper.addEventListener(
    "pointerup",
    stopDragging
);

galleryWrapper.addEventListener(
    "pointercancel",
    stopDragging
);


/* ========================================
   MOMENTUM
======================================== */

function applyMomentum() {

    let momentum =
        velocity * 8;

    function animateMomentum() {

        if (Math.abs(momentum) < 0.5) {
            return;
        }

        galleryWrapper.scrollLeft -= momentum;

        momentum *= 0.94;

        requestAnimationFrame(
            animateMomentum
        );

    }

    requestAnimationFrame(
        animateMomentum
    );

}


/* ========================================
   MOUSE WHEEL
======================================== */

galleryWrapper.addEventListener(
    "wheel",
    (event) => {

        if (
            Math.abs(event.deltaY) >
            Math.abs(event.deltaX)
        ) {

            event.preventDefault();

            galleryWrapper.scrollLeft +=
                event.deltaY;

        }

    },
    {
        passive: false
    }
);


/* ========================================
   PROJECT CLICK
======================================== */

items.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            if (movedDuringDrag) {
                movedDuringDrag = false;
                return;
            }

            const background =
                window.getComputedStyle(item)
                    .backgroundColor;

            const number =
                item.querySelector(
                    ".image-number"
                ).textContent;

            lightboxImage.style.background =
                background;

            lightboxNumber.textContent =
                number;

            lightbox.classList.add(
                "active"
            );

            document.body.style.overflow =
                "hidden";

        }
    );

});


/* ========================================
   CLOSE LIGHTBOX
======================================== */

function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );

    document.body.style.overflow = "";

}


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightbox.addEventListener(
    "click",
    (event) => {

        if (
            event.target === lightbox ||
            event.target === lightboxContent
        ) {

            closeLightbox();

        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {
            closeLightbox();
        }

    }
);


/* ========================================
   AUTOMATIC MOVEMENT
======================================== */

let automaticSpeed = 0.18;


function automaticMovement() {

    if (
        !isDragging &&
        !lightbox.classList.contains(
            "active"
        )
    ) {

        galleryWrapper.scrollLeft +=
            automaticSpeed;

    }

    requestAnimationFrame(
        automaticMovement
    );

}


automaticMovement();
