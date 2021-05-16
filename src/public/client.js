// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
});

let slideImage = 0;
let store = Immutable.Map({
  rovers: ["Curiosity", "Opportunity", "Spirit"],
  selectedRover: undefined,
  roverDetails: undefined,
  roverImages: undefined,
  slideImage: 0,
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState) => {
  store = store.merge(newState);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  return `
        <header>
          <h1> Welcome to Mars Rovers Dashboard </h1>
        </header>
        <main>
        <div class='tabs'>
            ${getTabs(state)}
         </div>
         <div class='tabContent'>
           ${getSelectedRoverContent(state)}
           ${getSelectedRoverImages(state)}
         </div>
        </main>
        <footer></footer>
    `;
};

// ------------------------------------------------------  COMPONENTS
const handleOnTabPres = (tabName) => {
  updateStore(store, { selectedRover: tabName, roverImages: undefined });
  const selectedRover = store.get("selectedRover");
  let tabButtons = document.getElementsByClassName("tabButton");
  for (tabButton of tabButtons) {
    tabButton.className = tabButton.className.replace(" active", " ");
    if (selectedRover === tabButton.value) {
      tabButton.className += " active";
    }
  }
};

const getTabs = (state) => {
  const rovers = state.get("rovers");
  const selectedRover = state.get("selectedRover");
  return rovers
    .map((rover) => {
      if (selectedRover === rover) {
        return `<button class='tabButton active' onClick='handleOnTabPres("${rover}")' value="${rover}">${rover}</button>`;
      } else {
        return `<button class='tabButton' onClick='handleOnTabPres("${rover}")' value="${rover}">${rover}</button>`;
      }
    })
    .join("\n");
};

const getSelectedRoverContent = (state) => {
  const selectedRover = state.get("selectedRover");
  let roverDetails = state.get("roverDetails");
  roverDetails = roverDetails?.toJS();
  if (selectedRover && (!roverDetails || roverDetails.name !== selectedRover)) {
    getRoverDetails(selectedRover, state);
    return '<p class="message">Fetching data from MARS...</p>';
  } else if (roverDetails && roverDetails.name === selectedRover) {
    const keys = Object.keys(roverDetails);
    return keys
      .filter((key) => !["cameras", "id", "max_sol"].includes(key))
      .map(
        (key) =>
          `<p class="capitalize">${key.replace("_", " ").replace("max", "recent photo")}: ${
            roverDetails[key]
          }</p>`
      )
      .join("\n");
  } else {
    return "<p class='message'> Please select a Rover </p>";
  }
};

const getSelectedRoverImages = (state) => {
  const selectedRover = state.get("selectedRover");
  let roverDetails = state.get("roverDetails");
  let roverImages = state.get("roverImages");
  roverDetails = roverDetails?.toJS();
  roverImages = roverImages?.toJS();
  if (typeof roverDetails === "undefined") {
    return `<p></p>`;
  }
  if (roverDetails.name === selectedRover) {
    if (!roverImages) {
      getRoverPhotos(selectedRover, roverDetails.max_date, state);
      return '<p class="message">Fetching Images of MARS from MARS</p>';
    } else {
      return showImages(roverImages, state);
    }
  }
  return `<p></p>`;
};

const showImages = (images, state) => {
  let slideShowDom = '<div class="slideshow-container">';
  images.forEach((img, index) => {
    slideShowDom +=
      index === 0
        ? `<div class="mySlides fade show">`
        : `<div class="mySlides fade">`;
    slideShowDom += `<div class="numbertext">${index + 1} / ${
      images.length
    }</div>
        <img src="${img.img_src}" style="width:100%">
        </div>`;
  });
  slideShowDom += `
    <a class="prev" onClick="moveSlide('prev',${images.length})">&#10094;</a>
    <a class="next" onClick="moveSlide('next',${images.length})">&#10095;</a>
    </div>`;
  return slideShowDom;
};

// Slider helper
const moveSlide = (movement, imagesLength) => {
  const slides = document.getElementsByClassName("mySlides");
  slides[slideImage].style.display = "none";
  if (movement === "prev") {
    if (slideImage > 0) {
      slideImage--;
    } else {
      slideImage = imagesLength - 1;
    }
  } else if (movement === "next") {
    if (slideImage >= imagesLength - 1) {
      slideImage = 0;
    } else {
      slideImage++;
    }
  }
  slides[slideImage].style.display = "block";
};

// ------------------------------------------------------  API CALLS
const getRoverDetails = (rover, state) => {
  let details;
  fetch(`http://localhost:3000/${rover}`)
    .then((res) => {
      return res.clone().json();
    })
    .then((roverDetails) => {
      if (roverDetails.data) {
        updateStore(state, { roverDetails: roverDetails.data.rover });
      }
      details = roverDetails.data;
    })
    .catch((err) => console.error(err));
  return details;
};

const getRoverPhotos = async (rover, date, state) => {
  let photos;
  await fetch(`http://localhost:3000/${rover}/photos/${date}`)
    .then((res) => {
      return res.clone().json();
    })
    .then((roverPhotos) => {
      if (roverPhotos.data) {
        updateStore(state, { roverImages: roverPhotos.data.photos });
      }
      photos = roverPhotos.data.photos;
    })
    .catch((err) => console.error(err));
  return;
};
