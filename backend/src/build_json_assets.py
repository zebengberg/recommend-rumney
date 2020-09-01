import json
import pandas as pd
from scrape_rumney_routes import stars_file_path

df = pd.read_csv(stars_file_path)


def build_user_data():
  """Export list of MP Rumney to file."""
  # TODO: get additional data on each user such as age, sex, ticks, .... ?
  user_df = df[['route', 'user']]
  grouped = user_df.groupby(by='user', as_index=False)
  counts = grouped.count()
  counts = counts.rename(columns={'route': 'n_votes'})

  # sorting users by their number of votes
  counts = counts.sort_values(by='n_votes', ascending=False)

  # exporting
  users_json_path = '../../src/assets/users.json'
  counts.to_json(users_json_path, orient='records')


def build_route_data():
  """Export list of MP Rumney users to file."""
  route_df = df[['route', 'user', 'star']]
  grouped = route_df.groupby(by='route', as_index=False)
  stats = grouped.agg({'user': 'count', 'star': 'mean'})
  stats = stats.rename(columns={'user': 'n_votes', 'star': 'avg_stars'})

  # sorting routes by their number of votes
  stats = stats.sort_values(by='n_votes', ascending=False)

  # exporting
  routes_json_path = '../../src/assets/routes.json'
  stats.to_json(routes_json_path, orient='records')


def build_route_best_preferences_data():
  pass


def build_user_star_ratings_data():
  """Export MP Rumney user star ratings to file."""
  user_df = df[['route', 'user', 'star']]
  grouped = user_df.groupby(by='user')

  # building dictionary to export as json
  d = {user: dict(zip(group['route'], group['star'])) for user, group in grouped}

  # exporting
  stars_json_path = '../../src/assets/stars.json'
  with open(stars_json_path, 'w') as f:
    json.dump(d, f)


if __name__ == '__main__':
  build_user_data()
  build_route_data()
  build_user_star_ratings_data()
