import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression as lin_reg
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

    self.r_to_i = None
    self.r_squared = None
    self.weights = None

  def set_trainset_parameters(self, trainset):
    """Setting various attributes needed in fit."""
    lower, upper = trainset.rating_scale
    rating_bins_gen = range(lower, upper + 1)
    self.rating_bins = np.array(rating_bins_gen)
    n_rating_bins = len(rating_bins_gen)

    def r_to_i(r):
      """Helper function to convert a rating into an index in the freq array."""
      return int(r) - lower
    self.r_to_i = r_to_i

    self.freq = np.zeros((n_rating_bins, n_rating_bins,
                          trainset.n_items, trainset.n_items), np.int)
    self.m = np.zeros((trainset.n_items, trainset.n_items), np.double)
    self.b = np.zeros((trainset.n_items, trainset.n_items), np.double)
    self.r_squared = np.zeros((trainset.n_items, trainset.n_items), np.double)
    self.weights = np.zeros((trainset.n_items, trainset.n_items), np.double)

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)
    self.set_trainset_parameters(trainset)

    # Computation of freq array
    for u_ratings in trainset.ur.values():
      for i, r_ui in u_ratings:
        for j, r_uj in u_ratings:
          self.freq[self.r_to_i(r_ui), self.r_to_i(r_uj), i, j] += 1

    # Calculating the linear regression coefficients
    for i in range(trainset.n_items):
      for j in range(trainset.n_items):
        freq_ij = self.freq[:, :, i, j]

        n = freq_ij.sum()  # total count
        if n > 5:  # minimum threshold # TODO: think about this
          # Calculating means
          x_bar = np.dot(self.rating_bins, freq_ij.sum(axis=1)) / n
          y_bar = np.dot(self.rating_bins, freq_ij.sum(axis=0)) / n

          self.calculate_m_and_b(freq_ij, x_bar, y_bar, i, j)
          self.weights[i, j] = self.r_squared[i, j] * np.sqrt(n)

    return self

  def calculate_m_and_b(self, freq_ij, x_bar, y_bar, i, j):
    """Calculate m and b with residuals and means."""

    x_diff = self.rating_bins - x_bar
    y_diff = self.rating_bins - y_bar
    xy_prod = np.outer(x_diff, y_diff)

    m_num = np.sum(freq_ij * xy_prod)
    m_denom = np.sum(freq_ij.sum(axis=1) * x_diff * x_diff)
    r_num = np.sum(freq_ij * xy_prod)
    r_denom = np.sqrt(np.dot(freq_ij.sum(axis=1), x_diff * x_diff)
                      * np.dot(freq_ij.sum(axis=0), y_diff * y_diff))

    if m_denom:
      self.m[i, j] = m_num / m_denom
    if r_denom:
      self.r_squared[i, j] = (r_num / r_denom) ** 2

    self.m[i, j] = 1  # TODO: remove this

    self.b[i, j] = y_bar - self.m[i, j] * x_bar

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    # Ri: relevant items for i. This is the set of items j rated by u that
    # also have common users with i (i.e. at least one user has rated both
    # i and j).
    Ri = [(i, r) for i, r in self.trainset.ur[u]
          if self.m[i, j] and self.b[i, j]]
    Wi = [self.weights[i, j] for i, _ in Ri]

    if Ri:
      R_pred = [self.m[i, j] * r + self.b[i, j] for i, r in Ri]
      w = np.sum(Wi)
      if w:
        return np.dot(R_pred, Wi) / w
    return 0


algos = [TuplesRegressor(), BaselineOnly(), SlopeOne()]
for algo in algos:
  print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
  cross_validate(algo, data, verbose=True)
