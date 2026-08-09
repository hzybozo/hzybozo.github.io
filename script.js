const galleryWrapper =
    document.getElementById(
        "galleryWrapper"
    );

const gallery =
    document.getElementById(
        "gallery"
    );

const originalItems =
    Array.from(
        gallery.querySelectorAll(
            ".gallery-item"
        )
    );


const lightbox =
    document.getElementById(
        "lightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );

const lightboxNumber =
    document.getElementById(
        "lightboxNumber"
    );

const lightboxClose =
    document.getElementById(
        "lightboxClose"
    );


/* ========================================
   CREATE INFINITE DUPLICATE
======================================== */

/*
    Original:

    01 02 03 04 ... 12

    Becomes:

    01 02 03 04 ... 12 | 01 02 03 04 ... 12

    Once the first copy has completely
    moved away, we shift the track back
    by exactly one copy's width.
*/

originalItems.forEach((item) => {

    const clone =
        item.cloneNode(true);

    gallery.appendChild(
        clone
    );

});


/* ========================================
   STATE
======================================== */

let singleSetWidth = 0;

let position = 0;

let lastTime = performance.now();


/*
    Automatic speed.

    Pixels per second.

    Increase this if you want it faster.
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

let momentum = 0;


/*
    Momentum friction.

    Higher = slides for longer.
*/

const MOMENTUM_FRICTION = 0.94;


/*
    Maximum momentum.

    Prevents an accidental huge
    mouse movement from launching
    the gallery extremely far.
*/

const MAX_MOMENTUM = 2500;


/* ========================================
   MEASURE
======================================== */

function measureGallery() {

    /*
        Since the gallery contains two
        identical sets, half its width
        is one complete set.
    */

    singleSetWidth =
        gallery.scrollWidth / 2;


    /*
        Keep position inside the
        infinite range.
    */

    normalizePosition();

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
   NORMALIZE POSITION
======================================== */

function normalizePosition() {

    if (
        singleSetWidth <= 0
    ) {

        return;

    }


    /*
        If moving to the right.
    */

    while (
        position <=
        -singleSetWidth
    ) {

        position +=
            singleSetWidth;

    }


    /*
        If moving to the left.
    */

    while (
        position > 0
    ) {

        position -=
            singleSetWidth;

    }

}


/* ========================================
   APPLY POSITION
======================================== */

function renderGallery() {

    gallery.style.transform =
        `translate3d(${position}px, 0, 0)`;

}


/* ========================================
   AUTOMATIC MOVEMENT
======================================== */

function animationLoop(currentTime) {

    const deltaTime =
        Math.min(
            currentTime -
            lastTime,

            50
        );


    lastTime =
        currentTime;


    /*
        Normal automatic movement.

        Positive position movement
        means the gallery travels left.
    */

    if (
        !isDragging &&
        Math.abs(momentum) < 0.1 &&
        !lightbox.classList.contains(
            "active"
        )
    ) {

        position -=
            AUTO_SPEED *
            (deltaTime / 1000);

    }


    /*
        Momentum after dragging.
    */

    if (
        !isDragging &&
        Math.abs(momentum) >= 0.1 &&
        !lightbox.classList.contains(
            "active"
        )
    ) {

        position +=
            momentum *
            (deltaTime / 1000);


        /*
            Gradually kill momentum.
        */

        momentum *=
            Math.pow(
                MOMENTUM_FRICTION,
                deltaTime / 16.67
            );

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

        /*
            Only respond to left mouse
            button / primary pointer.
        */

        if (
            event.button !== 0
        ) {

            return;

        }


        /*
            Don't start dragging if the
            enlarged image is open.
        */

        if (
            lightbox.classList.contains(
                "active"
            )
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


        /*
            Detect which project was
            pressed.
        */

        const item =
            event.target.closest(
                ".gallery-item"
            );


        if (item) {

            pressedItem =
                item;

            pressedItem.classList.add(
                "pressing"
            );

        }


        galleryWrapper.setPointerCapture(
            event.pointerId
        );


        /*
            Prevent browser drag behaviour.
        */

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


        const currentTime =
            performance.now();


        const distance =
            event.clientX -
            dragStartX;


        /*
            Once movement exceeds 7px,
            it is officially a drag.
        */

        if (
            Math.abs(distance) > 7
        ) {

            hasDragged = true;

        }


        /*
            Remove the press animation
            once the user starts dragging.
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
            Directly follow the mouse.
        */

        position =
            dragStartPosition +
            distance;


        normalizePosition();

        renderGallery();


        /*
            Calculate velocity.

            This is what gives the drag
            its momentum when released.
        */

        const timeDifference =
            currentTime -
            lastPointerTime;


        if (
            timeDifference > 0
        ) {

            dragVelocity =
                (
                    event.clientX -
                    lastPointerX
                ) /
                (
                    timeDifference / 1000
                );

        }


        lastPointerX =
            event.clientX;

        lastPointerTime =
            currentTime;


        event.preventDefault();

    }
);


/* ========================================
   POINTER UP
======================================== */

function releasePointer(event) {

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
        If this was a click rather than
        a drag, open the project.
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
        Remove the press animation.
    */

    if (pressedItem) {

        pressedItem.classList.remove(
            "pressing"
        );

    }


    /*
        Give the gallery momentum.

        The negative sign makes the
        gallery continue in the same
        direction as the drag.
    */

    momentum =
        Math.max(
            -MAX_MOMENTUM,

            Math.min(
                MAX_MOMENTUM,

                dragVelocity
            )
        );


    /*
        Clear state.
    */

    pressedItem = null;

    pointerId = null;

    dragVelocity = 0;


    try {

        galleryWrapper.releasePointerCapture(
            event.pointerId
        );

    } catch (error) {

        /*
            Pointer capture may already
            have been released by the browser.
        */

    }

}


galleryWrapper.addEventListener(
    "pointerup",
    releasePointer
);


galleryWrapper.addEventListener(
    "pointercancel",
    releasePointer
);


/* ========================================
   POINTER LEAVES WINDOW
======================================== */

galleryWrapper.addEventListener(
    "lostpointercapture",
    () => {

        if (!isDragging) {

            return;

        }


        isDragging = false;

        galleryWrapper.classList.remove(
            "dragging"
        );


        if (pressedItem) {

            pressedItem.classList.remove(
                "pressing"
            );

        }


        /*
            Keep whatever velocity was
            already calculated.
        */

        momentum =
            Math.max(
                -MAX_MOMENTUM,

                Math.min(
                    MAX_MOMENTUM,

                    dragVelocity
                )
            );


        pressedItem = null;

        pointerId = null;

    }
);


/* ========================================
   OPEN PROJECT
======================================== */

function openProject(item) {

    const computedStyle =
        window.getComputedStyle(
            item
        );


    const backgroundColor =
        computedStyle.backgroundColor;


    const number =
        item.querySelector(
            ".image-number"
        );


    lightboxImage.style.background =
        backgroundColor;


    lightboxNumber.textContent =
        number
            ? number.textContent
            : "";


    /*
        Stop momentum when opening.
    */

    momentum = 0;


    /*
        Show the lightbox.
    */

    lightbox.classList.add(
        "active"
    );


    /*
        Stop the website behind it
        from scrolling.
    */

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
   X BUTTON
======================================== */

lightboxClose.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        closeLightbox();

    }
);


/* ========================================
   CLICK BACKGROUND TO CLOSE
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
   IMPORTANT: NO WHEEL EVENT
======================================== */

/*
    There is deliberately NO wheel
    listener anywhere in this script.

    The gallery does not have native
    horizontal scrolling.

    Therefore:

        Mouse over gallery
                +
           scroll wheel
                ↓
        normal webpage scroll

    The gallery continues its automatic
    horizontal animation independently.
*/
