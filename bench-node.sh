source $HOME/a2a-benchmark/set_env.sh


cd benchmark-node

echo `pwd`
echo staring a2a bench node generate prime
make deps
make build
make run
