const galleryWrapper = document.getElementById("galleryWrapper");
const gallery = document.getElementById("gallery");

const pricingButton = document.getElementById("pricingButton");
const pricingSection = document.getElementById("pricing");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxMagnifier = document.getElementById("lightboxMagnifier");

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("[data-section]");

const folderCards = document.querySelectorAll("[data-social-scroll]");


/* ========================================
   GALLERY
======================================== */

const originalItems = Array.from(
    gallery.querySelectorAll(".gallery-item")
);

originalItems.forEach((item) => {
    gallery.appendChild(item.cloneNode(true));
});

let singleSetWidth = 0;
let position = 0;

function measureGallery() {

    singleSetWidth = gallery.scrollWidth / 2;

    normalizeGallery();
    renderGallery();
}

function normalizeGallery() {

    if (!singleSetWidth) {
        return;
    }

    while (position <= -singleSetWidth) {
        position += singleSetWidth;
    }

    while (position > 0) {
        position -= singleSetWidth;
    }
}

function renderGallery() {

    gallery.style.transform =
        `translate3d(${position}px, 0, 0)`;
}

window.addEventListener("load", measureGallery);
window.addEventListener("resize", measureGallery);


/* ========================================
   GALLERY MOTION
======================================== */

let isDragging = false;
let pointerId = null;

let dragStartX = 0;
let dragStartPosition = 0;

let lastPointerX = 0;
let lastPointerTime = 0;

let dragVelocity = 0;
let momentum = 0;

let pressedItem = null;
let hasDragged = false;

const AUTO_SPEED = 18;
const MOMENTUM_MULTIPLIER = 2.0;
const MOMENTUM_FRICTION = 0.975;
const MAX_MOMENTUM = 2600;

let lastFrameTime = performance.now();

function galleryLoop(currentTime) {

    const delta =
        Math.min(
            currentTime - lastFrameTime,
            50
        );

    lastFrameTime = currentTime;

    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        if (Math.abs(momentum) > .1) {

            position +=
                momentum *
                (delta / 1000);

            momentum *=
                Math.pow(
                    MOMENTUM_FRICTION,
                    delta / 16.67
                );

        } else {

            momentum = 0;

            position -=
                AUTO_SPEED *
                (delta / 1000);
        }
    }

    normalizeGallery();
    renderGallery();

    requestAnimationFrame(galleryLoop);
}

requestAnimationFrame(galleryLoop);


/* ========================================
   GALLERY DRAG
======================================== */

galleryWrapper.addEventListener(
    "pointerdown",
    (event) => {

        if (event.button !== 0) {
            return;
        }

        if (event.target.closest(".zoom-trigger")) {
            return;
        }

        isDragging = true;
        pointerId = event.pointerId;

        hasDragged = false;
        momentum = 0;

        dragStartX = event.clientX;
        dragStartPosition = position;

        lastPointerX = event.clientX;
        lastPointerTime = performance.now();

        dragVelocity = 0;

        pressedItem =
            event.target.closest(".gallery-item");

        if (pressedItem) {
            pressedItem.classList.add("pressing");
        }

        galleryWrapper.classList.add("dragging");

        galleryWrapper.setPointerCapture(
            event.pointerId
        );
    }
);


galleryWrapper.addEventListener(
    "pointermove",
    (event) => {

        if (
            !isDragging ||
            event.pointerId !== pointerId
        ) {
            return;
        }

        const now = performance.now();

        const distance =
            event.clientX - dragStartX;

        if (Math.abs(distance) > 7) {
            hasDragged = true;
        }

        if (hasDragged && pressedItem) {
            pressedItem.classList.remove("pressing");
        }

        position =
            dragStartPosition + distance;

        normalizeGallery();
        renderGallery();

        const elapsed =
            now - lastPointerTime;

        if (elapsed > 0) {

            dragVelocity =
                (
                    event.clientX -
                    lastPointerX
                ) /
                (elapsed / 1000);
        }

        lastPointerX = event.clientX;
        lastPointerTime = now;
    }
);


