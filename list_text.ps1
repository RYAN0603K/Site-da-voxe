$path = "C:\Users\Ryan Az\.gemini\antigravity\brain\d5e4a3d3-5330-4f74-b954-e726449dd7ac\.system_generated\steps\277\content.md"
$content = [System.IO.File]::ReadAllText($path)

# Let's clean up HTML tags to extract readable text
# Find all headings (h1, h2, h3, h4) and paragraph text, along with sections
$regex = [regex]"<(h[1-4]|section|p|li)[^>]*>(.*?)</\1>"
$matches = $regex.Matches($content)

foreach ($m in $matches) {
    $tag = $m.Groups[1].Value
    $text = $m.Groups[2].Value -replace "<[^>]+>", "" # Remove inner HTML tags
    $text = $text.Trim()
    if ($text) {
        Write-Output "[$tag] $text"
    }
}
