$filePath = Join-Path $PSScriptRoot "style.css"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($filePath, $utf8NoBom)

# Restore align-items: center everywhere (the text-align: left changes are fine)
$text = $text.Replace("align-items: flex-start", "align-items: center")

# Now selectively set text sections to left align (keep text-align: left as is)
# The hero-cta-group on mobile should align center for buttons
# But overall text-align: left is what the user wants

[System.IO.File]::WriteAllText($filePath, $text, $utf8NoBom)
Write-Output "Done - restored align-items: center throughout CSS"
