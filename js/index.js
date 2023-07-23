function blurButton() {
  document.getElementById("record-button").addEventListener("click", () => {
    setTimeout(() => {
      document.getElementById("record-button").blur();
    }, 400);
  });
}

// JavaScript to load and display the placeholder images
async function loadImages() {
  const response = await fetch("/images");
  const imagePaths = (await response.json()).sort(() => Math.random() - 0.5);
  const container = document.getElementById("photostream-container");
  container.classList.add("primary");

  for (const imagePath of imagePaths) {
    const img = document.createElement("img");
    img.src = imagePath;
    img.classList.add("photo");
    container.appendChild(img);
  }

  const containerSecondary = container.cloneNode(true);
  containerSecondary.classList.add("secondary");
  document.getElementById("right").appendChild(containerSecondary);

  document.body.style.setProperty("--yValuePos", `${imagePaths.length * 35}%`);
  document.body.style.setProperty("--yValueNeg", `-${imagePaths.length * 35}%`);
  document.body.style.setProperty("--duration", `${imagePaths.length * 2}s`);
}

function setup() {
  blurButton();
  loadImages();
}

setup();
