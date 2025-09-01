const card = document.querySelector(".card");
const cardContainer = document.querySelector(".card-container");
let startX = 0;
let endX = 0;
let isFlipped = false; // keep track of state

// --- Flip on click (fallback) ---
card.addEventListener("click", () => {
  isFlipped = !isFlipped;
  updateFlip();
});

// --- Swipe Detection on the whole page --- //
// Touch (mobile)
document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

// Mouse (desktop)
document.addEventListener("mousedown", (e) => {
  startX = e.clientX;
});

document.addEventListener("mouseup", (e) => {
  endX = e.clientX;
  handleSwipe();
});

function handleSwipe() {
  let diffX = endX - startX;

  if (Math.abs(diffX) > 50) { // threshold
    if (diffX > 0) {
      // Swiped Right → Flip to front
      isFlipped = false;
    } else {
      // Swiped Left → Flip to back
      isFlipped = true;
    }
    updateFlip();
  }
}

function updateFlip() {
  if (isFlipped) {
    card.classList.add("is-flipped");
  } else {
    card.classList.remove("is-flipped");
  }
}

// --- Entrance animation ---
window.addEventListener("load", () => {
  gsap.from(".card-container", {
    y: 80,
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: "back.out(1.7)"
  });

  requestMotionPermission(); // ask for motion sensor access
});

// --- VanillaTilt setup ---

// --- Request device motion permission (needed for iOS & some Android) ---
function requestMotionPermission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          console.log("Motion permission granted (iOS).");
        }
      })
      .catch(console.error);
  } else {
    // Android Chrome: must be enabled in Site Settings → Motion Sensors
    console.log("If tilt doesn't work, enable Motion Sensors in Chrome site settings.");
  }
}

// --- VanillaTilt setup ---
function initTilt() {
  // Destroy if already exists
  if (cardContainer.vanillaTilt) {
    cardContainer.vanillaTilt.destroy();
  }

  VanillaTilt.init(cardContainer, {
    max: 15,
    speed: 400,
    glare: true,
    gyroscope: false, // disable built-in gyroscope (unreliable on Samsung/Chrome)
  });

  // If in portrait, swap tilt axes
  if (window.matchMedia("(max-width: 600px) and (orientation: portrait)").matches) {
    const vt = cardContainer.vanillaTilt;

    // Override updateTransform to swap X and Y
    const originalUpdate = vt.updateTransform.bind(vt);
    vt.updateTransform = function() {
      const oldX = this.tiltX;
      this.tiltX = this.tiltY;
      this.tiltY = -oldX;
      originalUpdate();
    };
  }

  // --- Custom gyroscope handling ---
  window.addEventListener("deviceorientation", (event) => {
    const vt = cardContainer.vanillaTilt;
    if (!vt) return;

    // event.gamma = left/right, event.beta = front/back
    let gamma = event.gamma || 0; 
    let beta = event.beta || 0;

    // normalize values (-90 to 90) into VanillaTilt range
    vt.tiltX = (gamma / 15) * vt.settings.max; // left/right
    vt.tiltY = (beta / 15) * vt.settings.max;  // up/down

    vt.updateTransform();
  }, true);
}


// Run once on load
initTilt();

// Run again whenever window resizes or rotates
window.addEventListener("resize", initTilt);
window.addEventListener("orientationchange", initTilt);
