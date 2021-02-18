## Description

 - This is a simple serverless backend service with node js using the movie database api - https://developers.themoviedb.org/
 - The service basically does the following,
 - fetches all the available genres
 - fetch the movies for the requested genre
 - for each movie fetch the reviews by different authors
 - calcualte the average review rating for each movie
 - display the list of movies sorted by rating

## Setup

Run this command to install node package manager.

npm install

## To run the code 

serverless offline 

serverless offline to access the end point 
- http://localhost:3000/dev/movies/{genre} 
- params - {genre} - values could be one among the below mentioned values
- ["Comedy", "Action", "War" ]

## To run the test 

sls invoke test
