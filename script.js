/* ========================================
ELEMENTS
======================================== */

const galleryWrapper = document.getElementById("galleryWrapper");
const gallery = document.getElementById("gallery");

const pricingButton =
    document.getElementById("pricingButton");

const socialsHeroButton =
    document.getElementById("socialsHeroButton");

const contactButton =
    document.getElementById("contactButton");

const pricingSection =
    document.getElementById("pricing");

const socialsSection =
    document.getElementById("socials");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxMagnifier =
    document.getElementById("lightboxMagnifier");

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll("[data-section]");

const revealSections =
    document.querySelectorAll(".section-reveal");

const cursorDot =
    document.querySelector(".cursor-dot");

const cursorGlow =
    document.querySelector(".cursor-glow");

const scrollProgress =
    document.getElementById("scrollProgress");


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

    }
);


function cursorLoop() {

    cursorX +=
        (mouseX - cursorX) * 0.075;

    cursorY +=
        (mouseY - cursorY) * 0.075;


    if (cursorDot) {

        cursorDot.style.transform =
            `translate3d(
                ${cursorX - 4}px,
                ${cursorY - 4}px,
                0
            )`;

    }


    if (cursorGlow) {

        cursorGlow.style.transform =
            `translate3d(
                ${cursorX - 180}px,
                ${cursorY - 180}px,
                0
            )`;

    }


    requestAnimationFrame(cursorLoop);

}

cursorLoop();


/* ========================================
BACKGROUND CURSOR REACTION
======================================== */

let backgroundX = 0;
let backgroundY = 0;


function backgroundLoop() {

    backgroundX +=
        (
            (mouseX / window.innerWidth) * 30 -
            backgroundX
        ) * 0.035;


    backgroundY +=
        (
            (mouseY / window.innerHeight) * 30 -
            backgroundY
        ) * 0.035;


    document.documentElement.style.setProperty(
        "--mouse-x",
        `${backgroundX}px`
    );


    document.documentElement.style.setProperty(
        "--mouse-y",
        `${backgroundY}px`
    );


    requestAnimationFrame(
        backgroundLoop
    );

}

backgroundLoop();


/* ========================================
SMOOTH 3D TILT
======================================== */

const tiltElements =
    document.querySelectorAll(
        ".tilt-frame, .gallery-item"
    );


tiltElements.forEach(
    (element) => {

        let targetRotateX = 0;
        let targetRotateY = 0;

        let currentRotateX = 0;
        let currentRotateY = 0;

        let hovering = false;


        element.addEventListener(
            "pointerenter",
            () => {

                hovering = true;

            }
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


                const rect =
                    element.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const percentX =
                    (x / rect.width) -
                    0.5;


                const percentY =
                    (y / rect.height) -
                    0.5;


                targetRotateY =
                    percentX * 5;


                targetRotateX =
                    percentY * -5;

            }
        );


        element.addEventListener(
            "pointerleave",
            () => {

                hovering = false;

                targetRotateX = 0;
                targetRotateY = 0;

            }
        );


        function tiltLoop() {

            currentRotateX +=
                (
                    targetRotateX -
                    currentRotateX
                ) * 0.075;


            currentRotateY +=
                (
                    targetRotateY -
                    currentRotateY
                ) * 0.075;


            if (
                Math.abs(currentRotateX) > 0.01 ||
                Math.abs(currentRotateY) > 0.01 ||
                hovering
            ) {

                element.style.transform =
                    `perspective(900px)
                     rotateX(${currentRotateX}deg)
                     rotateY(${currentRotateY}deg)
                     translateY(${hovering ? -3 : 0}px)`;

            } else {

                element.style.transform = "";

            }


            requestAnimationFrame(
                tiltLoop
            );

        }


        tiltLoop();

    }
);


/* ========================================
GALLERY DUPLICATION
======================================== */

const originalItems =
    Array.from(
        gallery.querySelectorAll(
            ".gallery-item"
        )
    );


originalItems.forEach(
    (item) => {

        gallery.appendChild(
            item.cloneNode(true)
        );

    }
);


/* ========================================
GALLERY VARIABLES
======================================== */

let gallerySetWidth = 0;

let galleryPosition = 0;

let galleryLastTime =
    performance.now();


const AUTO_SPEED = 18;


/* ========================================
GALLERY MEASUREMENT
======================================== */

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


    while (
        galleryPosition <=
        -gallerySetWidth
    ) {

        galleryPosition +=
            gallerySetWidth;

    }


    while (
        galleryPosition > 0
    ) {

        galleryPosition -=
            gallerySetWidth;

    }

}


