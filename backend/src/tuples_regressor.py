import numpy as np
import pandas as pd
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible, SlopeOne
from surprise.model_selection import cross_validate
from scrape_rumney_routes import stars_file_path

df = pd.read_csv(stars_file_path)
df = df[['user', 'route', 'star']]
reader = Reader(rating_scale=(1, 4))
data = Dataset.load_from_df(df, reader)
# use this one later
# data = Dataset.load_builtin('ml-100k')


class TuplesRegressor(AlgoBase):
  def __init__(self, dim=1):
    AlgoBase.__init__(self)
    self.dim = dim
    self.freq = None
    self.m = None
    self.b = None
    self.user_mean = None
    self.rating_bins = None
    self.rating_to_index = None
    self.r_squared = None  # TODO: weight regression predictions by accuracy, say, r^2

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)

    lower, upper = trainset.rating_scale
    self.rating_bins = range(lower, upper + 1)

    def rating_to_index(r):
      """Helper function to convert a rating into an index in the freq array."""
      return int(r) - lower
    self.rating_to_index = rating_to_index

    self.freq = np.zeros((len(self.rating_bins), len(
        self.rating_bins), trainset.n_items, trainset.n_items), np.int)
    self.m = np.zeros((trainset.n_items, trainset.n_items), np.double)
    self.b = np.zeros((trainset.n_items, trainset.n_items), np.double)
    self.r_squared = np.zeros((trainset.n_items, trainset.n_items), np.double)

    # Computation of freq array
    for u_ratings in trainset.ur.values():
      for i, r_ui in u_ratings:
        for j, r_uj in u_ratings:
          self.freq[rating_to_index(r_ui), rating_to_index(r_uj), i, j] += 1

    # Calculating the linear regression coefficients
    for i in range(trainset.n_items):
      self.m[i, i] = 1  # b already 0
      for j in range(i + 1, trainset.n_items):
        ratings = self.freq[:, :, i, j]
        n = ratings.sum()  # total count
        if n:
          # Calculating means
          x_bar = np.dot(np.array(self.rating_bins), ratings.sum(axis=1)) / n
          y_bar = np.dot(np.array(self.rating_bins), ratings.sum(axis=0)) / n

          self.calculate_m_and_b(ratings, x_bar, y_bar, i, j)

    return self

  def calculate_m_and_b(self, ratings, x_bar, y_bar, i, j):
    """Calculate m and b with residuals and means."""
    m_num = 0
    m_ij_denom = 0
    m_ji_denom = 0

    # TODO: redo this with numpy
    for r_x in self.rating_bins:
      for r_y in self.rating_bins:
        f = ratings[self.rating_to_index(
            r_x), self.rating_to_index(r_y)]  # frequency
        x_res = r_x - x_bar
        y_res = r_y - y_bar
        m_num += f * x_res * y_res
        m_ij_denom += f * x_res * x_res
        m_ji_denom += f * y_res * y_res

    if m_ij_denom:
      self.m[i, j] = m_num / m_ij_denom
    if m_ji_denom:
      self.m[j, i] = m_num / m_ji_denom

    # TODO: remove this
    # self.m[i, j] = 1
    # self.m[j, i] = 1

    self.b[i, j] = y_bar - self.m[i, j] * x_bar
    self.b[j, i] = -self.b[i, j]

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    # Ri: relevant items for i. This is the set of items j rated by u that
    # also have common users with i (i.e. at least one user has rated both
    # i and j).
    Ri = [(i, r) for i, r in self.trainset.ur[u]
          if self.m[i, j] and self.b[i, j]]
    est = 0

    if Ri:
      R_pred = [self.m[i, j] * r + self.b[i, j] for i, r in Ri]
      est = np.mean(R_pred)

    return est


algos = [TuplesRegressor(), BaselineOnly(), SlopeOne()]
for algo in algos:
  print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
  cross_validate(algo, data, verbose=True)
