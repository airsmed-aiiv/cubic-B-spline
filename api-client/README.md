# Skin Area Segmentation API

주어진 사진 속에서 피부에 해당하는 영역의 mask를 자동으로 추출하는 REST API를 제공합니다.

## API 인터페이스
- API 주소: `https://artiq.dev/api/skin_area`
- input: `.jpg` 또는 `.png` 형식의 임의 크기 이미지 파일을 바이너리 형식으로 전송
- output: input 이미지와 동일한 크기의 `.png` 형식 grayscale 이미지 (배경: 0, 피부:255)

## Python 예제 코드
```Python
import requests


# upload input.jpg file
res = requests.post(
    'https://artiq.dev/api/skin_area',
    files={'file': open('input.jpg', 'rb').read()}
)

# save the result as output.png
with open('output.png', 'wb') as f:
    f.write(res.content)
```

## 입출력 예시
![input.jpg](input.jpg)
![output.png](output.png)

## 고려 사항
- 본 API를 통해 민감정보에 해당하는 환자 사진이 주로 처리될 것임을 감안하여, <개인정보의 기술적/관리적 보호조치 기준 제5조 (개인정보의 암호화)>에서 요구하는 바에 따라 SSL 인증서를 통한 암호화를 지원하고 있습니다.
- API 서버 상에서 피부 영역 인식을 마친 이미지 정보는 **일체 저장하지 않고 즉시 삭제됩니다.**
- 본 API는 사람이 개입하지 않는 자동 처리에 의해 동작하므로, 인식 결과에 일정 수준의 오류가 불가피하게 포함될 수 있습니다. 가급적이면 해당 API가 반환한 결과를 곧바로 사용하기보다는, 사람이 한번 눈으로 검수하는 절차를 거친 이후에 사용하는 것을 권장드립니다.
