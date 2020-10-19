"""Test built-in surprise algorithms."""

import surprise
import pandas as pd
from scrape_rumney_routes import DATA_PATH

df = pd.read_csv(DATA_PATH)
# need to increment all ratings to avoid division by zero error in NMF
df['rating'] += 1


def tests():
  """Test built-in surprise algorithms."""
  reader = surprise.Reader(rating_scale=(1, 5))
  dataset = surprise.Dataset.load_from_df(df, reader)
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
    d = surprise.model_selection.cross_validate(algo, dataset, verbose=False)
    scores = zip(d['test_rmse'], d['test_mae'])
    print('rmse \t\t\t mae')
    for s1, s2 in scores:
      print(f'{round(s1, 4)} \t\t\t {round(s2, 4)}')
    print('\n' + '#'*80 + '\n')


if __name__ == '__main__':
  tests()
