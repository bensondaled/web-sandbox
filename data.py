import numpy as np
import pandas as pd
import matplotlib.pyplot as pl
import matplotlib
matplotlib.use('Agg')
pl.ioff()

def now():
    return pd.Timestamp.now().strftime('%Y-%m-%d at %H:%M')

def generate_plot(filepath, width=100, height=100, dpi=200):
    fig, ax = pl.subplots(figsize=(width/dpi, height/dpi), dpi=dpi)
    ax.plot(np.random.randint(100, size=100))
    fig.savefig(filepath)
