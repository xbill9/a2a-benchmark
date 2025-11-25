import matplotlib.pyplot as plt
import numpy as np

# Data points collected
# Number of Primes (N) -> Time in seconds (T)
data = [
    (5, 1.9788742065429688e-05),
    (6, 1.8596649169921875e-05),
    (6, 1.3828277587890625e-05), # Duplicate x, but that's fine
    (8, 4.673004150390625e-05),
    (10, 0.00030207633972167969),
    (12, 0.00053119659423828125),
    (13, 0.01795196533203125),
    (14, 0.030256271362304688),
    (15, 0.23837494850158691),
    (16, 1.6413366794586182),
    (16, 1.6357765197753906),
    (17, 1.9018535614013672),
    (17, 1.9298233985900879),
    (20, 22.407544374465942),
    (21, 431.7957398891449)
]

# Sort data by N (just in case)
data.sort(key=lambda x: x[0])

x = [p[0] for p in data]
y = [p[1] for p in data]

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'o-', label='Calculated Times')

plt.xlabel('Number of Mersenne Primes')
plt.ylabel('Time (seconds)')
plt.title('Time to Calculate Mersenne Primes')
plt.grid(True, which="both", ls="-")

# Since the growth is likely exponential/very fast, a log scale is appropriate
plt.yscale('log')

plt.legend()
plt.savefig('prime_calculation_times.png')
print("Graph saved to prime_calculation_times.png")
