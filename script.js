/* ========================================
   ELEMENTS
======================================== */

const galleryWrapper =
    document.getElementById("galleryWrapper");

const gallery =
    document.getElementById("gallery");

const pricingButton =
    document.getElementById("pricingButton");

const contactButton =
    document.getElementById("contactButton");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");

const lightboxZoom =
    document.getElementById("lightboxZoom");

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll("[data-section]");

const cursorDot =
    document.querySelector(".cursor-dot");

const cursorGlow =
    document.querySelector(".cursor-glow");

const scrollbarThumb =
    document.querySelector(".scrollbar-thumb");


/* ========================================
   CURSOR
======================================== */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let dotX = mouseX;
let dotY = mouseY;

let glowX = mouseX;
let glowY = mouseY;

document.addEventListener(
    "pointermove",
    (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        document.documentElement.style.setProperty(
            "--mouse-x",
            `${(mouseX / window.innerWidth) * 100}%`
        );

        document.documentElement.style.setProperty(
            "--mouse-y",
            `${(mouseY / window.innerHeight) * 100}%`
        );

    }
);


function animateCursor() {

    /*
        Lower values create more delay.
    */

    dotX +=
        (mouseX - dotX) * 0.075;

    dotY +=
        (mouseY - dotY) * 0.075;


    glowX +=
        (mouseX - glowX) * 0.035;

    glowY +=
        (mouseY - glowY) * 0.035;


    if (cursorDot) {

        cursorDot.style.left =
            `${dotX}px`;

        cursorDot.style.top =
            `${dotY}px`;

    }


    if (cursorGlow) {

        cursorGlow.style.left =
            `${glowX}px`;

        cursorGlow.style.top =
            `${glowY}px`;

    }


    requestAnimationFrame(
        animateCursor
    );

}


animateCursor();


/* ========================================
   SMOOTH 3D TILT
======================================== */

const tiltElements =
    document.querySelectorAll(".tilt-card");


tiltElements.forEach(
    (element) => {

        let currentX = 0;
        let currentY = 0;

        let targetX = 0;
        let targetY = 0;


        function tiltLoop() {

            currentX +=
                (targetX - currentX) * 0.12;

            currentY +=
                (targetY - currentY) * 0.12;


            element.style.transform =
                `
                perspective(900px)
                rotateX(${currentY}deg)
                rotateY(${currentX}deg)
                translateZ(0)
                `;


            requestAnimationFrame(
                tiltLoop
            );

        }


        tiltLoop();


        element.addEventListener(
            "pointermove",
            (event) => {

                const rect =
                    element.getBoundingClientRect();


                const x =
                    (event.clientX - rect.left) /
                    rect.width;

                const y =
                    (event.clientY - rect.top) /
                    rect.height;


                targetX =
                    (x - 0.5) * 8;

                targetY =
                    (0.5 - y) * 8;

            }
        );


        element.addEventListener(
            "pointerleave",
            () => {

                targetX = 0;
                targetY = 0;

            }
        );

    }
);


/* ========================================
   GALLERY LOOP
======================================== */

const originalItems =
    Array.from(
        gallery.querySelectorAll(".gallery-item")
    );


originalItems.forEach(
    (item) => {

        gallery.appendChild(
            item.cloneNode(true)
        );

    }
);


let singleSetWidth = 0;

let galleryPosition = 0;

let galleryLastTime =
    performance.now();


const AUTO_SPEED = 16;


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

let hasDragged = false;

let pressedItem = null;


const MOMENTUM_MULTIPLIER = 2.25;

const MOMENTUM_FRICTION = 0.94;

const MAX_MOMENTUM = 1800;


