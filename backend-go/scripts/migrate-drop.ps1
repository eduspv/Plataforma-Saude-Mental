$envFile = ".env"

if (!(Test-Path $envFile)) {
    Write-Error ".env não encontrado"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
    }
}

migrate -path migrations -database $env:DATABASE_URL drop