$filePath = Join-Path $PSScriptRoot "index.html"

# Read raw bytes
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# Strip BOM if present
$start = 0
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $start = 3
}

# The file was written as UTF-8 but the original content was already UTF-8,
# so we have a double-encoding. We need to interpret the bytes as Latin-1 first,
# then re-encode as UTF-8 to get the original characters back.
$latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1")
$utf8 = [System.Text.Encoding]::UTF8

if ($start -gt 0) {
    $cleanBytes = New-Object byte[] ($bytes.Length - $start)
    [Array]::Copy($bytes, $start, $cleanBytes, 0, $cleanBytes.Length)
    $bytes = $cleanBytes
}

# Decode as UTF-8 to get the string (with mojibake)
$text = $utf8.GetString($bytes)

# Now encode back to Latin-1 bytes (this reverses the double-encoding)
$latin1Bytes = $latin1.GetBytes($text)

# And decode those bytes as UTF-8 (the original encoding)
$fixedText = $utf8.GetString($latin1Bytes)

# Write back without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $fixedText, $utf8NoBom)

Write-Output "Fixed! First 300 chars:"
Write-Output $fixedText.Substring(0, 300)
