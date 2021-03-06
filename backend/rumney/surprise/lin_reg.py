
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from tqdm import tqdm
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible, SlopeOne
from surprise.model_selection import cross_validate
# pylint: disable=import-error
from rumney.definitions import DATA_PATH

df = pd.read_csv(DATA_PATH)
reader = Reader(rating_scale=(0, 4))
# need to specify columns in this order
# https://surprise.readthedocs.io/en/stable/getting_started.html#load-from-df-example
data = Dataset.load_from_df(df[['user', 'route', 'rating']], reader)


class LinReg(AlgoBase):
  """Linear regression item-based filtering."""

  def __init__(self):
    AlgoBase.__init__(self)
    self.freqs = None
    self.m = None
    self.b = None

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)  # sets self.trainset = trainset
    if self.trainset.rating_scale[1] - self.trainset.rating_scale[0] != 4:
      raise NotImplementedError('Cannot deal with rating scale.')

    n_items = trainset.n_items
    freqs = np.zeros((n_items, n_items, 5, 5), np.int)

    for u_ratings in trainset.ur.values():
      for item1, rating1 in u_ratings:
        for item2, rating2 in u_ratings:
          freqs[item1, item2, self.to_index(
              rating1), self.to_index(rating2)] += 1

    self.freqs = freqs
    self.lin_reg()
    return self

  def lin_reg(self):
    """Run sklearn LinearRegression on frequency data."""
    n_items = self.trainset.n_items
    self.m = np.zeros((n_items, n_items), np.float)
    self.b = np.zeros((n_items, n_items), np.float)
    for item1 in tqdm(range(n_items)):
      for item2 in range(n_items):
        freq = self.freqs[item1, item2, :, :]
        x = [i for i in range(5) for j in range(5) for _ in range(freq[i, j])]
        y = [j for i in range(5) for j in range(5) for _ in range(freq[i, j])]

        if x:  # can't run LinearRegression without data
          x = np.array(x).reshape(-1, 1)
          y = np.array(y)
          m = LinearRegression()
          m.fit(x, y)
          self.m[item1, item2] = m.coef_[0]
          self.b[item1, item2] = m.intercept_

  def to_index(self, r):
    """Convert rating to an np index."""
    lower = self.trainset.rating_scale[0]
    return int(r) - lower

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    u_ratings = self.trainset.ur[u]

    predictions = [self.m[i, j] * r + self.b[i, j]
                   for i, r in u_ratings if self.b[i, j]]
    return np.mean(predictions)


if __name__ == '__main__':
  algos = [LinReg(), BaselineOnly(), SlopeOne()]
  for algo in algos:
    print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
    cross_validate(algo, data, verbose=True)
