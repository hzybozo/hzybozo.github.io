/* ========================================
   ELEMENTS
======================================== */

const galleryWrapper = document.getElementById("galleryWrapper");
const gallery = document.getElementById("gallery");

const pricingButton = document.getElementById("pricingButton");
const socialsHeroButton = document.getElementById("socialsHeroButton");
const contactButton = document.getElementById("contactButton");

const pricingSection = document.getElementById("pricing");
const socialsSection = document.getElementById("socials");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxMagnifier = document.getElementById("lightboxMagnifier");

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("[data-section]");
const revealSections = document.querySelectorAll(".section-reveal");

const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");
const scrollProgress = document.getElementById("scrollProgress");


/* ========================================
   CURSOR
======================================== */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

document.addEventListener(
    "pointermove",
    (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

    },
    { passive: true }
);


function updateCursor() {

    cursorX += (mouseX - cursorX) * 0.075;
    cursorY += (mouseY - cursorY) * 0.075;

    cursorDot.style.transform =
        `translate3d(${cursorX - 4}px, ${cursorY - 4}px, 0)`;

    cursorGlow.style.transform =
        `translate3d(${cursorX - 180}px, ${cursorY - 180}px, 0)`;

}


/* ========================================
   SMOOTH 3D TILT

   Notes on the perf changes here:

   - getBoundingClientRect() is a forced layout read.
     The original code called it on every single raw
     pointermove event, for every tilt element on the
     page (including all 24 gallery frames). That's
     what made things like dragging across the gallery
     feel heavy - lots of layout thrashing on the main
     thread.

   - Now, the rect is only measured once per hover
     (cached on pointerenter) and the actual tilt target
     is only recalculated once per animation frame inside
     updateTilt(), no matter how many pointermove events
     fired in between. The visual result (a smooth tilt
     that follows the cursor) is identical.

   - will-change is now toggled on only while an element
     is actively hovered, instead of being permanently set
     on every card/frame in CSS.
======================================== */

const tiltElements = document.querySelectorAll(
    ".tilt-frame, .gallery-item, .folder-card, .pricing-card, .tool-card, .social-card"
);

const tiltStates = new Map();

tiltElements.forEach((element) => {

    const state = {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        hovering: false,
        rect: null,
        pendingEvent: null
    };

    tiltStates.set(element, state);

    element.addEventListener(
        "pointerenter",
        () => {

            state.hovering = true;
            state.rect = element.getBoundingClientRect();

            element.classList.add("tilting");

        },
        { passive: true }
    );

    element.addEventListener(
        "pointermove",
        (event) => {

            if (
                event.target.closest("button") ||
                event.target.closest("a")
            ) {
                return;
            }

            /*
                Just store the event - the actual math
                happens at most once per frame, inside
                updateTilt().
            */

            state.pendingEvent = event;

        },
        { passive: true }
    );

    element.addEventListener(
        "pointerleave",
        () => {

            state.targetX = 0;
            state.targetY = 0;
            state.hovering = false;
            state.rect = null;
            state.pendingEvent = null;

            element.classList.remove("tilting");

        },
        { passive: true }
    );

});


/*
    Cached rects go stale if the page scrolls or the
    window resizes, so drop them and let them be
    re-measured lazily on the next frame that needs one.
*/

function invalidateTiltRects() {

    tiltStates.forEach((state) => {

        if (state.hovering) {
            state.rect = null;
        }

    });

}


window.addEventListener(
    "resize",
    invalidateTiltRects
);

window.addEventListener(
    "scroll",
    invalidateTiltRects,
    { passive: true }
);


function updateTilt() {

    tiltStates.forEach((state, element) => {

        if (
            state.hovering &&
            state.pendingEvent
        ) {

            if (!state.rect) {

                state.rect =
                    element.getBoundingClientRect();

            }

            const rect = state.rect;
            const event = state.pendingEvent;

            const x =
                (event.clientX - rect.left) /
                rect.width;

            const y =
                (event.clientY - rect.top) /
                rect.height;

            state.targetY =
                (x - 0.5) * 7;

            state.targetX =
                (y - 0.5) * -7;

            state.pendingEvent = null;

        }

        /*
            Smooth interpolation.

            This is deliberately low so the tilt
            follows the mouse without snapping.
        */

        state.currentX +=
            (state.targetX - state.currentX) * 0.075;

        state.currentY +=
            (state.targetY - state.currentY) * 0.075;

        const settling =
            Math.abs(state.currentX) < 0.01 &&
            Math.abs(state.currentY) < 0.01 &&
            !state.hovering;

        if (settling) {

            state.currentX = 0;
            state.currentY = 0;

            element.style.transform = "";

            return;
        }

        element.style.transform =
            `perspective(900px)
             rotateX(${state.currentX}deg)
             rotateY(${state.currentY}deg)
             translateY(${state.hovering ? -4 : 0}px)`;

    });

}


