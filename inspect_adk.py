import inspect
from google.adk.runners import InMemoryRunner
print(inspect.signature(InMemoryRunner.run))
print(inspect.signature(InMemoryRunner.run_async))
