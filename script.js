/* ========================================
   ELEMENTS
======================================== */

const galleryWrapper = document.getElementById("galleryWrapper");
const gallery = document.getElementById("gallery");

const pricingButton = document.getElementById("pricingButton");
const pricingSection = document.getElementById("pricing");

const contactButton = document.getElementById("contactButton");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxMagnifier = document.getElementById("lightboxMagnifier");

const navItems = document.querySelectorAll(".nav-item");

const cursorDot = document.getElementById("cursorDot");
const cursorGlow = document.getElementById("cursorGlow");

const scrollProgressBar =
    document.getElementById("scrollProgressBar");


/* ========================================
   CURSOR
======================================== */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let dotX = mouseX;
let dotY = mouseY;

let glowX = mouseX;
let glowY = mouseY;


document.addEventListener("pointermove", (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    document.documentElement.style.setProperty(
        "--mouse-x",
        `${mouseX}px`
    );

    document.documentElement.style.setProperty(
        "--mouse-y",
        `${mouseY}px`
    );

});


function cursorLoop() {

    dotX += (mouseX - dotX) * 0.16;
    dotY += (mouseY - dotY) * 0.16;

    glowX += (mouseX - glowX) * 0.055;
    glowY += (mouseY - glowY) * 0.055;

    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;

    requestAnimationFrame(cursorLoop);

}

cursorLoop();


/* ========================================
   3D TILT
======================================== */

const tiltCards =
    document.querySelectorAll(".tilt-card");


tiltCards.forEach((card) => {

    card.addEventListener("pointermove", (event) => {

        if (
            event.target.closest(
                "button, a, summary, input, select, textarea"
            )
        ) {
            return;
        }

        const rect =
            card.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) /
            rect.width;

        const y =
            (event.clientY - rect.top) /
            rect.height;

        const rotateY =
            (x - 0.5) * 7;

        const rotateX =
            (0.5 - y) * 7;

        card.style.transform =
            `perspective(900px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateZ(0)`;

    });


    card.addEventListener("pointerleave", () => {

        card.style.transform =
            "perspective(900px) rotateX(0deg) rotateY(0deg)";

    });

});


/* ========================================
   GALLERY SETUP
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


let singleSetWidth = 0;
let position = 0;

let lastTime =
    performance.now();


const AUTO_SPEED = 16;


/* ========================================
   DRAG / MOMENTUM
======================================== */

let isDragging = false;
let pointerId = null;

let dragStartX = 0;
let dragStartPosition = 0;

let lastPointerX = 0;
let lastPointerTime = 0;

let dragVelocity = 0;
let momentum = 0;

let hasDragged = false;
let pressedItem = null;

const MOMENTUM_MULTIPLIER = 4.4;
const MOMENTUM_FRICTION = 0.975;
const MAX_MOMENTUM = 6000;


/* ========================================
   MEASURE
======================================== */

