"""A module for investigating item-based associations."""

from random import sample
import pandas as pd
import numpy as np
# pylint: disable=import-error
from rumney.definitions import DATA_PATH

df = pd.read_csv(DATA_PATH)


def most_rated(n):
  """Return a list of the n most rated routes."""
  counts = df[['user', 'route']].groupby(by='route').count()
  return list(counts.sort_values(by='user', ascending=False)[:n].index)


def random_combination(pool, r):
  """Return random selection of r items from pool."""
  indices = sorted(sample(range(len(pool)), r))
  return [pool[i] for i in indices]


def print_association(*routes):
  """Print association matrix of users scoring routes."""
  grouped = df.groupby(by='route')
  groups = [grouped.get_group(route) for route in routes]
  users = set.intersection(*[set(g['user']) for g in groups])

  dim = (5,) * len(routes)
  matrix = np.zeros(dim)
  for u in users:
    ratings = [g[g['user'] == u]['rating'].iloc[0] for g in groups]
    matrix[tuple(ratings)] += 1
  print(matrix)


def print_pair_associations():
  """Print association matrix for pairs of popular routes."""
  routes = most_rated(50)
  for _ in range(50):
    r1, r2 = random_combination(routes, 2)
    print(r1, r2)
    print_association(r1, r2)
    print('')


def print_triple_associations():
  """Print association matrix for triples of popular routes."""
  routes = most_rated(50)
  for _ in range(10):
    r1, r2, r3 = random_combination(routes, 3)
    print(r1, r2, r3)
    print_association(r1, r2, r3)
    print('')


def print_mean(*routes, threshold=5):
  """Print mean of image of map (r1, r2, ..., r_n-1) -> r_n."""
  grouped = df.groupby(by='route')
  groups = [grouped.get_group(route) for route in routes]
  users = set.intersection(*[set(g['user']) for g in groups])

  dim = (5,) * len(routes)
  freqs = np.zeros(dim)
  for u in users:
    ratings = [g[g['user'] == u]['rating'].iloc[0] for g in groups]
    freqs[tuple(ratings)] += 1

  totals = freqs.sum(axis=-1)
  # masking bins with few datapoints
  mask = totals >= threshold
  mask = mask.astype(int)

  means = freqs.dot(np.array(range(5))) / totals
  means = np.nan_to_num(means * mask)  # nan -> 0
  print(means.round(2))


def print_pair_means():
  """Print association mean for pair of popular routes."""
  routes = most_rated(50)
  for _ in range(50):
    r1, r2 = random_combination(routes, 2)
    print(r1, r2)
    print_mean(r1, r2)
    print('')


def print_triple_means():
  """Print association mean for triples of popular routes."""
  routes = most_rated(50)
  for _ in range(50):
    r1, r2, r3 = random_combination(routes, 3)
    print(r1, r2, r3)
    print_mean(r1, r2, r3)
    print('')


if __name__ == '__main__':
  print_pair_associations()
  print_triple_associations()
  print_pair_means()
  print_triple_means()