function releaseGalleryDrag(event) {

    if (
        !isDragging ||
        event.pointerId !== pointerId
    ) {
        return;
    }

    isDragging = false;

    galleryWrapper.classList.remove("dragging");

    if (
        pressedItem &&
        !hasDragged
    ) {

        openProject(pressedItem);
    }

    if (hasDragged) {

        momentum =
            dragVelocity *
            MOMENTUM_MULTIPLIER;

        momentum =
            Math.max(
                -MAX_MOMENTUM,
                Math.min(
                    MAX_MOMENTUM,
                    momentum
                )
            );
    }

    if (pressedItem) {
        pressedItem.classList.remove("pressing");
    }

    pressedItem = null;
    pointerId = null;
    dragVelocity = 0;
}

galleryWrapper.addEventListener(
    "pointerup",
    releaseGalleryDrag
);

galleryWrapper.addEventListener(
    "pointercancel",
    releaseGalleryDrag
);


/* ========================================
   LIGHTBOX
======================================== */

function openProject(item) {

    const background =
        window.getComputedStyle(item).background;

    lightboxImage.style.background = background;

    lightbox.classList.add("active");

    lightboxMagnifier.classList.remove("active");
    lightboxImage.classList.remove("magnified");

    document.body.style.overflow = "hidden";
}


function closeLightbox() {

    lightbox.classList.remove("active");

    lightboxMagnifier.classList.remove("active");
    lightboxImage.classList.remove("magnified");

    removeZoomLens();

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
            event.target === lightbox
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
   LIGHTBOX MAGNIFIER
======================================== */

let zoomLens = null;
let magnifierActive = false;


function createZoomLens() {

    if (zoomLens) {
        return;
    }

    zoomLens =
        document.createElement("div");

    zoomLens.className = "zoom-lens";

    document.body.appendChild(zoomLens);
}


function removeZoomLens() {

    if (!zoomLens) {
        return;
    }

    zoomLens.remove();
    zoomLens = null;
}


function toggleMagnifier() {

    magnifierActive = !magnifierActive;

    lightboxMagnifier.classList.toggle(
        "active",
        magnifierActive
    );

    lightboxImage.classList.toggle(
        "magnified",
        magnifierActive
    );

    if (magnifierActive) {

        createZoomLens();

        zoomLens.classList.add("active");

    } else {

        if (zoomLens) {
            zoomLens.classList.remove("active");
        }
    }
}


lightboxMagnifier.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        toggleMagnifier();
    }
);


lightboxImage.addEventListener(
    "pointermove",
    (event) => {

        if (
            !magnifierActive ||
            !zoomLens
        ) {
            return;
        }

        const rect =
            lightboxImage.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const percentX =
            Math.max(
                0,
                Math.min(
                    100,
                    (x / rect.width) * 100
                )
            );

        const percentY =
            Math.max(
                0,
                Math.min(
                    100,
                    (y / rect.height) * 100
                )
            );

        zoomLens.style.left =
            `${event.clientX}px`;

        zoomLens.style.top =
            `${event.clientY}px`;

        zoomLens.style.background =
            lightboxImage.style.background;

        zoomLens.style.backgroundSize =
            "250% 250%";

        zoomLens.style.backgroundPosition =
            `${percentX}% ${percentY}%`;
    }
);


lightboxImage.addEventListener(
    "pointerleave",
    () => {

        if (zoomLens) {
            zoomLens.classList.remove("active");
        }
    }
);


lightboxImage.addEventListener(
    "pointerenter",
    () => {

        if (
            magnifierActive &&
            zoomLens
        ) {
            zoomLens.classList.add("active");
        }
    }
);


/* ========================================
   PRICING BUTTON
======================================== */

pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(pricingSection);
    }
);


/* ========================================
   UI FOLDER CARDS
======================================== */

folderCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const socials =
                    document.getElementById("socials");

                if (socials) {
                    smoothScrollTo(socials);
                }
            }
        );
    }
);


/* ========================================
   BOTTOM NAV
======================================== */

navItems.forEach(
    (item) => {

        item.addEventListener(
            "click",
            () => {

                const target =
                    document.getElementById(
                        item.dataset.target
                    );

                if (!target) {
                    return;
                }

                smoothScrollTo(target);
            }
        );
    }
);


