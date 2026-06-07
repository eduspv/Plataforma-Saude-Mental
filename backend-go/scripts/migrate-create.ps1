param (
    [Parameter(Mandatory=$true)]
    [string]$Name
)

migrate create -ext sql -dir migrations -seq $Name