/* ========================================
   GALLERY DUPLICATION
======================================== */

const originalItems =
    Array.from(
        gallery.querySelectorAll(".gallery-item")
    );

originalItems.forEach((item) => {

    gallery.appendChild(
        item.cloneNode(true)
    );

});

let gallerySetWidth = 0;
let galleryPosition = 0;

let galleryLastTime = performance.now();

const AUTO_SPEED = 18;


/* ========================================
   GALLERY DRAG
======================================== */

let isDragging = false;
let pointerId = null;

let dragStartX = 0;
let dragStartPosition = 0;

let lastPointerX = 0;
let lastPointerTime = 0;

let dragVelocity = 0;
let galleryMomentum = 0;

let pressedItem = null;
let hasDragged = false;

const MOMENTUM_MULTIPLIER = 4.6;
const MOMENTUM_FRICTION = .972;
const MAX_MOMENTUM = 6500;


function measureGallery() {

    gallerySetWidth =
        gallery.scrollWidth / 2;

    normalizeGallery();
    renderGallery();

}


function normalizeGallery() {

    if (!gallerySetWidth) {
        return;
    }

    /*
        Equivalent to the original pair of while loops,
        but done with a single modulo operation instead
        of iterating - keeps galleryPosition in the same
        (-gallerySetWidth, 0] range without looping,
        which matters under large momentum values.
    */

    let wrapped =
        galleryPosition % gallerySetWidth;

    if (wrapped > 0) {
        wrapped -= gallerySetWidth;
    }

    galleryPosition = wrapped;

}


function renderGallery() {

    gallery.style.transform =
        `translate3d(${galleryPosition}px,0,0)`;

}


window.addEventListener(
    "load",
    measureGallery
);

window.addEventListener(
    "resize",
    measureGallery
);


/* ========================================
   GALLERY ANIMATION
======================================== */

function updateGallery(currentTime) {

    const delta =
        Math.min(
            currentTime - galleryLastTime,
            50
        );

    galleryLastTime = currentTime;

    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        if (
            Math.abs(galleryMomentum) > .15
        ) {

            galleryPosition +=
                galleryMomentum *
                (delta / 1000);

            galleryMomentum *=
                Math.pow(
                    MOMENTUM_FRICTION,
                    delta / 16.67
                );

        } else {

            galleryMomentum = 0;

            galleryPosition -=
                AUTO_SPEED *
                (delta / 1000);

        }

    }

    normalizeGallery();
    renderGallery();

}


/* ========================================
   GALLERY POINTER DOWN
======================================== */

galleryWrapper.addEventListener(
    "pointerdown",
    (event) => {

        if (
            event.button !== 0
        ) {
            return;
        }

        isDragging = true;

        pointerId =
            event.pointerId;

        hasDragged = false;

        galleryMomentum = 0;

        dragStartX =
            event.clientX;

        dragStartPosition =
            galleryPosition;

        lastPointerX =
            event.clientX;

        lastPointerTime =
            performance.now();

        dragVelocity = 0;

        galleryWrapper.classList.add(
            "dragging"
        );

        pressedItem =
            event.target.closest(
                ".gallery-item"
            );

        if (pressedItem) {

            pressedItem.classList.add(
                "pressing"
            );

        }

        galleryWrapper.setPointerCapture(
            event.pointerId
        );

        event.preventDefault();

    }
);


/* ========================================
   GALLERY POINTER MOVE
======================================== */

galleryWrapper.addEventListener(
    "pointermove",
    (event) => {

        if (
            !isDragging ||
            event.pointerId !== pointerId
        ) {
            return;
        }

        const now =
            performance.now();

        const distance =
            event.clientX - dragStartX;

        if (
            Math.abs(distance) > 7
        ) {
            hasDragged = true;
        }

        if (
            hasDragged &&
            pressedItem
        ) {

            pressedItem.classList.remove(
                "pressing"
            );

        }

        galleryPosition =
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

        lastPointerX =
            event.clientX;

        lastPointerTime =
            now;

    }
);


/* ========================================
   GALLERY RELEASE
======================================== */

