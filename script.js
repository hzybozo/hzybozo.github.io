const galleryWrapper =
    document.getElementById("galleryWrapper");

const gallery =
    document.getElementById("gallery");

const originalItems =
    Array.from(
        document.querySelectorAll(".gallery-item")
    );


const lightbox =
    document.getElementById("lightbox");

const lightboxContent =
    document.getElementById("lightboxContent");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxNumber =
    document.getElementById("lightboxNumber");

const lightboxClose =
    document.getElementById("lightboxClose");


/* ========================================
   INFINITE GALLERY
======================================== */

originalItems.forEach((item) => {

    const clone =
        item.cloneNode(true);

    gallery.appendChild(clone);

});


let loopWidth = 0;


function calculateLoopWidth() {

    loopWidth =
        gallery.scrollWidth / 2;

}


calculateLoopWidth();


window.addEventListener(
    "resize",
    calculateLoopWidth
);


/* ========================================
   AUTOMATIC MOVEMENT
======================================== */

let automaticSpeed = 0.35;


function automaticMovement() {

    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        galleryWrapper.scrollLeft +=
            automaticSpeed;


        if (
            galleryWrapper.scrollLeft >=
            loopWidth
        ) {

            galleryWrapper.scrollLeft -=
                loopWidth;

        }

    }

    requestAnimationFrame(
        automaticMovement
    );

}


automaticMovement();


/* ========================================
   DRAGGING
======================================== */

let isDragging = false;

let startX = 0;

let startScroll = 0;

let previousX = 0;

let velocity = 0;

let movedDuringDrag = false;

let activePressedItem = null;


galleryWrapper.addEventListener(
    "pointerdown",
    (event) => {

        if (event.button !== 0) {
            return;
        }


        isDragging = true;

        movedDuringDrag = false;

        startX =
            event.clientX;

        previousX =
            event.clientX;

        startScroll =
            galleryWrapper.scrollLeft;

        velocity = 0;


        galleryWrapper.classList.add(
            "dragging"
        );


        const item =
            event.target.closest(
                ".gallery-item"
            );


        if (item) {

            activePressedItem =
                item;

            item.classList.add(
                "pressing"
            );

        }


        galleryWrapper.setPointerCapture(
            event.pointerId
        );

    }
);


/* ========================================
   DRAG MOVE
======================================== */

galleryWrapper.addEventListener(
    "pointermove",
    (event) => {

        if (!isDragging) {
            return;
        }


        const movement =
            event.clientX -
            startX;


        if (
            Math.abs(movement) > 5
        ) {

            movedDuringDrag = true;

        }


        if (
            movedDuringDrag &&
            activePressedItem
        ) {

            activePressedItem.classList.remove(
                "pressing"
            );

        }


        galleryWrapper.scrollLeft =
            startScroll -
            movement;


        velocity =
            event.clientX -
            previousX;


        previousX =
            event.clientX;

    }
);


/* ========================================
   DRAG RELEASE
======================================== */

function stopDragging() {

    if (!isDragging) {
        return;
    }


    isDragging = false;


    galleryWrapper.classList.remove(
        "dragging"
    );


    if (
        activePressedItem &&
        !movedDuringDrag
    ) {

        openItem(
            activePressedItem
        );

    }


    if (activePressedItem) {

        activePressedItem.classList.remove(
            "pressing"
        );

    }


    activePressedItem = null;


    if (movedDuringDrag) {
        applyMomentum();
    }

}


galleryWrapper.addEventListener(
    "pointerup",
    stopDragging
);


galleryWrapper.addEventListener(
    "pointercancel",
    stopDragging
);


/* ========================================
   MOMENTUM
======================================== */

function applyMomentum() {

    let momentum =
        velocity * 7;


    function animateMomentum() {

        if (
            Math.abs(momentum) < 0.5
        ) {

            return;

        }


        if (
            lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        galleryWrapper.scrollLeft -=
            momentum;


        if (
            galleryWrapper.scrollLeft >=
            loopWidth
        ) {

            galleryWrapper.scrollLeft -=
                loopWidth;

        }


        if (
            galleryWrapper.scrollLeft < 0
        ) {

            galleryWrapper.scrollLeft +=
                loopWidth;

        }


        momentum *= 0.94;


        requestAnimationFrame(
            animateMomentum
        );

    }


    requestAnimationFrame(
        animateMomentum
    );

}


/* ========================================
   OPEN IMAGE
======================================== */

function openItem(item) {

    const background =
        window.getComputedStyle(
            item
        ).backgroundColor;


    const number =
        item.querySelector(
            ".image-number"
        ).textContent;


    lightboxImage.style.background =
        background;


    lightboxNumber.textContent =
        number;


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* ========================================
   CLOSE IMAGE
======================================== */

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
            event.key === "Escape"
        ) {

            closeLightbox();

        }

    }
);


/* ========================================
   IMPORTANT:
   NO WHEEL HANDLER
======================================== */

/*
    There is deliberately no wheel
    event listener.

    This means the mouse wheel always
    controls normal page scrolling.

    The gallery continues moving
    automatically regardless of where
    the cursor is positioned.
*/
