from os import path
import logging
from time import sleep
import requests
import pandas as pd
from lxml import html
from tqdm import tqdm


url_file_path = '../data/rumney_urls.csv'
stars_file_path = '../data/rumney_stars.csv'
log_file_path = '../data/scrape_history.log'

logging.basicConfig(filename=log_file_path,
                    level=logging.INFO,
                    format='%(asctime)s %(message)s',
                    datefmt='%m/%d/%Y %H:%M:%S')


def download_route_urls():
  """Download CSV of Rumney route URLs from MP server."""

  # use local cached csv if one exists
  if path.exists(url_file_path):
    print('Using cached version of URL data.')
    print(f'Delete {url_file_path} to download new data.')

  else:
    # url taken from MP route-finder feature
    url = ('https://www.mountainproject.com/route-finder-export?'
           'selectedIds=105867829&type=rock&diffMinrock=1000'
           '&diffMinboulder=20000&diffMinaid=70000&diffMinice=30000'
           '&diffMinmixed=50000&diffMaxrock=12400&diffMaxboulder=20050'
           '&diffMaxaid=75260&diffMaxice=38500&diffMaxmixed=60000'
           '&is_sport_climb=1&stars=0&pitches=0&sort1=area&sort2=rating')
    r = requests.get(url)

    with open(url_file_path, 'wb') as f:
      f.write(r.content)

    # counting total number of lines in downloaded CSV and logging count
    num_lines = sum(1 for line in open(url_file_path))
    logging.info('Downloaded route URL csv with %s lines from MP.', num_lines)
    logging.info('Data written to: %s', url_file_path.split('/')[-1])


def scrape_url(url):
  """Find MP user star ratings for given route by searching the HTML tree."""
  r = requests.get(url)
  tree = html.fromstring(r.content)

  # searching for the header of the star table -- the table itself comes next
  table = tree.xpath('.//h3[text()="Star Ratings "]')[0].getnext()

  # getting users and stars based on HTML structure
  users = []
  stars = []
  for user, star in table.getchildren():  # user, star are <td> elements
    users.append(user.getchildren()[0].text)  # text of an <a> element
    stars.append(len(star.getchildren()[1].getchildren())) # counting <img>

  return users, stars

def build_dataframe():
  """Save joining table in which each ordered pair (route, user) is a row."""

  url_df = pd.read_csv(url_file_path)
  url_df = url_df[url_df['Avg Stars'] != -1]  # ignoring routes without stars
  routes = list(url_df['Route'])
  urls = list(url_df['URL'])
  url_prefix = 'https://www.mountainproject.com/route/'
  # inserting 'stats/' into url to get MP stats for each route
  urls = [url_prefix + 'stats/' + url[len(url_prefix):] for url in urls]

  rows = []
  for route, url in zip(tqdm(routes), urls):
    users, stars = scrape_url(url)
    sleep(1)  # giving MP server a break
    for user, star in zip(users, stars):
      rows.append({'route': route, 'user': user, 'star': star})


  logging.info('Scraped %s route-user-star records from MP.', len(rows))

  df = pd.DataFrame(rows)
  df.to_csv(stars_file_path, index=False)
  logging.info('Data written to: %s \n', stars_file_path.split('/')[-1])


if __name__ == '__main__':
  download_route_urls()
  build_dataframe()