function releaseGallery(event) {

    if (
        !isDragging ||
        event.pointerId !== pointerId
    ) {
        return;
    }

    isDragging = false;

    galleryWrapper.classList.remove(
        "dragging"
    );

    if (
        pressedItem &&
        !hasDragged
    ) {

        pressedItem.classList.remove(
            "pressing"
        );

        pressedItem.classList.remove(
            "clicked"
        );

        void pressedItem.offsetWidth;

        pressedItem.classList.add(
            "clicked"
        );

        openProject(
            pressedItem
        );

    }

    if (hasDragged) {

        galleryMomentum =
            dragVelocity *
            MOMENTUM_MULTIPLIER;

        galleryMomentum =
            Math.max(
                -MAX_MOMENTUM,
                Math.min(
                    MAX_MOMENTUM,
                    galleryMomentum
                )
            );

    }

    if (pressedItem) {

        pressedItem.classList.remove(
            "pressing"
        );

    }

    pressedItem = null;
    pointerId = null;
    dragVelocity = 0;

}


galleryWrapper.addEventListener(
    "pointerup",
    releaseGallery
);

galleryWrapper.addEventListener(
    "pointercancel",
    releaseGallery
);


/* ========================================
   CUSTOM PAGE WHEEL
   NO DEFAULT WINDOWS/BROWSER SCROLL
======================================== */

let wheelVelocity = 0;
let wheelTarget = window.scrollY;

let wheelAnimation = false;


function smoothWheelScroll(delta) {

    const multiplier =
        window.innerWidth < 700
            ? 1.05
            : 1.15;

    wheelVelocity +=
        delta * multiplier;

    wheelVelocity =
        Math.max(
            -2200,
            Math.min(
                2200,
                wheelVelocity
            )
        );

    wheelTarget =
        window.scrollY +
        wheelVelocity;

    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

    wheelTarget =
        Math.max(
            0,
            Math.min(
                maxScroll,
                wheelTarget
            )
        );

    if (!wheelAnimation) {

        wheelAnimation = true;

        requestAnimationFrame(
            wheelLoop
        );

    }

}


function wheelLoop() {

    const current =
        window.scrollY;

    const distance =
        wheelTarget - current;

    window.scrollTo(
        0,
        current + distance * 0.085
    );

    wheelVelocity *= 0.93;

    if (
        Math.abs(distance) > 0.35 ||
        Math.abs(wheelVelocity) > 0.35
    ) {

        requestAnimationFrame(
            wheelLoop
        );

    } else {

        window.scrollTo(
            0,
            wheelTarget
        );

        wheelVelocity = 0;
        wheelAnimation = false;

    }

}


/*
    Intercept wheel events globally.

    This prevents the browser/Windows default
    scroll behavior from fighting the custom
    momentum system.
*/

window.addEventListener(
    "wheel",
    (event) => {

        if (
            lightbox.classList.contains("active")
        ) {
            return;
        }

        event.preventDefault();

        smoothWheelScroll(
            event.deltaY
        );

    },
    {
        passive: false
    }
);


/* ========================================
   LIGHTBOX
======================================== */

let currentProject = null;


function openProject(item) {

    currentProject = item;

    resetMagnifier();

    lightboxImage.style.background =
        getComputedStyle(item).background;

    lightboxImage.style.backgroundSize =
        "cover";

    lightboxImage.style.backgroundPosition =
        "center";

    lightboxImage.style.backgroundRepeat =
        "no-repeat";

    lightbox.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


function closeLightbox() {

    resetMagnifier();

    lightbox.classList.remove(
        "active"
    );

    lightboxImage.style.backgroundSize =
        "cover";

    lightboxImage.style.backgroundPosition =
        "center";

    lightboxImage.style.backgroundRepeat =
        "no-repeat";

    document.body.style.overflow =
        "";

    /*
        Make sure the custom wheel system
        starts from the actual position after
        leaving the lightbox.
    */

    wheelTarget =
        window.scrollY;

    wheelVelocity = 0;
    wheelAnimation = false;

    currentProject = null;

}


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

        if (
            event.key === "Escape"
        ) {

            if (
                lightbox.classList.contains(
                    "active"
                )
            ) {

                closeLightbox();

            }

        }

    }
);


/* ========================================
   LIGHTBOX MAGNIFIER
======================================== */

let magnifying = false;


