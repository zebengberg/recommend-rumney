import pandas as pd
from scrape import stars_file_path

df = pd.read_csv(stars_file_path)


def build_user_data():
  """Export list of MP users contributing to Rumney to file."""
  # TODO: get additional data on each user such as age, sex, ticks, .... ?
  user_df = df[['route', 'user']]
  g = user_df.groupby(by='user', as_index=False)
  counts = g.count()
  counts = counts.rename(columns={'route': 'n_votes'})

  # sorting users by their number of votes
  counts = counts.sort_values(by='n_votes', ascending=False)

  # exporting
  users_json_path = '../../src/assets/users.json'
  counts.to_json(users_json_path, orient='records')


def build_route_data():
  """Export list of MP users contributing to Rumney to file."""
  route_df = df[['route', 'user', 'star']]
  g = route_df.groupby(by='route', as_index=False)
  stats = g.agg({'user': 'count', 'star': 'mean'})
  stats = stats.rename(columns={'user': 'n_votes', 'star': 'avg_stars'})

  # sorting routes by their number of votes
  stats = stats.sort_values(by='n_votes', ascending=False)

  # exporting
  routes_json_path = '../../src/assets/routes.json'
  stats.to_json(routes_json_path, orient='records')

def build_route_best_preferences_data():
  pass

def build_user_star_ratings_data():
  # normalize it?
  pass







if __name__ == '__main__':
  build_user_data()
  build_route_data()
