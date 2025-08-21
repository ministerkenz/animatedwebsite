// Entire scrolling effect with touch support
const track = document.getElementById("image-track");
let isMouseDown = false;
let isTouchDevice = 'ontouchstart' in window;

// Mouse events
window.onmousedown = e => {
    if (!isTouchDevice) {
        track.dataset.mouseDownAt = e.clientX;
        isMouseDown = true;
    }
}

window.onmouseup = () => {
    if (!isTouchDevice) {
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage;
        isMouseDown = false;
    }
}

window.onmousemove = e => {
    if (!isTouchDevice && track.dataset.mouseDownAt !== "0") {
        handleMove(e.clientX);
    }
}

// Touch events
window.ontouchstart = e => {
    if (isTouchDevice) {
        track.dataset.mouseDownAt = e.touches[0].clientX;
        isMouseDown = true;
        e.preventDefault();
    }
}

window.ontouchend = () => {
    if (isTouchDevice) {
        track.dataset.mouseDownAt = "0";
        track.dataset.prevPercentage = track.dataset.percentage;
        isMouseDown = false;
    }
}

window.ontouchmove = e => {
    if (isTouchDevice && track.dataset.mouseDownAt !== "0") {
        handleMove(e.touches[0].clientX);
        e.preventDefault();
    }
}

// Common move handler
function handleMove(clientX) {
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    let nextPercentage = parseFloat(track.dataset.prevPercentage) + percentage;
   
    nextPercentage = Math.min(nextPercentage, 0);
    nextPercentage = Math.max(nextPercentage, -100);

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
    }, { duration: 1200, fill: "forwards"});

    for(const image of track.getElementsByClassName("image")){
        image.animate({
            objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards"});
    }
}
// End of scrolling effect

// Image pop-out functionality
const popupOverlay = document.getElementById("popup-overlay");
const popupImage = document.getElementById("popup-image");
const closeButton = document.getElementById("close-button");

// Add click/touch event to all images
document.querySelectorAll('.image').forEach(image => {
    const handleImageClick = (e) => {
        // Only trigger if not dragging
        if (!isMouseDown) {
            popupImage.src = image.src;
            popupOverlay.classList.add('active');
            
            // Animate the popup with anime.js
            anime({
                targets: '.popup-image',
                scale: [0.8, 1],
                duration: 300,
                easing: 'easeOutBack'
            });
        }
        e.preventDefault();
    };

    image.addEventListener('click', handleImageClick);
    if (isTouchDevice) {
        image.addEventListener('touchend', handleImageClick);
    }
});

// Close popup functionality
const closePopup = () => {
    anime({
        targets: '.popup-image',
        scale: [1, 0.8],
        duration: 200,
        easing: 'easeInBack',
        complete: () => {
            popupOverlay.classList.remove('active');
        }
    });
};

closeButton.addEventListener('click', closePopup);
if (isTouchDevice) {
    closeButton.addEventListener('touchend', closePopup);
}

popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
        closePopup();
    }
});

if (isTouchDevice) {
    popupOverlay.addEventListener('touchend', (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
        closePopup();
    }
});

// Entire tile effect with touch support
const wrapper = document.getElementById("tiles");

let columns = 0;
let rows = 0;

const colors = [
    "rgb(229, 57, 53)",
    "rgb(253,216,53)",
    "rgb(244,81,30)",
    "rgb(76,175, 80)",
    "rgb(33,150,243)",
    "rgb(156,39,176)",
];

let count = -1;

const handleonClick = index => {
    count = count + 1;

    anime({
        targets: ".tile",
        backgroundColor: colors[count % colors.length],
        duration: 300,
        easing: 'easeInOutQuad',
        delay: anime.stagger(40, {
            grid: [columns, rows],
            from: index
        })
    });
}

const createTile = index => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    
    const handleTileClick = (e) => {
        handleonClick(index);
        e.preventDefault();
    };

    tile.onclick = handleTileClick;
    if (isTouchDevice) {
        tile.ontouchend = handleTileClick;
    }
    
    return tile;
}

const createTiles = quantity => {
    Array.from(Array(quantity)).map((tile, index) => {
        wrapper.appendChild(createTile(index));
    })
}

const createGrid = () => {
    wrapper.innerHTML = "";

    // Adjust tile size for mobile
    const tileSize = window.innerWidth < 768 ? 30 : 50;
    columns = Math.floor(document.body.clientWidth / tileSize);
    rows = Math.floor(document.body.clientHeight / tileSize);

    wrapper.style.setProperty("--columns", columns);
    wrapper.style.setProperty("--rows", rows);

    createTiles(columns * rows);
}

createGrid();

window.onresize = () => createGrid();

// Prevent default touch behaviors that might interfere
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('#image-track') || e.target.closest('#tiles')) {
        e.preventDefault();
    }
}, { passive: false });