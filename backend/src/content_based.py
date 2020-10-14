"""A module for calculating and exploring content-based similarity metrics."""

from itertools import combinations
from tqdm import tqdm
from analyze_text import extract_climbing_words


data = extract_climbing_words()


def build_grade_list():
  """Return a list of climbing grades."""
  grades = []
  for i in range(10):
    grades.append('5.' + str(i))
  for i in range(10, 15):
    for l in ['a', 'b', 'c', 'd']:
      grades.append('5.' + str(i) + l)
  grades.append('5.15a')
  return grades


def grade_to_number(grade):
  """Parse an MP grade into an index."""
  grades_list = build_grade_list()
  if grade[2] != '1':  # eg 5.8+
    g = grade[:3]
  else:
    g = grade[:5]
    if len(g) == 4:  # eg 5.10
      g += 'a'
    else:  # len(g) == 5
      if g[4] == '+':
        g = g[:4] + 'd'
      elif g[4] == '-':
        g = g[:4] + 'a'

  return grades_list.index(g)  # will throw


def print_grades_histogram():
  """Print histogram of Rumney route grades for exploration purposes."""
  d = [0 for g in build_grade_list()]
  for route in data:
    g = data[route]['grade']
    d[grade_to_number(g)] += 1
  print(d)


def score_grade_similarities(route1, route2):
  """Return score in [0, 1] measuring similarity of grades of route1 and route2."""
  g1 = grade_to_number(data[route1]['grade'])
  g2 = grade_to_number(data[route2]['grade'])
  if abs(g2 - g1) > 3:
    return 0
  return 1 - abs(g2 - g1) / 4


def dot_words(route1, route2):
  """Calculate dot product."""
  counts1 = data[route1]['word_counts']
  counts2 = data[route2]['word_counts']
  return sum(counts1[word] * counts2[word] for word in counts1)


def normalized_dot_words(route1, route2):
  """Calculate dot product after scaling to unit vectors."""
  denom = (dot_words(route1, route1) * dot_words(route2, route2)) ** 0.5
  if denom:
    return dot_words(route1, route2) / denom
  return 0


def calculate_content_similarities():
  """Calculate content similarities between pairs of routes."""
  routes = sorted(list(data.keys()))  # sort alphabetically
  similarities = {}
  # tqdm wasn't designed to work with generator, so we cast to list
  for r1, r2 in tqdm(list(combinations(routes, 2))):
    word_similarity = normalized_dot_words(r1, r2)
    grade_similarity = score_grade_similarities(r1, r2)
    key = r1 + ' ' + r2  # concatenate route names to form key
    similarity = word_similarity * grade_similarity
    # most similarity are 0; don't need to write those
    if similarity:
      similarities[key] = similarity
  return similarities
