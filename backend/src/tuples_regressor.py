from itertools import product, combinations
import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.linear_model import LinearRegression
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible, SlopeOne
from surprise.model_selection import cross_validate
from scrape_rumney_routes import DATA_PATH

df = pd.read_csv(DATA_PATH)

reader = Reader(rating_scale=(1, 4))
data = Dataset.load_from_df(df, reader)
# use this one later
# data = Dataset.load_builtin('ml-100k')
# data = Dataset.load_builtin('ml-1m')


class TuplesRegressor(AlgoBase):
  def __init__(self, dim=1, weight_predictions=False, minimum_threshold=0):
    AlgoBase.__init__(self)
    self.dim = dim
    self.weight_predictions = weight_predictions
    self.minimum_threshold = minimum_threshold

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
      if isinstance(r, (tuple, list)):
        return tuple([int(s) - lower for s in r])
      return int(r) - lower
    self.r_to_i = r_to_i

    size = (trainset.n_items,) * (self.dim + 1)
    size_freq = size + (n_rating_bins,) * (self.dim + 1)

    self.freq = np.zeros(size_freq, np.int)
    self.m = np.zeros((self.dim,) + size, np.double)  # linear coefficients
    self.b = np.zeros(size, np.double)  # constant coefficient
    self.r_squared = np.zeros(size, np.double)
    self.weights = np.zeros(size, np.double)

  def populate_freq_array(self, trainset):
    """Populate the freq array holding frequencies of user ratings."""
    print('Populating the freq array....')

    for u_ratings in tqdm(trainset.ur.values()):
      combos = combinations(u_ratings, self.dim + 1)
      # Want to iterate through everything in combo as output
      for combo in combos:
        for i in range(self.dim + 1):
          output_index, output_rating = combo[i]
          input_index = tuple(combo)  # HEREHERE

        print(combo)

        x = 1/0

      # input_indices = combinations(u_ratings, self.dim)
      # output_indices = u_ratings

      # for input_index in input_indices:
      #   for output_index in output_indices:

      #     print(input_index)
      #     print('#')
      #     print(output_index)

      #   index = tuple([pair[0] for pair in input_indices])

      # prod = [u_ratings] * (self.dim + 1)
      # for items in product(*prod):
      #   indices = tuple([item[0] for item in items])
      #   ratings = tuple([self.r_to_i(item[1]) for item in items])
      #   self.freq[indices + ratings] += 1

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)
    self.set_trainset_parameters(trainset)
    self.populate_freq_array(trainset)

    # Calculating the linear regression coefficients
    prod = [range(trainset.n_items)] * self.dim
    for input_index in product(*prod):
      for output_index in range(trainset.n_items):
        freq_slice = self.freq[input_index, output_index, ...]
        print(freq_slice)
        n = freq_slice.sum()  # total count
        print(n)

        if n > self.minimum_threshold:  # minimum threshold # TODO: think about this
          self.calculate_with_sklearn(freq_slice, input_index, output_index)

    # for i in range(trainset.n_items):
    #   for j in range(trainset.n_items):
    #     freq_ij = self.freq[i, j, :, :]

    #     n = freq_ij.sum()  # total count
    #     if n > self.minimum_threshold:  # minimum threshold # TODO: think about this
    #       # Calculating means

    #       self.calculate_with_sklearn(freq_ij, i, j)

          # x_bar = np.dot(self.rating_bins, freq_ij.sum(axis=1)) / n
          # y_bar = np.dot(self.rating_bins, freq_ij.sum(axis=0)) / n

          # self.calculate_m_and_b(freq_ij, x_bar, y_bar, i, j)
          # self.weights[i, j] = self.r_squared[i, j] * np.sqrt(n)

    return self

  def calculate_with_sklearn(self, freq_slice, input_index, output_index):
    """Calculate m and b using sklearn's LinearRegression."""

    prod = [self.rating_bins] * self.dim

    print(prod)
    prod = product(*prod)

    for r in prod:
      print('#')
      print(self.r_to_i(r))
      print(freq_slice[self.r_to_i(r) + (slice(None),)])

    X = [r for r in prod for _ in range(
        freq_slice[self.r_to_i(r), :].sum())]
    print(X)
    X = np.array(X).reshape((len(X), self.dim))
    print(X)
    y = [r for r in self.rating_bins for _ in range(
        freq_slice[..., self.r_to_i(r)[0]].sum())]
    y = np.array(y)

    model = LinearRegression()
    model.fit(X, y)

    self.m[input_index, output_index] = model.coef_
    self.b[input_index, output_index] = model.intercept_

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
      self.m[0, i, j] = m_num / m_denom
    if r_denom:
      self.r_squared[i, j] = (r_num / r_denom) ** 2

    # self.m[i, j] = 1  # TODO: remove this

    self.b[i, j] = y_bar - self.m[0, i, j] * x_bar

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    # Ri: relevant items for i. This is the set of items j rated by u that
    # also have common users with i (i.e. at least one user has rated both
    # i and j).
    Ri = [(i, r) for i, r in self.trainset.ur[u]
          if self.m[0, i, j] and self.b[i, j]]
    Wi = [self.weights[i, j] for i, _ in Ri]

    if Ri:
      R_pred = [self.m[0, i, j] * r + self.b[i, j] for i, r in Ri]
      w = np.sum(Wi)
      if w and self.weight_predictions:
        return np.dot(R_pred, Wi) / w
      else:
        return np.mean(R_pred)
    return 0


algos = [TuplesRegressor(dim=2), BaselineOnly(), SlopeOne()]
for algo in algos:
  print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
  cross_validate(algo, data, verbose=True)
