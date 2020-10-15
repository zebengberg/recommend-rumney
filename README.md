# recommend-rumney

> A recommendation engine predicting Rumney routes you might enjoy. [Try it out.](https://zebengberg.github.io/recommend-rumney)

## Algorithm

We take a [collaborative filtering](https://en.wikipedia.org/wiki/Collaborative_filtering) approach using [data](#data) from Mountain Project.

Terminology: user, item, rating

### Collaborative filtering

Why collaborative filtering? routes <---> users duality.

#### Item-based

we implement slope 1, and store the results in json

#### User-based

network of users, nearest neighbors

### Content-based filtering

A content-based filtering algorithm considers _intrinsic_ properties of an item to measure similarity. The underlying idea of this approach is that a user prefers an item based on the properties it possess, and will therefore prefer other items with similar properties. In a content-based system, user ratings are unnecessary; indeed, only properties of the underlying item are relevant as opposed to users' perception of the item.

In addition to user ratings, each Mountain Project route also includes

- a grade
- a written description
- user contributed comments.

While the inclusion of user contributed comments may go against the spirit of a purely content-based system, we use them here as a way of detecting underlying properties of the route in question.

We approach route-similarity content-based filtering in two steps. First, for each Mountain Project route, we extract the description and comment text. We count instances of [handcrafted climbing keywords](backend/src/handcrafted_words.txt) within this text, thereby giving each route a set of inherent properties. To compare two routes, we can simply take a dot product between the vectors associated to these word counts. Second, we deem two routes to be similar if they have a close climbing grade. Finally, these two notions of similarity are aggregated to give a composite similarity score between routes.

The module [`content_based`](backend/src/content_based.py) implements this.

## Data

Mountain Project is a website that organizes user-generated content into a rock climbing guidebook. Mountain Project serves as a repository of information across varying scales (areas, cliffs, routes, moves) within the climbing ecosystem. In this project, we focus on climbs occurring at the route-level. Mountain project users have ability to:

- post descriptions and grades for undocumented routes
- comment on existing routes
- give star ratings to exiting routes
- record "ticks" for routes

Mountain Project servers provide user-generated data through dynamically generated webpages. In particular, each distinct climbing route is accompanied with its own webpage containing nearly all of the user-generated data associated to the route. Mountain Project also provides an [API](https://www.mountainproject.com/data) for requesting batch json data. Unfortunately, the Mountain Project API only aggregates user data into summary statistics (such as average star rating) for a given route. Because the Mountain Project webpage for each route contains significantly more data than their API provides. I built a simple scraper to request and parse the HTML files for the roughly 600 routes contained in the Rumney area. Specifically, I used Python's `requests` and `lxml` packages to extract key data from the HTML tree for each route.

## Code

### Backend

A number of [python modules](backend/src) scrape, extract, and process data from Mountain Project. The processed data is stored is json format, which in turn is accessed by the react web app. Gathering the data from scratch requires running two python files.

```sh
python scrape_rumney_routes.py
python build_json_assets.py
```

surprise?

### React

Built with `create-react-app` and `React Bootstrap`.

The most challenging part of the react development process was implementing a loading button to be rendered to the user while recommendations were computed. If this project included a dynamic web-server component, the recommendation calculation would likely occur server-side, and an `async`-`await` pattern could be used to retrieve the result. Instead, this web app is static and all computation (apart from the initial python processing) is done inside the browser.

## License

MIT
