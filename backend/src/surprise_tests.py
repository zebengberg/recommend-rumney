"""Test built-in surprise algorithms."""

import surprise
import pandas as pd
from scrape_rumney_routes import stars_file_path

df = pd.read_csv(stars_file_path)


def tests():
  """Test built-in surprise algorithms."""
  stars = df[['user', 'route', 'star']]
  reader = surprise.Reader(rating_scale=(1, 4))
  dataset = surprise.Dataset.load_from_df(stars, reader)
  algorithms = [surprise.NormalPredictor(),
                surprise.BaselineOnly(),
                surprise.KNNBasic(),
                surprise.KNNWithMeans(),
                surprise.KNNWithZScore(),
                surprise.KNNBaseline(),
                surprise.SVD(),
                surprise.NMF(),
                surprise.SlopeOne(),
                surprise.CoClustering()]
  for algo in algorithms:
    print(f'With {algo.__class__.__name__} algorithm:')
    surprise.model_selection.cross_validate(algo, dataset, verbose=True)
    print('\n' + '#'*80 + '\n')


if __name__ == '__main__':
  tests()
