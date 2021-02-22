from collections import OrderedDict
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as pl
pl.ioff()
from matplotlib.transforms import blended_transform_factory as blend
import urllib.request

def now():
    return pd.Timestamp.now().strftime('%Y-%m-%d at %H:%M')

def download_data(filepath):
    url = 'https://covid.ourworldindata.org/data/excess_mortality/excess_mortality.csv'
    urllib.request.urlretrieve(url, filepath)

def generate_plot(filepath, data_path, width=100, height=100, dpi=200):

    country = 'United States'
    years = [2015, 2016, 2017, 2018, 2019, 2020,]# 2021]
    min_date, max_date = (0, 1), (1, 2) # year relative to current, month idx
    FS = 7

    data = pd.read_csv(data_path)
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
    data = pd.concat(series).reset_index()


    #
    cmap = pl.cm.Reds
    cols = cmap(np.linspace(0.25, 1.0, len(years)-1))
    cols = np.concatenate([cols, [[0,0,0,1]]], axis=0)

    fig, axs = pl.subplots(1, 3, figsize=(width/dpi, height/dpi), dpi=dpi,
            gridspec_kw=dict(left=0.09, right=0.98, top=0.8, bottom=0.2, wspace=0.5))
    insets = OrderedDict()
    umos = []
    for idx, year in enumerate(years):
        col = cols[idx]

        start = pd.Timestamp(f'{year + min_date[0]}-{min_date[1]}-01')
        end = pd.Timestamp(f'{year + max_date[0]}-{max_date[1]}-28')
        use = (data.date >= start) & (data.date <= end)
        dat = data[use]

        axs[0].plot(dat.date.values, dat.val.values, color=col, lw=2)

        yearless = dat.date.apply(lambda x:
                x.replace(year=1800+x.year-dat.date.iloc[0].year))
        umos.append(np.unique(yearless.dt.strftime('%Y-%m-15')))
        axs[1].plot(yearless.values, dat.val.values, color=col, lw=2)

        cum = np.cumsum(dat.val.values)
        axs[2].plot(yearless.values, cum, color=col)
        
        dat['valcs'] = dat.val.cumsum()
        bars = dat.groupby(yearless.apply(lambda x: x.strftime('%Y-%m'))).valcs.max()
        for mo, val in zip(bars.index, bars.values):
            if mo not in insets:
                x,y,w,h = axs[2].get_position().bounds
                x0 = axs[2].transData.transform([matplotlib.dates.date2num(pd.Timestamp(mo+'-15').to_datetime64()), 0])[0]
                x0 = fig.transFigure.inverted().transform([x0, 0])[0]
                _ax = fig.add_axes([x0-w/20, y+h/60, w/10, h/3])
                insets[mo] = _ax
            iax = insets[mo]
            iax.bar(idx, val, color=col)
            iax.axis('off')
    for i, k in enumerate(sorted(insets.keys())):
        if (i-2)%3 != 0:
            insets[k].remove()
        else:
            insets[k].set_ylim([0, 4e6])

    ax = axs[0]
    ax.set_xticks([pd.Timestamp(year=year, month=6, day=30) for year in years])
    ax.set_xticklabels([])
    for yr, pos, col in zip(years, ax.get_xticks(), cols):
        ax.text(pos, -0.15, "'"+str(yr)[2:], weight='bold',
                color=col, ha='center', va='center',
                fontsize=FS,
                transform=blend(ax.transData, ax.transAxes))

    umos = pd.to_datetime(np.unique(np.concatenate(umos)))
    for ax in axs[1:]:
        ax.set_xticks(umos)
        ax.set_xticklabels([s[:3] if i%2==0 else '' for i,s in enumerate(umos.month_name())],
                fontsize=FS)

    for ax in axs[:2]:
        ax.set_yticks(np.arange(50000, 80001, 10000))
        ax.set_yticklabels([f'{y//1000}k' for y in ax.get_yticks()], fontsize=FS)

    ax = axs[2]
    ax.set_yticks(np.arange(0, 3e6+1, 1e6))
    ax.set_yticklabels([f'{int(y//1e6)}m' for y in ax.get_yticks()], fontsize=FS)

    for ax in axs:
        ax.tick_params(length=6, labelsize=FS)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

    axs[0].set_title('Weekly US deaths', fontsize=FS, pad=20)
    axs[1].set_title('Weekly US deaths', fontsize=FS, pad=20)
    axs[2].set_title('Cumulative US deaths', fontsize=FS, pad=20)

    fig.savefig(filepath)
