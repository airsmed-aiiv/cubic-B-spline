# Skin Area Segmentation API

## 사용법

### Python
```Python
import requests

# upload input.jpg
res = requests.post(
    'http://artiq.xyz/api/skin_area',
    files={'file': open('input.jpg', 'rb').read()}
)

# save as output.png
with open('output.png', 'wb') as f:
    f.write(res.content)
```

### Bash
```Bash
$ curl -X POST -F 'file=@./input.jpg' -o 'output.png' http://artiq.xyz:8080/api/skin_area
```