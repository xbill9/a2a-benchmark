package main

import (
	"strings"
	"testing"

	"google.golang.org/adk/tool"
)

func TestIsPrime(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected bool
	}{
		{"Negative number", -1, false},
		{"Zero", 0, false},
		{"One", 1, false},
		{"Two (Prime)", 2, true},
		{"Three (Prime)", 3, true},
		{"Four (Not Prime)", 4, false},
		{"Nine (Not Prime)", 9, false},
		{"Seventeen (Prime)", 17, true},
		{"Large Prime", 97, true},
		{"Large Non-Prime", 100, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isPrime(tt.input); got != tt.expected {
				t.Errorf("isPrime(%d) = %v; want %v", tt.input, got, tt.expected)
			}
		})
	}
}

func TestGeneratePrimes(t *testing.T) {
	tests := []struct {
		name     string
		args     generatePrimesArgs
		contains []string
	}{
		{
			name:     "First 5 Mersenne primes",
			args:     generatePrimesArgs{Count: 5}, // 2, 3, 5, 7, 13 -> all Mersenne exponents for known small Mersenne primes
			contains: []string{"Elapsed time:"},
		},
	}

	var tc tool.Context

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := generatePrimes(tc, tt.args)
			if err != nil {
				t.Fatalf("generatePrimes() error = %v; want nil", err)
			}
			for _, c := range tt.contains {
				if !strings.Contains(got, c) {
					t.Errorf("generatePrimes() = %q; want to contain %q", got, c)
				}
			}
		})
	}
}