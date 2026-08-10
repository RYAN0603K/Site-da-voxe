$filePath = Join-Path $PSScriptRoot "index.html"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($filePath, $utf8NoBom)

# Fix remaining broken characters
$text = $text.Replace([char]0xFFFD + "?""", [char]0x2014)  # em-dash
$text = $text.Replace("?""", [char]0x2014)  # em-dash variant
$text = $text.Replace([char]0xFFFD, [char]0x0020)  # replace replacement chars with space

# Write back
[System.IO.File]::WriteAllText($filePath, $text, $utf8NoBom)

Write-Output "Done. Line 6:"
$lines = [System.IO.File]::ReadAllLines($filePath, $utf8NoBom)
Write-Output $lines[5]
