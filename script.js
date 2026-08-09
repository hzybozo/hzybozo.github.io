/* ========================================
   ELEMENTS
======================================== */

const galleryWrapper =
    document.getElementById("galleryWrapper");

const gallery =
    document.getElementById("gallery");

const pricingButton =
    document.getElementById("pricingButton");

const pricingSection =
    document.getElementById("pricing");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");

const navItems =
    document.querySelectorAll(".nav-item");


/* ========================================
   GALLERY
======================================== */

const originalItems =
    Array.from(
        gallery.querySelectorAll(".gallery-item")
    );


originalItems.forEach((item) => {

    const clone =
        item.cloneNode(true);

    gallery.appendChild(clone);

});


let singleSetWidth = 0;

let position = 0;

let lastTime =
    performance.now();


/*
    Automatic movement.
*/

const AUTO_SPEED = 25;


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


const MOMENTUM_MULTIPLIER = 3.2;

const MOMENTUM_FRICTION = 0.982;

const MAX_MOMENTUM = 5000;


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
   LOOP POSITION
======================================== */

function normalizePosition() {

    if (!singleSetWidth) {
        return;
    }


    while (
        position <=
        -singleSetWidth
    ) {

        position +=
            singleSetWidth;

    }


    while (
        position > 0
    ) {

        position -=
            singleSetWidth;

    }

}


/* ========================================
   RENDER
======================================== */

function renderGallery() {

    gallery.style.transform =
        `translate3d(${position}px,0,0)`;

}


/* ========================================
   ANIMATION
======================================== */

function animationLoop(
    currentTime
) {

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

        if (
            Math.abs(momentum) > .15
        ) {

            position +=
                momentum *
                (
                    delta / 1000
                );


            momentum *=
                Math.pow(
                    MOMENTUM_FRICTION,
                    delta / 16.67
                );

        } else {

            momentum = 0;

            position -=
                AUTO_SPEED *
                (
                    delta / 1000
                );

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

        if (
            event.button !== 0
        ) {
            return;
        }


        isDragging = true;

        pointerId =
            event.pointerId;

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


        position =
            dragStartPosition +
            distance;


        normalizePosition();

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


    /*
        A short click opens the
        project lightbox.
    */

    if (
        pressedItem &&
        !hasDragged
    ) {

        openProject(
            pressedItem
        );

    }


    /*
        Strong momentum from release.
    */

    if (
        hasDragged
    ) {

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


    if (
        pressedItem
    ) {

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

function openProject(item) {

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

        if (
            event.key === "Escape"
        ) {

            closeLightbox();

        }

    }
);


/* ========================================
   MAGNIFYING GLASS
======================================== */

const zoomButtons =
    document.querySelectorAll(
        ".zoom-trigger"
    );


zoomButtons.forEach(
    (button) => {

        button.addEventListener(
            "pointerdown",
            (event) => {

                event.stopPropagation();

            }
        );


        button.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const item =
                    button.closest(
                        ".gallery-item"
                    );

                if (!item) {
                    return;
                }


                activateZoom(
                    item,
                    event
                );

            }
        );

    }
);


/*
    Cursor-following zoom.

    This is intentionally separate from
    the normal lightbox so the user can
    inspect a precise area of an image.
*/

let zoomingItem = null;

let zoomActive = false;


function activateZoom(
    item,
    event
) {

    zoomingItem =
        item;

    zoomActive = true;

    item.classList.add(
        "zooming"
    );


    /*
        Use the current cursor position
        immediately.
    */

    updateZoom(
        event,
        item
    );

}


/*
    Follow the cursor over the image.
*/

galleryWrapper.addEventListener(
    "pointermove",
    (event) => {

        if (
            !zoomActive ||
            !zoomingItem
        ) {

            return;

        }


        if (
            event.target.closest(
                ".zoom-trigger"
            )
        ) {

            return;

        }


        updateZoom(
            event,
            zoomingItem
        );

    }
);


function updateZoom(
    event,
    item
) {

    const rect =
        item.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left;

    const y =
        event.clientY -
        rect.top;


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


    item.style.transformOrigin =
        `${percentX}% ${percentY}%`;

    item.style.transform =
        `scale(1.55)`;

}


/*
    Clicking outside the magnifier
    removes the zoom.
*/

document.addEventListener(
    "pointerdown",
    (event) => {

        if (
            !zoomActive
        ) {

            return;

        }


        if (
            event.target.closest(
                ".zoom-trigger"
            )
        ) {

            return;

        }


        if (
            event.target.closest(
                ".gallery-item"
            )
        ) {

            return;

        }


        deactivateZoom();

    }
);


function deactivateZoom() {

    if (
        !zoomingItem
    ) {

        return;

    }


    zoomingItem.style.transform =
        "";

    zoomingItem.style.transformOrigin =
        "";


    zoomingItem.classList.remove(
        "zooming"
    );


    zoomingItem = null;

    zoomActive = false;

}


/*
    Release / leave gallery also
    removes the active zoom.
*/

galleryWrapper.addEventListener(
    "pointerleave",
    () => {

        if (
            zoomActive
        ) {

            deactivateZoom();

        }

    }
);


/* ========================================
   PRICING BUTTON
======================================== */

pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            pricingSection
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


function smoothScrollTo(
    element
) {

    const start =
        window.scrollY;


    const target =
        element.getBoundingClientRect().top +
        window.scrollY -
        35;


    const distance =
        target -
        start;


    const duration =
        Math.min(
            1150,
            Math.max(
                650,
                Math.abs(distance) * .7
            )
        );


    const startTime =
        performance.now();


    if (
        scrollAnimation
    ) {

        cancelAnimationFrame(
            scrollAnimation
        );

    }


    function animate(
        currentTime
    ) {

        const progress =
            Math.min(
                1,
                (
                    currentTime -
                    startTime
                ) /
                duration
            );


        /*
            Quintic ease-out.
            Very smooth at the beginning
            and settles naturally.
        */

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

        }

    }


    scrollAnimation =
        requestAnimationFrame(
            animate
        );

}


/* ========================================
   ACTIVE NAVIGATION
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
            threshold: .25
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

                if (
                    !item.open
                ) {

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
