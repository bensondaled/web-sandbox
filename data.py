import numpy as np
import pandas as pd
import matplotlib.pyplot as pl
import matplotlib
matplotlib.use('Agg')
pl.ioff()

def now():
    return pd.Timestamp.now().strftime('%Y-%m-%d at %H:%M')

def generate_plot(filepath):
    fig, ax = pl.subplots()
    ax.plot([1, 3, 2])
    fig.savefig(filepath)
