"""Scrap MP data and store as CSV files."""

from os import path
import logging
from time import sleep
import json
import requests
import pandas as pd
from lxml import html
from tqdm import tqdm
# pylint: disable=import-error
from rumney.definitions import URLS_PATH, DATA_PATH, TEXT_PATH, LOG_PATH
from redacted import strip_id


with open('redacted_fixes.json') as file:
  fixes = json.load(file)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
fh = logging.FileHandler(LOG_PATH)
fh.setLevel(logging.INFO)
formatter = logging.Formatter(fmt='%(asctime)s %(message)s',
                              datefmt='%m/%d/%Y %H:%M:%S')
fh.setFormatter(formatter)
logger.addHandler(fh)


def download_route_urls():
  """Download CSV of Rumney route URLs from MP server."""
  # use local cached csv if one exists
  if path.exists(URLS_PATH):
    print('Using cached version of URL data.')
    print(f'Remove {URLS_PATH} to download new data.')

  else:
    # url taken from MP route-finder feature
    url = ('https://www.mountainproject.com/route-finder-export?'
           'selectedIds=105867829&type=rock&diffMinrock=1000'
           '&diffMinboulder=20000&diffMinaid=70000&diffMinice=30000'
           '&diffMinmixed=50000&diffMaxrock=12400&diffMaxboulder=20050'
           '&diffMaxaid=75260&diffMaxice=38500&diffMaxmixed=60000'
           '&is_sport_climb=1&stars=0&pitches=0&sort1=area&sort2=rating')
    r = requests.get(url)

    with open(URLS_PATH, 'wb') as f:
      f.write(r.content)

    # counting total number of lines in downloaded CSV and logging count
    num_lines = sum(1 for line in open(URLS_PATH))
    logger.info('Downloaded route URL csv with %s lines from MP.', num_lines)
    logger.info('Data written to: %s', URLS_PATH.split('/')[-1])


def scrape_stats_url(url):
  """Scrape stats version of MP page for user star ratings."""
  r = requests.get(url)
  tree = html.fromstring(r.content)

  # searching for the header of the star table -- the table itself comes next
  table = tree.xpath('.//h3[text()="Star Ratings "]')[0].getnext()

  # getting users and stars based on HTML structure
  users = []
  ratings = []
  for td1, td2 in table.getchildren():
    users.append(td1.getchildren()[0].text)  # text of an <a> element

    # dealing with star and bomb images
    children = td2.getchildren()[1].getchildren()
    if children[0].get('src') == '/img/stars/bombBlue.svg':
      ratings.append(0)  # bombs get a rating of 0
    else:  # img_type == '/img/stars/starBlue.svg'
      ratings.append(len(children))

  return users, ratings


def scrape_printer_url(url):
  """Scrape printer-friendly version of MP page for description and comment text."""
  r = requests.get(url)
  tree = html.fromstring(r.content)

  # searching for a div with class=fr-view and taking the first one found
  description = tree.xpath('//div[@class="fr-view"]')[0]
  # getting all inner text and ignoring <br> elements
  description = description.text_content()

  # searching for comments
  comments = tree.xpath('//div[@class="comment-body"]')
  # grabbing the first child of the comment div
  comments = [c.getchildren()[0] for c in comments]
  # the comment itself is the tail text of the first child
  comments = [c.tail for c in comments]

  # concatenating all text together and returning massive string
  text = [description] + comments
  return ' '.join(text), len(comments)


def process_url(url):
  """Return stat and printer-friendly versions of URL of MP page."""
  url_prefix = 'https://www.mountainproject.com/route/'
  # inserting 'stats/' into url to get MP stats for each route
  stats_url = url_prefix + 'stats/' + url[len(url_prefix):]
  printer_url = url + '?print=1'
  return stats_url, printer_url


def process_url_csv():
  """Read CSV of MP URLs, remove routes without ratings, deal with redacted names."""

  url_df = pd.read_csv(URLS_PATH)
  url_df = url_df[url_df['Avg Stars'] != -1]  # ignoring routes without ratings

  # dealing with redacted route names
  def fix_row(row):
    if row['Route'] == 'Redacted':
      route_id = strip_id(row['URL'])
      return fixes[route_id]  # will raise error if fixes doesn't contain id
    return row['Route']
  url_df['Route'] = url_df.apply(fix_row, axis=1)

  routes = list(url_df['Route'])
  urls = list(url_df['URL'])
  grades = list(url_df['Rating'])
  return {'routes': routes, 'urls': urls, 'grades': grades}


def build_ratings_dataframe():
  """Save joining table in which each ordered pair (route, user) is a row."""
  print('Scraping route-user-rating data.')

  data = process_url_csv()
  rows = []
  for route, url in zip(tqdm(data['routes']), data['urls']):
    stats_url, _ = process_url(url)
    users, ratings = scrape_stats_url(stats_url)
    sleep(1)  # giving MP server a break

    for user, rating in zip(users, ratings):
      rows.append({'route': route, 'user': user, 'rating': rating})

  logger.info('Scraped %s route-user-rating records from MP.', len(rows))
  df = pd.DataFrame(rows)
  df.to_csv(DATA_PATH, index=False)
  logger.info('Data written to: %s', DATA_PATH.split('/')[-1])


def build_text_data_json():
  """Save json file holding URL, grade, and text data for each route."""
  print('Scraping route descriptions and comments.')

  data = process_url_csv()
  d = {}
  total_n_comments = 0
  for route, url, grade in zip(tqdm(data['routes']), data['urls'], data['grades']):
    _, printer_url = process_url(url)
    text, n_comments = scrape_printer_url(printer_url)
    total_n_comments += n_comments
    sleep(1)  # giving MP server a break

    # append gathered data to dict
    d[route] = {'url': url, 'grade': grade, 'text': text}

  logger.info('Scraped %s comments from MP.', total_n_comments)
  with open(TEXT_PATH, 'w') as f:
    json.dump(d, f)
  logger.info('Metadata written to: %s \n\n', TEXT_PATH.split('/')[-1])


def main_scrape():
  """Run all scraping methods."""
  download_route_urls()
  build_ratings_dataframe()
  build_text_data_json()
  logging.shutdown()
