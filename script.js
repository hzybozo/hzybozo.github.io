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
        document.querySelectorAll(
            ".gallery-item"
        )
    );


const lightbox =
    document.getElementById(
        "lightbox"
    );

const lightboxContent =
    document.getElementById(
        "lightboxContent"
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
   INFINITE GALLERY
======================================== */

/*
    Make a second identical copy.

    This gives us:

    01 02 03 ... 12 | 01 02 03 ... 12

    Once we reach the second copy,
    we silently jump back to the first.

    Because they are identical, the user
    sees a continuous infinite strip.
*/

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

    /*
        Automatic movement pauses while
        the user is actively dragging or
        looking at an enlarged project.
    */

    if (
        !isDragging &&
        !lightbox.classList.contains(
            "active"
        )
    ) {

        galleryWrapper.scrollLeft +=
            automaticSpeed;


        /*
            Infinite loop.
        */

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
   DRAG VARIABLES
======================================== */

let isDragging = false;

let startX = 0;

let startScroll = 0;

let previousX = 0;

let velocity = 0;

let movedDuringDrag = false;

let activePressedItem = null;


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


        /*
            Find the card underneath
            the cursor.
        */

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
   POINTER MOVE
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


        /*
            Small movements still count
            as a click.

            Once movement passes 6px,
            it's a drag.
        */

        if (
            Math.abs(movement) > 6
        ) {

            movedDuringDrag = true;

        }


        /*
            Remove the click animation
            once the user starts dragging.
        */

        if (
            movedDuringDrag &&
            activePressedItem
        ) {

            activePressedItem.classList.remove(
                "pressing"
            );

        }


        /*
            Move gallery according to
            the pointer.
        */

        galleryWrapper.scrollLeft =
            startScroll -
            movement;


        /*
            Calculate velocity for
            momentum after release.
        */

        velocity =
            event.clientX -
            previousX;


        previousX =
            event.clientX;


        /*
            Keep manual dragging
            inside the infinite loop.
        */

        keepGalleryLooped();

    }
);


/* ========================================
   POINTER UP
======================================== */

function stopDragging() {

    if (!isDragging) {

        return;

    }


    isDragging = false;


    galleryWrapper.classList.remove(
        "dragging"
    );


    /*
        If the pointer was released
        without actually dragging,
        open the selected project.

        This means:

        Press → animation
        Release → image opens
    */

    if (
        activePressedItem &&
        !movedDuringDrag
    ) {

        openItem(
            activePressedItem
        );

    }


    /*
        Remove the press animation.
    */

    if (activePressedItem) {

        activePressedItem.classList.remove(
            "pressing"
        );

    }


    activePressedItem = null;


    /*
        Only apply momentum if the
        user actually dragged.
    */

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
   KEEP GALLERY INFINITE
======================================== */

function keepGalleryLooped() {

    if (
        loopWidth <= 0
    ) {

        return;

    }


    /*
        Moving forwards.
    */

    if (
        galleryWrapper.scrollLeft >=
        loopWidth
    ) {

        galleryWrapper.scrollLeft -=
            loopWidth;

    }


    /*
        Moving backwards.
    */

    if (
        galleryWrapper.scrollLeft < 0
    ) {

        galleryWrapper.scrollLeft +=
            loopWidth;

    }

}


/* ========================================
   DRAG MOMENTUM
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


        /*
            Stop momentum when an image
            is opened.
        */

        if (
            lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        galleryWrapper.scrollLeft -=
            momentum;


        keepGalleryLooped();


        /*
            Gradually slow down.
        */

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
   OPEN PROJECT
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


    /*
        Give the enlarged image the
        same placeholder colour.
    */

    lightboxImage.style.background =
        background;


    lightboxNumber.textContent =
        number;


    /*
        Show lightbox.
    */

    lightbox.classList.add(
        "active"
    );


    /*
        Prevent the page itself from
        scrolling while the image is open.
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
    closeLightbox
);


/* ========================================
   CLICK OUTSIDE IMAGE
======================================== */

lightbox.addEventListener(
    "click",
    (event) => {

        /*
            Only close when the actual
            dark background is clicked.

            Clicking the image itself
            does nothing.
        */

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
   NO MOUSE-WHEEL HANDLER
======================================== */

/*
    Deliberately no "wheel" event is
    attached to the gallery.

    The gallery wrapper also uses:

        overflow: hidden;

    Therefore the gallery cannot consume
    the mouse wheel.

    Example:

        Cursor over gallery
                    ↓
             Scroll wheel
                    ↓
        Normal webpage scrolls

    Meanwhile the gallery's own automatic
    animation continues independently.
*/
