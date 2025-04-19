from src.scrapper.run_scrap_no_db import run_scrapping
from src.backend.update_data import DataProcessor

if __name__ == '__main__':
    run_scrapping()
    updater = DataProcessor()
    updater.update_data()
