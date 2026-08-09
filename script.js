/* ========================================
   ELEMENTS
======================================== */

const galleryWrapper =
    document.getElementById(
        "galleryWrapper"
    );

const gallery =
    document.getElementById(
        "gallery"
    );

const pricingButton =
    document.getElementById(
        "pricingButton"
    );

const pricingSection =
    document.getElementById(
        "pricing"
    );

const lightbox =
    document.getElementById(
        "lightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );

const lightboxClose =
    document.getElementById(
        "lightboxClose"
    );


/* ========================================
   GALLERY SETUP
======================================== */

const originalItems =
    Array.from(
        gallery.querySelectorAll(
            ".gallery-item"
        )
    );


/*
    Duplicate the cards so the gallery
    can continuously loop.
*/

originalItems.forEach(
    (item) => {

        const clone =
            item.cloneNode(true);

        gallery.appendChild(
            clone
        );

    }
);


/* ========================================
   GALLERY STATE
======================================== */

let singleSetWidth = 0;

let position = 0;

let lastTime =
    performance.now();


/*
    Natural automatic movement.

    Pixels per second.
*/

const AUTO_SPEED = 28;


/* ========================================
   DRAG STATE
======================================== */

let isDragging = false;

let pointerId = null;

let dragStartX = 0;

let dragStartPosition = 0;

let lastPointerX = 0;

let lastPointerTime = 0;

let dragVelocity = 0;

let hasDragged = false;

let pressedItem = null;


/* ========================================
   MOMENTUM
======================================== */

/*
    Current momentum.

    Positive / negative determines
    direction.
*/

let momentum = 0;


/*
    MUCH stronger momentum than before.
*/

const MOMENTUM_MULTIPLIER = 2.2;


/*
    How quickly momentum fades.

    0.975 = long, smooth glide.
*/

const MOMENTUM_FRICTION = 0.975;


/*
    Maximum possible momentum.
*/

const MAX_MOMENTUM = 4000;


/* ========================================
   MEASURE GALLERY
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
   NORMALIZE INFINITE LOOP
======================================== */

function normalizePosition() {

    if (
        singleSetWidth <= 0
    ) {

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
        `translate3d(${position}px, 0, 0)`;

}


/* ========================================
   GALLERY ANIMATION
======================================== */

function animationLoop(
    currentTime
) {

    const deltaTime =
        Math.min(
            currentTime -
            lastTime,

            50
        );


    lastTime =
        currentTime;


    /*
        Don't move the gallery automatically
        while the user is dragging.
    */

    if (
        !isDragging &&
        !lightbox.classList.contains(
            "active"
        )
    ) {

        /*
            Momentum first.
        */

        if (
            Math.abs(momentum) > 0.1
        ) {

            position +=
                momentum *
                (
                    deltaTime /
                    1000
                );


            /*
                Smoothly decay momentum.
            */

            momentum *=
                Math.pow(
                    MOMENTUM_FRICTION,
                    deltaTime / 16.67
                );

        } else {

            /*
                Once momentum is gone,
                return to natural scrolling.
            */

            momentum = 0;

            position -=
                AUTO_SPEED *
                (
                    deltaTime /
                    1000
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


        /*
            Kill existing momentum when
            the user takes control.
        */

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


        /*
            Find the card that was pressed.
        */

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
            event.pointerId !==
            pointerId
        ) {

            return;

        }


        const now =
            performance.now();


        const distance =
            event.clientX -
            dragStartX;


        /*
            Movement greater than 7px
            means this is a drag.
        */

        if (
            Math.abs(distance) > 7
        ) {

            hasDragged = true;

        }


        /*
            Remove click animation once
            dragging actually begins.
        */

        if (
            hasDragged &&
            pressedItem
        ) {

            pressedItem.classList.remove(
                "pressing"
            );

        }


        /*
            Follow pointer.
        */

        position =
            dragStartPosition +
            distance;


        normalizePosition();

        renderGallery();


        /*
            Calculate actual pointer
            velocity.
        */

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
   RELEASE DRAG
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
        CLICK
        -----
        If the user barely moved,
        open the project.
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
        MOMENTUM
        --------
        Turn release velocity into
        a strong glide.
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


    /*
        Remove press state.
    */

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


    try {

        galleryWrapper.releasePointerCapture(
            event.pointerId
        );

    } catch (error) {

        /*
            Already released.
        */

    }

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
   LOST POINTER
======================================== */

galleryWrapper.addEventListener(
    "lostpointercapture",
    () => {

        if (
            !isDragging
        ) {

            return;

        }


        isDragging = false;

        galleryWrapper.classList.remove(
            "dragging"
        );


        if (
            pressedItem
        ) {

            pressedItem.classList.remove(
                "pressing"
            );

        }


        if (
            hasDragged
        ) {

            momentum =
                dragVelocity *
                MOMENTUM_MULTIPLIER;

        }


        pressedItem = null;

        pointerId = null;

    }
);


/* ========================================
   OPEN PROJECT
======================================== */

function openProject(item) {

    const background =
        window.getComputedStyle(
            item
        ).backgroundColor;


    /*
        Put the project's colour
        into the enlarged preview.
    */

    lightboxImage.style.background =
        background;


    /*
        Stop gallery momentum while
        the preview is open.
    */

    momentum = 0;


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* ========================================
   CLOSE PROJECT
======================================== */

function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* ========================================
   CLOSE BUTTON
======================================== */

lightboxClose.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        closeLightbox();

    }
);


/* ========================================
   CLICK BACKDROP
======================================== */

lightbox.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            lightbox
        ) {

            closeLightbox();

        }

    }
);


/* ========================================
   ESCAPE
======================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }

    }
);


/* ========================================
   PRICING BUTTON
======================================== */

pricingButton.addEventListener(
    "click",
    () => {

        /*
            Use native smooth scrolling
            for the long-page transition.
        */

        pricingSection.scrollIntoView(
            {
                behavior: "smooth",
                block: "start"
            }
        );

    }
);


/* ========================================
   EXTRA SMOOTH PAGE SCROLLING
======================================== */

/*
    We deliberately DO NOT intercept
    the wheel event.

    That is important because the gallery
    must never steal the mouse wheel.

    The browser therefore retains native
    trackpad / mouse-wheel scrolling.

    scroll-behavior: smooth handles
    programmatic page movement such as
    the pricing button.
*/


/* ========================================
   PREVENT IMAGE / TEXT DRAGGING
======================================== */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);
