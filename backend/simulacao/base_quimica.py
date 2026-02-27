import random

CATIONS_DISPONIVEIS = [
    "Ag+",
    "Pb2+",
    "Fe3+",
    "Cu2+",
    "Ba2+",
    "Na+"
]

def sortear_cation():
    return random.choice(CATIONS_DISPONIVEIS)