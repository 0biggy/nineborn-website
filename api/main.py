def handler(request, response):
    response.status_code = 200
    response.headers["Content-Type"] = "text/plain"
    response.text = "Merhaba, Python API Vercel'de çalışıyor!"
