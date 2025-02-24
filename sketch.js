/* - - MediaPipe Body tracking - - */

/*

Which tracking points can I use?
https://developers.google.com/static/mediapipe/images/solutions/pose_landmarks_index.png

We have a total of 33 points on the body:
(our points are mirrored, so left and right are switched)

0 = nose
12 = right shoulder
11 = left shoulder
26 = right knee
25 = left knee
32 = right foot
31 = left foot
20 = right hand
19 = left hand

Full documentation
https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index

What we do in this example:
- draw a few points
- connect them with lines
 
*/

/* - - Variables - - */

// webcam variables
let capture; // our webcam
let captureEvent; // callback when webcam is ready

// styling
let ellipseSize = 20; // size of the ellipses
let letterSize = 20; // size of the letter

// body tracking
let bodypix;
let segmentation;
const options = {
  outputStride: 16, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.4, // 0 - 1, defaults to 0.5
};

let synesthesia;

let theShader;
let shaderTexture;

let vid;

let img;

let angle = 0;

let rotationSpeed = 0.1;

function preload() {
  synesthesia = loadModel("assets/synesthesia.obj");
  theShader = loadShader("assets/texture.vert", "assets/texture.frag");
  img = loadImage("assets/galaxy.jpeg");
}

// function createHSBPalette() {
//   colorMode(HSB);
//   options.palette = bodypix.config.palette;
//   Object.keys(options.palette).forEach((part) => {
//     const h = floor(random(360));
//     const s = floor(random(100));
//     const b = floor(random(100));
//     const c = color(255, 140, 100);
//     options.palette[part].color = c;
//   });
// }

/* - - Setup - - */
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  captureWebcam(); // launch webcam
  // styling
  // noStroke();
  shaderTexture = createGraphics(100, 100, WEBGL);
  shaderTexture.noStroke();

  // // turn off the createGraphics layers stroke
  //
  bodypix = ml5.bodyPix(capture, options);

  // createHSBPalette();

  vid = createVideo(["assets/swarm.mp4"]);
  vid.loop();
  vid.hide();

  // initialize the createGraphics layers
}

