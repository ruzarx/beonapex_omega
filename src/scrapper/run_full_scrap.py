import pandas as pd

from db_scrapper import scrap_race
from db_connectors import DBWriter
from file_parsers import NascarRaceDataParser, NascarResultsParser

from flask import Flask

from pathlib import Path

app = Flask(__name__)

writer = DBWriter(app)

writer.fill_tracks_info()

available_races = writer.get_available_races()

writer.fill_calendar_info()

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

for season in [2025]:
    for race_number in range(1, 37):
        if (season, race_number) not in available_races:
            print(season, race_number)
            is_success = scrap_race(season, race_number)
            if not is_success:
                break
            race_data, csv_race_data = NascarRaceDataParser(season, race_number).fill_race_data()
            writer.fill_race_data(race_data)
            race_results, standings, csv_res, csv_standings = NascarResultsParser(season, race_number).fill_results_data()
            make_csv_from_res(csv_res, season, race_number, 'race_results')
            make_csv_from_res(csv_standings, season, race_number, 'standings')
            make_csv_from_res(csv_race_data, season, race_number, 'race_data')
            loop_data = NascarResultsParser(season, race_number).fill_loop_data()
            make_csv_from_res(loop_data, season, race_number, 'loop_data')
            writer.fill_race_results(race_results)
            writer.fill_standings(standings)
