import numpy as np
import pandas as pd

def now():
    return pd.Timestamp.now().strftime('%Y-%m-%d at %H:%M')
