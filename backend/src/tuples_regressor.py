import numpy as np
import pandas as pd
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible
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

  def fit(self, trainset):
    AlgoBase.fit(self, trainset)

    n_items = trainset.n_items
    lower, upper = trainset.rating_scale
    rating_bins = range(lower, upper + 1)
    n_rating_bins = len(rating_bins)
    def rating_to_index(r): return r - lower

    freq = np.zeros((n_rating_bins, n_rating_bins, n_items, n_items), np.int)
    m = np.zeros((trainset.n_items, trainset.n_items), np.double)
    b = np.zeros((trainset.n_items, trainset.n_items), np.double)

    # Computation of freq array
    for u, u_ratings in trainset.ur.items():
      for i, r_ui in u_ratings:
        for j, r_uj in u_ratings:
          freq[rating_to_index(r_ui), rating_to_index(r_uj), i, j] += 1

    # TODO: consider breaking this into two separate functions....
    # Calculating the linear regression coefficients
    for i in range(n_items):
      m[i, i] = 1  # b already 0
      for j in range(i + 1, n_items):
        ratings = freq[:, :, i, j]
        n = ratings.sum()  # total count
        if n:
          x_bar = 0
          y_bar = 0

          for r in rating_bins:
            x_bar = r * ratings[rating_to_index(r), :].sum()
            y_bar = r * ratings[:, rating_to_index(r)].sum()
          x_bar /= n
          y_bar /= n

          m_num = 0
          m_denom = 0
          for r1 in rating_bins:
            for r2 in rating_bins:
              f = ratings[r1, r2]  # frequency
              m_num += f * ((r1 - x_bar) * (r2 - y_bar))
              m_denom += f * (r1 - x_bar) * (r1 - x_bar)

          m[i, j] = m_num / m_denom
          m[j, i] = 0  # TODO: do this!
          b[i, j] = y_bar - m[i, j] * x_bar
          b[j, i] = 0  # and this.

        else:
          m[i, j] = 0
          m[j, i] = 0

    self.freq = freq
    self.m = m
    self.b = b

    # mean ratings of all users: mu_u
    self.user_mean = [np.mean([r for (_, r) in trainset.ur[u]])
                      for u in trainset.all_users()]

    return self

  def estimate(self, u, i):

    if not (self.trainset.knows_user(u) and self.trainset.knows_item(i)):
      raise PredictionImpossible('User and/or item is unknown.')

    # Ri: relevant items for i. This is the set of items j rated by u that
    # also have common users with i (i.e. at least one user has rated both
    # i and j).
    Ri = [j for (j, _) in self.trainset.ur[u] if self.freq[i, j] > 0]
    est = self.user_mean[u]
    if Ri:
      est += sum(self.dev[i, j] for j in Ri) / len(Ri)

    return est


algo = TuplesRegressor()
base = BaselineOnly()

cross_validate(algo, data, verbose=True)
cross_validate(base, data, verbose=True)
