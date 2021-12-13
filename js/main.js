const APP = {
  KEY: "883762e0241bf7da58c9cb6546739dea",
  baseURL: "https://api.themoviedb.org/3/",
  imgURL: "http://image.tmdb.org/t/p/w500",

  init: () => {
    // Change home url
    history.replaceState({}, '', '#') 

    // Fire function on popstate
    window.addEventListener("popstate", NAV.navigation) 

    // Listen for events from the search button.
    let search = document.getElementById("btnSearch");
    search.addEventListener("click", SEARCH.getInput);
    
    // Listen for click events on the H1
    let title = document.getElementById("pageTitle")
    title.style.cursor = "pointer";
    title.addEventListener("click", NAV.goHome)
  },
};

const SEARCH = {
  results: [],
  input: "",

  getInput: (ev) => {
    ev.preventDefault();
    
    SEARCH.input = document.getElementById("search").value;
    history.pushState({}, '', `#${SEARCH.input}`)
    document.title = `ActorSearch | ${SEARCH.input}`
    
    let input = location.hash
    SEARCH.doSearch(input)
  },

  // Our search function checks if something is in local storage or not. 
  // Also checks to see if the user input anything into the search bar.
  doSearch: (input) => {
    let key = STORAGE.BASE_KEY + input;

    if (key in localStorage) {
      ACTORS.actors = localStorage.getItem(key);
      ACTORS.displayActors(JSON.parse(ACTORS.actors));
    } else {
      if (!SEARCH.input) {
        alert("The search bar is empty!")
      }else if (location.hash == '#') {
        let homePage = document.getElementById("instructions");
        homePage.style.display = "none";
      } else {
        SEARCH.doFetch();
      }
 
    }
  },

  // This is the main data fetch function.
  doFetch() {
    let url = `${APP.baseURL}search/person?api_key=${APP.KEY}&query=${SEARCH.input}&language=en-US`;
    let loader = document.querySelector('.loader')
    loader.classList.add('active')

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
        loader.classList.remove("active")
      })
      .catch((err) => {
        alert(err.message);
        loader.classList.remove("active")
      });

  },

};

const ACTORS = {
  actors: [],
  sortedActors: [],

// Display Actors function that builds the cards for the searched actor name.
  displayActors: (actors) => {
    window.scrollTo(0,0)
    let homePage = document.getElementById("instructions");
    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack")

    homePage.style.display = "none";
    actorsPage.style.display = "block";
    mediaPage.style.display = "none";
    backButton.style.display = "none"

    // Listen for click on sort name tag
    let sortName = document.getElementById("sortName");
    sortName.addEventListener("click", ACTORS.sortName);
    
     // Listen for click on sort popularity tag
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
      cardDeckDiv.classList.add("flexSizing", "col")
      cardDeckDiv.style.cursor = "pointer";

      let cardDiv = document.createElement("div");
      cardDiv.className = "card";

      // Listen for click on actor cards
      cardDiv.addEventListener("click", MEDIA.setHistory);
      cardDiv.setAttribute("data-id", actor.id);

      let img = document.createElement("img");
      img.className = "card-img-top";

      // Check to see if API fetches image, if not we give a place holder.
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

  // Sort by name A-Z and Z-A, toggled.
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

  // Sort through popularity low - high and high to low, toggled.
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

  setHistory: (ev) => {
    let targetID = ev.target.closest('.card')
     actorID = targetID.getAttribute('data-id');
     console.log('set history')
   
    history.pushState({}, '', `${location.hash}/${actorID}`)
    MEDIA.displayMedia(actorID)
   
  },

  // This is the main function to build our media cards for the actor our user clicked on.
  displayMedia: (actorID) => {

    let key = STORAGE.BASE_KEY + SEARCH.input;
    let media = JSON.parse(localStorage.getItem(key));
    // console.log(NAV.actorID)

    // Hide Actors Page & Show Media Page
    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    actorsPage.style.display = "none";
    mediaPage.style.display = "block";

    // Show the Back button.
    let backButton = document.getElementById("btnBack");
    backButton.addEventListener("click", MEDIA.goBack);
    backButton.style.display = "block";

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

      if (actor.id == actorID || actor.id == NAV.actorID) {
        actor.known_for.forEach((media) => {

          h2Title = document.getElementById("mediaTitle")
          h2Title.innerHTML = `Top 3 Titles for ${actor.name}`
          document.title = `ActorSearch | ${actor.name}`

          let cardMediaDeckDiv = document.createElement("div");
          cardMediaDeckDiv.classList.add("col", "pb-2",  "flexSizing");

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

          // Display media type and make the first letter uppercase.
          let mediaType = document.createElement("p");
          mediaTypeContent = `${media.media_type}`
          mediaType.innerHTML = `Type: ${mediaTypeContent.charAt(0).toUpperCase()}${mediaTypeContent.slice(1)}`;

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

  // This function enables the back button to go back from the media page  to actors page.
  goBack: (ev) => {
    ev.preventDefault();

    // Commented code was used in A3 when History API was not implemented.
    //I have replaced it with window.history.back so it works with our URL.

    // let actorsPage = document.getElementById("actors");
    // let mediaPage = document.getElementById("media");
    // let backButton = document.getElementById("btnBack");

    // backButton.style.display = "none";
    // mediaPage.style.display = "none";
    // actorsPage.style.display = "block";
    window.history.back()
  },
};

// Sets our storage
const STORAGE = {
  BASE_KEY: "Tibet-Actors-Search-",

  setStorage: (input, results) => {
    let key = STORAGE.BASE_KEY + input;
    localStorage.setItem(key, JSON.stringify(results));
  },
};

const NAV = {
  actorID: '',
  navigation: () => {
      let input = location.hash.replace('#', '')

      if (!input) {

        document.getElementById("search").value = ''
        let homePage = document.getElementById('instructions')
        let actorsPage = document.getElementById('actors')
        let mediaPage = document.getElementById('media')

        actorsPage.style.display = 'none';
        mediaPage.style.display = 'none';
        homePage.style.display = 'block';

      } else {
        if (/\d/.test(input)) {

          NAV.actorID = input.split('/')[1]
          MEDIA.displayMedia(NAV.actorID)
          
        } else {
          SEARCH.input = input
          SEARCH.doSearch(input)
        }
      }
   

  },

  // This function enables the user to click the title and navigate back to the home/instructions page.
  goHome: (ev) => {
    ev.preventDefault()

    history.pushState({}, '', `#`)
    document.title = `ActorSearch | Home`

    let homePage = document.getElementById("instructions");
    let actorsPage = document.getElementById("actors");
    let mediaPage = document.getElementById("media");
    let backButton = document.getElementById("btnBack")

    homePage.style.display = "block";
    actorsPage.style.display = "none";
    mediaPage.style.display = "none";
    backButton.style.display = "none"

  }
};

//Start everything running
document.addEventListener("DOMContentLoaded", APP.init);