function measureGallery() {

    singleSetWidth =
        gallery.scrollWidth / 2;

    normalizePosition();
    renderGallery();

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
   LOOP
======================================== */

function normalizePosition() {

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


/* ========================================
   GALLERY ANIMATION
======================================== */

function animationLoop(currentTime) {

    const delta =
        Math.min(
            currentTime - lastTime,
            50
        );

    lastTime =
        currentTime;


    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        if (Math.abs(momentum) > 0.15) {

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


    normalizePosition();
    renderGallery();

    requestAnimationFrame(
        animationLoop
    );

}

requestAnimationFrame(
    animationLoop
);


/* ========================================
   POINTER DOWN
======================================== */

galleryWrapper.addEventListener(
    "pointerdown",
    (event) => {

        if (event.button !== 0) {
            return;
        }

        isDragging = true;
        pointerId = event.pointerId;

        hasDragged = false;
        momentum = 0;

        dragStartX =
            event.clientX;

        dragStartPosition =
            position;

        lastPointerX =
            event.clientX;

        lastPointerTime =
            performance.now();

        dragVelocity = 0;

        galleryWrapper.classList.add(
            "dragging"
        );


        const item =
            event.target.closest(
                ".gallery-item"
            );


        if (item) {

            pressedItem =
                item;

            item.classList.add(
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
   POINTER MOVE
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
            event.clientX -
            dragStartX;


        if (Math.abs(distance) > 7) {
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


        position =
            dragStartPosition +
            distance;


        normalizePosition();
        renderGallery();


        const elapsed =
            now -
            lastPointerTime;


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

        event.preventDefault();

    }
);


/* ========================================
   RELEASE
======================================== */

function releaseDrag(event) {

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

        pressedItem.classList.add(
            "clicked"
        );

        setTimeout(() => {

            if (pressedItem) {
                pressedItem.classList.remove(
                    "clicked"
                );
            }

        }, 300);

        openProject(
            pressedItem
        );

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
    releaseDrag
);

galleryWrapper.addEventListener(
    "pointercancel",
    releaseDrag
);


/* ========================================
   LIGHTBOX
======================================== */

let currentLightboxItem = null;


function openProject(item) {

    currentLightboxItem =
        item;


    const background =
        window.getComputedStyle(
            item
        ).backgroundColor;


    lightboxImage.style.background =
        background;


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

    currentLightboxItem =
        null;

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

let lightboxZoomed = false;


lightboxMagnifier.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        if (!currentLightboxItem) {
            return;
        }


        lightboxZoomed =
            !lightboxZoomed;


        if (lightboxZoomed) {

            lightboxImage.style.transform =
                "scale(1.7)";

            lightboxImage.style.cursor =
                "zoom-out";

        } else {

            lightboxImage.style.transform =
                "scale(1)";

            lightboxImage.style.cursor =
                "";

        }

    }
);


lightboxImage.addEventListener(
    "pointermove",
    (event) => {

        if (
            !lightboxZoomed
        ) {
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


        lightboxImage.style.transformOrigin =
            `${x}% ${y}%`;

    }
);


/* ========================================
   PRICING / CONTACT
======================================== */

pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            pricingSection
        );

    }
);


if (contactButton) {

    contactButton.addEventListener(
        "click",
        () => {

            window.open(
                "https://discord.com",
                "_blank",
                "noopener,noreferrer"
            );

        }
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

                const targetId =
                    item.dataset.target;

                const target =
                    document.getElementById(
                        targetId
                    );


                if (!target) {
                    return;
                }


                smoothScrollTo(
                    target
                );

            }
        );

    }
);


/* ========================================
   SMOOTH SECTION SCROLL
======================================== */

let scrollAnimation = null;


function smoothScrollTo(element) {

    const start =
        window.scrollY;


    const target =
        element.getBoundingClientRect().top +
        window.scrollY -
        25;


    const distance =
        target -
        start;


    const duration =
        Math.min(
            1200,
            Math.max(
                650,
                Math.abs(distance) * .65
            )
        );


    const startTime =
        performance.now();


    if (scrollAnimation) {

        cancelAnimationFrame(
            scrollAnimation
        );

    }


    function animate(currentTime) {

        const progress =
            Math.min(
                1,
                (
                    currentTime -
                    startTime
                ) / duration
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
            distance *
            eased
        );


        if (progress < 1) {

            scrollAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            scrollAnimation =
                null;

        }

    }


    scrollAnimation =
        requestAnimationFrame(
            animate
        );

}


/* ========================================
   NORMAL SCROLL MOMENTUM
======================================== */

let wheelVelocity = 0;
let wheelAnimation = null;
let lastWheelTime = 0;


window.addEventListener(
    "wheel",
    (event) => {

        if (
            lightbox.classList.contains(
                "active"
            )
        ) {
            return;
        }


        event.preventDefault();


        const now =
            performance.now();


        const elapsed =
            Math.max(
                8,
                now - lastWheelTime
            );


        lastWheelTime =
            now;


        wheelVelocity +=
            event.deltaY *
            0.72;


        wheelVelocity =
            Math.max(
                -1800,
                Math.min(
                    1800,
                    wheelVelocity
                )
            );


        if (!wheelAnimation) {
            wheelAnimation =
                requestAnimationFrame(
                    wheelScrollLoop
                );
        }

    },
    {
        passive: false
    }
);


function wheelScrollLoop() {

    if (
        Math.abs(wheelVelocity) < .3
    ) {

        wheelVelocity = 0;
        wheelAnimation = null;

        return;

    }


    window.scrollBy(
        0,
        wheelVelocity * .045
    );


    wheelVelocity *= .90;


    wheelAnimation =
        requestAnimationFrame(
            wheelScrollLoop
        );

}


/* ========================================
   ACTIVE NAV
======================================== */

const sections =
    document.querySelectorAll(
        "[data-section]"
    );


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
            threshold: .3
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
   SCROLL PROGRESS
======================================== */

function updateScrollProgress() {

    const scrollTop =
        window.scrollY;

    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;


    if (maxScroll <= 0) {
        return;
    }


    const progress =
        scrollTop /
        maxScroll;


    const trackHeight =
        100 -
        20;


    scrollProgressBar.style.top =
        `${progress * trackHeight}%`;

}


window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
        passive: true
    }
);


updateScrollProgress();


/* ========================================
   PREVENT IMAGE DRAGGING
======================================== */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);
