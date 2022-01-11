"use strict";
window.onload = init;

function init(){

    // local storage
    const animeOpt = document.querySelector("#anime");
    const dayOpt = document.querySelector("#day");
    const genreOpt = document.querySelector("#genre");
    const prefix = "anf7503-";
    const animeKey = prefix + "anime";
    const dayKey = prefix + "day";
    const genreKey = prefix + "genre";

    const storedAnime = localStorage.getItem(animeKey);
    const storedDay = localStorage.getItem(dayKey);
    const storedGenre = localStorage.getItem(genreKey);

    if (storedAnime){
        animeOpt.value = storedAnime;
    }

    if (storedDay){
        dayOpt.querySelector(`option[value='${storedDay}']`).selected = true;
    }

    if (storedGenre){
        genreOpt.querySelector(`option[value='${storedGenre}']`).selected = true;
    }

    animeOpt.onchange = e=>{ localStorage.setItem(animeKey, e.target.value); };
    dayOpt.onchange = e=>{ localStorage.setItem(dayKey, e.target.value); };
    genreOpt.onchange = e=>{ localStorage.setItem(genreKey, e.target.value); };


    document.querySelector("#animeName").onclick = getNameData;
    document.querySelector("#animeDay").onclick = getDayData;
    document.querySelector("#animeGenre").onclick = getGenreData;
}

let term = ""; // we declared `term` out here because we will need it later
let anime = false;
let day = false;
let genre = false;

function getNameData(){

    // 0 - visual feedback
    document.querySelector("#content").innerHTML = "<p><i>Searching...</i></p>"
    
    // 1 - main entry point to web service
    const SERVICE_URL = "https://api.jikan.moe/v3/";
    
    // No API Key required!

    // 1.5 set anime to true
    anime = true;
    day = false;
    genre = false;
    
    // 2 - build up our URL string
    let url = SERVICE_URL;    
    
    // 3 - parse the user entered term we wish to search
    term = document.querySelector("#anime").value;
    
    // get rid of any leading and trailing spaces
    term = term.trim();
    // encode spaces and special characters
    term = encodeURIComponent(term);
    
    // if there's no term to search then bail out of the function (return does this)
    if(term.length < 1){
        return;
    }

    // update the url
    url += "search/anime?q=" + term + "&page=1";

    // 4 - update the UI
    // Don't need this anymore
    // document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;
    
    // 5 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 6 - set the onload handler
    xhr.onload = dataLoaded;

    // 7 - set the onerror handler
    xhr.onerror = dataError;

    // 8 - open connection and send the request
    xhr.open("GET",url);
    xhr.send();
}

function getDayData(){

    // 0 - visual feedback
    document.querySelector("#content").innerHTML = "<p><i>Searching...</i></p>"

    // 1 - main entry point to web service
    const SERVICE_URL = "https://api.jikan.moe/v3/";
    
    // No API Key required!

    // 1.5 set day to true
    anime = false;
    day = true;
    genre = false;
    
    // 2 - build up our URL string
    let url = SERVICE_URL;    
    
    // 3 - parse the user entered term we wish to search
    term = document.querySelector("#day").value;
    
    // get rid of any leading and trailing spaces
    term = term.trim();
    // encode spaces and special characters
    term = encodeURIComponent(term);
    
    // if there's no term to search then bail out of the function (return does this)
    if(term.length < 1){
        return;
    }

    // update the url
    url += "schedule/" + term;
    
    // 4 - update the UI
    // Don't need this anymore
    // document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;
    
    // 5 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 6 - set the onload handler
    xhr.onload = dataLoaded;

    // 7 - set the onerror handler
    xhr.onerror = dataError;

    // 8 - open connection and send the request
    xhr.open("GET",url);
    xhr.send();
}

function getGenreData(){

    // 0 - visual feedback
    document.querySelector("#content").innerHTML = "<p><i>Searching...</i></p>"

    // 1 - main entry point to web service
    const SERVICE_URL = "https://api.jikan.moe/v3/";

    // 1.5 - set genre true
    anime = false;
    day = false;
    genre = true;
    
    // No API Key required!
    
    // 2 - build up our URL string
    let url = SERVICE_URL;    
    
    // 3 - parse the user entered term we wish to search
    term = document.querySelector("#genre").value;
    
    // get rid of any leading and trailing spaces
    term = term.trim();
    // encode spaces and special characters
    term = encodeURIComponent(term);
    
    // if there's no term to search then bail out of the function (return does this)
    if(term.length < 1){
        return;
    }

    url += "genre/anime/" + term;

    // 4 - update the UI
    // Don't need this anymore
    // document.querySelector("#debug").innerHTML = `<b>Querying web service with:</b> <a href="${url}" target="_blank">${url}</a>`;
    
    // 5 - create a new XHR object
    let xhr = new XMLHttpRequest();

    // 6 - set the onload handler
    xhr.onload = dataLoaded;

    // 7 - set the onerror handler
    xhr.onerror = dataError;

    // 8 - open connection and send the request
    xhr.open("GET",url);
    xhr.send();
}

function dataError(e){
    console.log("An error occurred");
}

function dataLoaded(e){
    // 1 - e.target is the xhr object
    let xhr = e.target;

    // 2 - xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    // 3 - turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);
    
    // 4 - if there are no results, print a message and return
    if(obj.error){
        let msg = obj.error;
        document.querySelector("#content").innerHTML = `<p><i>Problem! <b>${msg}</b></i></p>`;
        return; // Bail out
    }

    // makes results here so it isn't a local object    
    let results;

    // 5 - if there is an array of results, loop through them
    // the process for searching by name
    if (anime)
    {
        results = obj["results"];
        if(!results){
            document.querySelector("#content").innerHTML = `<p><i>Problem! <b>No results for "${term}"</b> 
                                                            Please search for another term or try again at a later time.</i></p>`;
            return;
        }
    }

    // process for searching by day of the week
    else if (day)
    {
        results = obj[term];
        if(!results){
            document.querySelector("#content").innerHTML = `<p><i>Problem! <b>No results for "${term}"</b> Please try again at a later time.</i></p>`;
            return;
        }
    }

    // process for searching
    else if (genre)
    {
        results = obj["anime"];
        if(!results){
            let genreName = document.querySelector("#genre");
            document.querySelector("#content").innerHTML = `<p><i>Problem! <b>No results for "` + genreName + `" at the moment.</b> Please try again at a later time.</i></p>`;
            return;
        }
    }
    
    // 6 - put together HTML
    let bigString = `<p id='number'><i>Here are <b>${results.length}</b> results!</i></p>`; // ES6 String Templating
    
    for (let i=0;i<results.length;i++){
        let result = results[i];
        let url = result.url;
        let title = result.title;
        let image = result.image_url;
        let synopsis = result.synopsis;
        let line = `<div class='result'>
                        <header>
                            <a href='${url}'>${title}</a>
                        </header>
                        <main>
                            <img src=${image} alt="${title}">
                            <p id='syn'>${synopsis}</p>
                        </main>
                    </div>`;
        bigString += line;
    }
    
    // 7 - display final results to user
    document.querySelector("#content").innerHTML = bigString;
}	