/* ========================================
   SMOOTH PROGRAMMATIC SCROLL
======================================== */

let scrollAnimation = null;


function smoothScrollTo(element) {

    if (!element) {
        return;
    }

    const start =
        window.scrollY;

    const target =
        element.getBoundingClientRect().top +
        window.scrollY -
        35;

    const distance =
        target - start;

    const duration =
        Math.min(
            1200,
            Math.max(
                600,
                Math.abs(distance) * .65
            )
        );

    const startTime =
        performance.now();

    if (scrollAnimation) {
        cancelAnimationFrame(scrollAnimation);
    }

    function animate(currentTime) {

        const progress =
            Math.min(
                1,
                (currentTime - startTime) /
                duration
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                5
            );

        window.scrollTo(
            0,
            start +
            distance * eased
        );

        if (progress < 1) {

            scrollAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            scrollAnimation = null;
        }
    }

    scrollAnimation =
        requestAnimationFrame(animate);
}


/* ========================================
   NORMAL PAGE SCROLL MOMENTUM
======================================== */

let pageScrollVelocity = 0;
let pageScrollAnimation = null;
let lastWheelTime = 0;

const PAGE_SCROLL_FRICTION = .84;
const PAGE_SCROLL_MULTIPLIER = .9;


function animatePageMomentum() {

    if (Math.abs(pageScrollVelocity) < .3) {

        pageScrollVelocity = 0;
        pageScrollAnimation = null;
        return;
    }

    window.scrollBy(
        0,
        pageScrollVelocity
    );

    pageScrollVelocity *=
        PAGE_SCROLL_FRICTION;

    pageScrollAnimation =
        requestAnimationFrame(
            animatePageMomentum
        );
}


window.addEventListener(
    "wheel",
    (event) => {

        if (
            lightbox.classList.contains("active")
        ) {
            return;
        }

        /*
            The gallery intentionally ignores
            wheel input. The page scrolls instead.
        */

        event.preventDefault();

        if (scrollAnimation) {

            cancelAnimationFrame(
                scrollAnimation
            );

            scrollAnimation = null;
        }

        const now = performance.now();

        const timeSinceLastWheel =
            now - lastWheelTime;

        const multiplier =
            timeSinceLastWheel < 80
                ? 1.0
                : .72;

        pageScrollVelocity +=
            event.deltaY *
            PAGE_SCROLL_MULTIPLIER *
            multiplier;

        pageScrollVelocity =
            Math.max(
                -45,
                Math.min(
                    45,
                    pageScrollVelocity
                )
            );

        lastWheelTime = now;

        if (!pageScrollAnimation) {

            pageScrollAnimation =
                requestAnimationFrame(
                    animatePageMomentum
                );
        }

    },
    {
        passive: false
    }
);


/* ========================================
   ACTIVE NAVIGATION
======================================== */

const sectionObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        const id =
                            entry.target.dataset.section;

                        navItems.forEach(
                            (item) => {

                                item.classList.toggle(
                                    "active",
                                    item.dataset.target === id
                                );
                            }
                        );
                    }
                }
            );
        },
        {
            threshold: .25
        }
    );


sections.forEach(
    (section) => {

        sectionObserver.observe(section);
    }
);


/* ========================================
   FAQ
======================================== */

const faqItems =
    document.querySelectorAll(
        ".faq-item"
    );

faqItems.forEach(
    (item) => {

        item.addEventListener(
            "toggle",
            () => {

                if (!item.open) {
                    return;
                }

                faqItems.forEach(
                    (other) => {

                        if (
                            other !== item
                        ) {
                            other.removeAttribute("open");
                        }
                    }
                );
            }
        );
    }
);


/* ========================================
   PREVENT GALLERY IMAGE DRAGGING
======================================== */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();
    }
);


/* ========================================
   INITIAL MEASURE
======================================== */

if (document.readyState === "complete") {
    measureGallery();
} else {
    window.addEventListener(
        "load",
        measureGallery,
        { once: true }
    );
}
