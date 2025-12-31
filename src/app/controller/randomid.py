import random

def randomId():
    return str(random.randint(1000,9999))

def checkId(create_id,player_id):
    if create_id == player_id: return True