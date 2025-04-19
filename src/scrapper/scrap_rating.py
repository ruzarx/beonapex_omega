import os
import csv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

url = 'https://www.racing-reference.info/loopdata/2024-03/W/'
options = Options()
options.headless = True
# driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver = webdriver.Chrome(options=options)

try:
    driver.get(url)
    page_source = driver.page_source
    soup = BeautifulSoup(page_source, 'html.parser')

    try:
        results_table = soup.find('table', class_='tb loopData')
        if results_table:
            filename = os.path.join('.', "loop_data.csv")
            with open(filename, mode='w', newline='', encoding='utf-8') as csv_file:
                writer = csv.writer(csv_file)
                headers = ["driver_name",
                           "start_pos",
                           "mid_race_pos",
                           "finish_pos",
                           "highest_pos",
                           "lowest_pos",
                           "avg_pos",
                           "pass_diff",
                           "green_flag_passes",
                           "green_flag_times_passed",
                           "quality_passes",
                           "pct_quality_passes",
                           "fastest_lap",
                           "top_15_laps",
                           "pct_top_15_laps",
                           "laps_led",
                           "pct_laps_led",
                           "total_laps",
                           "driver_rating"]
                writer.writerow(headers)
                rows = results_table.find_all('tr')[3:]
                for row in rows:
                    cells = row.find_all('td')
                    row_data = []
                    for cell in cells:
                        cell_text = re.sub(r'\xa0', ' ', cell.text.strip())
                        row_data.append(cell_text)
                    writer.writerow(row_data)
        else:
            logging.warning("Race results table not found")
    except Exception as e:
        logging.error(f"Error extracting or saving race results: {e}")

finally:
    driver.quit()
    logging.info("Driver quit successfully")
