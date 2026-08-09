/* ========================================
ELEMENTS
======================================== */

const galleryWrapper =
    document.getElementById("galleryWrapper");

const gallery =
    document.getElementById("gallery");

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

let mouseX =
    window.innerWidth / 2;

let mouseY =
    window.innerHeight / 2;

let cursorX =
    mouseX;

let cursorY =
    mouseY;


document.addEventListener(
    "pointermove",
    (event) => {

        mouseX =
            event.clientX;

        mouseY =
            event.clientY;

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


    requestAnimationFrame(
        cursorLoop
    );

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

/*
    Lower smoothing value = slower / smoother movement.

    The cards now gently follow the mouse instead
    of snapping toward it.

    Includes:
    - Design Capabilities
    - Pricing
    - Tools
    - Socials
    - Gallery items
*/

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

        let targetLift = 0;
        let currentLift = 0;

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

                /*
                    Don't let buttons/links affect the tilt
                    calculation.
                */

                if (
                    event.target.closest("button") ||
                    event.target.closest("a")
                ) {
                    return;
                }


                const rect =
                    element.getBoundingClientRect();


                if (
                    rect.width <= 0 ||
                    rect.height <= 0
                ) {
                    return;
                }


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


                /*
                    Very gentle tilt.

                    Maximum:
                    4 degrees

                    This keeps the effect subtle
                    rather than making the cards feel
                    unstable.
                */

                targetRotateY =
                    percentX * 4;

                targetRotateX =
                    percentY * -4;


                targetLift = -2;

            }
        );


        element.addEventListener(
            "pointerleave",
            () => {

                hovering = false;

                targetRotateX = 0;
                targetRotateY = 0;
                targetLift = 0;

            }
        );


        function tiltLoop() {

            /*
                Slow interpolation prevents snapping.
            */

            currentRotateX +=
                (
                    targetRotateX -
                    currentRotateX
                ) * 0.045;


            currentRotateY +=
                (
                    targetRotateY -
                    currentRotateY
                ) * 0.045;


            currentLift +=
                (
                    targetLift -
                    currentLift
                ) * 0.055;


            const active =
                hovering ||
                Math.abs(currentRotateX) > 0.01 ||
                Math.abs(currentRotateY) > 0.01 ||
                Math.abs(currentLift) > 0.01;


            if (active) {

                element.style.transform =
                    `perspective(1000px)
                     rotateX(${currentRotateX}deg)
                     rotateY(${currentRotateY}deg)
                     translateY(${currentLift}px)`;

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

    if (!gallery) {
        return;
    }


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

    if (!gallery) {
        return;
    }


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
        !lightbox?.classList.contains("active")
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
            lightbox &&
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
PAGE WHEEL SYSTEM
======================================== */

/*
    The browser's normal wheel behaviour is disabled.

    Every mouse wheel event is routed through the
    smooth scrolling system below.

    This prevents the native Windows/browser wheel
    movement from fighting the custom scrolling.
*/

let wheelVelocity = 0;

let wheelTarget =
    window.scrollY;

let wheelAnimation = false;

let lastWheelTime =
    performance.now();


const WHEEL_MULTIPLIER =
    window.innerWidth < 700
        ? 1.15
        : 1.25;


const WHEEL_FRICTION = 0.88;

const WHEEL_SMOOTHING = 0.075;

const MAX_WHEEL_VELOCITY = 1800;


function smoothWheelScroll(delta) {

    if (
        lightbox &&
        lightbox.classList.contains("active")
    ) {
        return;
    }


    /*
        If the user changes direction,
        don't allow old momentum to fight it.
    */

    if (
        Math.sign(delta) !==
        Math.sign(wheelVelocity) &&
        Math.abs(delta) > 1
    ) {

        wheelVelocity *= 0.35;

    }


    wheelVelocity +=
        delta *
        WHEEL_MULTIPLIER;


    wheelVelocity =
        Math.max(
            -MAX_WHEEL_VELOCITY,
            Math.min(
                MAX_WHEEL_VELOCITY,
                wheelVelocity
            )
        );


    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;


    wheelTarget +=
        wheelVelocity *
        0.22;


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


function wheelLoop(time) {

    if (
        lightbox &&
        lightbox.classList.contains("active")
    ) {

        wheelVelocity = 0;

        wheelTarget =
            window.scrollY;

        wheelAnimation = false;

        return;

    }


    const current =
        window.scrollY;


    const distance =
        wheelTarget -
        current;


    /*
        Smoothly approach the target.

        This is intentionally low so the page
        does not feel snappy.
    */

    const movement =
        distance *
        WHEEL_SMOOTHING;


    window.scrollTo(
        0,
        current + movement
    );


    /*
        Gradually remove momentum.
    */

    wheelVelocity *=
        WHEEL_FRICTION;


    const stillMoving =
        Math.abs(distance) > 0.35 ||
        Math.abs(wheelVelocity) > 0.35;


    if (stillMoving) {

        wheelAnimation = true;

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
    GLOBAL wheel handler.

    This replaces the browser's default wheel
    scrolling everywhere on the page.
*/

document.addEventListener(
    "wheel",
    (event) => {

        if (
            lightbox &&
            lightbox.classList.contains("active")
        ) {

            /*
                Do absolutely nothing while the
                lightbox is open.
            */

            event.preventDefault();

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

let magnifying = false;


/*
    Completely reset the magnifier state.
*/

function resetMagnifier() {

    magnifying = false;


    if (lightboxMagnifier) {

        lightboxMagnifier.classList.remove(
            "active"
        );

    }


    if (lightboxImage) {

        lightboxImage.style.backgroundSize =
            "";

        lightboxImage.style.backgroundPosition =
            "";

    }

}


function openProject(item) {

    if (
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }


    currentProject =
        item;


    /*
        Stop every previous wheel operation
        before opening the lightbox.
    */

    wheelVelocity = 0;

    wheelTarget =
        window.scrollY;

    wheelAnimation = false;


    resetMagnifier();


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


    /*
        Lock page scrolling while the lightbox
        is open.
    */

    document.body.style.overflow =
        "hidden";

}


function closeLightbox() {

    /*
        Reset everything before restoring
        normal page scrolling.
    */

    resetMagnifier();


    if (lightboxImage) {

        lightboxImage.style.background =
            "";

    }


    if (lightbox) {

        lightbox.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";


    currentProject =
        null;


    /*
        IMPORTANT:

        Restore wheel state to the exact current
        page position. This prevents the page from
        suddenly moving after magnification.
    */

    wheelVelocity = 0;

    wheelTarget =
        window.scrollY;

    wheelAnimation = false;

    lastWheelTime =
        performance.now();


    /*
        Make sure the gallery cannot accidentally
        inherit old movement from before the
        lightbox was opened.
    */

    galleryMomentum = 0;

}


/* ========================================
LIGHTBOX BACKGROUND CLICK
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
            lightbox &&
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


        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }


        const x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) * 100;


        const y =
            (
                (
                    event.clientY -
                    rect.top
                ) /
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


    /*
        Stop wheel momentum before navigation.
        Otherwise the wheel system can fight the
        navigation animation.
    */

    wheelVelocity = 0;

    wheelAnimation = false;


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
                ) /
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


            /*
                Sync custom wheel position with
                the final navigation position.
            */

            wheelTarget =
                window.scrollY;

            wheelVelocity = 0;

            wheelAnimation = false;

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


        /*
            Synchronize custom wheel scrolling
            with the actual initial position.
        */

        wheelTarget =
            window.scrollY;

        wheelVelocity = 0;

        wheelAnimation = false;


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
