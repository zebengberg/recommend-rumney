"""Run all backend scripts to build frontend data assets."""

# pylint: disable=import-error
from rumney.scrape.scrape_rumney_routes import main_scrape
from rumney.process_data.build_json_assets import main_build

if __name__ == '__main__':
  main_scrape()
  main_build()
