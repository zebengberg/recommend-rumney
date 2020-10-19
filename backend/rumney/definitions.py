"""Define paths used by modules."""

import os
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

URLS_PATH = os.path.join(ROOT_DIR, 'data/rumney_urls.csv')
DATA_PATH = os.path.join(ROOT_DIR, 'data/rumney_data.csv')
TEXT_PATH = os.path.join(ROOT_DIR, 'data/rumney_text.json')
LOG_PATH = os.path.join(ROOT_DIR, 'data/scrape_history.log')


FRONTEND_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))), 'src/assets/data')

ROUTE_DATA_PATH = os.path.join(FRONTEND_DATA_DIR, 'route_data_array.json')
USER_DATA_PATH = os.path.join(FRONTEND_DATA_DIR, 'user_data_array.json')
USER_RATING_PATH = os.path.join(FRONTEND_DATA_DIR, 'user_rating_object.json')
SLOPE_ONE_PATH = os.path.join(FRONTEND_DATA_DIR, 'slope_one_object.json')
CONTENT_PATH = os.path.join(FRONTEND_DATA_DIR, 'content_object.json')
