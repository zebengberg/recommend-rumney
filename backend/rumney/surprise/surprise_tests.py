"""Test built-in surprise algorithms."""

import surprise
import pandas as pd
# pylint: disable=import-error
from rumney.definitions import DATA_PATH

df = pd.read_csv(DATA_PATH)
# need to increment all ratings to avoid division by zero error in NMF
df['rating'] += 1
reader = surprise.Reader(rating_scale=(1, 5))

# need to specify columns in this order
# https://surprise.readthedocs.io/en/stable/getting_started.html#load-from-df-example
data = surprise.Dataset.load_from_df(df[['user', 'route', 'rating']], reader)


def tests():
  """Test built-in surprise algorithms."""
  algorithms = [surprise.NormalPredictor(),
                surprise.BaselineOnly(verbose=False),
                surprise.KNNBasic(verbose=False),
                surprise.KNNWithMeans(verbose=False),
                surprise.KNNWithZScore(verbose=False),
                surprise.KNNBaseline(verbose=False),
                surprise.SVD(verbose=False),
                surprise.NMF(verbose=False),
                surprise.SlopeOne(),
                surprise.CoClustering(verbose=False)]
  for algo in algorithms:
    print(f'With {algo.__class__.__name__} algorithm:')
    d = surprise.model_selection.cross_validate(algo, data, verbose=False)
    scores = zip(d['test_rmse'], d['test_mae'])
    print('rmse \t\t\t mae')
    for s1, s2 in scores:
      print(f'{round(s1, 4)} \t\t\t {round(s2, 4)}')
    print('\n' + '#'*80 + '\n')


if __name__ == '__main__':
  tests()
