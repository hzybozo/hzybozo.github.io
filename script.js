const galleryWrapper = document.querySelector(".gallery-wrapper");
const items = document.querySelectorAll(".gallery-item");

const lightbox = document.querySelector("#lightbox");
const lightboxContent = document.querySelector("#lightboxContent");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxNumber = document.querySelector("#lightboxNumber");
const lightboxClose = document.querySelector("#lightboxClose");

let isDragging = false;
let startX = 0;
let startScroll = 0;
let velocity = 0;
let previousX = 0;


/* DRAG */

galleryWrapper.addEventListener("pointerdown", (event) => {
    isDragging = true;

    startX = event.clientX;
    previousX = event.clientX;
    startScroll = galleryWrapper.scrollLeft;

    galleryWrapper.setPointerCapture(event.pointerId);
});

galleryWrapper.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const movement = event.clientX - startX;

    galleryWrapper.scrollLeft = startScroll - movement;

    velocity = event.clientX - previousX;
    previousX = event.clientX;
});

function stopDragging() {
    if (!isDragging) return;

    isDragging = false;
    applyMomentum();
}

galleryWrapper.addEventListener("pointerup", stopDragging);
galleryWrapper.addEventListener("pointercancel", stopDragging);


/* MOMENTUM */

function applyMomentum() {
    let momentum = velocity * 8;

    function animate() {
        if (Math.abs(momentum) < 0.5) return;

        galleryWrapper.scrollLeft -= momentum;
        momentum *= 0.94;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


/* MOUSE WHEEL */

galleryWrapper.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        galleryWrapper.scrollLeft += event.deltaY;
    }
}, { passive: false });


/* OPEN IMAGE */

items.forEach((item) => {

    item.addEventListener("click", () => {

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


/* CLOSE */

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
    if (
        event.target === lightbox ||
        event.target === lightboxContent
    ) {
        closeLightbox();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLightbox();
    }
});


/* AUTOMATIC MOVEMENT */

function automaticGalleryMovement() {

    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {
        galleryWrapper.scrollLeft += 0.15;
    }

    requestAnimationFrame(automaticGalleryMovement);
}

automaticGalleryMovement();
