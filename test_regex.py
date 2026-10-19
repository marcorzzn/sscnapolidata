import re
scorers_str = "Powolny 9', Castellazzi 35', Bernardini 50',"
parts = [s.strip() for s in scorers_str.split(',') if s.strip()]
print(parts)
for part in parts:
    m = re.match(r'^(.*?)\s+(\d+)\'?$', part)
    if m: print('MATCH:', m.groups())
    else: print('NO MATCH:', part)
