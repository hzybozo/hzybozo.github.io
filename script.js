/* =========================================================
   HZY PORTFOLIO
   JAVASCRIPT MATCHED DIRECTLY TO THE CURRENT HTML
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   SAFETY
========================================================= */

if (!gallery || !galleryWrapper) {
    console.error("Gallery elements could not be found.");
}


/* =========================================================
   GALLERY DUPLICATION
========================================================= */

const originalItems =
    gallery
        ? Array.from(
            gallery.querySelectorAll(".gallery-item")
        )
        : [];


/*
    We duplicate the entire set.

    This gives us:

    [1 2 3 4 ... 12] [1 2 3 4 ... 12]

    When the first set leaves the screen,
    the position is wrapped back to the beginning.
*/

originalItems.forEach((item) => {

    const clone =
        item.cloneNode(true);

    clone.dataset.clone =
        "true";

    gallery.appendChild(clone);

});


/* =========================================================
   GALLERY STATE
========================================================= */

let singleSetWidth = 0;

let position = 0;

let lastFrameTime =
    performance.now();


/*
    Pixels per second.

    Lower = slower.
    This is deliberately gentle so the strip
    moves continuously without looking rushed.
*/

const AUTO_SPEED = 24;


/* =========================================================
   DRAG STATE
========================================================= */

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


/*
    Increased from the previous version.

    This controls how much velocity is
    generated when the mouse is released.
*/

const MOMENTUM_MULTIPLIER = 4.8;


/*
    Friction closer to 1 means the gallery
    keeps moving longer.
*/

const MOMENTUM_FRICTION = 0.987;


/*
    Safety limit so a very fast mouse
    movement cannot launch the gallery
    infinitely far.
*/

const MAX_MOMENTUM = 6500;


/* =========================================================
   MEASUREMENT
========================================================= */

function measureGallery() {

    if (!gallery) {
        return;
    }

    /*
        Because the gallery contains exactly
        two copies of the item set, half of
        the scroll width is one complete set.
    */

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
    () => {

        /*
            Delay measurement slightly so
            responsive CSS has settled.
        */

        requestAnimationFrame(
            measureGallery
        );

    }
);


/* =========================================================
   NORMALIZE LOOP POSITION
========================================================= */

