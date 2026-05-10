# use PowerShell instead of sh:
set shell := ["pwsh", "-c"]

hello:
    Write-Host "Hello, world!"

backend-server:
    cd ./backend && uv run fastapi dev

frontend-server:
    cd ./fronted && deno task dev
