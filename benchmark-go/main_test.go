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

func TestGenerateMersennePrimes(t *testing.T) {
	tests := []struct {
		name     string
		args     generateMersennePrimesArgs
		contains []string
	}{
		{
			name:     "Up to 5",
			args:     generateMersennePrimesArgs{Limit: 5},
			contains: []string{"Elapsed time:"},
		},
	}

	var tc tool.Context

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := generateMersennePrimes(tc, tt.args)
			if err != nil {
				t.Fatalf("generateMersennePrimes() error = %v; want nil", err)
			}
			for _, c := range tt.contains {
				if !strings.Contains(got, c) {
					t.Errorf("generateMersennePrimes() = %q; want to contain %q", got, c)
				}
			}
		})
	}
}