function measureGallery() {

    singleSetWidth =
        gallery.scrollWidth / 2;

    normalizeGallery();

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


function normalizeGallery() {

    if (!singleSetWidth) {
        return;
    }


    while (
        galleryPosition <=
        -singleSetWidth
    ) {

        galleryPosition +=
            singleSetWidth;

    }


    while (
        galleryPosition > 0
    ) {

        galleryPosition -=
            singleSetWidth;

    }

}


function renderGallery() {

    gallery.style.transform =
        `translate3d(${galleryPosition}px,0,0)`;

}


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
            Math.abs(galleryMomentum) > .1
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
                (
                    elapsed / 1000
                );

        }


        lastPointerX =
            event.clientX;

        lastPointerTime =
            now;


        event.preventDefault();

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

        pressedItem.classList.add(
            "clicked"
        );


        setTimeout(
            () => {

                pressedItem?.classList.remove(
                    "clicked"
                );

            },
            350
        );


        openLightbox(
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
   GALLERY TILT
======================================== */

const galleryItems =
    document.querySelectorAll(
        ".gallery-item"
    );


galleryItems.forEach(
    (item) => {

        let tiltX = 0;
        let tiltY = 0;

        let currentX = 0;
        let currentY = 0;


        function updateTilt() {

            currentX +=
                (tiltX - currentX) *
                .1;

            currentY +=
                (tiltY - currentY) *
                .1;


            if (
                !isDragging &&
                !item.classList.contains("zooming")
            ) {

                item.style.transform =
                    `
                    perspective(900px)
                    rotateX(${currentY}deg)
                    rotateY(${currentX}deg)
                    `;

            }


            requestAnimationFrame(
                updateTilt
            );

        }


        updateTilt();


        item.addEventListener(
            "pointermove",
            (event) => {

                if (isDragging) {
                    return;
                }


                const rect =
                    item.getBoundingClientRect();


                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                tiltX =
                    (x - .5) * 5;

                tiltY =
                    (.5 - y) * 5;

            }
        );


        item.addEventListener(
            "pointerleave",
            () => {

                tiltX = 0;
                tiltY = 0;

            }
        );

    }
);


/* ========================================
   LIGHTBOX
======================================== */

let currentLightboxItem = null;

let zoomActive = false;


function openLightbox(item) {

    currentLightboxItem =
        item;


    lightboxImage.style.background =
        window.getComputedStyle(
            item
        ).backgroundColor;


    lightbox.classList.add(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    zoomActive = false;

    lightboxZoom.classList.remove(
        "active"
    );

    lightboxImage.classList.remove(
        "zoomed"
    );

}


function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    lightboxImage.classList.remove(
        "zoomed"
    );


    lightboxZoom.classList.remove(
        "active"
    );


    zoomActive = false;

    currentLightboxItem = null;

    document.body.style.overflow =
        "";

}


/* ========================================
   LIGHTBOX CLOSE
======================================== */

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

lightboxZoom.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        zoomActive =
            !zoomActive;


        lightboxZoom.classList.toggle(
            "active",
            zoomActive
        );


        lightboxImage.classList.toggle(
            "zoomed",
            zoomActive
        );

    }
);


