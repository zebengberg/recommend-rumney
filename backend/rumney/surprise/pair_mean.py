"""Attempt at an item-based prediction in which the map item1 -> item2 is considered."""


from surprise.model_selection import cross_validate
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible, SlopeOne
from tqdm import tqdm
import pandas as pd
import numpy as np
from ..scrape_rumney_routes import DATA_PATH

df = pd.read_csv(DATA_PATH)
reader = Reader(rating_scale=(0, 4))
# need to specify columns in this order
# https://surprise.readthedocs.io/en/stable/getting_started.html#load-from-df-example
data = Dataset.load_from_df(df[['user', 'route', 'rating']], reader)


class PairMean(AlgoBase):
  """Use means of image of map route1 -> route2 to predict."""

  def __init__(self, minimum_threshold=3, weighting=None):
    AlgoBase.__init__(self)
    self.minimum_threshold = minimum_threshold
    self.freqs = None
    self.sums = None
    if weighting in [None, 'log', 'linear']:
      self.weighting = weighting

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)  # sets self.trainset = trainset
    if self.trainset.rating_scale[1] - self.trainset.rating_scale[0] != 4:
      raise NotImplementedError('Cannot deal with trainset scale.')

    n_items = trainset.n_items
    freqs = np.zeros((n_items, n_items, 5), np.int)
    sums = np.zeros((n_items, n_items, 5), np.int)

    for u_ratings in tqdm(trainset.ur.values()):
      for item1, rating1 in u_ratings:
        for item2, rating2 in u_ratings:
          freqs[item1, item2, self.to_index(rating1)] += 1
          sums[item1, item2, self.to_index(rating1)] += int(rating2)

    self.freqs = freqs
    self.sums = sums
    self.mask()
    return self

  def to_index(self, r):
    """Convert rating to an np index."""
    lower = self.trainset.rating_scale[0]
    return int(r) - lower

  def mask(self):
    """Mask data below threshold."""

    mask = self.freqs >= self.minimum_threshold
    mask = mask.astype(int)
    self.freqs = self.freqs * mask
    self.sums = self.sums * mask

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    u_ratings = self.trainset.ur[u]

    if self.weighting == 'linear':
      weight = sum(self.freqs[i, j, self.to_index(r)] for i, r in u_ratings)
      score = sum(self.sums[i, j, self.to_index(r)] for i, r in u_ratings)
      return score / weight

    # self.weighting == 'log' or None
    weights = [self.freqs[i, j, self.to_index(r)] for i, r in u_ratings]
    reciprocals = [1 / w if w else 0 for w in weights]
    scores = [self.sums[i, j, self.to_index(r)] for i, r in u_ratings]
    scores = [s * w for s, w in zip(scores, reciprocals)]

    if self.weighting is None:
      return np.mean(scores)
    # self.weighting == 'log'
    logs = [np.log(w + 1) if w >= 1 else 0 for w in weights]
    return np.dot(scores, logs) / np.sum(logs)


if __name__ == '__main__':
  algos = [PairMean(minimum_threshold=2, weighting='log'),
           PairMean(minimum_threshold=2, weighting='linear'),
           BaselineOnly(verbose=False),
           SlopeOne()]
  for algo in algos:
    print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
    cross_validate(algo, data, verbose=True)
