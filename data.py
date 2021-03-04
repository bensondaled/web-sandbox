import numpy as np
import pandas as pd
from collections import OrderedDict as odict
import urllib.request

DATA_URL = 'https://covid.ourworldindata.org/data/excess_mortality/excess_mortality.csv'

def download_data(dest):
    urllib.request.urlretrieve(DATA_URL, dest)

def process_data(input_path,
                 output_path,
                 country = 'United States',
                 years = [2015, 2016, 2017, 2018, 2019, 2020,],
                 min_date = (0, 1), # year relative to current, month idx
                 max_date = (0, 12),
                 ):

    data = pd.read_csv(input_path)
    data = data[data.location == country]
    dates = pd.to_datetime(data.date)

    # use the 2020 dates as the backbone for all years
    data = data[dates.dt.year==2020]
    dates = dates[dates.dt.year==2020]
    date_templ = dates.dt.strftime('%m-%d')
    series = []
    for year in years:
        col = f'deaths_{year}_all_ages'
        vals = data[col].values
        date = [pd.Timestamp(f'{year}-'+t) for t in date_templ.values]
        ser = pd.DataFrame(dict(val=vals, date=date))
        series.append(ser)
    data_ = pd.concat(series).reset_index(drop=True)
    
    data = pd.DataFrame()
    for idx, year in enumerate(years):
        start = pd.Timestamp(f'{year + min_date[0]}-{min_date[1]}-01')
        end = pd.Timestamp(f'{year + max_date[0]}-{max_date[1]}-28')
        dat = data_[(data_.date >= start) & (data_.date <= end)]

        yearless = dat.date.apply(lambda x:
                x.replace(year=1800+x.year-dat.date.iloc[0].year))
        if not 'date' in data.columns:
            data['date'] = yearless.values
        else:
            assert np.all(yearless.values == data['date'].values)

        data[f'{year}'] = dat.val.values
    
    data.to_csv(output_path, index=False)
