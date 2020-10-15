"""Deal with MP redacted routes."""

import json
import pandas as pd

# redundant with scrape_rumney_routes; avoiding circular import
URLS_PATH = '../data/rumney_urls.csv'


def build_redacteds():
  """Export redacted IDs to json file."""
  url_df = pd.read_csv(URLS_PATH)
  redacteds = url_df[url_df['Route'] == 'Redacted']['URL']
  ids = redacteds.apply(strip_id)
  redacteds.index = ids
  return redacteds.to_dict()


def strip_id(url):
  """Get MP database ID from url."""
  url = url.split('/')
  return url[-2]


if __name__ == '__main__':
  with open('redacted.json', 'w') as f:
    json.dump(build_redacteds(), f, indent=2)
