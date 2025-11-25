// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"os"
	"time"

	"google.golang.org/adk/agent"
	"google.golang.org/adk/agent/llmagent"
	"google.golang.org/adk/cmd/launcher"
	"google.golang.org/adk/cmd/launcher/prod"
	"google.golang.org/adk/model/gemini"
	"google.golang.org/adk/session"
	"google.golang.org/adk/tool"
	"google.golang.org/adk/tool/functiontool"
	"google.golang.org/genai"
)

// isPrime checks if a number is prime.
func isPrime(n int) bool {
	if n <= 1 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}

type generatePrimesArgs struct {
	Count int `json:"count" jsonschema:"The number of Mersenne primes to generate."`
}

func generatePrimes(tc tool.Context, args generatePrimesArgs) (string, error) {
	start := time.Now()
	var mPrimes []string
	count := args.Count

	// isMersennePrime checks if M_p = 2^p - 1 is prime using Lucas-Lehmer test
	isMersennePrime := func(p int) (bool, *big.Int) {
		if p == 2 {
			return true, big.NewInt(3)
		}
		m := new(big.Int).Lsh(big.NewInt(1), uint(p))
		m.Sub(m, big.NewInt(1))

		s := big.NewInt(4)
		two := big.NewInt(2)
		for i := 0; i < p-2; i++ {
			s.Mul(s, s)
			s.Sub(s, two)
			s.Mod(s, m)
		}
		return s.Sign() == 0, m
	}

	p := 2
	found := 0
	for found < count {
		if isPrime(p) {
			if ok, val := isMersennePrime(p); ok {
				mPrimes = append(mPrimes, val.String())
				found++
			}
		}
		p++
	}

	elapsed := time.Since(start)
	return fmt.Sprintf("Elapsed time: %s", elapsed), nil
}

// SingleAgentLoader is a simple implementation of agent.Loader for a single agent.
type SingleAgentLoader struct {
	Agent agent.Agent
}

func (l *SingleAgentLoader) LoadAgent(name string) (agent.Agent, error) {
	if name == l.Agent.Name() {
		return l.Agent, nil
	}
	return nil, fmt.Errorf("agent not found: %s", name)
}

func (l *SingleAgentLoader) ListAgents() []string {
	return []string{l.Agent.Name()}
}

func (l *SingleAgentLoader) RootAgent() agent.Agent {
	return l.Agent
}

// --8<-- [start:a2a-launcher]
func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx := context.Background()
	primesTool, err := functiontool.New(functiontool.Config{
		Name:        "generate_primes",
		Description: "Generate the first x Mersenne primes and measure execution time.",
	}, generatePrimes)
	if err != nil {
		slog.Error("Failed to create generate_primes tool", "error", err)
		os.Exit(1)
	}

	modelName := os.Getenv("MODEL_NAME")
	if modelName == "" {
		modelName = "gemini-2.5-flash"
	}

	slog.Info("Using Model ", "model", modelName)

	model, err := gemini.NewModel(ctx, modelName, &genai.ClientConfig{})
	if err != nil {
		slog.Error("Failed to create model", "error", err)
		os.Exit(1)
	}

	primeAgent, err := llmagent.New(llmagent.Config{
		Name:        "mersenne_agent_go",
		Description: "Generate Mersenne Primes in Go.",
		Instruction: `
			You can generate Mersenne primes in Go.
			generate the first x Mersenne primes and return the elapsed time.
    `,
		Model: model,
		Tools: []tool.Tool{primesTool},
	})
	if err != nil {
		slog.Error("Failed to create agent", "error", err)
		os.Exit(1)
	}

	// Create launcher.
	l := prod.NewLauncher()

	// Allow PORT to be set by the environment (e.g., Cloud Run), default to 8102
	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8102"
	}
	// Set PORT env var for the launcher to pick up
	os.Setenv("PORT", portStr)

	// Create ADK config
	config := &launcher.Config{
		AgentLoader:    &SingleAgentLoader{Agent: primeAgent},
		SessionService: session.InMemoryService(),
	}

	slog.Info("Starting A2A mersenne prime server", "port", portStr)

	// Arguments for the launcher.
	// Note: ParseAndRun usually expects the first argument to be the program name if it parses full os.Args,
	// but here we are constructing args manually.
	// If full launcher uses standard flag parsing, it might expect the command "a2a" as a subcommand.
	args := []string{
		"--port", portStr,
		"a2a",
		"--a2a_agent_url", "http://0.0.0.0:" + portStr,
	}

	// Run launcher
	if err := l.Execute(ctx, config, args); err != nil {
		slog.Error("launcher.Run() error", "error", err)
		os.Exit(1)
	}
}

// --8<-- [end:a2a-launcher]
