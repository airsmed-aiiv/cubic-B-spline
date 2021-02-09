import requests


# upload input.jpg
res = requests.post(
    'https://artiq.dev/api/skin_area',
    files={'file': open('input.jpg', 'rb').read()}
)

# save as output.png
with open('output.png', 'wb') as f:
    f.write(res.content)
