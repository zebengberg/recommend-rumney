"""Analyze text data scraped from MP. This module includes a number of utility
functions for exploring and understanding the MPT text data."""

import json
from collections import defaultdict
# pylint: disable=import-error
from rumney.definitions import TEXT_PATH


with open(TEXT_PATH) as f:
  data = json.load(f)

with open('handcrafted_words.txt') as f:
  climbing_words = [line.strip() for line in f]


def get_all_text():
  """Return string of all text from MP description and comments."""
  return ' '.join([d['text'] for d in data.values()])


def print_word_counts():
  """Print popular words over all MP descriptions and comments."""
  counts = defaultdict(int)
  text = get_all_text()
  for word in text.split(' '):
    counts[word] += 1

  # sorting according to popularity
  counts = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
  # printing most popular words
  for k, v in counts[:500]:
    print(k, v)


def print_word_from_substring(substring):
  """Print word associated to substring for testing purposes."""
  text = get_all_text()
  text = text.split(' ')
  for word in text:
    if substring in word:
      # only print when word is much longer than substring
      if len(word) >= len(substring) + 2:
        print(word)


def print_most_commented():
  """Print routes according to the number of comments."""
  counts = {route: len(d['text']) for route, d in data.items()}
  counts = sorted(counts.items(), key=lambda kv: kv[1])
  for k, v in counts:
    print(k, v)


def extract_climbing_words():
  """Extract instances of hand-crafted climbing words from data."""
  for d in data.values():
    text = d['text']
    d['text_length'] = len(text)

    d['word_counts'] = {word: text.count(word) for word in climbing_words}
    # merging foot  with feet
    d['word_counts']['foot'] += d['word_counts']['feet']
    del d['word_counts']['feet']

  return data