lightboxImage.addEventListener(
    "pointermove",
    (event) => {

        if (!zoomActive) {
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


        lightboxImage.style.setProperty(
            "--zoom-x",
            `${x}%`
        );

        lightboxImage.style.setProperty(
            "--zoom-y",
            `${y}%`
        );

    }
);


/* ========================================
   SMOOTH PAGE SCROLL
======================================== */

let pageVelocity = 0;

let pageScrollAnimation = null;

let lastWheelTime = 0;


const PAGE_FRICTION = .88;

const PAGE_ACCELERATION = .85;

const MAX_PAGE_VELOCITY = 3600;


window.addEventListener(
    "wheel",
    (event) => {

        if (
            lightbox.classList.contains("active")
        ) {

            return;

        }


        event.preventDefault();


        const now =
            performance.now();


        const timeSinceLast =
            now -
            lastWheelTime;


        lastWheelTime =
            now;


        /*
            A burst of wheel input creates
            velocity rather than separate
            stepped movements.
        */

        const input =
            event.deltaY *
            PAGE_ACCELERATION;


        pageVelocity +=
            input;


        /*
            Prevent old momentum from becoming
            excessive after a long pause.
        */

        if (
            timeSinceLast > 120
        ) {

            pageVelocity *= .55;

        }


        pageVelocity =
            Math.max(
                -MAX_PAGE_VELOCITY,
                Math.min(
                    MAX_PAGE_VELOCITY,
                    pageVelocity
                )
            );


        if (
            !pageScrollAnimation
        ) {

            pageScrollAnimation =
                requestAnimationFrame(
                    pageScrollLoop
                );

        }

    },
    {
        passive: false
    }
);


function pageScrollLoop() {

    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;


    if (
        Math.abs(pageVelocity) < .25
    ) {

        pageVelocity = 0;

        pageScrollAnimation = null;

        return;

    }


    let next =
        window.scrollY +
        pageVelocity *
        .016;


    next =
        Math.max(
            0,
            Math.min(
                maxScroll,
                next
            )
        );


    window.scrollTo(
        0,
        next
    );


    pageVelocity *=
        PAGE_FRICTION;


    if (
        (
            next <= 0 &&
            pageVelocity < 0
        ) ||
        (
            next >= maxScroll &&
            pageVelocity > 0
        )
    ) {

        pageVelocity = 0;

    }


    pageScrollAnimation =
        requestAnimationFrame(
            pageScrollLoop
        );

}


/* ========================================
   SMOOTH SECTION SCROLL
======================================== */

let sectionScrollAnimation = null;


function smoothScrollTo(element) {

    if (!element) {
        return;
    }


    const start =
        window.scrollY;


    const target =
        element.getBoundingClientRect().top +
        window.scrollY -
        105;


    const distance =
        target -
        start;


    const duration =
        Math.min(
            1250,
            Math.max(
                700,
                Math.abs(distance) * .65
            )
        );


    const startTime =
        performance.now();


    pageVelocity = 0;


    if (
        sectionScrollAnimation
    ) {

        cancelAnimationFrame(
            sectionScrollAnimation
        );

    }


    function animate(currentTime) {

        const progress =
            Math.min(
                1,
                (
                    currentTime -
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

            sectionScrollAnimation =
                requestAnimationFrame(
                    animate
                );

        } else {

            sectionScrollAnimation =
                null;

        }

    }


    sectionScrollAnimation =
        requestAnimationFrame(
            animate
        );

}


/* ========================================
   PRICING BUTTON
======================================== */

pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            document.getElementById("pricing")
        );

    }
);


/* ========================================
   CONTACT BUTTON
======================================== */

contactButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            document.getElementById("socials")
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


                smoothScrollTo(
                    target
                );

            }
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
            threshold: .2
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
   CUSTOM SCROLLBAR
======================================== */

function updateScrollbar() {

    if (!scrollbarThumb) {
        return;
    }


    const documentHeight =
        document.documentElement.scrollHeight;


    const viewportHeight =
        window.innerHeight;


    const maxScroll =
        documentHeight -
        viewportHeight;


    if (
        maxScroll <= 0
    ) {

        scrollbarThumb.style.height =
            "100%";

        scrollbarThumb.style.transform =
            "translateY(0)";

        return;

    }


    const viewportRatio =
        viewportHeight /
        documentHeight;


    const thumbHeight =
        Math.max(
            55,
            (
                viewportRatio *
                100
            )
        );


    const availableTravel =
        100 -
        thumbHeight;


    const scrollRatio =
        window.scrollY /
        maxScroll;


    scrollbarThumb.style.height =
        `${thumbHeight}%`;


    scrollbarThumb.style.transform =
        `translateY(${availableTravel * scrollRatio}%)`;

}


window.addEventListener(
    "scroll",
    updateScrollbar,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateScrollbar
);


window.addEventListener(
    "load",
    updateScrollbar
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
   PREVENT GALLERY IMAGE DRAG
======================================== */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);


/* ========================================
   INITIAL UPDATE
======================================== */

measureGallery();

updateScrollbar();