function normalizePosition() {

    if (!singleSetWidth) {
        return;
    }


    /*
        Keep position between:

        -singleSetWidth
        and
        0
    */

    while (
        position <= -singleSetWidth
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


/* =========================================================
   RENDER
========================================================= */

function renderGallery() {

    if (!gallery) {
        return;
    }

    gallery.style.transform =
        `translate3d(${position}px, 0, 0)`;

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animationLoop(
    currentTime
) {

    const delta =
        Math.min(
            currentTime - lastFrameTime,
            50
        );

    lastFrameTime =
        currentTime;


    /*
        Do not automatically move the gallery
        while the user is actively dragging.
    */

    if (
        !isDragging &&
        !lightbox.classList.contains("active")
    ) {

        /*
            Momentum gets priority after a drag.

            Once it becomes small enough,
            automatic movement resumes.
        */

        if (
            Math.abs(momentum) > 0.15
        ) {

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


            /*
                Normal continuous movement.
            */

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


/* =========================================================
   POINTER DOWN
========================================================= */

galleryWrapper.addEventListener(
    "pointerdown",
    (event) => {

        /*
            Only the primary mouse button
            starts a gallery drag.

            Touch and pen are still supported.
        */

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {

            return;

        }


        /*
            Magnifier button should not start
            a gallery drag.
        */

        if (
            event.target.closest(
                ".zoom-trigger"
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


        try {

            galleryWrapper.setPointerCapture(
                event.pointerId
            );

        } catch (error) {
            /* Pointer capture may not be available
               in every browser environment. */
        }


        /*
            Prevent browser image selection,
            but NOT wheel scrolling.
        */

        event.preventDefault();

    }
);


/* =========================================================
   POINTER MOVE
========================================================= */

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


        /*
            A 7px threshold separates a click
            from an actual drag.
        */

        if (
            Math.abs(distance) > 7
        ) {

            hasDragged = true;

        }


        /*
            Once dragging has actually started,
            remove the press animation.
        */

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


        /*
            Calculate velocity from the latest
            pointer movement.
        */

        const elapsed =
            now -
            lastPointerTime;


        if (
            elapsed > 0
        ) {

            const instantVelocity =
                (
                    event.clientX -
                    lastPointerX
                ) /
                (
                    elapsed / 1000
                );



            /*
                Smooth the velocity rather than
                using one potentially noisy frame.
            */

            dragVelocity =
                dragVelocity * .65 +
                instantVelocity * .35;

        }


        lastPointerX =
            event.clientX;

        lastPointerTime =
            now;


        event.preventDefault();

    }
);


/* =========================================================
   RELEASE DRAG
========================================================= */

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
        If the user barely moved the mouse,
        treat the interaction as a click.
    */

    if (
        pressedItem &&
        !hasDragged
    ) {

        /*
            Small delay lets the CSS press
            animation actually be visible.
        */

        const clickedItem =
            pressedItem;

        clickedItem.classList.remove(
            "pressing"
        );


        setTimeout(
            () => {

                openProject(
                    clickedItem
                );

            },
            90
        );

    }


    /*
        Convert drag velocity into momentum.
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


    /*
        Release pointer capture.
    */

    try {

        galleryWrapper.releasePointerCapture(
            event.pointerId
        );

    } catch (error) {
        /* Ignore unsupported release calls. */
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


/* =========================================================
   IMPORTANT:
   WHEEL SCROLLING
========================================================= */

/*
    There is intentionally NO wheel listener
    on galleryWrapper.

    Therefore:

    - wheel over the gallery = normal webpage scroll
    - wheel outside gallery = normal webpage scroll
    - gallery itself keeps moving automatically
    - wheel never controls horizontal gallery movement

    This is exactly what you requested.
*/


/* =========================================================
   LIGHTBOX
========================================================= */

function openProject(item) {

    if (!lightbox || !lightboxImage) {
        return;
    }


    /*
        Use the item's computed background so
        each placeholder appears as the same
        colour in the large preview.
    */

    const background =
        window.getComputedStyle(
            item
        ).background;


    lightboxImage.style.background =
        background;


    lightbox.classList.add(
        "active"
    );


    document.body.classList.add(
        "lightbox-open"
    );

}


function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "lightbox-open"
    );

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
            event.key === "Escape" &&
            lightbox.classList.contains("active")
        ) {

            closeLightbox();

        }

    }
);


/* =========================================================
   MAGNIFYING GLASS
========================================================= */

const zoomButtons =
    document.querySelectorAll(
        ".zoom-trigger"
    );


let zoomingItem = null;

let zoomActive = false;


/*
    Prevent the magnifier button from
    becoming a gallery drag.
*/

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


                if (
                    zoomActive &&
                    zoomingItem === item
                ) {

                    deactivateZoom();

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


/* =========================================================
   ACTIVATE ZOOM
========================================================= */

function activateZoom(
    item,
    event
) {

    /*
        If another image is currently zoomed,
        restore it first.
    */

    if (
        zoomingItem &&
        zoomingItem !== item
    ) {

        zoomingItem.style.transform = "";

        zoomingItem.style.transformOrigin = "";

        zoomingItem.classList.remove(
            "zooming"
        );

    }


    zoomingItem =
        item;

    zoomActive = true;


    item.classList.add(
        "zooming"
    );


    updateZoom(
        event,
        item
    );

}


/* =========================================================
   FOLLOW CURSOR
========================================================= */

galleryWrapper.addEventListener(
    "pointermove",
    (event) => {

        if (
            !zoomActive ||
            !zoomingItem
        ) {

            return;

        }


        /*
            The magnifier button itself should
            not move the zoom target.
        */

        if (
            event.target.closest(
                ".zoom-trigger"
            )
        ) {

            return;

        }


        /*
            Only follow the cursor while it
            remains over the zoomed item.
        */

        if (
            !event.target.closest(
                ".gallery-item"
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


/* =========================================================
   UPDATE ZOOM
========================================================= */

function updateZoom(
    event,
    item
) {

    if (!item) {
        return;
    }


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
        "scale(1.55)";

}


/* =========================================================
   DEACTIVATE ZOOM
========================================================= */

function deactivateZoom() {

    if (!zoomingItem) {
        return;
    }


    zoomingItem.style.transform =
        "";

    zoomingItem.style.transformOrigin =
        "";

    zoomingItem.classList.remove(
        "zooming"
    );


    zoomingItem =
        null;

    zoomActive =
        false;

}


/*
    Clicking somewhere outside the gallery
    closes magnification.
*/

document.addEventListener(
    "pointerdown",
    (event) => {

        if (!zoomActive) {
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


/*
    Leaving the gallery closes zoom.
*/

galleryWrapper.addEventListener(
    "pointerleave",
    () => {

        if (zoomActive) {

            deactivateZoom();

        }

    }
);


/* =========================================================
   PRICING BUTTON
========================================================= */

pricingButton.addEventListener(
    "click",
    () => {

        smoothScrollTo(
            pricingSection
        );

    }
);


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

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


/* =========================================================
   SMOOTH SECTION SCROLL
========================================================= */

let scrollAnimation =
    null;


function smoothScrollTo(
    element
) {

    if (!element) {
        return;
    }


    const start =
        window.scrollY;


    const target =
        element.getBoundingClientRect().top +
        window.scrollY -
        30;


    const distance =
        target -
        start;


    const duration =
        Math.min(
            1200,
            Math.max(
                650,
                Math.abs(distance) * .7
            )
        );


    const startTime =
        performance.now();


    if (scrollAnimation) {

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

            Fast initial movement,
            progressively softer finish.
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


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

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
                        !entry.isIntersecting
                    ) {

                        return;

                    }


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


/* =========================================================
   FAQ
========================================================= */

const faqItems =
    document.querySelectorAll(
        ".faq-item"
    );


faqItems.forEach(
    (item) => {

        item.addEventListener(
            "toggle",
            () => {

                /*
                    Only react when this FAQ
                    has actually been opened.
                */

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


/* =========================================================
   PREVENT NATIVE DRAGGING
========================================================= */

gallery.addEventListener(
    "dragstart",
    (event) => {

        event.preventDefault();

    }
);


/* =========================================================
   INITIAL MEASUREMENT
========================================================= */

requestAnimationFrame(
    () => {

        measureGallery();

    }
);