/* - - Draw - - */
function draw() {
  background(0);

  /* WEBCAM */
  push();
  centerOurStuff(); // center the webcam
  scale(-1, 1); // mirror webcam
  image(
    capture,
    -0.5 * capture.scaledWidth,
    -0.5 * capture.scaledHeight,
    capture.scaledWidth,
    capture.scaledHeight
  ); // draw webcam
  // if (segmentation) {
  //   push();
  //   background(100, 100, 200);
  //   image(
  //     segmentation.personMask,
  //     -0.5 * capture.scaledWidth,
  //     -0.5 * capture.scaledHeight,
  //     capture.scaledWidth,
  //     capture.scaledHeight
  //   );
  //   pop();
  // }

  scale(-1, 1); // unset mirror
  pop();

  /* TRACKING */
  if (mediaPipe.landmarks[0]) {
    // is hand tracking ready?

    //console.log("we have a total of " + mediaPipe.landmarks[0].length + " points");

    // nose
    let noseX = map(
      mediaPipe.landmarks[0][0].x,
      1,
      0,
      -0.5 * capture.scaledWidth,
      0.5 * capture.scaledWidth
    );
    let noseY = map(
      mediaPipe.landmarks[0][0].y,
      0,
      1,
      -0.5 * capture.scaledHeight,
      0.5 * capture.scaledHeight
    );

    // left shoulder
    let leftShoulderX = map(
      mediaPipe.landmarks[0][12].x,
      1,
      0,
      -0.5 * capture.scaledWidth,
      0.5 * capture.scaledWidth
    );
    let leftShoulderY = map(
      mediaPipe.landmarks[0][12].y,
      0,
      1,
      -0.5 * capture.scaledHeight,
      0.5 * capture.scaledHeight
    );

    // right shoulder
    let rightShoulderX = map(
      mediaPipe.landmarks[0][11].x,
      1,
      0,
      0,
      capture.scaledWidth
    );
    let rightShoulderY = map(
      mediaPipe.landmarks[0][11].y,
      0,
      1,
      0,
      capture.scaledHeight
    );

    // left hand
    let leftHandX = map(
      mediaPipe.landmarks[0][19].x,
      1,
      0,
      0,
      capture.scaledWidth
    );
    let leftHandY = map(
      mediaPipe.landmarks[0][19].y,
      0,
      1,
      0,
      capture.scaledHeight
    );

    // right hand
    let rightHandX = map(
      mediaPipe.landmarks[0][20].x,
      1,
      0,
      0,
      capture.scaledWidth
    );
    let rightHandY = map(
      mediaPipe.landmarks[0][20].y,
      0,
      1,
      0,
      capture.scaledHeight
    );

    let waistX = map(
      mediaPipe.landmarks[0][24].x,
      1,
      0,
      -0.5 * capture.scaledWidth,
      0.5 * capture.scaledWidth
    );
    let waistY = map(
      mediaPipe.landmarks[0][24].y,
      0,
      1,
      -0.5 * capture.scaledHeight,
      0.5 * capture.scaledHeight
    );

    push();
    centerOurStuff();

    // draw points
    fill("white");
    ellipse(noseX, noseY, ellipseSize, ellipseSize); // nose
    ellipse(leftShoulderX, leftShoulderY, ellipseSize, ellipseSize); // left shoulder
    ellipse(rightShoulderX, rightShoulderY, ellipseSize, ellipseSize); // right shoulder
    ellipse(leftHandX, leftHandY, ellipseSize, ellipseSize); // left hand
    ellipse(rightHandX, rightHandY, ellipseSize, ellipseSize); // right hand

    // draw labels
    // textSize(letterSize);
    // text("nose", noseX + 20, noseY); // nose
    // text("left shoulder", leftShoulderX + 20, leftShoulderY); // left shoulder
    // text("right shoulder", rightShoulderX + 20, rightShoulderY); // right shoulder
    // text("left hand", leftHandX + 20, leftHandY); // left hand
    // text("right hand", rightHandX + 20, rightHandY); // right hand
    angle += 0.01;
    angle = angle % 30;

    push();
    // normalMaterial();

    translate(leftShoulderX, leftShoulderY, 0);
    rotateX(PI);

    // shaderTexture.shader(theShader);
    // theShader.setUniform("resolution", [width, height]);
    // shaderTexture.rect(0, 0, width, height);
    // texture(shaderTexture);
    // // here we're using setUniform() to send our uniform values to the shader
    // theShader.setUniform("resolution", [width, height]);

    // // passing the shaderTexture layer geometry to render on
    // rotateZ(frameCount * 0.01);
    // rotateX(frameCount * 0.01);
    // rotateY(frameCount * 0.01);
    // texture(vid);
    ambientLight(255, 0, 255);
    // texture(img);
    normalMaterial();
    scale(5);
    model(synesthesia);

    pop();

    // push();
    // texture(img);

    // angle += rotationSpeed;

    // // Keep the angle within the range of 0 to 30 degrees
    // if (angle > 30 || angle < 0) {
    //   angle = constrain(angle, 0, 30);
    //   rotationSpeed *= -1;
    // }
    // rotateX(radians(angle));
    // plane(200, 200);
    // pop();
  }
}

/* - - Helper functions - - */

// function: launch webcam
function captureWebcam() {
  capture = createCapture(
    {
      audio: false,
      video: {
        facingMode: "user",
      },
    },
    function (e) {
      captureEvent = e;
      // console.log(captureEvent.getTracks()[0].getSettings());
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480
      capture.srcObject = e;
      setCameraDimensions(capture);
      mediaPipe.predictWebcam(capture);
      //mediaPipe.predictWebcam(parentDiv);
      bodypix.segmentWithParts(capture, options, gotResults);
    }
  );
  capture.elt.setAttribute("playsinline", "");
  capture.hide();
}

function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  bodypix.segmentWithParts(capture, options, gotResults);
  segmentation = result;
  console.log(segmentation);
}

// function: resize webcam depending on orientation
function setCameraDimensions(video) {
  const vidAspectRatio = video.width / video.height; // aspect ratio of the video
  const canvasAspectRatio = width / height; // aspect ratio of the canvas

  if (vidAspectRatio > canvasAspectRatio) {
    // Image is wider than canvas aspect ratio
    video.scaledHeight = height;
    video.scaledWidth = video.scaledHeight * vidAspectRatio;
  } else {
    // Image is taller than canvas aspect ratio
    video.scaledWidth = width;
    video.scaledHeight = video.scaledWidth / vidAspectRatio;
  }
}

// function: center our stuff
function centerOurStuff() {
  translate(
    width / 2 - capture.scaledWidth / 2,
    height / 2 - capture.scaledHeight / 2
  ); // center the webcam
}

// function: window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCameraDimensions(capture);
}
