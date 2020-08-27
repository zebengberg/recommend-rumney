import pandas as pd
from scrape import stars_file_path

df = pd.read_csv(stars_file_path)


def build_user_data():
  """Export list of MP users contributing to Rumney to file."""
  user_df = df[['user', 'route']]
  g = user_df.groupby(by='user', as_index=False)
  counts = g.count().sort_values(by='route', ascending=False)
  counts = counts.rename(columns={'route': 'n_votes'})
  counts.to_json('../data/users.json', orient='records')


build_user_data()
