class Glitch {
  constructor() {
    const headerBanner = document.querySelector(".header-banner");
    const imgLink = headerBanner.dataset.glitchImage;
    const canvas = headerBanner.querySelector(".pixi");
    const fitMode = headerBanner.dataset.glitchFit || "cover";
    this.intensity = headerBanner.dataset.glitchIntensity || 'medium'; // low, high

    // Make canvas responsive
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Create PIXI application with debug options
    this.app = new PIXI.Application({
      view: canvas,
      resizeTo: window,
      transparent: true,
      backgroundColor: 0x000000, // Temporary black background for debugging
      antialias: true,
      autoDensity: true
    });

    console.log("PIXI Application created"); // Debug log

    // Create container for the image
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    // Create loading text
    const loadingText = new PIXI.Text("Loading image...", {
      fill: 0xffffff,
      fontSize: 24
    });
    loadingText.anchor.set(0.5);
    loadingText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );
    this.container.addChild(loadingText);

    console.log("Loading image from:", imgLink); // Debug log

    // Load the image
    this.loadImage(imgLink)
      .then(() => {
        console.log("Image loaded successfully"); // Debug log
        this.container.removeChild(loadingText);
        this.setupFilters();
        this.setupResponsiveImage(fitMode);
        this.animate();
      })
      .catch((error) => {
        console.error("Image loading failed:", error); // Debug log
        loadingText.text = "Loading failed! Check console";
      });

    // Add resize listener
    window.addEventListener("resize", () => {
      if (this.originalWidth) {
        this.setupResponsiveImage(fitMode);
      }
    });
  }

  async loadImage(imgLink) {
    return new Promise((resolve, reject) => {
      // Use PIXI.Loader for more reliable loading
      const loader = new PIXI.Loader();
      loader.add("glitchImage", imgLink);

      loader.load((loader, resources) => {
        if (!resources.glitchImage.texture) {
          reject(new Error("Texture not loaded"));
          return;
        }

        this.img = new PIXI.Sprite(resources.glitchImage.texture);
        this.container.addChild(this.img);

        this.originalWidth = this.img.texture.orig.width;
        this.originalHeight = this.img.texture.orig.height;

        console.log(
          "Image dimensions:",
          this.originalWidth,
          this.originalHeight
        ); // Debug log
        resolve();
      });

      loader.onError.add((error) => {
        reject(error);
      });
    });
  }

  setupFilters() {
    console.log("Setting up filters"); // Debug log
    // Define intensity presets
    const intensitySettings = {
      low: {
        rgbOffset: 5,
        slices: 5,
        offset: 10,
        speed: 0.8
      },
      medium: {
        rgbOffset: 10,
        slices: 10,
        offset: 20,
        speed: 1.2
      },
      high: {
        rgbOffset: 15,
        slices: 15,
        offset: 30,
        speed: 1.5
      }
    };

    // Get settings for current intensity (default to medium)
    const settings =
      intensitySettings[this.intensity] || intensitySettings.medium;
    this.img.filters = [
      new PIXI.filters.RGBSplitFilter(),
      new PIXI.filters.GlitchFilter({
        slices: settings.slices,
        offset: settings.offset
      })
    ];
    this.rgbFilter = this.img.filters[0];
    this.glitchFilter = this.img.filters[1];

    // Also modify the animation speed based on intensity
    this.animationSpeed = settings.speed;

    this.resetFilters();
  }

  setupResponsiveImage(fit = fitMode) {
    const { width: w, height: h } = this.app.screen;
    console.log("Resizing to:", w, h); // Debug log

    const scale =
      fit === "cover"
        ? Math.max(w / this.originalWidth, h / this.originalHeight)
        : fit === "contain"
          ? Math.min(w / this.originalWidth, h / this.originalHeight)
          : 1;

    this.img.scale.set(scale);
    this.img.position.set(w / 2, h / 2);
    this.img.anchor.set(0.5);
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  resetFilters() {
    this.rgbFilter.red = [0, 0];
    this.rgbFilter.green = [0, 0];
    this.rgbFilter.blue = [0, 0];
    this.glitchFilter.slices = 0;
    this.glitchFilter.offset = 20;
    this.glitchFilter.direction = 0;
  }

  createGlitchSequence() {
    const tl = gsap.timeline();

    // Use this.rgbOffset from settings
    tl.to(this.rgbFilter, {
      duration: 0.1,
      red: [
        this.randomInRange(-this.rgbOffset, this.rgbOffset),
        this.randomInRange(-this.rgbOffset, this.rgbOffset)
      ],
      ease: "power1.inOut"
    });

    tl.to(this.rgbFilter, {
      duration: 0.05,
      red: [0, 0]
    });

    tl.to(
      this.rgbFilter,
      {
        duration: 0.15,
        blue: [this.randomInRange(-15, 15), 0],
        onStart: () => {
          this.glitchFilter.slices = 20;
          this.glitchFilter.direction = this.randomInRange(-75, 75);
        },
        ease: "power1.inOut"
      },
      "-=0.1"
    );

    tl.to(this.rgbFilter, {
      duration: 0.1,
      blue: [this.randomInRange(-15, 15), this.randomInRange(-5, 5)],
      onStart: () => {
        this.glitchFilter.slices = 12;
        this.glitchFilter.direction = this.randomInRange(-75, 75);
      },
      ease: "power1.inOut"
    });

    tl.to(this.rgbFilter, {
      duration: 0.05,
      blue: [0, 0],
      onStart: () => {
        this.glitchFilter.slices = 0;
        this.glitchFilter.direction = 0;
      }
    });

    tl.to(
      this.rgbFilter,
      {
        duration: 0.15,
        green: [this.randomInRange(-15, 15), 0],
        ease: "power1.inOut"
      },
      "-=0.1"
    );

    tl.to(this.rgbFilter, {
      duration: 0.1,
      green: [this.randomInRange(-20, 20), this.randomInRange(-15, 15)],
      ease: "power1.inOut"
    });

    tl.to(this.rgbFilter, {
      duration: 0.05,
      green: [0, 0]
    });

    // Apply the speed modifier
    tl.timeScale(this.animationSpeed);
    return tl;
  }

  animate() {
    const sequence = this.createGlitchSequence();
    sequence.eventCallback("onComplete", () => {
      gsap.delayedCall(this.randomInRange(0, 1), this.animate.bind(this));
    });
  }
}

// Initialize with error checking
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded"); // Debug log

  if (!window.PIXI) {
    console.error("PIXI.js is not loaded!");
    document.body.innerHTML =
      '<h1 style="color:red">Error: PIXI.js not loaded!</h1>';
    return;
  }

  if (!window.gsap) {
    console.error("GSAP is not loaded!");
    document.body.innerHTML =
      '<h1 style="color:red">Error: GSAP not loaded!</h1>';
    return;
  }

  console.log("Creating Glitch instance"); // Debug log
  new Glitch();
});
// Ensure PIXI and GSAP are loaded before running the script
if (typeof PIXI === "undefined" || typeof gsap === "undefined") {
  console.error("Required libraries (PIXI or GSAP) are not loaded.");
}