const galleryWrapper = document.querySelector(".gallery-wrapper");
const gallery = document.querySelector("#gallery");

const items = document.querySelectorAll(".gallery-item");

const lightbox = document.querySelector("#lightbox");
const lightboxContent = document.querySelector("#lightboxContent");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxNumber = document.querySelector("#lightboxNumber");
const lightboxClose = document.querySelector("#lightboxClose");


/* =========================
   GALLERY DRAGGING
========================= */

let isDragging = false;

let startX = 0;
let startScroll = 0;

let velocity = 0;
let previousX = 0;

galleryWrapper.addEventListener("pointerdown", (event) => {

    if (event.target.closest(".gallery-item") && event.button !== 0) {
        return;
    }

    isDragging = true;

    startX = event.clientX;
    previousX = event.clientX;

    startScroll = galleryWrapper.scrollLeft;

    galleryWrapper.setPointerCapture(event.pointerId);

    galleryWrapper.classList.add("dragging");
});


galleryWrapper.addEventListener("pointermove", (event) => {

    if (!isDragging) return;

    const movement = event.clientX - startX;

    galleryWrapper.scrollLeft = startScroll - movement;

    velocity = event.clientX - previousX;

    previousX = event.clientX;
});


galleryWrapper.addEventListener("pointerup", () => {

    isDragging = false;

    galleryWrapper.classList.remove("dragging");

    applyMomentum();
});


galleryWrapper.addEventListener("pointercancel", () => {

    isDragging = false;

    galleryWrapper.classList.remove("dragging");

    applyMomentum();
});


/* =========================
   DRAG MOMENTUM
========================= */

function applyMomentum() {

    let momentum = velocity * 8;

    function animateMomentum() {

        if (Math.abs(momentum) < 0.5) return;

        galleryWrapper.scrollLeft -= momentum;

        momentum *= 0.94;

        requestAnimationFrame(animateMomentum);
    }

    requestAnimationFrame(animateMomentum);
}


/* =========================
   MOUSE WHEEL
========================= */

galleryWrapper.addEventListener(
    "wheel",
    (event) => {

        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {

            event.preventDefault();

            galleryWrapper.scrollLeft += event.deltaY;
        }

    },
    { passive: false }
);


/* =========================
   CLICK → LARGE IMAGE
========================= */

items.forEach((item) => {

    item.addEventListener("click", () => {

        if (Math.abs(velocity) > 3) {
            return;
        }

        const background =
            window.getComputedStyle(item).backgroundColor;

        const number =
            item.querySelector(".image-number").textContent;

        lightboxImage.style.background = background;

        lightboxNumber.textContent = number;

        lightbox.classList.add("active");

        document.body.style.overflow = "hidden";
    });

});


/* =========================
   CLOSE LIGHTBOX
========================= */

function closeLightbox() {

    lightbox.classList.remove("active");

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


/* =========================
   CONTINUOUS MOTION
========================= */

let automaticMotion = 0;

function automaticGalleryMovement() {

    if (!isDragging && !lightbox.classList.contains("active")) {

        automaticMotion += 0.15;

        galleryWrapper.scrollLeft += 0.15;
    }

    requestAnimationFrame(automaticGalleryMovement);
}

automaticGalleryMovement();
