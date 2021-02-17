'use strict';
const axios = require("axios");
const base_url = process.env.MOVIE_DB_BASE_URL;
const api_key = process.env.MOVIE_API_KEY;
const language = process.env.MOVIE_LANGUAGE;
const pages = process.env.MOVIE_DEFAULT_PAGES;

function getAvailableGenres() {
  return  axios.get(`${base_url}/genre/movie/list?api_key=${api_key}&language=${language}`).then((response) => {
            return response.data
        });
}

function getMoviesList(genreId){
  return  axios.get(`${base_url}/list/1?api_key=${api_key}`).then((response) => {
            return response.data.items.filter((item) => {
                return item.genre_ids.includes(genreId)
            });

        });
}

function getReviewsByMovie(movie){
    return axios.get((`${base_url}/movie/${movie.id}/reviews?api_key=${api_key}&language=${language}&page=${pages}`))
    .then(response => {
        return response.data.results.filter((author) => author.author_details.rating != null)
    })
    .then(reviews => {
        return {
            id: movie.id,
            title: movie.original_title,
            reviews: reviews
        }
    })
}

async function calculateRatingForMovies(reviewPromises) {
    let moviesRating = [];
    for await (let reviewsSet of reviewPromises) {
        let aggregatedScore = 0;
        reviewsSet.reviews.forEach(review => aggregatedScore += review.author_details.rating);
        let averageScore = aggregatedScore / reviewsSet.reviews.length;
        let finalRating = Number.isNaN(averageScore) ? "rating unavailable" : averageScore.toFixed(1);
        moviesRating.push({
            movie_id: reviewsSet.id,
            movie_title: reviewsSet.title,
            movie_rating: finalRating
        });
        }
    return moviesRating;
}

module.exports.getMoviesByGenre = async (event) => {
    try {
        const genreToVerify = event.pathParameters.genre;
        if(!(/^[A-Za-z]+$/.test(genreToVerify)))
        {
         var errorResponse =  
         {
            statusCode: 400,
            body: JSON.stringify("validation error genre must be a valid string")
         }
         return errorResponse;
        }

        const genres = await getAvailableGenres();
        const genreId = genres.genres.find(genere => genere.name === genreToVerify).id;
        const moviesList = await getMoviesList(genreId);

        let reviewPromises = [];
        
        moviesList.forEach(movie => {
            reviewPromises.push(
                getReviewsByMovie(movie)
            );
        });
        
        const moviesWithRating = await calculateRatingForMovies(reviewPromises);
        
        const moviesSortedByRating = moviesWithRating.sort((movie1, movie2) => movie2.movie_rating - movie1.movie_rating);
        
        return {
            statusCode: 200,
            body: JSON.stringify(moviesSortedByRating)
        };

    } catch (error) {
        console.log(error);
    }
};