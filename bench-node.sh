source $HOME/a2a-hello-world/set_env.sh


cd poly-node

echo `pwd`
echo staring a2a poly node generate prime
make deps
make build
make run
