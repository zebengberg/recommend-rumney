"""Build json data after MP scrap."""

import json
from collections import defaultdict
import pandas as pd
import numpy as np
from tqdm import tqdm
from scrape_rumney_routes import DATA_PATH

full_df = pd.read_csv(DATA_PATH)


def build_user_data():
  """Export list of MP Rumney to file."""
  df = full_df[['route', 'user']]
  grouped = df.groupby(by='user', as_index=False)
  counts = grouped.count()
  counts = counts.rename(columns={'route': 'n_votes'})

  # sorting users by their number of votes
  counts = counts.sort_values(by='n_votes', ascending=False)

  # exporting
  users_json_path = '../../src/assets/users_array.json'
  counts.to_json(users_json_path, orient='records')


def build_route_data():
  """Export list of MP Rumney users to file."""
  df = full_df[['route', 'user', 'star', 'grade', 'url']]
  grouped = df.groupby(by='route', as_index=False)
  stats = grouped.agg({'user': 'count', 'star': 'mean',
                       'grade': 'first', 'url': 'first'})
  stats = stats.rename(columns={'user': 'n_votes', 'star': 'avg_stars'})

  # sorting routes by their number of votes
  stats = stats.sort_values(by='n_votes', ascending=False)

  # exporting
  routes_json_path = '../../src/assets/routes_array.json'
  stats.to_json(routes_json_path, orient='records')


def build_route_stats_data():
  """Determine and sort routes according to the variation in star rating."""
  df = full_df[['route', 'star']]
  grouped = df.groupby(by='route', as_index=False)
  stats = grouped.agg(['mean', lambda x: np.std(x, ddof=0), 'count'])

  # columns are a MultiIndex; flattening them down
  stats.columns = ['_'.join(col).rstrip('_') for col in stats.columns.values]
  stats.rename(columns={'star_<lambda_0>': 'star_std'}, inplace=True)

  # weight the standard deviation by some increasing function of route counts
  # this weighting will avoid routes with few but varied star reviews
  def weight(x):
    return x ** 0.1
  stats['star_weight'] = stats['star_std'] * weight(stats['star_count'])

  # don't want to include very obscure routes
  stats['star_weight'] *= stats['star_count'] > 50

  # keeping route names as column
  stats.reset_index(inplace=True)

  # sorting
  stats = stats.sort_values(by='star_weight', ascending=False)

  # exporting array
  stats_json_path = '../../src/assets/stats_array.json'
  stats.to_json(stats_json_path, orient='records')

  # building dictionary to export as json
  d = dict(zip(stats['route'], stats['star_std']))
  std_json_path = '../../src/assets/std_object.json'
  with open(std_json_path, 'w') as f:
    json.dump(d, f)


def build_user_star_ratings_data():
  """Export MP Rumney user star ratings to file."""
  df = full_df[['route', 'user', 'star']]
  grouped = df.groupby(by='user')

  # building dictionary to export as json
  d = {user: dict(zip(group['route'], group['star']))
       for user, group in grouped}

  # exporting
  stars_json_path = '../../src/assets/stars_object.json'
  with open(stars_json_path, 'w') as f:
    json.dump(d, f)


def build_slope_one_data():
  """Build slope-one parameters for pairs r1 -> r2 of routes."""
  counts = defaultdict(int)
  deviations = defaultdict(float)
  df = full_df[['route', 'user', 'star']]

  # building the counts and deviations dictionary
  users = df.groupby(by='user')
  for _, group in tqdm(users):
    zipped = zip(group['route'], group['star'])
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
  slope_one_path = '../../src/assets/slope_one_object.json'
  with open(slope_one_path, 'w') as f:
    json.dump(deviations, f)


def build_pairs_regressor():
  """Build regressor parameters for triples (r1, r2) -> r3 of routes."""


if __name__ == '__main__':
  build_user_data()
  build_route_data()
  build_user_star_ratings_data()
  build_route_stats_data()
  build_slope_one_data()
