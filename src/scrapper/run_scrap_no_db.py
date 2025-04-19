import pandas as pd
from datetime import datetime

from db_scrapper import scrap_race
from file_parsers import NascarRaceDataParser, NascarResultsParser

from pathlib import Path


def get_available_races():
    df = pd.read_csv('../backend/data/race_data.csv')
    loaded_races = []
    for season, race_number in df[['season_year', 'race_number']].drop_duplicates().values:
        loaded_races.append((season, race_number))
    return loaded_races


def make_csv_from_res(data, season, race_number, name):
    path = Path(f'../backend/data/{name}.csv')
    if path.exists():
        df = pd.read_csv(f'../backend/data/{name}.csv')
        season_data = df[df['season_year'] == season]
        if race_number not in season_data['race_number'].values:
            df = pd.concat([df, pd.DataFrame(data)])
            df.to_csv(f'../backend/data/{name}.csv', index=False)
    else:
        pd.DataFrame(data).to_csv(f'../backend/data/{name}.csv', index=False)
    return

def run_scrapping(start_year=2022):
    current_year = datetime.now().year
    for season in range(start_year, current_year + 1):
        for race_number in range(1, 37):
            if (season, race_number) not in get_available_races():
                print(season, race_number)
                is_success = scrap_race(season, race_number)
                if not is_success:
                    break
                _, csv_race_data = NascarRaceDataParser(season, race_number).fill_race_data()
                _, _, csv_res, csv_standings = NascarResultsParser(season, race_number).fill_results_data()
                make_csv_from_res(csv_res, season, race_number, 'race_results')
                make_csv_from_res(csv_standings, season, race_number, 'standings')
                make_csv_from_res(csv_race_data, season, race_number, 'race_data')
                loop_data = NascarResultsParser(season, race_number).fill_loop_data()
                make_csv_from_res(loop_data, season, race_number, 'loop_data')
