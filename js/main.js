//app is for general control over the application
//and connections between the other components
const APP = {
  KEY: "883762e0241bf7da58c9cb6546739dea",
  baseURL: "https://api.themoviedb.org/3/",
  imgURL: "http://image.tmdb.org/t/p/w500",

  init: () => {
    //this function runs when the page loads
    let search = document.getElementById("btnSearch");
    search.addEventListener("click", SEARCH.doSearch);
  },
};

//search is for anything to do with the fetch api
const SEARCH = {
  results: [],
  input: "",

  doSearch: (ev) => {
    ev.preventDefault();

    SEARCH.input = document.getElementById("search").value;
    let key = STORAGE.BASE_KEY + SEARCH.input;

    if (key in localStorage) {
      ACTORS.actors = localStorage.getItem(key);
      ACTORS.displayActors(JSON.parse(ACTORS.actors));
    } else {
      SEARCH.doFetch();
    }
  },

  doFetch() {
    let url = `${APP.baseURL}search/person?api_key=${APP.KEY}&query=${SEARCH.input}&language=en-US`;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Error: ${response.status_code} ${response.status_message}`
          );
        }
      })
      .then((data) => {
        SEARCH.results = data.results;
        STORAGE.setStorage(SEARCH.input, data.results);
        ACTORS.displayActors(data.results);
      })
      .catch((err) => {
        alert(err.message);
      });
  },
};

//actors is for changes connected to content in the actors section
const ACTORS = {
  actors: [],

  displayActors: (actors) => {
    let homePage = document.getElementById("instructions");
    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");

    homePage.style.display = "none";
    actorsPage.style.display = "block";
    mediaPage.style.display = "none";

    let df = document.createDocumentFragment();

    let cardRowDiv = document.createElement("div");
    cardRowDiv.classList.add(
      "row",
      "row-cols-1",
      "row-cols-md-3",
      "row-cols-lg-4",
      "g4",
      "rowDiv"
    );

    actors.forEach((actor) => {
      let cardDeckDiv = document.createElement("div");
      cardDeckDiv.className = "col";
      cardDeckDiv.style.cursor = "pointer";

      let cardDiv = document.createElement("div");
      cardDiv.className = "card";

      cardDiv.addEventListener("click", MEDIA.displayMedia);
      cardDiv.setAttribute("data-id", actor.id);

      // Use this to go to local storage then use for media targeting, display what they are known_for.

      let img = document.createElement("img");
      img.className = "card-img-top";

      if (actor.profile_path) img.src = APP.imgURL + actor.profile_path;
      else img.src = "https://via.placeholder.com/500x750?text=IMAGE+NOT+FOUND";
      
      img.alt = actor.name;

      let bodyDiv = document.createElement("div");
      bodyDiv.className = "card-body";

      let h5 = document.createElement("h5");
      h5.className = "card-title";
      h5.innerHTML = actor.name;

      let pPopularity = document.createElement("p");
      pPopularity.className = "card-text";
      pPopularity.innerHTML = `Popularity: ${actor.popularity}`;

      let pKnownFor = document.createElement("p");
      pKnownFor.className = "card-text";
      pKnownFor.innerHTML = `Known for: ${actor.known_for_department}`;

      bodyDiv.append(h5, pPopularity, pKnownFor);
      cardDiv.append(img, bodyDiv);
      cardDeckDiv.append(cardDiv);
      df.append(cardDeckDiv);
    });
    cardRowDiv.append(df);

    let actorDiv = document.getElementById("actorsCardContent");
    actorDiv.innerHTML = "";
    actorDiv.append(cardRowDiv);
  },
};

//media is for changes connected to content in the media section
// figure out the target clicked
// Get ID of clicked
// search through the key
//element.closest
const MEDIA = {
  movies: [],

  displayMedia: (ev) => {
    let actorTarget = ev.target.closest(".card");
    let actorID = actorTarget.getAttribute("data-id");

    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");

    actorsPage.style.display = "none";
    mediaPage.style.display = "block";

    let backButton = document.getElementById("btnBack")
    backButton.addEventListener("click", MEDIA.goBack)
    backButton.style.display = "block"

    let key = STORAGE.BASE_KEY + SEARCH.input;
  
    let media = JSON.parse(localStorage.getItem(key));


    let mediaDF = document.createDocumentFragment();

    let mediaCardRowDiv = document.createElement("div");
    mediaCardRowDiv.classList.add(
      "row",
      "row-cols-1",
      "row-cols-md-8",
      'row-cols-lg-4',
      "rowDiv"
      
    );

    media.forEach((actor) => {
      if (actor.id == actorID) {
        actor.known_for.forEach((media) => {
          console.log(media);

          let cardMediaDeckDiv = document.createElement("div");
          cardMediaDeckDiv.classList.add("col", "pb-2")

          let mediaCardDiv = document.createElement("div");
          mediaCardDiv.className = "card";

          let mediaIMG = document.createElement("img");
          mediaIMG.className = "card-img-top";
          mediaIMG.src = APP.imgURL + media.poster_path;
          mediaIMG.alt = media.title + " poster.";

          let mediaBodyDiv = document.createElement("div");
          mediaBodyDiv.className = "card-body";

          let mediaTitle = document.createElement("h5");
          mediaTitle.className = "card-title";
          if (media.media_type === "tv") {
            mediaTitle.innerHTML = media.name;
          } else {
            mediaTitle.innerHTML = media.original_title;
          }

          let mediaDate = document.createElement("p");
          if (media.media_type === "movie") {
          mediaDate.innerHTML = `Released: ${media.release_date}`;
        }

          let mediaType = document.createElement("p");
          mediaType.innerHTML = `Type: ${media.media_type}`;

          let mediaVote = document.createElement("p")
          mediaVote.innerHTML = `Rating: ${media.vote_average}`

          // let mediaDescription = document.createElement("p");
          // mediaDescription.innerHTML = media.overview;

          mediaBodyDiv.append(
            mediaTitle,
            mediaDate,
            mediaType,
            mediaVote
          );
          mediaCardDiv.append(mediaIMG, mediaBodyDiv);
          cardMediaDeckDiv.append(mediaCardDiv);
          mediaDF.append(cardMediaDeckDiv);
        });
      }
    });

    mediaCardRowDiv.append(mediaDF);
    let mediaDiv = document.getElementById("mediaCardContent");
    mediaDiv.innerHTML = "";
    mediaDiv.append(mediaCardRowDiv);
  },

  goBack: (ev) => {
    ev.preventDefault()

    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack")

    backButton.style.display = "none"

    mediaPage.style.display = "none";
    actorsPage.style.display = "block";
  }
};

//storage is for working with localStorage
const STORAGE = {
  //  this will be used in Assign 4
  BASE_KEY: "Tibet-Actors-Search-",

  setStorage: (input, results) => {
    let key = STORAGE.BASE_KEY + input;
    localStorage.setItem(key, JSON.stringify(results));
  },
};

//nav is for anything connected to the history api and location
const NAV = {
  //this will be used in Assign 4
};

//Start everything running

document.addEventListener("DOMContentLoaded", APP.init);
