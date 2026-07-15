"""Regression tests for the Mersenne prime tool."""

import unittest

from agent import find_mersenne_primes


class TestFindMersennePrimes(unittest.TestCase):
    def test_small_count_returns_elapsed_time(self):
        result = find_mersenne_primes(5)
        self.assertIn("elapsed_time", result)
        self.assertGreaterEqual(result["elapsed_time"], 0.0)

    def test_count_24_does_not_crash(self):
        # Regression for the CPython 4300-digit int->str limit: str(2**19937 - 1)
        # is 6002 digits, so stringifying primes crashed the tool for count >= 24.
        result = find_mersenne_primes(24)
        self.assertIn("elapsed_time", result)
        self.assertGreater(result["elapsed_time"], 0.0)


if __name__ == "__main__":
    unittest.main()
