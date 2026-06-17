$port = 8080
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
if (!$ip) { $ip = "127.0.0.1" }

# Bind to 0.0.0.0 (all interfaces) which does NOT require administrator privileges in Windows
$address = [System.Net.IPAddress]::Any
$server = New-Object System.Net.Sockets.TcpListener($address, $port)

try {
    $server.Start()
} catch {
    Write-Output "Erro ao iniciar na porta $port. Tentando porta 8081..."
    $port = 8081
    $server = New-Object System.Net.Sockets.TcpListener($address, $port)
    $server.Start()
}

Write-Output "========================================"
Write-Output "  SERVIDO! Site rodando sem Node/Python"
Write-Output "  Local (PC): http://localhost:$port"
Write-Output "  Rede (Celular): http://$($ip):$port"
Write-Output "  Pressione Ctrl+C para finalizar."
Write-Output "========================================"

$buffer = New-Object System.Byte[] 4096

while ($server.Active -or $true) {
    try {
        $client = $server.AcceptTcpClient()
        # Set timeouts to prevent slow connections or pre-connections from blocking the server
        $client.ReceiveTimeout = 1000
        $client.SendTimeout = 2000
        $stream = $client.GetStream()
        
        # Wait up to 150ms for the browser to send request headers
        $waitCount = 0
        while (!$stream.DataAvailable -and $waitCount -lt 15) {
            Start-Sleep -Milliseconds 10
            $waitCount++
        }
        
        if ($stream.DataAvailable) {
            # Read incoming request bytes
            $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            if ($bytesRead -gt 0) {
                $requestStr = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
                
                # Simple HTTP parsing
                $firstLine = $requestStr.Split("`n")[0]
                $tokens = $firstLine.Split(" ")
                if ($tokens.Length -gt 1) {
                    $urlPath = $tokens[1].Split('?')[0]
                    if ($urlPath -eq "/") { $urlPath = "/index.html" }
                    
                    $cleanPath = $urlPath.TrimStart('/')
                    $filePath = Join-Path (Get-Location) $cleanPath.Replace("/", "\")
                    
                    if (Test-Path $filePath -PathType Leaf) {
                        $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                        
                        # MIME Types
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = "text/plain"
                        if ($ext -eq ".html") { $mime = "text/html; charset=utf-8" }
                        elseif ($ext -eq ".css") { $mime = "text/css" }
                        elseif ($ext -eq ".js") { $mime = "application/javascript" }
                        elseif ($ext -eq ".png") { $mime = "image/png" }
                        elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $mime = "image/jpeg" }
                        elseif ($ext -eq ".webp") { $mime = "image/webp" }
                        elseif ($ext -eq ".mp4") { $mime = "video/mp4" }
                        
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($fileBytes.Length)`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($fileBytes, 0, $fileBytes.Length)
                    } else {
                        $err = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                        $errBytes = [System.Text.Encoding]::UTF8.GetBytes($err)
                        $stream.Write($errBytes, 0, $errBytes.Length)
                    }
                }
            }
        }
        $stream.Close()
        $client.Close()
    } catch {
        # ignore context errors to keep server running
    }
}
