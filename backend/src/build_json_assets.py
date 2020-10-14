"""Build json data after MP scrape. Each dataset is exported to the assets
folder. Exported filenames include an 'array' or 'object' tail to describe the
type of the outermost js container."""

import json
from collections import defaultdict
import pandas as pd
from tqdm import tqdm
from scrape_rumney_routes import DATA_PATH
from analyze_text import extract_climbing_words
from content_based import calculate_content_similarities


ROUTE_DATA_PATH = '../../src/assets/data/route_data_object.json'
USER_DATA_PATH = '../../src/assets/data/user_data_array.json'
USER_RATING_PATH = '../../src/assets/data/user_rating_object.json'
SLOPE_ONE_PATH = '../../src/assets/data/slope_one_object.json'
CONTENT_SIMILARITIES_PATH = '../../src/assets/data/content_similarities_object.json'


df = pd.read_csv(DATA_PATH)


def agg_route_data():
  """Calculate n_votes and avg_rating for each route."""
  grouped = df.groupby(by='route', as_index=True)
  stats = grouped.agg({'user': 'count', 'rating': 'mean'})
  stats = stats.rename(columns={'user': 'n_votes', 'rating': 'avg_rating'})
  return stats.to_dict(orient='index')


def build_route_data():
  """Export route data object to file."""
  print('Building route data ...')
  stats = agg_route_data()
  data = extract_climbing_words()

  # merging text data and stats
  for route in data:
    stat = stats[route]
    for key in stat:
      data[route][key] = stat[key]
    # deleting all text
    del data[route]['text']

  with open(ROUTE_DATA_PATH, 'w') as f:
    json.dump(data, f)


def build_user_data():
  """Export array of MP Rumney users to file."""
  print('Building user data ...')
  df_slice = df[['route', 'user']]
  grouped = df_slice.groupby(by='user', as_index=False)
  counts = grouped.count()
  counts = counts.rename(columns={'route': 'n_votes'})

  # sorting users by their number of votes
  counts = counts.sort_values(by='n_votes', ascending=False)
  counts.to_json(USER_DATA_PATH, orient='records')


def build_user_ratings_data():
  """Export MP Rumney user ratings to file."""
  print('Building user-rating data ...')
  grouped = df.groupby(by='user')
  d = {user: dict(zip(group['route'], group['rating']))
       for user, group in grouped}

  with open(USER_RATING_PATH, 'w') as f:
    json.dump(d, f)


def build_content_similarities():
  """Export content similarities to file."""
  print('Building content similarities data ...')
  with open(CONTENT_SIMILARITIES_PATH, 'w') as f:
    json.dump(calculate_content_similarities(), f)


def build_slope_one_data():
  """Build slope-one parameters for pairs r1 -> r2 of routes."""
  print('Building slope one data ...')
  counts = defaultdict(int)
  deviations = defaultdict(float)

  # building the counts and deviations dictionary
  users = df.groupby(by='user')
  for _, group in tqdm(users):
    zipped = zip(group['route'], group['rating'])
    # itertools.product doesn't work with zipped
    for route1, star1 in zipped:
      for route2, star2 in zipped:
        key = route1 + ' ' + route2  # concatenate route names to form key
        counts[key] += 1
        deviations[key] += star1 - star2

  routes = df['route'].unique()
  for route1 in routes:
    for route2 in routes:
      key = route1 + ' ' + route2
      if counts[key]:  # don't want to divide by 0
        deviations[key] /= counts[key]

  # converting to a vanilla dict in order to export to json
  deviations = dict(deviations)
  with open(SLOPE_ONE_PATH, 'w') as f:
    json.dump(deviations, f)


def build_pairs_regressor():
  """Build regressor parameters for triples (r1, r2) -> r3 of routes."""


if __name__ == '__main__':
  build_route_data()
  build_user_data()
  build_user_ratings_data()
  build_content_similarities()
  build_slope_one_data()
