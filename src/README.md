# recommend-rumney

> A recommendation engine predicting Rumney routes you might enjoy. [Try it out.](https://zebengberg.github.io/recommend-rumney)

## Algorithm

We take a [collaborative filtering](https://en.wikipedia.org/wiki/Collaborative_filtering) approach using [data](#data) from Mountain Project.

### Collaborative filtering

Why collaborative filtering? routes <---> users duality.

#### Item-based

we implement slope 1, and store the results in json

#### User-based

network of users, nearest neighbors

### Content-based filtering

 Why not content-based filtering? Future work! Make a hybrid model.
 For each route, we have:

- grade
- written description
- popularity
- comments

From written description and comments, we can extract certain keywords.

## Data

Mountain Project is a website that organizes user-generated content into a rock climbing guidebook. Mountain Project serves as a repository of information across varying scales (areas, cliffs, routes, moves) within the climbing ecosystem. In this project, we focus on climbs occurring at the route-level. Mountain project users have ability to:

- post descriptions and grades for undocumented routes
- comment on existing routes
- give star ratings to exiting routes
- record "ticks" for routes

Mountain Project servers provide user-generated data through dynamically generated webpages. In particular, each distinct climbing route is accompanied with its own webpage containing nearly all of the user-generated data associated to the route. Mountain Project also provides an [API](https://www.mountainproject.com/data) for requesting batch json data. Unfortunately, the Mountain Project API only aggregates user data into summary statistics (such as average star rating) for a given route. Because the Mountain Project webpage for each route contains significantly more data than their API provides. I built a simple scraper to request and parse the HTML files for the roughly 600 routes contained in the Rumney area. Specifically, I used Python's `requests` and `lxml` packages to extract key data from the HTML tree for each route.

## Code

### Backend

### React subtleties


Built with `create-react-app` and `React Bootstrap`.

CRA stuff
markdown
loading button

### Source

The source can be found on [github](https://github.com/zebengberg/recommend-rumney).

### License

MIT
