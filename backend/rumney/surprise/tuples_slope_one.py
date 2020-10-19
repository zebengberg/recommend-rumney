"""An attempt at an item-based higher dimensional version of the slope one
algorithm. We consider linear regression approximation to the map
(item1, item2, ...) -> item3."""

from itertools import combinations
import numpy as np
import pandas as pd
from tqdm import tqdm
from surprise import AlgoBase, BaselineOnly, Dataset, Reader, PredictionImpossible, SlopeOne
from surprise.model_selection import cross_validate
from scrape_rumney_routes import DATA_PATH

df = pd.read_csv(DATA_PATH)
reader = Reader(rating_scale=(0, 4))
# need to specify columns in this order
# https://surprise.readthedocs.io/en/stable/getting_started.html#load-from-df-example
data = Dataset.load_from_df(df[['user', 'route', 'rating']], reader)


class TuplesSlopeOne(AlgoBase):
  def __init__(self, dim=1, minimum_threshold=0):
    AlgoBase.__init__(self)
    self.dim = dim
    self.minimum_threshold = minimum_threshold
    self.freq = None
    self.dev = None

  def fit(self, trainset):
    """Override method from AlgoBase."""
    AlgoBase.fit(self, trainset)  # sets self.trainset = trainset
    n_items = trainset.n_items
    freq = np.zeros((n_items,) * (self.dim + 1), np.int)
    dev = np.zeros((n_items,) * (self.dim + 1), np.double)

    print('Populating freq and dev arrays.')
    for u_ratings in tqdm(trainset.ur.values()):
      combos = combinations(u_ratings, self.dim + 1)
      for combo in combos:
        for i, output in enumerate(combo):
          inputs = combo[:i] + combo[i + 1:]
          index = tuple([item[0] for item in inputs]) + (output[0],)
          input_rating = sum(item[1] for item in inputs) / self.dim
          output_rating = output[1]
          freq[index] += 1
          dev[index] += input_rating - output_rating

    combos = combinations(range(n_items), self.dim + 1)
    for combo in combos:
      for i, output in enumerate(combo):
        inputs = combo[:i] + combo[i + 1:]
        index = inputs + (output,)
        if freq[index] > self.minimum_threshold:
          dev[index] /= freq[index]

    self.freq = freq
    self.dev = dev
    return self

  def estimate(self, u, j):
    """Override method from AlgoBase."""
    if not (self.trainset.knows_user(u) and self.trainset.knows_item(j)):
      raise PredictionImpossible('User and/or item is unknown.')

    combos = combinations(self.trainset.ur[u], self.dim)

    def get_index(combo):
      return tuple([item[0] for item in combo]) + (j,)
    relevants = [combo for combo in combos if self.freq[get_index(combo)]]

    def get_mean_rating(combo):
      return sum(item[1] for item in combo) / self.dim
    if relevants:
      means = [get_mean_rating(combo) for combo in relevants]
      indices = [get_index(combo) for combo in relevants]
      predictions = [mean - self.dev[index]
                     for mean, index in zip(means, indices)]
      return np.mean(predictions)

    user_mean = np.mean([item[1] for item in self.trainset.ur[u]])
    return user_mean


algos = [TuplesSlopeOne(dim=2, minimum_threshold=5),
         BaselineOnly(), SlopeOne()]
for algo in algos:
  print('#' * 80 + '\n' * 2 + algo.__class__.__name__)
  cross_validate(algo, data, verbose=True)
