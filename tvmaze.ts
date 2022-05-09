import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const $showEpisodes = $(".Show-getEpisodes");

const API_BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG = "https://tinyurl.com/tv-missing";

interface showInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface Episode {
  id: number;
  name: string;
  season: string;
  number: string;
}

// interface showImage {
//   url : string;
// }

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<showInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const resp = await axios.get(`${API_BASE_URL}/search/shows?q=${term}`);

  const shows = resp.data.map((s: any) => {
    const show = {
      id: s.show.id,
      name: s.show.name,
      summary: s.show.summary,
      image: s.show.image.original || DEFAULT_IMG,
    } as showInterface;
    return show;
  });

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: showInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="episodesBtn btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  console.log(typeof term);
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  const result = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = result.data.map((e: any) => {
    const episode = {
      id: e.id,
      name: e.name,
      season: e.season,
      number: e.number
    } as Episode;

    return episode;
  });
  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Episode[]) {
  $episodesList.empty();
  $episodesArea.show();

  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id="${episode.id}">
        ${episode.name} (Season ${episode.season}, Episode ${episode.number})
       </li>
      `
    );

    $episodesList.append($episode);
  }
}

$showsList.on("click", ".episodesBtn", async function (evt) {

  const $showDiv = $(evt.target).closest(".Show")!;
  const showId = $showDiv.data("showId");
  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);

});
