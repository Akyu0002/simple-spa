const APP = {
  KEY: "883762e0241bf7da58c9cb6546739dea",
  baseURL: "https://api.themoviedb.org/3/",
  imgURL: "http://image.tmdb.org/t/p/w500",

  init: () => {
    let search = document.getElementById("btnSearch");
    search.addEventListener("click", SEARCH.doSearch);

    window.addEventListener("popstate", NAV.navigate)

    NAV.homeURL()
    
  },
};

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

const ACTORS = {
  actors: [],
  sortedActors: [],

  displayActors: (actors) => {
    let homePage = document.getElementById("instructions");
    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");

    homePage.style.display = "none";
    actorsPage.style.display = "block";
    mediaPage.style.display = "none";

    NAV.actorURL()

    let sortName = document.getElementById("sortName");
    sortName.addEventListener("click", ACTORS.sortName);
    
    let sortPopularity = document.getElementById("sortPopularity");
    sortPopularity.addEventListener("click", ACTORS.sortPopularity);

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

      img.alt = `${actor.name}'s Profile Picture`;

      let bodyDiv = document.createElement("div");
      bodyDiv.className = "card-body";

      let h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.innerHTML = actor.name;

      let pPopularity = document.createElement("p");
      pPopularity.className = "card-text";
      pPopularity.innerHTML = `Popularity: ${actor.popularity}`;

      let pKnownFor = document.createElement("p");
      pKnownFor.className = "card-text";
      pKnownFor.innerHTML = `Known for: ${actor.known_for_department}`;

      bodyDiv.append(h3, pPopularity, pKnownFor);
      cardDiv.append(img, bodyDiv);
      cardDeckDiv.append(cardDiv);
      df.append(cardDeckDiv);
    });
    cardRowDiv.append(df);

    let actorDiv = document.getElementById("actorsCardContent");
    actorDiv.innerHTML = "";
    actorDiv.append(cardRowDiv);
  },

  sortName: (ev) => {
    let descend = document.getElementById("nameDescend");
    let ascend = document.getElementById("nameAscend");
    popDescend.classList.remove('active');
    popAscend.classList.remove('active');

    let key = STORAGE.BASE_KEY + SEARCH.input;
    let data = JSON.parse(localStorage.getItem(key));
    let dataCopy = [...data];

    let p = document.getElementById("sortName");
    p.classList.toggle("sort");

    let newData = dataCopy.sort((a, b) => {
      let personA = a.name;
      let personB = b.name;

      if (p.classList.contains("sort")) {
        ascend.classList.add("active");
        descend.classList.remove('active')
        if (personA > personB) {
          return 1;
        }
        if (personA < personB) {
          return -1;
        }
        return 0;
      } else {
        descend.classList.add("active");
        ascend.classList.remove('active')
        if (personA < personB) {
          return 1;
        }
        if (personA > personB) {
          return -1;
        }
        return 0;
      }
    });
    ACTORS.sortedActors = newData;
    ACTORS.displayActors(ACTORS.sortedActors);
  },

  sortPopularity: (ev) => {
    nameAscend.classList.remove('active');
    nameDescend.classList.remove('active');

    let key = STORAGE.BASE_KEY + SEARCH.input;
    let data = JSON.parse(localStorage.getItem(key));
    let dataCopy = [...data];

    let p = document.getElementById("sortPopularity");
    p.classList.toggle("sort");

    let popData = dataCopy.sort((a, b) => {
      let personA = a.popularity;
      let personB = b.popularity;
      if (p.classList.contains("sort")) {
        popAscend.classList.remove("active");
        popDescend.classList.add('active')
        if (personA > personB) {
          return 1;
        }
        if (personA < personB) {
          return -1;
        }
        return 0;
      } else {
        popDescend.classList.remove("active");
        popAscend.classList.add('active')
        if (personA < personB) {
          return 1;
        }
        if (personA > personB) {
          return -1;
        }
        return 0;
      }
    });
    ACTORS.sortedActors = popData;
    ACTORS.displayActors(ACTORS.sortedActors);
  },
};

const MEDIA = {
  movies: [],
  actorID: null,

  displayMedia: (ev) => {
    let actorTarget = ev.target.closest(".card");
    MEDIA.actorID = actorTarget.getAttribute("data-id");

    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");

    actorsPage.style.display = "none";
    mediaPage.style.display = "block";

    let backButton = document.getElementById("btnBack");
    backButton.addEventListener("click", MEDIA.goBack);
    backButton.style.display = "block";

    let key = STORAGE.BASE_KEY + SEARCH.input;

    let media = JSON.parse(localStorage.getItem(key));

    NAV.mediaURL() // Set location hash

    let mediaDF = document.createDocumentFragment();

    let mediaCardRowDiv = document.createElement("div");
    mediaCardRowDiv.classList.add(
      "row",
      "row-cols-1",
      "row-cols-md-8",
      "row-cols-lg-4",
      "rowDiv"
    );

    media.forEach((actor) => {
      if (actor.id == MEDIA.actorID) {
        actor.known_for.forEach((media) => {

          let cardMediaDeckDiv = document.createElement("div");
          cardMediaDeckDiv.classList.add("col", "pb-2");

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

          let mediaVote = document.createElement("p");
          mediaVote.innerHTML = `Rating: ${media.vote_average}`;

          mediaBodyDiv.append(mediaTitle, mediaDate, mediaType, mediaVote);
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
    ev.preventDefault();

    location.hash = `${SEARCH.input}`;

    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack");

    backButton.style.display = "none";
    mediaPage.style.display = "none";
    actorsPage.style.display = "block";
  },
};

const STORAGE = {
  BASE_KEY: "Tibet-Actors-Search-",

  setStorage: (input, results) => {
    let key = STORAGE.BASE_KEY + input;
    localStorage.setItem(key, JSON.stringify(results));
  },
};

const NAV = {
  locationHash: '',

  homeURL: () => {
    NAV.locationHash =  location.hash = `#`;
    document.title = `ActorSearchDB | Home`
  },

  actorURL: () => {
    NAV.locationHash = location.hash = `${SEARCH.input}`;
    document.title = `ActorSearchDB | ${NAV.locationHash}`
  },

  mediaURL: () => {
    NAV.locationHash =  location.hash = SEARCH.input + "/" + MEDIA.actorID;
    document.title = `ActorSearchDB | ${NAV.locationHash} / ${MEDIA.actorID}`
  },

  navigate: () => {
// console.log(location.href)
// console.log(history)
  }
};

//Start everything running
document.addEventListener("DOMContentLoaded", APP.init);