function resetMagnifier() {

    magnifying = false;

    lightboxMagnifier.classList.remove(
        "active"
    );

    lightboxImage.style.backgroundSize =
        "cover";

    lightboxImage.style.backgroundPosition =
        "center";

    lightboxImage.style.backgroundRepeat =
        "no-repeat";

}


lightboxMagnifier.addEventListener(
    "click",
    () => {

        magnifying =
            !magnifying;

        lightboxMagnifier.classList.toggle(
            "active",
            magnifying
        );

        if (!magnifying) {
            resetMagnifier();
        }

    }
);


lightboxImage.addEventListener(
    "pointermove",
    (event) => {

        if (!magnifying) {
            return;
        }

        const rect =
            lightboxImage.getBoundingClientRect();

        const x =
            (
                (event.clientX - rect.left) /
                rect.width
            ) * 100;

        const y =
            (
                (event.clientY - rect.top) /
                rect.height
            ) * 100;

        lightboxImage.style.backgroundSize =
            "175% 175%";

        lightboxImage.style.backgroundPosition =
            `${x}% ${y}%`;

        lightboxImage.style.backgroundRepeat =
            "no-repeat";

    },
    { passive: true }
);


lightboxImage.addEventListener(
    "pointerleave",
    () => {

        if (!magnifying) {
            return;
        }

        lightboxImage.style.backgroundPosition =
            "center";

    },
    { passive: true }
);


/* ========================================
   SECTION SCROLL
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
        65;

    const distance =
        target - start;

    const duration =
        Math.min(
            1250,
            Math.max(
                750,
                Math.abs(distance) * .62
            )
        );

    const startTime =
        performance.now();

    if (scrollAnimation) {

        cancelAnimationFrame(
            scrollAnimation
        );

    }

    /*
        Stop wheel momentum when using
        navigation buttons.
    */

    wheelVelocity = 0;
    wheelTarget = target;
    wheelAnimation = false;


    function animate(time) {

        const progress =
            Math.min(
                1,
                (time - startTime) /
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

            wheelTarget =
                window.scrollY;

        }

    }

    scrollAnimation =
        requestAnimationFrame(
            animate
        );

}


/* ========================================
   NAVIGATION
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

                smoothScrollTo(
                    target
                );

            }
        );

    }
);


pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            pricingSection
        );

    }
);


socialsHeroButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            socialsSection
        );

    }
);


contactButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            socialsSection
        );

    }
);


/* ========================================
   ACTIVE NAV
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
            rootMargin: "-35% 0px -55% 0px",
            threshold: 0
        }
    );


sections.forEach(
    (section) => {

        sectionObserver.observe(
            section
        );

    }
);


/* ========================================
   SCROLL REVEALS
======================================== */

const revealObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: .08,
            rootMargin: "0px 0px -80px 0px"
        }
    );


revealSections.forEach(
    (section) => {

        revealObserver.observe(
            section
        );

    }
);


/* ========================================
   SCROLL PROGRESS
======================================== */

function updateScrollProgress() {

    const scrollTop =
        window.scrollY;

    const scrollHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        scrollHeight > 0
            ? scrollTop / scrollHeight
            : 0;

    scrollProgress.style.height =
        `${Math.max(35, progress * 100)}%`;

}


window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
        passive: true
    }
);

window.addEventListener(
    "resize",
    updateScrollProgress
);

updateScrollProgress();


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

                            other.removeAttribute(
                                "open"
                            );

                        }

                    }
                );

            }
        );

    }
);


/* ========================================
   PREVENT IMAGE DRAGGING
======================================== */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);


/* ========================================
   MAIN LOOP

   Cursor, tilt and gallery updates used to run as
   four separate requestAnimationFrame loops (cursor,
   background-reactive-grid, tilt, gallery). One of
   those (background) did nothing visible at all - it
   set CSS custom properties that no rule in style.css
   actually reads, which forces a style recalculation
   for the whole document every frame for zero visual
   benefit, and has been removed entirely.

   The remaining three are now combined into a single
   loop for less scheduling overhead and more
   predictable frame timing.
======================================== */

function mainLoop(currentTime) {

    updateCursor();
    updateTilt();
    updateGallery(currentTime);

    requestAnimationFrame(mainLoop);

}

requestAnimationFrame(mainLoop);


/* ========================================
   INITIALIZE
======================================== */

window.addEventListener(
    "load",
    () => {

        measureGallery();

        updateScrollProgress();

        setTimeout(
            () => {

                document
                    .querySelector(".hero")
                    ?.classList.add(
                        "visible"
                    );

            },
            100
        );

    }
);
