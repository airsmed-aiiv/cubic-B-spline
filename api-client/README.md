# Skin Area Segmentation API

## 사용법
- input: '.jpg' 또는 '.png' 형식의 이미지를 바이너리 형식으로 전송
- output: '.png' 형식의 grayscale 이미지 (0: 배경, 255: 피부)

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

## Disclaimer
- 본 API를 통해, 주로 민감정보에 해당하는 환자 의학사진이 주로 처리될 점을 감안하여, 본 서버에서는 피부 인식 처리가 끝난 이미지 정보는 **일체 저장하지 않고 즉시 삭제합니다.**
- 본 피부 인식 API는 사람이 개입하지 않는 자동 처리에 의해 동작하므로 인식 결과에 일정 수준의 오류가 포함되는 것은 불가피합니다. 가급적이면 해당 결과를 직접 사용하기보다는 눈으로 한번 사람이 확인하는 절차를 거친 후 사용하시기를 권장드립니다.