function renderGallery() {

    gallery.style.transform =
        `translate3d(
            ${galleryPosition}px,
            0,
            0
        )`;

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

function galleryLoop(currentTime) {

    const delta =
        Math.min(
            currentTime -
            galleryLastTime,
            50
        );


    galleryLastTime =
        currentTime;


    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        if (
            Math.abs(galleryMomentum) > 0.15
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


    requestAnimationFrame(
        galleryLoop
    );

}


requestAnimationFrame(
    galleryLoop
);


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

const MOMENTUM_FRICTION = 0.972;

const MAX_MOMENTUM = 6500;


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


        if (
            lightbox.classList.contains("active")
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
            event.clientX -
            dragStartX;


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
            dragStartPosition +
            distance;


        normalizeGallery();

        renderGallery();


        const elapsed =
            now -
            lastPointerTime;


        if (
            elapsed > 0
        ) {

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
GALLERY WHEEL
PAGE SCROLL ONLY
======================================== */

galleryWrapper.addEventListener(
    "wheel",
    (event) => {

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
PAGE SCROLL MOMENTUM
======================================== */

let wheelVelocity = 0;

let wheelTarget =
    window.scrollY;

let wheelAnimation = false;


function smoothWheelScroll(delta) {

    const multiplier =
        window.innerWidth < 700
            ? 1.25
            : 1.45;


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
        wheelTarget -
        current;


    window.scrollTo(
        0,
        current +
        distance * 0.13
    );


    wheelVelocity *= 0.89;


    if (
        Math.abs(distance) > 0.5 ||
        Math.abs(wheelVelocity) > 0.5
    ) {

        requestAnimationFrame(
            wheelLoop
        );

    } else {

        window.scrollTo(
            0,
            wheelTarget
        );


        wheelAnimation = false;

        wheelVelocity = 0;

    }

}


/* ========================================
LIGHTBOX
======================================== */

let currentProject = null;

let magnifying = false;


function openProject(item) {

    currentProject =
        item;


    magnifying = false;


    lightboxMagnifier.classList.remove(
        "active"
    );


    lightboxImage.style.background =
        getComputedStyle(
            item
        ).background;


    lightboxImage.style.backgroundSize =
        "";


    lightboxImage.style.backgroundPosition =
        "";


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    /* Prevent leftover page-wheel momentum */
    wheelVelocity = 0;

    wheelAnimation = false;

}


function closeLightbox() {

    magnifying = false;


    lightboxMagnifier.classList.remove(
        "active"
    );


    lightboxImage.style.backgroundSize =
        "";


    lightboxImage.style.backgroundPosition =
        "";


    lightboxImage.style.background =
        "";


    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";


    currentProject =
        null;


    /* Reset wheel state so page scrolling
       cannot inherit lightbox movement */
    wheelVelocity = 0;

    wheelTarget =
        window.scrollY;

    wheelAnimation = false;

}


/* ========================================
LIGHTBOX CLOSE BY BACKGROUND CLICK
======================================== */

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


/* ========================================
ESCAPE CLOSE
======================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            lightbox.classList.contains("active")
        ) {

            closeLightbox();

        }

    }
);


/* ========================================
LIGHTBOX MAGNIFIER
======================================== */

lightboxMagnifier.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        magnifying =
            !magnifying;


        lightboxMagnifier.classList.toggle(
            "active",
            magnifying
        );


        if (!magnifying) {

            lightboxImage.style.backgroundSize =
                "";


            lightboxImage.style.backgroundPosition =
                "";

        }

    }
);


/* ========================================
LIGHTBOX MAGNIFICATION
======================================== */

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
                (event.clientX -
                    rect.left) /
                rect.width
            ) * 100;


        const y =
            (
                (event.clientY -
                    rect.top) /
                rect.height
            ) * 100;


        lightboxImage.style.backgroundSize =
            "175% 175%";


        lightboxImage.style.backgroundPosition =
            `${x}% ${y}%`;

    }
);


lightboxImage.addEventListener(
    "pointerleave",
    () => {

        if (!magnifying) {
            return;
        }


        lightboxImage.style.backgroundSize =
            "";


        lightboxImage.style.backgroundPosition =
            "";

    }
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
        target -
        start;


    const duration =
        Math.min(
            1250,
            Math.max(
                750,
                Math.abs(distance) * 0.62
            )
        );


    const startTime =
        performance.now();


    if (scrollAnimation) {

        cancelAnimationFrame(
            scrollAnimation
        );

    }


    function animate(time) {

        const progress =
            Math.min(
                1,
                (
                    time -
                    startTime
                ) / duration
            );


        const eased =
            1 -
            Math.pow(
                1 -
                progress,
                5
            );


        window.scrollTo(
            0,
            start +
            distance *
            eased
        );


        if (
            progress < 1
        ) {

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


/* ========================================
HERO BUTTONS
======================================== */

if (pricingButton) {

    pricingButton.addEventListener(
        "click",
        () => {

            smoothScrollTo(
                pricingSection
            );

        }
    );

}


if (socialsHeroButton) {

    socialsHeroButton.addEventListener(
        "click",
        () => {

            smoothScrollTo(
                socialsSection
            );

        }
    );

}


if (contactButton) {

    contactButton.addEventListener(
        "click",
        () => {

            smoothScrollTo(
                socialsSection
            );

        }
    );

}


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
            rootMargin:
                "-35% 0px -55% 0px",

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
            threshold: 0.08,

            rootMargin:
                "0px 0px -80px 0px"
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


    if (scrollProgress) {

        scrollProgress.style.height =
            `${Math.max(
                35,
                progress * 100
            )}%`;

    }

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
                    .querySelector(
                        ".hero"
                    )
                    ?.classList.add(
                        "visible"
                    );

            },
            100
        );

    }
);
